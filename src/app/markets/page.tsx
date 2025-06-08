'use client';

import { useMarketBrowsing } from '@/hooks/useMarketData';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MarketCategoryFilter } from '@/types/market';
import { MarketCard } from '@/components/Markets/MarketCard';
import { CategoryFilter } from '@/components/Markets/CategoryFilter';
import { AuthButton } from '@/components/AuthButton';

// Enhanced client-side session check with refresh capability
function useSession() {
  const [user, setUser] = useState<any>(null);  // TODO: Add proper user type
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(() => {
    setLoading(true);
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return { user, loading, refreshSession: checkSession };
}

export default function MarketsPage() {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategoryFilter>('all');
  const {
    markets,
    totalCount,
    isLoading,
    error,
    applyFilters,
    resetFilters
  } = useMarketBrowsing();
  const router = useRouter();
  const { user, loading: sessionLoading, refreshSession } = useSession();

  // Handle category change
  const handleCategoryChange = async (category: MarketCategoryFilter) => {
    setSelectedCategory(category);
    if (category === 'all') {
      await resetFilters();
    } else {
      await applyFilters({ category });
    }
  };

  const handleMarketClick = (marketId: string) => {
    router.push(`/markets/${marketId}`);
  };

  const handleCreateClick = () => {
    if (!user) {
      // Show auth prompt or redirect to auth
      alert('Please sign in to create markets');
      return;
    }
    // TODO: Navigate to create market page
    console.log('Navigate to create market');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Bar with Auth/Create Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Knova Markets</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handleCreateClick}
              >
                + Create
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCreateClick}
                >
                  + Create
                </Button>
                <AuthButton onAuthSuccess={refreshSession} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* User Status & Market Stats Overview */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Prediction Markets</h2>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Loading...' : `${totalCount} markets available`}
            </p>
          </div>
          <div className="text-right">
            {user ? (
              <div>
                <p className="text-sm font-medium text-green-600">Welcome, {user.username}</p>
                <p className="text-xs text-gray-500">Start predicting!</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-blue-600">Browse Markets</p>
                <p className="text-xs text-gray-500">Sign in to participate</p>
              </div>
            )}
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
              <MarketCard 
                key={market.id} 
                market={market}
                variant="list"
                onClick={() => handleMarketClick(market.id)}
              />
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
            {user ? (
              <Button
                variant="primary"
                onClick={handleCreateClick}
              >
                Create the First Market
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-500">Sign in to create markets</p>
                <AuthButton onAuthSuccess={refreshSession} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 