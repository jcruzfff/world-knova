'use client';

import { useState, useMemo, useEffect } from 'react';
import { MarketCard } from './MarketCard';
import { FeaturedMarketCard } from './FeaturedMarketCard';
import { MarketCategory } from './CategoryFilter';

// Mock market data - will be replaced with real API data
const mockMarkets = [
  {
    id: '1',
    title: 'Champions League Final 2024',
    subtitle: 'Real Madrid vs Manchester City',
    category: 'sports' as MarketCategory,
    endTime: new Date('2024-06-01T20:00:00Z'),
    totalVolume: '45.2K WLD',
    outcomes: [
      { name: 'Real Madrid Wins', odds: 2.1, percentage: 48 },
      { name: 'Manchester City Wins', odds: 1.9, percentage: 52 }
    ],
    isFeatured: true,
    image: '/images/champions-league.jpg'
  },
  {
    id: '2',
    title: 'Bitcoin Price Prediction',
    subtitle: 'Will BTC reach $100K by Dec 2024?',
    category: 'crypto' as MarketCategory,
    endTime: new Date('2024-12-31T23:59:59Z'),
    totalVolume: '89.1K WLD',
    outcomes: [
      { name: 'Yes', odds: 1.8, percentage: 56 },
      { name: 'No', odds: 2.2, percentage: 44 }
    ],
    isFeatured: false
  },
  {
    id: '3',
    title: 'Grammy Awards 2024',
    subtitle: 'Album of the Year Winner',
    category: 'music' as MarketCategory,
    endTime: new Date('2024-02-15T23:00:00Z'),
    totalVolume: '23.5K WLD',
    outcomes: [
      { name: 'Taylor Swift', odds: 1.5, percentage: 67 },
      { name: 'SZA', odds: 3.2, percentage: 22 },
      { name: 'Others', odds: 4.1, percentage: 11 }
    ],
    isFeatured: false
  },
  {
    id: '4',
    title: 'NBA Finals MVP',
    subtitle: 'Who will win Finals MVP?',
    category: 'sports' as MarketCategory,
    endTime: new Date('2024-06-20T23:59:59Z'),
    totalVolume: '67.3K WLD',
    outcomes: [
      { name: 'Jayson Tatum', odds: 2.3, percentage: 43 },
      { name: 'Luka Dončić', odds: 2.1, percentage: 47 },
      { name: 'Others', odds: 5.2, percentage: 10 }
    ],
    isFeatured: false
  },
  {
    id: '5',
    title: 'Ethereum Price Movement',
    subtitle: 'ETH above $4000 by March?',
    category: 'crypto' as MarketCategory,
    endTime: new Date('2024-03-31T23:59:59Z'),
    totalVolume: '31.8K WLD',
    outcomes: [
      { name: 'Yes', odds: 1.9, percentage: 53 },
      { name: 'No', odds: 2.0, percentage: 47 }
    ],
    isFeatured: false
  },
  {
    id: '6',
    title: 'Coachella Headliner',
    subtitle: 'Surprise headliner announcement',
    category: 'music' as MarketCategory,
    endTime: new Date('2024-04-15T00:00:00Z'),
    totalVolume: '12.4K WLD',
    outcomes: [
      { name: 'Beyoncé', odds: 3.5, percentage: 29 },
      { name: 'Drake', odds: 2.8, percentage: 36 },
      { name: 'Others', odds: 2.1, percentage: 35 }
    ],
    isFeatured: false
  },
  {
    id: '7',
    title: 'World Cup 2024 Winner',
    subtitle: 'Copa América Champion',
    category: 'sports' as MarketCategory,
    endTime: new Date('2024-07-15T00:00:00Z'),
    totalVolume: '52.7K WLD',
    outcomes: [
      { name: 'Argentina', odds: 2.5, percentage: 40 },
      { name: 'Brazil', odds: 3.0, percentage: 33 },
      { name: 'Others', odds: 2.8, percentage: 27 }
    ],
    isFeatured: false
  },
  {
    id: '8',
    title: 'Next Solana ATH',
    subtitle: 'SOL above $300 by Q2 2024?',
    category: 'crypto' as MarketCategory,
    endTime: new Date('2024-06-30T23:59:59Z'),
    totalVolume: '28.9K WLD',
    outcomes: [
      { name: 'Yes', odds: 2.4, percentage: 42 },
      { name: 'No', odds: 1.7, percentage: 58 }
    ],
    isFeatured: false
  }
];

interface MarketGridProps {
  selectedCategory?: MarketCategory;
}

export const MarketGrid = ({ selectedCategory = 'all' }: MarketGridProps) => {
  const [markets] = useState(mockMarkets);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Check screen size on client side
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Filter markets based on selected category
  const filteredMarkets = useMemo(() => {
    if (selectedCategory === 'all') {
      return markets;
    }
    return markets.filter(market => market.category === selectedCategory);
  }, [markets, selectedCategory]);

  const featuredMarket = filteredMarkets.find(m => m.isFeatured);
  const regularMarkets = filteredMarkets.filter(m => !m.isFeatured);

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">
          {selectedCategory === 'all' ? 'All Markets' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Markets`}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredMarkets.length})
          </span>
        </h3>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Featured Market - Full Width */}
      {featuredMarket && (
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            🔥 <span>Featured Market</span>
          </h4>
          <FeaturedMarketCard market={featuredMarket} />
        </div>
      )}

      {/* Regular Markets */}
      {regularMarkets.length > 0 ? (
        <div className="space-y-4">
          {regularMarkets.length > 0 && !featuredMarket && (
            <h4 className="text-lg font-bold text-gray-900">Markets</h4>
          )}
          
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {regularMarkets.map((market, index) => {
                // Create varied layouts for bento style on larger screens
                const isLarge = index % 5 === 0 && isLargeScreen;
                const cardClass = isLarge 
                  ? "lg:col-span-2" 
                  : "col-span-1";
                
                return (
                  <div key={market.id} className={cardClass}>
                    <MarketCard 
                      market={market} 
                      variant={isLarge ? 'large' : 'compact'}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {regularMarkets.map((market) => (
                <div key={market.id} className="w-full">
                  <MarketCard 
                    market={market} 
                    variant="list"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No markets found
          </h3>
          <p className="text-gray-600 mb-6">
            {selectedCategory === 'all' 
              ? "No markets are currently available." 
              : `No ${selectedCategory} markets are currently available.`
            }
          </p>
          <button 
            onClick={() => setViewMode('grid')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Refresh Markets
          </button>
        </div>
      )}

      {/* Load More Button */}
      {regularMarkets.length > 0 && (
        <div className="flex justify-center pt-6 pb-4">
          <button className="px-8 py-3 bg-white border border-gray-200 rounded-full text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2">
            <span>Load More Markets</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              +{Math.floor(Math.random() * 20) + 5}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}; 