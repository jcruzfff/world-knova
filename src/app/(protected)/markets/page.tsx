'use client';

import { MarketGrid } from '@/components/Markets/MarketGrid';
import { CategoryFilter, MarketCategory } from '@/components/Markets/CategoryFilter';
import { MarketStats } from '@/components/Markets/MarketStats';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { useState } from 'react';

export default function MarketsPage() {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('all');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Bar */}
      <TopBar 
        title="Markets" 
        className="bg-white border-b border-gray-200"
      />
      
      {/* Market Stats Overview */}
      <div className="px-4 py-3 bg-white">
        <MarketStats />
      </div>
      
      {/* Category Filter */}
      <div className="px-4 py-2 bg-white border-b border-gray-100">
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>
      
      {/* Markets Grid - Bento Style */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <MarketGrid selectedCategory={selectedCategory} />
      </div>
    </div>
  );
} 