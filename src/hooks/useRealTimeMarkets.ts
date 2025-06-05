'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket, MarketUpdate } from './useWebSocket';
import type { Market } from '@/components/Markets/types';

interface UseRealTimeMarketsProps {
  markets: Market[];
  enabled?: boolean;
}

export const useRealTimeMarkets = ({ 
  markets, 
  enabled = true 
}: UseRealTimeMarketsProps) => {
  const [updatedMarkets, setUpdatedMarkets] = useState<Market[]>(markets);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const marketsRef = useRef<Market[]>(markets);

  // Handle WebSocket market updates
  const handleMarketUpdate = useCallback((update: MarketUpdate) => {
    setUpdatedMarkets(prevMarkets => 
      prevMarkets.map(market => {
        if (market.id === update.marketId) {
          return {
            ...market,
            ...(update.totalVolume && { totalVolume: update.totalVolume }),
            ...(update.totalStakers && { totalStakers: update.totalStakers }),
            ...(update.outcomes && { outcomes: update.outcomes })
          };
        }
        return market;
      })
    );
    setLastUpdate(new Date());
  }, []); // Empty dependency array - this function doesn't need to recreate

  // WebSocket connection
  const webSocket = useWebSocket({
    onMarketUpdate: handleMarketUpdate,
    url: process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_WS_URL 
      : undefined
  });

  // Development simulation of real-time updates
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') {
      return;
    }

    console.log('🎲 Starting real-time market simulation...');

    const simulateMarketUpdate = () => {
      const currentMarkets = marketsRef.current;
      if (currentMarkets.length === 0) return;

      // Pick a random market to update
      const randomMarket = currentMarkets[Math.floor(Math.random() * currentMarkets.length)];
      
      // Simulate various types of updates
      const updateTypes = [
        'volume', 'stakers', 'odds'
      ];
      const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];

      let update: Partial<MarketUpdate> = {
        marketId: randomMarket.id,
        timestamp: Date.now()
      };

      switch (updateType) {
        case 'volume':
          // Simulate volume increase
          const currentVolume = parseFloat(randomMarket.totalVolume.replace(/[^0-9.]/g, ''));
          const volumeIncrease = Math.random() * 5 + 0.1; // 0.1 to 5.1 increase
          update.totalVolume = `${(currentVolume + volumeIncrease).toFixed(1)}K WLD`;
          break;

        case 'stakers':
          // Simulate new stakers joining
          const stakersIncrease = Math.floor(Math.random() * 3) + 1; // 1-3 new stakers
          update.totalStakers = (randomMarket.totalStakers || 0) + stakersIncrease;
          break;

        case 'odds':
          // Simulate odds changes
          update.outcomes = randomMarket.outcomes.map(outcome => {
            const oddsChange = (Math.random() - 0.5) * 0.2; // -0.1 to +0.1 change
            const newOdds = Math.max(1.1, Math.min(10, outcome.odds + oddsChange));
            
            // Recalculate percentages (simplified)
            const newPercentage = Math.max(5, Math.min(95, outcome.percentage + (Math.random() - 0.5) * 10));
            
            return {
              ...outcome,
              odds: parseFloat(newOdds.toFixed(2)),
              percentage: Math.round(newPercentage)
            };
          });
          break;
      }

      // Apply the simulated update
      handleMarketUpdate(update as MarketUpdate);
      
      console.log(`📊 Simulated ${updateType} update for market:`, randomMarket.title);
    };

    // Start simulation with random intervals
    const getRandomInterval = () => Math.random() * 15000 + 5000; // 5-20 seconds

    const scheduleNextUpdate = () => {
      const timeout = setTimeout(() => {
        simulateMarketUpdate();
        scheduleNextUpdate(); // Schedule the next update
      }, getRandomInterval());

      return timeout;
    };

    const timeoutId = scheduleNextUpdate();

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only depend on enabled, not markets or handleMarketUpdate to prevent infinite loops

  // Update markets when props change
  useEffect(() => {
    marketsRef.current = markets;
    setUpdatedMarkets(markets);
  }, [markets]);

  return {
    markets: updatedMarkets,
    lastUpdate,
    isConnected: webSocket.isConnected,
    isReconnecting: webSocket.isReconnecting,
    connectionError: webSocket.error,
    // Manual refresh function
    refresh: () => setUpdatedMarkets([...markets])
  };
}; 