'use client';

import { MarketDetail } from '@/components/Markets/MarketDetail';
import { useMarkets } from '@/providers/MarketProvider';
import { notFound } from 'next/navigation';
import { use, useEffect } from 'react';

interface MarketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MarketDetailPage({ params }: MarketDetailPageProps) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params);
  
  // Use the MarketProvider for consistent data management
  const { state, fetchMarket } = useMarkets();
  const { currentMarket, isLoadingMarket, marketError } = state;

  // Fetch market data when component mounts
  useEffect(() => {
    if (id) {
      fetchMarket(id);
    }
  }, [id, fetchMarket]);

  if (isLoadingMarket) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market...</p>
        </div>
      </div>
    );
  }

  if (marketError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading market: {marketError}</p>
          <button 
            onClick={() => fetchMarket(id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentMarket) {
    notFound();
  }

  return <MarketDetail market={currentMarket} />;
} 