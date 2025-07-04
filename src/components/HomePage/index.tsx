'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMarkets } from '@/providers/MarketProvider';
import { MarketCategoryFilter, Market } from '@/types/market';
import { AuthButton } from '@/components/AuthButton';
import { MarketCard } from '@/components/Markets/MarketCard';
import { FeaturedMarketCard } from '@/components/Markets/FeaturedMarketCard';
import { CategoryFilter } from '@/components/Markets/CategoryFilter';
import { Navigation } from '@/components/Navigation';
import { useSession } from '@/hooks/useSession';
import { ProfileCompletionWrapper } from '@/components/ProfileCompletion/ProfileCompletionWrapper';


export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const { state, fetchMarkets } = useMarkets();
  const [activeCategory, setActiveCategory] = useState<MarketCategoryFilter>('all');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [profileCompletionDismissed, setProfileCompletionDismissed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // All useEffect hooks must be before any early returns
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Check if user previously dismissed the profile completion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem('profileCompletionDismissed');
      setProfileCompletionDismissed(dismissed === 'true');
    }
  }, []);

  // Auto-show profile completion for incomplete profiles (but respect dismissal)
  useEffect(() => {
    if (user && !user.isProfileComplete && !profileCompletionDismissed) {
      // Small delay to prevent jarring immediate popup
      const timer = setTimeout(() => {
        setShowProfileCompletion(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, profileCompletionDismissed]);

  // Ensure activeCardIndex is within bounds when markets change
  useEffect(() => {
    if (state.markets.length > 0) {
      const maxIndex = Math.min(2, state.markets.length - 1); // Max 3 featured cards
      if (activeCardIndex > maxIndex) {
        setActiveCardIndex(0);
      }
    } else {
      setActiveCardIndex(0);
    }
  }, [state.markets.length, activeCardIndex]);

  // Track scroll position for active card indicator
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    try {
      const container = scrollContainerRef.current;
      const cardWidth = 356 + 16; // Card width + gap
      const scrollLeft = container.scrollLeft;
      const newActiveIndex = Math.round(scrollLeft / cardWidth);
      
      // Only update if markets exist and index is different
      if (state.markets.length > 0 && newActiveIndex !== activeCardIndex) {
        const maxIndex = Math.min(2, state.markets.length - 1); // Max 3 featured cards
        const clampedIndex = Math.max(0, Math.min(newActiveIndex, maxIndex));
        setActiveCardIndex(clampedIndex);
      }
    } catch (error) {
      console.error('Error in handleScroll:', error);
    }
  }, [activeCardIndex, state.markets.length]);

  const handleMarketClick = (marketId: string) => {
    router.push(`/markets/${marketId}`);
  };

  const handleCategoryChange = (category: MarketCategoryFilter) => {
    setActiveCategory(category);
    // Don't call fetchMarkets() - just update local state for client-side filtering
  };

  const handleProfileCompletionClose = () => {
    setShowProfileCompletion(false);
    setProfileCompletionDismissed(true);
    // Remember dismissal for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('profileCompletionDismissed', 'true');
    }
  };

  const handleProfileCompletionComplete = () => {
    setShowProfileCompletion(false);
    setProfileCompletionDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('profileCompletionDismissed');
    }
    router.refresh();
  };

  const handleOpenProfileCompletion = () => {
    setShowProfileCompletion(true);
    setProfileCompletionDismissed(false);
  };

  // Helper function to get section title based on active category
  const getSectionTitle = (category: MarketCategoryFilter): string => {
    switch (category) {
      case 'all':
        return 'All Markets';
      case 'sports':
        return 'Sports Markets';
      case 'crypto':
        return 'Crypto Markets';
      case 'music':
        return 'Music Markets';
      case 'user_generated':
        return 'Community Markets';
      default:
        return 'All Markets';
    }
  };

  // Early return after all hooks
  if (loading || state.isLoading) {
    return (
      <div className="min-h-screen bg-[#0F111A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Debug: Log market data received in HomePage
  console.log('🏠 HomePage - Market data analysis:', {
    loading,
    error: state.error ? String(state.error) : null,
    marketsCount: state.markets?.length || 0,
    userLoggedIn: !!user,
    markets: state.markets?.slice(0, 3).map(market => ({
      id: market.id,
      title: market.title?.substring(0, 50) + '...',
      imageUrl: market.imageUrl,
      hasImageUrl: !!market.imageUrl,
      optionsCount: market.options?.length || 0,
      optionsWithImages: market.options?.filter(option => option.imageUrl).length || 0,
      status: market.status,
      category: market.category
    })) || []
  });

  // Featured markets - empty for now (admin will select these later)
  const featuredMarkets: Market[] = []; // TODO: Admin-selected featured markets
  console.log('🌟 HomePage - Featured markets:', featuredMarkets.length);

  // All Markets section - show all user-created markets
  const allMarketsData = state.markets; // Show all markets
  console.log('📊 HomePage - All markets data:', allMarketsData.length);

  // Filter by category if needed
  const filteredMarkets = activeCategory === 'all' 
    ? allMarketsData
    : allMarketsData.filter(market => market.category === activeCategory);

  return (
    <>
      <div className="min-h-screen bg-[#0F111A] text-white pb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-[14px] py-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Knova</h1>
          </div>
          <div className="flex items-center gap-3">

            <AuthButton onProfileComplete={handleOpenProfileCompletion} />
          </div>
        </div>

        {/* Profile Completion Banner - only show if user is authenticated but profile incomplete and not dismissed */}
        {user && !user.isProfileComplete && !showProfileCompletion && !profileCompletionDismissed && (
          <div className="mx-[14px] mb-6 p-4 bg-[#1D283B] border border-[#373a46] rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-white font-semibold font-['Outfit']">Complete Your Profile</h3>
                  <p className="text-[#a0a0a0] text-sm font-['Outfit']">Finish setting up to access all features</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleProfileCompletionClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={handleOpenProfileCompletion}
                  className="bg-[#e9ff74] hover:bg-[#d4e668] px-4 py-2 rounded-lg text-black font-semibold text-sm font-['Outfit'] transition-colors"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Markets Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center px-[14px] mb-4">
            <h2 className="text-white text-xl font-medium">Featured Markets</h2>
            {featuredMarkets.length > 0 && (
              <div className="flex gap-1">
                {featuredMarkets.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === activeCardIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {featuredMarkets.length > 0 ? (
            /* Horizontal Scrolling Container */
            <div className="px-[14px] overflow-hidden">
              <div 
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mr-[14px] pr-12"
                onScroll={handleScroll}
              >
                {featuredMarkets.map((market) => (
                  <div key={market.id} className="snap-start">
                    <FeaturedMarketCard 
                      market={market}
                      onClick={() => handleMarketClick(market.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Coming Soon Message */
            <div className="px-[14px]">
              <div className="bg-[#1D283B] border border-[#373a46] rounded-xl p-8 text-center">
                <div className="mb-3">
                  <div className="w-12 h-12 bg-[#373a46] rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-lg font-['Outfit']">Featured Markets Coming Soon</h3>
                  <p className="text-[#a0a0a0] text-sm font-['Outfit'] mt-2">
                    Our team is curating the best prediction markets for this section
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Category Filter */}
        <div className="px-[14px] mb-6">
          <CategoryFilter
            selectedCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* All Markets Section */}
        <div className="px-[14px] mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-white">{getSectionTitle(activeCategory)}</h2>
          </div>

          <div className="space-y-3">
            {state.error ? (
              <div className="text-center py-8">
                <div className="text-red-500">{state.error}</div>
              </div>
            ) : filteredMarkets.length > 0 ? (
              filteredMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  variant="list"
                  onClick={() => handleMarketClick(market.id)}
                />
              ))
            ) : state.markets.length === 0 ? (
              <div className="bg-[#1D283B] border border-[#373a46] rounded-xl p-8 text-center">
                <div className="w-12 h-12 bg-[#373a46] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-lg font-['Outfit'] mb-2">No Markets Yet</h3>
                <p className="text-[#a0a0a0] text-sm font-['Outfit']">
                  Be the first to create a prediction market!
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-[#9CA3AF]">No markets found in this category</div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Navigation />
        </div>
      </div>

      {/* Profile Completion Sheet - Shows when user exists and sheet is requested */}
      {user && showProfileCompletion && (
        <ProfileCompletionWrapper 
          user={user} 
          initialOpen={showProfileCompletion}
          onClose={handleProfileCompletionClose}
          onComplete={handleProfileCompletionComplete}
        />
      )}


    </>
  );
} 