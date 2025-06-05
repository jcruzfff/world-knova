'use client';

import { useMarketBrowsing } from '@/hooks/useMarketData';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarketCategory, Market } from '@/types/market';

// Simple market card component for now
function MarketCard({ market }: { market: Market }) {
  const router = useRouter();

  const handleCardClick = () => {
    console.log('Navigating to market:', market.id);
    router.push(`/markets/${market.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-95 " 
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{market.title}</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
          {market.category}
        </span>
      </div>
      
      <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-2">
        {market.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>${market.totalPool?.toLocaleString() || 0} pool</span>
        <span>{market.participantCount} participants</span>
      </div>
      
      {market.createdBy && (
        <div className="mt-2 text-xs text-gray-400">
          Created by @{market.createdBy.username}
        </div>
      )}
    </div>
  );
}

// Category filter component
function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange 
}: { 
  selectedCategory: MarketCategory | 'all';
  onCategoryChange: (category: MarketCategory | 'all') => void;
}) {
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'user_generated', label: 'User Generated' },
    { id: 'sports', label: 'Sports' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'music', label: 'Music' }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id as MarketCategory | 'all')}
          className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

export default function MarketsPage() {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'all'>('all');
  const {
    markets,
    totalCount,
    isLoading,
    error,
    applyFilters,
    resetFilters
  } = useMarketBrowsing();

  // Handle category change
  const handleCategoryChange = async (category: MarketCategory | 'all') => {
    setSelectedCategory(category);
    if (category === 'all') {
      await resetFilters();
    } else {
      await applyFilters({ category });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Bar with Create Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Markets</h1>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              // TODO: Navigate to create market page
              console.log('Navigate to create market');
            }}
          >
            + Create
          </Button>
        </div>
      </div>
      
      {/* Market Stats Overview */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Prediction Markets</h2>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Loading...' : `${totalCount} markets available`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-600">Active</p>
            <p className="text-xs text-gray-500">Make predictions</p>
          </div>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>
      
      {/* Markets Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading markets...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-red-800">Error loading markets</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={() => resetFilters()}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Markets Grid */}
        {!isLoading && !error && markets.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && markets.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No markets found</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory === 'all' 
                ? "There are no prediction markets available right now."
                : `No markets found in the ${selectedCategory} category.`
              }
            </p>
            <Button
              variant="primary"
              onClick={() => {
                // TODO: Navigate to create market
                console.log('Create first market');
              }}
            >
              Create the First Market
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 