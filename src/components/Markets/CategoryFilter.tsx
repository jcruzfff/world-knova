'use client';

import { useState } from 'react';
import { MarketCategoryFilter } from '@/types/market';

interface CategoryFilterProps {
  selectedCategory?: MarketCategoryFilter;
  onCategoryChange?: (category: MarketCategoryFilter) => void;
}

const categoryIcons = {
  all: '🌟',
  sports: '⚽',
  music: '🎵',
  crypto: '₿',
  user_generated: '👤'
};

const categoryLabels = {
  all: 'All Markets',
  sports: 'Sports',
  music: 'Music',
  crypto: 'Crypto',
  user_generated: 'User Generated'
};

export const CategoryFilter = ({ 
  selectedCategory = 'all', 
  onCategoryChange 
}: CategoryFilterProps) => {
  const [activeCategory, setActiveCategory] = useState<MarketCategoryFilter>(selectedCategory);

  const handleCategorySelect = (category: MarketCategoryFilter) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  const categories: MarketCategoryFilter[] = ['all', 'user_generated', 'sports', 'crypto', 'music'];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        
        return (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 ease-in-out flex-shrink-0
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <span className="text-base">
              {categoryIcons[category]}
            </span>
            <span>
              {categoryLabels[category]}
            </span>
          </button>
        );
      })}
    </div>
  );
}; 