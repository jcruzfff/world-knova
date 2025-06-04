'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock trending markets data - will be replaced with real API data
const trendingMarkets = [
  {
    id: '1',
    title: 'Champions League Final',
    subtitle: 'Real Madrid vs Manchester City',
    volume: '45.2K WLD',
    topOutcome: { name: 'Real Madrid Wins', percentage: 52 },
    change: '+12%',
    timeLeft: '2d 14h',
    category: 'sports'
  },
  {
    id: '2',
    title: 'Bitcoin $100K',
    subtitle: 'Will BTC reach $100K by Dec 2024?',
    volume: '89.1K WLD',
    topOutcome: { name: 'Yes', percentage: 56 },
    change: '+8%', 
    timeLeft: '45d',
    category: 'crypto'
  },
  {
    id: '3',
    title: 'Grammy Awards',
    subtitle: 'Album of the Year Winner',
    volume: '23.5K WLD',
    topOutcome: { name: 'Taylor Swift', percentage: 67 },
    change: '+15%',
    timeLeft: '28d',
    category: 'music'
  }
];

const categoryIcons = {
  sports: '⚽',
  music: '🎵',
  crypto: '₿'
};

const categoryColors = {
  sports: 'bg-green-100 text-green-700',
  music: 'bg-purple-100 text-purple-700',
  crypto: 'bg-orange-100 text-orange-700'
};

export const MarketHighlights = () => {
  const router = useRouter();
  const [markets] = useState(trendingMarkets);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Trending Markets</h2>
        <button 
          onClick={() => router.push('/markets')}
          className="text-blue-600 text-sm font-medium hover:text-blue-700"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {markets.map((market) => (
          <div 
            key={market.id}
            onClick={() => router.push(`/markets/${market.id}`)}
            className="bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${categoryColors[market.category as keyof typeof categoryColors]}
              `}>
                <span>{categoryIcons[market.category as keyof typeof categoryIcons]}</span>
                <span className="capitalize">{market.category}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Volume</div>
                <div className="text-sm font-semibold text-gray-900">{market.volume}</div>
              </div>
            </div>

            {/* Title */}
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 mb-1">{market.title}</h3>
              <p className="text-sm text-gray-600">{market.subtitle}</p>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-gray-500">Leading</div>
                  <div className="text-sm font-medium text-gray-900">
                    {market.topOutcome.name} ({market.topOutcome.percentage}%)
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Ends in</div>
                  <div className="text-sm font-medium text-gray-900">{market.timeLeft}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-green-600 text-sm font-semibold">{market.change}</div>
                <div className="text-xs text-gray-500">24h volume</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick CTA */}
      <button 
        onClick={() => router.push('/markets')}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors duration-200"
      >
        Explore All Markets
      </button>
    </div>
  );
}; 