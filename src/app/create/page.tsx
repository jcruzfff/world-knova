'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useMarkets } from '@/providers/MarketProvider';
import { MarketCategory, MarketCategoryFilter } from '@/types/market';
import { Navigation } from '@/components/Navigation';
import { AuthButton } from '@/components/AuthButton';
import { MarketDetailsStep, FundingDetailsStep, MarketOption } from '@/components/MarketCreation';

export default function CreateMarketPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const { createMarket, state } = useMarkets();
  
    // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Market details
  const [marketTitle, setMarketTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'none'>('none');
  const [options, setOptions] = useState<MarketOption[]>([
    { id: '1', title: '' },
    { id: '2', title: '' }
  ]);
  
  // Step 2: Funding details
  const [selectedToken, setSelectedToken] = useState('WRLD');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [fundAmount, setFundAmount] = useState('0.50');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('24 hour');

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F111A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const handleAddOption = () => {
    const newOption: MarketOption = {
      id: Date.now().toString(),
      title: ''
    };
    setOptions([...options, newOption]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const handleOptionChange = (id: string, title: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, title } : option
    ));
  };

  const handleImageUpload = (id: string, file: File) => {
    // TODO: Implement image upload
    console.log('Image upload for option', id, file);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!marketTitle.trim() || options.some(opt => !opt.title.trim())) {
        alert('Please fill in all required fields');
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/');
    }
  };

  const handleLaunch = async () => {
    try {
      const durationMap = {
        '24 hour': 1,
        '1 week': 7,
        '1 month': 30
      };
      
      const durationDays = durationMap[selectedDuration as keyof typeof durationMap] || 1;
      
      const marketData = {
        title: marketTitle,
        description: `A prediction market about: ${marketTitle}`,
        category: selectedCategory === 'none' ? 'user_generated' : selectedCategory as MarketCategory,
        options: options.map((opt, index) => ({
          title: opt.title,
          description: opt.title,
          imageUrl: opt.imageUrl,
          orderIndex: index
        })),
        endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        resolutionCriteria: 'Market will be resolved based on the actual outcome.',
        tags: selectedCategory === 'none' ? [] : [selectedCategory]
      };

      const result = await createMarket(marketData);
      if (result) {
        router.push(`/markets/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create market:', error);
      alert('Failed to create market. Please try again.');
    }
  };

  const handleCategoryChange = (category: MarketCategoryFilter) => {
    // Filter out 'all' and 'user_generated' since they're not valid for creation
    if (category === 'all' || category === 'user_generated') return;
    setSelectedCategory(category);
  };

  return (
    <>
      <div className="min-h-screen bg-[#0F111A] text-white pb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-[14px] py-4">
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="w-[30px] h-[30px] bg-[#131f30] rounded-full flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-semibold">
              {currentStep === 1 ? 'Launch your Prediction' : ''}
            </h1>
          </div>
          <AuthButton onProfileComplete={() => {}} />
        </div>

        {/* Form Content */}
        <div className="px-[14px] space-y-6">
          {currentStep === 1 ? (
            <MarketDetailsStep
              marketTitle={marketTitle}
              setMarketTitle={setMarketTitle}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              options={options}
              onOptionChange={handleOptionChange}
              onImageUpload={handleImageUpload}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
              onNext={handleNext}
            />
          ) : (
            <FundingDetailsStep
              selectedToken={selectedToken}
              setSelectedToken={setSelectedToken}
              showTokenDropdown={showTokenDropdown}
              setShowTokenDropdown={setShowTokenDropdown}
              fundAmount={fundAmount}
              setFundAmount={setFundAmount}
              customAmount={customAmount}
              setCustomAmount={setCustomAmount}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              onLaunch={handleLaunch}
              isCreating={state.isCreatingMarket}
            />
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Navigation />
      </div>
    </>
  );
} 