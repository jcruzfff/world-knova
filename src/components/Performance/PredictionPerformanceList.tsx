'use client';
import { useState, useEffect } from 'react';
import { PerformanceItem } from '@/components/Performance/PerformanceItem';
import { Prediction } from '@/types/prediction.types';
import { ApiResponse } from '@/types/api.types';

// Temporary interface for display until predictions are fully implemented
interface PredictionDisplay {
  id: string;
  userId: string;
  marketId: string;
  outcome: string;
  stake: number;
  odds: number;
  potentialPayout: number;
  status: 'active' | 'won' | 'lost' | 'refunded';
  payout?: number | null;
  createdAt: Date;
  updatedAt: Date;
  marketTitle?: string;
  marketEndDate?: string;
}

export const PredictionPerformanceList = () => {
  const [predictions, setPredictions] = useState<PredictionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/user/predictions', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          // Handle HTTP errors gracefully
          if (response.status === 401) {
            setError('Please log in to view your predictions');
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
        
        const data: ApiResponse<Prediction[]> = await response.json();
        
        if (data.success) {
          // Handle successful response, even if empty
          setPredictions(data.data || []);
        } else {
          // Handle API-level errors gracefully
          setError(data.message || 'Failed to load predictions');
        }
      } catch (err) {
        console.error('Error fetching predictions:', err);
        // Graceful fallback for network errors
        setError('Unable to connect. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
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

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-white text-lg font-semibold font-['Outfit'] mb-2">
          No Predictions Yet
        </h3>
        <p className="text-[#a0a0a0] text-sm mb-4">
          Start making predictions on markets to track your performance here.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-[#e9ff74] text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#d4e668] transition-colors"
        >
          Browse Markets
        </button>
      </div>
    );
  }

  // Calculate profit/loss for each prediction
  const enrichedPredictions = predictions.map(prediction => {
    let profitLoss = 0;
    let profitLossText = '';
    let profitLossColor = '';

    switch (prediction.status) {
      case 'won':
        profitLoss = (prediction.payout || 0) - prediction.stake;
        profitLossText = `+$${profitLoss.toFixed(2)}`;
        profitLossColor = 'text-green-400';
        break;
      case 'lost':
        profitLoss = -prediction.stake;
        profitLossText = `-$${prediction.stake.toFixed(2)}`;
        profitLossColor = 'text-red-400';
        break;
      case 'refunded':
        profitLoss = 0;
        profitLossText = 'Refunded';
        profitLossColor = 'text-[#a0a0a0]';
        break;
      case 'active':
      default:
        profitLossText = 'Pending';
        profitLossColor = 'text-[#a0a0a0]';
        break;
    }

    return {
      ...prediction,
      profitLoss,
      profitLossText,
      profitLossColor
    };
  });

  // Sort by creation date (newest first)
  const sortedPredictions = enrichedPredictions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedPredictions.map((prediction) => (
        <PerformanceItem
          key={prediction.id}
          type="prediction"
          title={prediction.marketTitle || 'Market Prediction'}
          subtitle={`Predicted: ${prediction.outcome}`}
          amount={`$${prediction.stake.toFixed(2)}`}
          result={prediction.profitLossText}
          resultColor={prediction.profitLossColor}
          status={prediction.status}
          date={prediction.createdAt.toString()}
        />
      ))}
    </div>
  );
}; 