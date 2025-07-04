'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/hooks/useSession';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { PredictionWagerOverlayProps } from './types';
import Image from 'next/image';

export const PredictionWagerOverlay = ({ 
  isOpen, 
  onCloseAction, 
  market, 
  selectedOption,
  selectedOptionData,
  onPredictionMade
}: PredictionWagerOverlayProps) => {
  const { user } = useSession();
  const { balance } = useWalletBalance(user?.walletAddress);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const [wagerAmount, setWagerAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState<string | null>(null);

  // Reset wager amount when overlay opens/closes
  useEffect(() => {
    if (isOpen) {
      setWagerAmount('');
      setSelectedPercentage(null);
    }
  }, [isOpen]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isOpen]);

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCloseAction();
    }
  };

  // Calculate potential earnings (placeholder logic for now)
  const calculatePotentialEarnings = (amount: number): number => {
    if (!amount || amount <= 0) return 0;
    // Placeholder odds calculation - will be replaced with smart contract logic
    const baseOdds = 1.8; // Example 1.8x multiplier
    return Math.round(amount * baseOdds * 100) / 100;
  };

  const wagerAmountNum = parseFloat(wagerAmount) || 0;
  const potentialEarnings = calculatePotentialEarnings(wagerAmountNum);
  const availableBalance = parseFloat(balance?.formatted || '0');
  const isValidAmount = wagerAmountNum > 0 && wagerAmountNum <= availableBalance;

  const handleSubmitWager = async () => {
    if (!isValidAmount || !user || !market || !selectedOption || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate prediction submission - will be replaced with actual API call
      console.log('Submitting wager:', {
        marketId: market.id,
        userId: user.id,
        outcome: selectedOption,
        amount: wagerAmountNum,
        potentialEarnings
      });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the parent callback to update market stats
      if (onPredictionMade) {
        onPredictionMade({
          userId: user.id,
          outcome: selectedOption,
          stake: wagerAmountNum,
          potentialEarnings
        });
      }
      
      // Close overlay on success
      onCloseAction();
      
    } catch (error) {
      console.error('Error submitting wager:', error);
      // TODO: Add proper error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAmount = (percentage: number, label: string) => {
    const quickAmount = Math.floor((availableBalance * percentage) * 100) / 100;
    setWagerAmount(quickAmount.toString());
    setSelectedPercentage(label);
  };

  const handleWagerAmountChange = (value: string) => {
    setWagerAmount(value);
    // Clear selected percentage if user manually changes amount
    setSelectedPercentage(null);
  };

  if (!isOpen || !market || !selectedOption) return null;

  return (
    <>
      {/* Backdrop - darker opacity for this overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Overlay Modal */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div 
          ref={overlayRef}
          className={`bg-[#1d283a] rounded-[24px] w-full max-w-[380px] shadow-2xl transform transition-all duration-300 ease-out ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-white text-xl font-semibold font-['Outfit']">
              Place Your Prediction
            </h2>
            <button
              onClick={onCloseAction}
              className="w-8 h-8 bg-[#343e4f] rounded-full flex items-center justify-center hover:bg-[#3d4856] transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Selected Option Display */}
          <div className="px-6 pb-4">
            <div className="bg-[#0f111a] rounded-[16px] p-4">
              <p className="text-[#d0d0d0] text-sm font-normal font-['Outfit'] mb-2">
                {market.title}
              </p>
              <div className="flex items-center gap-3">
                {selectedOptionData?.imageUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#343e4f]">
                    <Image 
                      src={selectedOptionData.imageUrl} 
                      alt={selectedOption}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-white text-base font-semibold font-['Outfit']">
                    {selectedOption}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Wager Amount Section with Available Balance */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[#d0d0d0] text-sm font-normal font-['Outfit']">
                Wager Amount
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[#d0d0d0] text-sm font-normal font-['Outfit']">
                  Available:
                </span>
                <Image 
                  src="/world-icon.svg" 
                  alt="World Currency"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span className="text-white text-base font-semibold font-['Outfit']">
                  {balance?.formatted || '0'}
                </span>
              </div>
            </div>
            <div className="bg-[#0f111a] rounded-[12px] p-4 border border-[#343e4f] focus-within:border-[#e9ff74] transition-colors">
              <div className="flex items-center gap-2">
                <Image 
                  src="/world-icon.svg" 
                  alt="World Currency"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <input
                  type="number"
                  value={wagerAmount}
                  onChange={(e) => handleWagerAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-white text-lg font-semibold font-['Outfit'] outline-none placeholder:text-[#6e81a1]"
                  step="0.01"
                  min="0"
                  max={availableBalance}
                />
              </div>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-3">
              {[
                { percentage: 0.25, label: '25%' },
                { percentage: 0.5, label: '50%' },
                { percentage: 0.75, label: '75%' },
                { percentage: 1, label: 'Max' }
              ].map(({ percentage, label }) => {
                const isSelected = selectedPercentage === label;
                return (
                  <button
                    key={percentage}
                    onClick={() => handleQuickAmount(percentage, label)}
                    className={`flex-1 rounded-full py-2 px-3 transition-all duration-200 ${
                      isSelected 
                        ? 'bg-[#e9ff74] text-black' 
                        : 'bg-[#343e4f] hover:bg-[#3d4856] text-[#d0d0d0]'
                    }`}
                  >
                    <span className="text-sm font-medium font-['Outfit']">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Potential Earnings */}
          {wagerAmountNum > 0 && (
            <div className="px-6 pb-4">
              <div className="bg-[#0f111a] rounded-[12px] p-4 border border-[#e9ff74]/20">
                <div className="flex items-center justify-between">
                  <span className="text-[#d0d0d0] text-sm font-normal font-['Outfit']">
                    Potential Earnings
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Image 
                      src="/world-icon.svg" 
                      alt="World Currency"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                    <span className="text-[#e9ff74] text-lg font-semibold font-['Outfit']">
                      +{potentialEarnings.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-[#6e81a1] text-xs font-normal font-['Outfit'] mt-1">
                  Based on current odds (estimated)
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {wagerAmountNum > availableBalance && (
            <div className="px-6 pb-4">
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">
                  Insufficient balance. Maximum wager: {balance?.formatted || '0'}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="p-6 pt-2">
            <button
              onClick={handleSubmitWager}
              disabled={!isValidAmount || isSubmitting || !user}
              className="w-full bg-[#e9ff74] hover:bg-[#d4e866] disabled:bg-[#343e4f] disabled:text-[#6e81a1] rounded-full py-4 transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span className="text-black text-base font-semibold font-['Outfit']">
                    Placing Prediction...
                  </span>
                </div>
              ) : (
                <span className="text-black text-base font-semibold font-['Outfit']">
                  Place Prediction
                </span>
              )}
            </button>
            
            {!user && (
              <p className="text-[#6e81a1] text-sm font-normal font-['Outfit'] text-center mt-2">
                Please sign in to place predictions
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}; 