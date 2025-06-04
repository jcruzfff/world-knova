'use client';

import { useState } from 'react';

export type MarketCategory = 'all' | 'sports' | 'music' | 'crypto';

interface CategoryFilterProps {
  selectedCategory?: MarketCategory;
  onCategoryChange?: (category: MarketCategory) => void;
}

const categoryIcons = {
  all: '🌟',
  sports: '⚽',
  music: '🎵',
  crypto: '₿'
};

const categoryLabels = {
  all: 'All Markets',
  sports: 'Sports',
  music: 'Music',
  crypto: 'Crypto'
};

export const CategoryFilter = ({ 
  selectedCategory = 'all', 
  onCategoryChange 
}: CategoryFilterProps) => {
  const [activeCategory, setActiveCategory] = useState<MarketCategory>(selectedCategory);

  const handleCategorySelect = (category: MarketCategory) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  const categories: MarketCategory[] = ['all', 'sports', 'music', 'crypto'];

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