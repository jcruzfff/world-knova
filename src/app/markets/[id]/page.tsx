'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useMarkets } from '@/providers/MarketProvider';
import { MarketDetail } from '@/components/Markets/MarketDetail';

export default function MarketDetailPage() {
  const params = useParams();
  const { state, fetchMarket } = useMarkets();
  const { currentMarket, isLoadingMarket, marketError } = state;

  const marketId = typeof params.id === 'string' ? params.id : '';

  console.log('🔍 MarketDetailPage - Component loaded:', {
    marketId,
    params,
    currentMarket: currentMarket?.id,
    isLoadingMarket,
    marketError,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baseUrl: typeof window !== 'undefined' ? window.location.origin : 'server'
  });

  useEffect(() => {
    if (!marketId) {
      console.error('❌ MarketDetailPage - No market ID provided');
      return;
    }

    console.log('📞 MarketDetailPage - Calling fetchMarket with ID:', marketId);
    
    try {
      fetchMarket(marketId);
    } catch (error) {
      console.error('❌ MarketDetailPage - Error calling fetchMarket:', error);
    }
  }, [marketId, fetchMarket]);

  // Show loading state
  if (isLoadingMarket) {
    console.log('⏳ MarketDetailPage - Loading market...');
    return (
      <div className="w-full max-w-[402px] h-screen relative bg-[#0f111a] flex items-center justify-center mx-auto">
        <div className="text-white text-lg">Loading market...</div>
      </div>
    );
  }

  // Show error state
  if (marketError) {
    console.error('❌ MarketDetailPage - Market error:', marketError);
    return (
      <div className="w-full max-w-[402px] h-screen relative bg-[#0f111a] flex items-center justify-center mx-auto">
        <div className="text-red-400 text-lg text-center px-4">
          <p>Error loading market</p>
          <p className="text-sm mt-2">{marketError}</p>
          <p className="text-xs mt-2 text-gray-400">Market ID: {marketId}</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!currentMarket) {
    console.warn('⚠️ MarketDetailPage - No market found for ID:', marketId);
    return (
      <div className="w-full max-w-[402px] h-screen relative bg-[#0f111a] flex items-center justify-center mx-auto">
        <div className="text-white text-lg text-center px-4">
          <p>Market not found</p>
          <p className="text-sm mt-2 text-gray-400">ID: {marketId}</p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 px-4 py-2 bg-[#e9ff74] text-black rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ MarketDetailPage - Rendering market:', currentMarket.title);
  return <MarketDetail market={currentMarket} />;
} 