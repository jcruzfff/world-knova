'use client';

import { Market } from './types';
import { CountdownTimer } from './CountdownTimer';
import { Button } from '@worldcoin/mini-apps-ui-kit-react';

interface FeaturedMarketCardProps {
  market: Market;
  onClick?: () => void;
}

export const FeaturedMarketCard = ({ market, onClick }: FeaturedMarketCardProps) => {
  const topOutcome = market.outcomes[0];
  const secondOutcome = market.outcomes[1];

  return (
    <div 
      onClick={onClick}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700 p-6 text-white cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
              FEATURED
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm capitalize">
              {market.category}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-80">Total Volume</div>
            <div className="text-lg font-bold">{market.totalVolume}</div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-1">{market.title}</h3>
          <p className="text-sm opacity-90">{market.subtitle}</p>
        </div>

        {/* Countdown */}
        <div className="mb-6">
          <CountdownTimer 
            endTime={market.endTime} 
            variant="featured"
          />
        </div>

        {/* Outcomes */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <div>
              <div className="font-semibold">{topOutcome.name}</div>
              <div className="text-xs opacity-80">{topOutcome.percentage}% probability</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{topOutcome.odds}x</div>
              <div className="text-xs opacity-80">odds</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <div>
              <div className="font-semibold">{secondOutcome.name}</div>
              <div className="text-xs opacity-80">{secondOutcome.percentage}% probability</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{secondOutcome.odds}x</div>
              <div className="text-xs opacity-80">odds</div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full bg-white text-blue-600 hover:bg-gray-50 font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          Place Prediction
        </Button>
      </div>
    </div>
  );
}; 