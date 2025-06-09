'use client';

import Image from 'next/image';
import { MarketCardProps } from './types';

export const FeaturedMarketCard = ({ market, onClick }: MarketCardProps) => {
  // Format the market value
  const displayVolume = `$${market.totalPool.toLocaleString()} WLD`;
  
  // Truncate question if longer than 12 words
  const truncateQuestion = (question: string, maxWords: number = 12): string => {
    const words = question.split(' ');
    if (words.length <= maxWords) {
      return question;
    }
    return words.slice(0, maxWords).join(' ') + '...?';
  };
  
  const displayQuestion = truncateQuestion(market.title);
  
  return (
    <div 
      data-layer="Market Card" 
      className="MarketCard w-[356px] h-[237px] relative bg-[#1d283b] rounded-[18px] overflow-hidden cursor-pointer flex-shrink-0"
      onClick={onClick}
    >
      <div 
        data-layer="Market Question" 
        className="MarketQuestion left-[14px] bottom-[14px] absolute text-white text-lg font-normal leading-tight max-w-[328px] flex items-center"
        style={{ top: '170px', height: '53px' }}
      >
        <span className="py-[14px]">
          {displayQuestion}
        </span>
      </div>
      
      <div 
        data-layer="Market Image" 
        className="MarketImage w-[356px] h-[156px] left-0 top-0 absolute bg-[#3e4f6c]"
      >
        {market.imageUrl ? (
          <Image 
            src={market.imageUrl} 
            alt={market.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#3e4f6c]" />
        )}
        
        {/* Amount Value - Top Left */}
        <div 
          data-layer="span" 
          className="Span h-9 px-3 py-1 left-[14px] top-[14px] absolute bg-white/10 backdrop-blur-sm rounded-full border-gray-200 inline-flex justify-center items-center gap-2.5 overflow-hidden"
        >
          <div 
            data-layer="Market Value" 
            className="MarketValue text-[#d0d0d0] text-base font-normal"
          >
            {displayVolume}
          </div>
        </div>

        {/* Player Icons and Count - Top Right */}
        <div className="absolute right-[14px] top-[24px] flex items-center gap-2">
          <div 
            data-layer="Player Icons" 
            className="PlayerIcons inline-flex justify-start items-center"
          >
            <div data-layer="Ellipse 11904" className="w-4 h-4 bg-[#52617b] rounded-full border-[0.80px] border-[#1d283b]" />
            <div data-layer="Ellipse 11905" className="w-4 h-4 bg-[#52617b] rounded-full border-[0.80px] border-[#1d283b] -ml-2" />
            <div data-layer="Ellipse 11906" className="w-4 h-4 bg-[#52617b] rounded-full border-[0.80px] border-[#1d283b] -ml-2" />
          </div>
          
          <div 
            data-layer="Player Count" 
            className="PlayerCount text-[#d0d0d0] text-xs font-normal whitespace-nowrap"
          >
            {market.participantCount || 129} players
          </div>
        </div>
      </div>
    </div>
  );
}; 