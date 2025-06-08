'use client';

import { MarketDetail } from '@/components/Markets/MarketDetail';
import { useMarket } from '@/hooks/useMarketData';
import { getMarketById } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import { use } from 'react';

interface MarketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MarketDetailPage({ params }: MarketDetailPageProps) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params);
  
  // Try to fetch from API first
  const { market: currentMarket, isLoading: isLoadingMarket, error: marketError } = useMarket(id, true);
  
  // Fallback to centralized mock data if API fails or market not found
  const fallbackMarket = getMarketById(id);
  const market = currentMarket || fallbackMarket;

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
    console.warn('Market API error, falling back to mock data:', marketError);
  }

  if (!market) {
    notFound();
  }

  return <MarketDetail market={market} />;
} 