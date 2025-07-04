'use client';
import { useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { PredictionPerformanceList } from '@/components/Performance/PredictionPerformanceList';
import { MarketPerformanceList } from '@/components/Performance/MarketPerformanceList';

export const PerformancePage = () => {
  const { user, loading } = useSession();
  const [activeTab, setActiveTab] = useState<'predictions' | 'markets'>('predictions');

  // Redirect to home if not authenticated
  if (!loading && !user) {
    window.location.href = '/';
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141b26] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141b26] pb-20">
      {/* Header with improved back button */}
      <div className="sticky top-0 bg-[#141b26] border-b border-[#373a46] z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => window.history.back()}
            className="h-10 w-10 bg-white/5 rounded-full outline-[0.50px] outline-offset-[-0.50px] outline-[#373a46] flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all duration-200"
          >
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
          </button>
          <h1 className="text-white text-lg font-semibold font-['Outfit']">
            Performance
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Enhanced Tab Navigation with wallet-dropdown style */}
      <div className="px-4 pt-6">
        <div className="bg-white/5 rounded-full p-1 border border-[#373a46]">
          <div className="flex">
            <button
              onClick={() => setActiveTab('predictions')}
              className={`flex-1 px-4 py-3 rounded-full text-sm font-medium font-['Outfit'] transition-all duration-200 ${
                activeTab === 'predictions'
                  ? 'bg-[#e9ff74] text-black shadow-lg'
                  : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
              }`}
            >
              My Predictions
            </button>
            <button
              onClick={() => setActiveTab('markets')}
              className={`flex-1 px-4 py-3 rounded-full text-sm font-medium font-['Outfit'] transition-all duration-200 ${
                activeTab === 'markets'
                  ? 'bg-[#e9ff74] text-black shadow-lg'
                  : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
              }`}
            >
              My Markets
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        {activeTab === 'predictions' ? (
          <PredictionPerformanceList />
        ) : (
          <MarketPerformanceList />
        )}
      </div>
    </div>
  );
}; 