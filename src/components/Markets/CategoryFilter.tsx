'use client';

import { useState } from 'react';
import { MarketCategoryFilter } from '@/types/market';

interface CategoryFilterProps {
  selectedCategory?: MarketCategoryFilter;
  onCategoryChange?: (category: MarketCategoryFilter) => void;
}


const categoryLabels = {
  all: 'All',
  sports: 'Sports',
  music: 'Music',
  crypto: 'Crypto',
  user_generated: 'User'
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

  const categories: MarketCategoryFilter[] = ['all', 'sports', 'crypto', 'music'];

  return (
    <div data-layer="Tab" className="Tab h-[42px] p-1 bg-[#0f111a] rounded-[80px] outline outline-offset-[-1px] outline-[#262833] inline-flex justify-start items-start gap-px">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        
        return (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            data-layer="Tab Item" 
            className={`TabItem h-[34px] px-[18px] py-3 rounded-[80px] inline-flex flex-col justify-center items-center gap-2.5 transition-all duration-200 ease-in-out ${
              isActive 
                ? 'bg-gradient-to-br from-[#343445] to-[#2a2a3e]/60' 
                : ''
            }`}
          >
            <div data-layer="Tab Label Container" className="TabLabelContainer inline-flex justify-start items-center gap-4">
              <div data-layer="Tab Label" className="TabLabel justify-center text-white text-base font-medium font-['Outfit'] leading-tight">
                {categoryLabels[category]}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}; 