'use client';

import { MarketDetail } from '@/components/Markets/MarketDetail';
import { useMarket } from '@/hooks/useMarketData';
import { notFound } from 'next/navigation';
import { use } from 'react';

// Fallback mock data for development - this would come from your API/database
const MOCK_MARKETS = {
  '1': {
    id: '1',
    title: 'Will Bitcoin hit $100K by end of 2024?',
    subtitle: 'Crypto market prediction based on current trends and institutional adoption',
    description: 'With increasing institutional adoption, ETF approvals, and the upcoming halving event, many analysts believe Bitcoin could reach the $100,000 milestone by the end of 2024. This market will resolve based on the highest Bitcoin price reached on any major exchange (Coinbase, Binance, Kraken) before December 31, 2024, 11:59 PM UTC.',
    category: 'crypto' as const,
    endTime: new Date('2024-12-31T23:59:59Z'),
    totalVolume: '2.4M WLD',
    outcomes: [
      { name: 'Yes', odds: 1.85, percentage: 54 },
      { name: 'No', odds: 2.15, percentage: 46 }
    ],
    isFeatured: true,
    image: '/images/bitcoin-market.jpg',
    totalStakers: 1247,
    createdAt: new Date('2024-01-15'),
    creator: 'CryptoAnalyst',
    tags: ['bitcoin', 'cryptocurrency', 'price-prediction', '100k'],
    resolutionSource: 'CoinGecko API + Manual verification',
    rules: [
      'Market resolves to "Yes" if Bitcoin reaches or exceeds $100,000 USD on any major exchange',
      'Market resolves to "No" if Bitcoin does not reach $100,000 USD by the deadline',
      'Price must be sustained for at least 10 minutes to count',
      'In case of exchange discrepancies, the highest price among Coinbase, Binance, and Kraken will be used'
    ]
  },
  '2': {
    id: '2',
    title: 'Who will win Super Bowl 2025?',
    subtitle: 'NFL Championship prediction for the 2024-2025 season',
    description: 'The Kansas City Chiefs are defending champions, but can they repeat? With strong contenders like the 49ers, Bills, and Ravens, this season promises exciting competition. This market will resolve based on the official Super Bowl LIX winner in February 2025.',
    category: 'sports' as const,
    endTime: new Date('2025-02-09T23:59:59Z'),
    totalVolume: '1.8M WLD',
    outcomes: [
      { name: 'Kansas City Chiefs', odds: 2.1, percentage: 28 },
      { name: 'San Francisco 49ers', odds: 2.3, percentage: 25 },
      { name: 'Buffalo Bills', odds: 2.8, percentage: 20 },
      { name: 'Baltimore Ravens', odds: 3.2, percentage: 18 },
      { name: 'Other Team', odds: 4.5, percentage: 9 }
    ],
    isFeatured: false,
    totalStakers: 892,
    createdAt: new Date('2024-09-01'),
    creator: 'SportsOracle',
    tags: ['nfl', 'superbowl', 'american-football', 'championship'],
    resolutionSource: 'Official NFL results',
    rules: [
      'Market resolves based on the official Super Bowl LIX winner',
      'Game must be completed according to NFL rules',
      'If the game is postponed, the market deadline extends accordingly',
      'Overtime results count toward the final outcome'
    ]
  }
};

interface MarketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MarketDetailPage({ params }: MarketDetailPageProps) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params);
  
  // Try to fetch from API first
  const { currentMarket, isLoadingMarket, marketError } = useMarket(id, true);
  
  // Fallback to mock data if API fails or market not found
  const fallbackMarket = MOCK_MARKETS[id as keyof typeof MOCK_MARKETS];
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