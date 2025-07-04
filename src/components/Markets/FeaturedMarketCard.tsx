'use client';

import Image from 'next/image';
import { MarketCardProps } from './types';

export const FeaturedMarketCard = ({ market, onClick }: MarketCardProps) => {
  // Format the market value
  const displayVolume = `$${market.totalPool.toLocaleString()} WLD`;
  
  // Get the first option's image URL
  const firstOptionImage = market.options.find(option => option.imageUrl)?.imageUrl;
  const displayImage = firstOptionImage || market.imageUrl;
  
  // Debug: Log image URLs to help identify issues
  console.log('🌟 FeaturedMarketCard Debug:', {
    marketId: market.id,
    marketTitle: market.title,
    marketImageUrl: market.imageUrl,
    optionsWithImages: market.options.filter(option => option.imageUrl).map(option => ({
      id: option.id,
      title: option.title,
      imageUrl: option.imageUrl
    })),
    firstOptionImage,
    displayImage,
    totalOptions: market.options.length
  });
  
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
        {displayImage ? (
          <Image 
            src={displayImage} 
            alt={market.title}
            fill
            className="object-cover"
            onError={(e) => {
              console.warn('⚠️ Failed to load featured market image:', displayImage);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          // Fallback for when no image is available
          <div className="w-full h-full bg-[#3e4f6c] flex items-center justify-center">
            <svg 
              className="w-16 h-16 text-[#52617b]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
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