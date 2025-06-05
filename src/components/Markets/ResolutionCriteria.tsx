'use client';

import { useState } from 'react';
import type { Market } from './types';

interface ResolutionCriteriaProps {
  market: Market;
}

export const ResolutionCriteria = ({ market }: ResolutionCriteriaProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getResolutionCriteria = (market: Market) => {
    // Generate resolution criteria based on market category and type
    const criteria = [];
    
    switch (market.category) {
      case 'sports':
        criteria.push('Official game results from the organizing body');
        criteria.push('Must be confirmed within 24 hours of event completion');
        criteria.push('Overtime/penalty results included if applicable');
        break;
      case 'crypto':
        criteria.push('Price data from CoinGecko API at market close time');
        criteria.push('USD price averaged over 1-hour window');
        criteria.push('Must reach target for minimum 1 hour to qualify');
        break;
      case 'music':
        criteria.push('Official results from award ceremony or chart provider');
        criteria.push('Billboard or Grammy official announcements only');
        criteria.push('Must be confirmed by primary source');
        break;
      default:
        criteria.push('Resolution based on publicly verifiable information');
        criteria.push('Multiple source confirmation required');
        criteria.push('Market creator reserves final decision rights');
    }

    return criteria;
  };

  const criteria = getResolutionCriteria(market);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-xl font-bold text-gray-900">Resolution Criteria</h2>
        <span className={`text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <p className="text-gray-600 text-sm">
            This market will be resolved according to the following criteria:
          </p>
          
          <ul className="space-y-3">
            {criteria.map((criterion, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700">
                <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                <span className="text-sm">{criterion}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 text-lg flex-shrink-0">⚠️</span>
              <div>
                <h4 className="font-semibold text-amber-800">Important Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Resolution disputes will be handled by the Knova team. 
                  All decisions are final and based on available evidence at resolution time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 