'use client';

import { MarketCardProps } from './types';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';

export const FeaturedMarketCard = ({ market, onClick }: MarketCardProps) => {
  // Use correct field names from main Market type
  const topOption = market.options[0];
  const secondOption = market.options[1];
  
  // Compute display values with fallbacks
  const displaySubtitle = market.subtitle || market.description?.substring(0, 100) + '...' || 'No description';
  const displayVolume = `$${market.totalPool.toLocaleString()}`;

  return (
    <div 
      onClick={onClick}
      className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-6 text-white cursor-pointer overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl transform translate-x-16 -translate-y-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-12 translate-y-12" />
      
      {/* Featured badge */}
      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-4">
        <span>⭐</span>
        <span>Featured</span>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Title and description */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 line-clamp-2">
            {market.title}
          </h2>
          <p className="text-sm opacity-90">{displaySubtitle}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-xs opacity-75 mb-1">Total Volume</div>
            <div className="text-lg font-bold">{displayVolume}</div>
          </div>
          <div>
            <div className="text-xs opacity-75 mb-1">Participants</div>
            <div className="text-lg font-bold">{market.participantCount || 0}</div>
          </div>
        </div>

        {/* Top options preview */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <span className="font-medium">{topOption.title}</span>
            <span className="font-bold">{topOption.odds || 2.0}x</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <span className="font-medium">{secondOption.title}</span>
            <span className="font-bold">{secondOption.odds || 2.0}x</span>
          </div>
        </div>

        {/* Action */}
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold"
        >
          Place Prediction
        </Button>
      </div>
    </div>
  );
}; 