'use client';

import { MarketCardProps } from './types';
import { CountdownTimer } from './CountdownTimer';

const categoryIcons = {
  sports: '⚽',
  music: '🎵',
  crypto: '₿',
  all: '🌟'
};

const categoryColors = {
  sports: 'bg-green-100 text-green-700',
  music: 'bg-purple-100 text-purple-700',
  crypto: 'bg-orange-100 text-orange-700',
  all: 'bg-blue-100 text-blue-700'
};

export const MarketCard = ({ market, variant = 'compact', onClick }: MarketCardProps) => {
  const topOutcome = market.outcomes[0];
  const secondOutcome = market.outcomes[1];
  const hasMoreOutcomes = market.outcomes.length > 2;

  const isLarge = variant === 'large';
  const isList = variant === 'list';

  if (isList) {
    // List variant - horizontal layout
    return (
      <div 
        onClick={onClick}
        className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Market info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${categoryColors[market.category]}
              `}>
                <span>{categoryIcons[market.category]}</span>
                <span className="capitalize">{market.category}</span>
              </div>
              <CountdownTimer endTime={market.endTime} />
            </div>
            
            <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">
              {market.title}
            </h3>
            <p className="text-gray-600 text-xs truncate">
              {market.subtitle}
            </p>
          </div>

          {/* Center - Outcomes */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="text-center px-3 py-2 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-900">{topOutcome.name}</div>
              <div className="text-sm font-bold text-blue-600">{topOutcome.odds}x</div>
            </div>
            <div className="text-center px-3 py-2 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-900">{secondOutcome.name}</div>
              <div className="text-sm font-bold text-blue-600">{secondOutcome.odds}x</div>
            </div>
          </div>

          {/* Right side - Volume and action */}
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-500 mb-1">Volume</div>
            <div className="text-sm font-bold text-gray-900 mb-2">{market.totalVolume}</div>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              Predict
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Original compact/large variants
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          ${categoryColors[market.category]}
        `}>
          <span>{categoryIcons[market.category]}</span>
          <span className="capitalize">{market.category}</span>
        </div>
        <CountdownTimer endTime={market.endTime} />
      </div>

      {/* Title */}
      <div className="mb-4">
        <h3 className={`font-bold text-gray-900 mb-1 ${isLarge ? 'text-lg' : 'text-base'}`}>
          {market.title}
        </h3>
        <p className={`text-gray-600 ${isLarge ? 'text-sm' : 'text-xs'}`}>
          {market.subtitle}
        </p>
      </div>

      {/* Volume */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">Total Volume</div>
        <div className="text-lg font-bold text-gray-900">{market.totalVolume}</div>
      </div>

      {/* Outcomes */}
      <div className="space-y-2">
        {/* Top Outcome */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
          <div className="flex-1">
            <div className={`font-semibold text-gray-900 ${isLarge ? 'text-sm' : 'text-xs'}`}>
              {topOutcome.name}
            </div>
            <div className="text-xs text-gray-500">{topOutcome.percentage}%</div>
          </div>
          <div className="text-right">
            <div className={`font-bold text-blue-600 ${isLarge ? 'text-base' : 'text-sm'}`}>
              {topOutcome.odds}x
            </div>
          </div>
        </div>

        {/* Second Outcome */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
          <div className="flex-1">
            <div className={`font-semibold text-gray-900 ${isLarge ? 'text-sm' : 'text-xs'}`}>
              {secondOutcome.name}
            </div>
            <div className="text-xs text-gray-500">{secondOutcome.percentage}%</div>
          </div>
          <div className="text-right">
            <div className={`font-bold text-blue-600 ${isLarge ? 'text-base' : 'text-sm'}`}>
              {secondOutcome.odds}x
            </div>
          </div>
        </div>

        {/* More Outcomes Indicator */}
        {hasMoreOutcomes && (
          <div className="text-center py-2">
            <div className="text-xs text-gray-500">
              +{market.outcomes.length - 2} more options
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button 
        className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        Place Prediction
      </button>
    </div>
  );
}; 