'use client';

import { MarketDetailProps } from './types';
import { CountdownTimer } from './CountdownTimer';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useRealTimeMarkets } from '@/hooks/useRealTimeMarkets'; // TODO: Enable after smart contracts are implemented
import { ResolutionCriteria } from './ResolutionCriteria';
import { OracleInformation } from './OracleInformation';



const categoryColors = {
  sports: 'bg-green-100 text-green-700 border-green-200',
  music: 'bg-purple-100 text-purple-700 border-purple-200',
  crypto: 'bg-orange-100 text-orange-700 border-orange-200',
  user_generated: 'bg-blue-100 text-blue-700 border-blue-200',
  all: 'bg-blue-100 text-blue-700 border-blue-200'
};




export const MarketDetail = ({ market }: MarketDetailProps) => {
  const router = useRouter();
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  // TODO: Enable real-time updates after smart contracts are implemented
  // const { 
  //   markets: [updatedMarket], 
  //   lastUpdate,
  //   isConnected 
  // } = useRealTimeMarkets({ 
  //   markets: [market], 
  //   enabled: true 
  // });

  // Use static market data for now
  const currentMarket = market;
  const lastUpdate = null;
  const isConnected = false;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMakePrediction = (outcome: string) => {
    setSelectedOutcome(outcome);
    setShowPredictionModal(true);
  };

  const submitPrediction = () => {
    // This would integrate with your prediction logic
    console.log('Submitting prediction:', {
      marketId: market.id,
      outcome: selectedOutcome,
      amount: stakeAmount
    });
    setShowPredictionModal(false);
    setSelectedOutcome(null);
    setStakeAmount('');
  };

  const handleShare = async () => {
    const displaySubtitle = currentMarket.subtitle || currentMarket.description?.substring(0, 100) + '...' || 'No description';
    const shareData = {
      title: currentMarket.title,
      text: `Check out this prediction market on Knova: ${displaySubtitle}`,
      url: window.location.href,
    };

    try {
      // Use native Web Share API if available (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Market shared successfully');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${market.title}\n${shareData.text}\n${shareData.url}`);
        console.log('Market link copied to clipboard');
        // You could show a toast notification here
      }
    } catch (error: unknown) {
      // Handle user cancellation silently (this is normal behavior)
      if (error instanceof Error && (error.name === 'AbortError' || error.message?.includes('cancellation'))) {
        console.log('📤 Share cancelled by user');
        return; // Don't show error or fallback for cancellation
      }

      // Handle permission denied silently (common on desktop)
      if (error instanceof Error && (error.message?.includes('not allowed') || error.message?.includes('denied'))) {
        console.log('📋 Share not available, copying to clipboard instead');
      } else {
        console.log('📋 Share failed, falling back to clipboard');
      }

      // Fallback: Copy to clipboard (except for cancellations)
      try {
        await navigator.clipboard.writeText(`${market.title}\n${shareData.text}\n${shareData.url}`);
        console.log('📋 Market link copied to clipboard');
      } catch {
        console.log('❌ Both share and clipboard failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="text-xl">‹</span>
          </button>
          
          {/* Center: App Name */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-lg font-bold text-gray-900">KNOVA</span>
          </div>
          
          {/* Right: Share Button */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <span className="text-lg">⤴</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Market Title Section */}
        <div className="bg-white px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {currentMarket.title}
          </h1>
          {/* Real-time indicator for development */}
          {process.env.NODE_ENV === 'development' && lastUpdate && (
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              Live updates • Last: {(lastUpdate as Date).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-6">
            {/* Category and Timer */}
            <div className="flex justify-between items-center mb-4">
              <div className={`
                inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border
                ${categoryColors[currentMarket.category]}
              `}>
                <span className="capitalize">{currentMarket.category}</span>
              </div>
              <CountdownTimer endTime={currentMarket.endTime} />
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 text-lg mb-6">
              {currentMarket.subtitle || currentMarket.description?.substring(0, 200) + '...' || 'No description'}
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">${currentMarket.totalPool.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Volume</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{currentMarket.participantCount || 0}</div>
                <div className="text-sm text-gray-500">Participants</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{currentMarket.options.length}</div>
                <div className="text-sm text-gray-500">Outcomes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">
                  {currentMarket.creator ? currentMarket.creator.substring(0, 8) + '...' : 'Anonymous'}
                </div>
                <div className="text-sm text-gray-500">Creator</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 p-6">
          {/* Left Column - Market Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Market Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {market.description || (market.subtitle || 'No description available')}
              </p>
              
              {/* Tags */}
              {market.tags && market.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {market.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rules & Resolution */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Rules & Resolution</h2>
              
              {market.rules && market.rules.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Market Rules</h3>
                  <ul className="space-y-2">
                    {market.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Resolution Source:</span>
                  <span className="text-gray-900 font-medium">
                    {market.resolutionSource || 'Manual verification'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Market Ends:</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(market.endTime)}
                  </span>
                </div>
                {market.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900 font-medium">
                      {formatDate(market.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Criteria */}
            <ResolutionCriteria market={currentMarket} />

            {/* Oracle Information */}
            <OracleInformation market={currentMarket} />
          </div>

          {/* Right Column - Prediction Interface */}
          <div className="space-y-6">
            {/* Outcomes */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Make Prediction</h2>
              
              <div className="space-y-3">
                {market.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleMakePrediction(option.title)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                          {option.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {option.percentage || 50}% probability
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {option.odds || 2.0}x
                        </div>
                        <div className="text-xs text-gray-500">
                          multiplier
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Market Activity</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Most Popular</span>
                  <span className="font-semibold text-gray-900">
                    {market.options[0]?.title || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Odds</span>
                  <span className="font-semibold text-blue-600">
                    {Math.max(...market.options.map(o => o.odds || 2.0))}x
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Left</span>
                  <CountdownTimer endTime={market.endTime} compact />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Modal */}
      {showPredictionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Place Prediction: {selectedOutcome}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stake Amount (WLD)
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowPredictionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={submitPrediction}
                  disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                  className="flex-1"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 