'use client';
import { useState, useEffect } from 'react';
import { PerformanceItem } from '@/components/Performance/PerformanceItem';
import { ApiResponse } from '@/types/api.types';
import { MarketStatus } from '@/types/market.types';

// Simplified market interface for performance display
interface UserMarketSummary {
  id: string;
  title: string;
  status: string;
  participantCount: number;
  viewCount: number;
  totalPool: number;
  createdAt: string;
  endTime: string;
}

export const MarketPerformanceList = () => {
  const [markets, setMarkets] = useState<UserMarketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/user/markets', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          // Handle HTTP errors gracefully
          if (response.status === 401) {
            setError('Please log in to view your markets');
            return;
          }
          if (response.status === 403) {
            setError('Access denied');
            return;
          }
          if (response.status === 500) {
            setError('Server error. Please try again later.');
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data: ApiResponse<UserMarketSummary[]> = await response.json();
        
        if (data.success) {
          // Handle successful response, even if empty
          setMarkets(data.data || []);
        } else {
          // Handle API-level errors gracefully
          setError(data.message || 'Failed to load markets');
        }
      } catch (err) {
        console.error('Error fetching markets:', err);
        // Graceful fallback for network errors
        setError('Unable to connect. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {/* Loading skeletons */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-[#1d283b] rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-[#373a46] rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-[#373a46] rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-[#373a46] rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-2">⚠️ Error</div>
        <div className="text-[#a0a0a0] text-sm mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#373a46] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#424650] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-white text-lg font-semibold font-['Outfit'] mb-2">
          No Markets Created
        </h3>
        <p className="text-[#a0a0a0] text-sm mb-4">
          Create your first prediction market to start tracking its performance.
        </p>
        <button
          onClick={() => window.location.href = '/create'}
          className="bg-[#e9ff74] text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#d4e668] transition-colors"
        >
          Create Market
        </button>
      </div>
    );
  }

  // Enrich markets with status information
  const enrichedMarkets = markets.map(market => {
    let statusText = market.status.charAt(0).toUpperCase() + market.status.slice(1).replace('_', ' ');
    let statusColor = 'text-[#a0a0a0]';

    switch (market.status as MarketStatus) {
      case 'active':
        statusColor = 'text-green-400';
        break;
      case 'resolved':
        statusColor = 'text-blue-400';
        break;
      case 'cancelled':
        statusColor = 'text-red-400';
        break;
      case 'pending_approval':
        statusColor = 'text-yellow-400';
        statusText = 'Pending';
        break;
      case 'draft':
        statusColor = 'text-[#a0a0a0]';
        break;
      default:
        break;
    }

    return {
      ...market,
      statusText,
      statusColor
    };
  });

  // Sort by creation date (newest first)
  const sortedMarkets = enrichedMarkets.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedMarkets.map((market) => (
        <PerformanceItem
          key={market.id}
          type="market"
          title={market.title}
          subtitle={`${market.participantCount} participants • ${market.viewCount} views`}
          amount={`$${market.totalPool.toFixed(2)}`}
          result={market.statusText}
          resultColor={market.statusColor}
          status={market.status}
          date={market.createdAt}
          marketId={market.id}
        />
      ))}
    </div>
  );
}; 