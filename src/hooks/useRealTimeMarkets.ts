'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket, MarketUpdate } from './useWebSocket';
import type { Market } from '@/types/market';

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
            ...(update.totalVolume && { totalPool: parseFloat(update.totalVolume.replace(/[^0-9.]/g, '')) * 1000 }),
            ...(update.totalStakers && { participantCount: update.totalStakers }),
            ...(update.outcomes && { 
              options: market.options.map((option, index) => ({
                ...option,
                ...(update.outcomes?.[index] && {
                  odds: update.outcomes[index].odds,
                  percentage: update.outcomes[index].percentage
                })
              }))
            })
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
          const currentVolume = randomMarket.totalPool / 1000; // Convert back to K format
          const volumeIncrease = Math.random() * 5 + 0.1; // 0.1 to 5.1 increase
          update.totalVolume = `${(currentVolume + volumeIncrease).toFixed(1)}K WLD`;
          break;

        case 'stakers':
          // Simulate new stakers joining
          const stakersIncrease = Math.floor(Math.random() * 3) + 1; // 1-3 new stakers
          update.totalStakers = randomMarket.participantCount + stakersIncrease;
          break;

        case 'odds':
          // Simulate odds changes
          update.outcomes = randomMarket.options.map(option => {
            const oddsChange = (Math.random() - 0.5) * 0.2; // -0.1 to +0.1 change
            const newOdds = Math.max(1.1, Math.min(10, (option.odds || 2.0) + oddsChange));
            
            // Recalculate percentages (simplified)
            const newPercentage = Math.max(5, Math.min(95, (option.percentage || 50) + (Math.random() - 0.5) * 10));
            
            return {
              name: option.title,
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