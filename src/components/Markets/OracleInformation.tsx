'use client';

import { useState } from 'react';
import type { Market } from '@/types/market';

interface OracleInformationProps {
  market: Market;
}

export const OracleInformation = ({ market }: OracleInformationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getOracleInfo = (market: Market) => {
    switch (market.category) {
      case 'sports':
        return {
          name: 'SportsRadar API',
          source: 'Official sports data provider',
          delay: '5-15 minutes',
          reliability: '99.9%',
          description: 'Real-time sports data with official game results and statistics.',
          website: 'https://www.sportradar.com'
        };
      case 'crypto':
        return {
          name: 'CoinGecko API',
          source: 'Cryptocurrency market data',
          delay: '1-5 minutes',
          reliability: '99.5%',
          description: 'Comprehensive cryptocurrency price data from multiple exchanges.',
          website: 'https://www.coingecko.com'
        };
      case 'music':
        return {
          name: 'Billboard Charts API',
          source: 'Official music charts',
          delay: '24-48 hours',
          reliability: '100%',
          description: 'Official Billboard chart positions and music industry awards.',
          website: 'https://www.billboard.com'
        };
      default:
        return {
          name: 'Knova Oracle Network',
          source: 'Decentralized oracle network',
          delay: '10-30 minutes',
          reliability: '99.0%',
          description: 'Community-driven oracle network for general predictions.',
          website: 'https://knova.io/oracles'
        };
    }
  };

  const oracleInfo = getOracleInfo(market);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-xl font-bold text-gray-900">Oracle Information</h2>
        <span className={`text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900">
              Oracle Status: Active
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Oracle Name</span>
                <span className="text-sm text-gray-900">{oracleInfo.name}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Data Source</span>
                <span className="text-sm text-gray-900">{oracleInfo.source}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Update Delay</span>
                <span className="text-sm text-gray-900">{oracleInfo.delay}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Reliability</span>
                <span className="text-sm text-green-600 font-semibold">{oracleInfo.reliability}</span>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
              <p className="text-sm text-blue-800 mb-3">
                {oracleInfo.description}
              </p>
              <a 
                href={oracleInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Learn more about this oracle →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 