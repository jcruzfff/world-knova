'use client';

import Image from 'next/image';
import { MarketCardProps } from './types';

const categoryConfig = {
  sports: {
    icon: '/sports-icon.svg',
    color: '#E9FF74',
    name: 'Sports'
  },
  music: {
    icon: '/music-icon.svg',
    color: '#74ffff',
    name: 'Music'
  },
  crypto: {
    icon: '/crypto-icon.svg',
    color: '#FBAC58',
    name: 'Crypto'
  },
  user_generated: {
    icon: '/user-icon.svg', // fallback
    color: '#E187FF',
    name: 'User'
  }
};

export const MarketCard = ({ market, onClick }: MarketCardProps) => {
  const displayVolume = `$${market.totalPool.toLocaleString()} WRL`;
  const categoryInfo = categoryConfig[market.category] || categoryConfig.sports;
  
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
      className="MarketCard w-full min-h-[123px] relative bg-[#1d283b] rounded-[18px] overflow-hidden cursor-pointer transition-all duration-200 hover:bg-[#243044]"
      onClick={onClick}
    >
      {/* Market Image - Fixed position hanging over right side, behind content */}
      <div 
        data-layer="Market Image" 
        className="MarketImage w-[155px] h-[155px] left-[230px] top-[13.82px] absolute origin-top-left rotate-[-9.22deg] bg-[#343e4f] rounded-lg opacity-40 z-0"
      >
        {market.imageUrl && (
          <Image 
            src={market.imageUrl} 
            alt={market.title}
            fill
            className="object-cover rounded-lg"
          />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 rounded-lg"></div>
      </div>
      
      {/* Amount Value - Fixed position on right side, auto-width */}
      <div 
        data-layer="span" 
        className="Span h-8 px-3 py-1 right-[14px] top-[14px] absolute bg-white/10 backdrop-blur-sm rounded-full border-gray-200 inline-flex justify-center items-center gap-2.5 overflow-hidden z-20 whitespace-nowrap"
      >
        <div 
          data-layer="Market Value" 
          className="MarketValue text-[#d0d0d0] text-sm font-normal font-['Outfit']"
        >
          {displayVolume}
        </div>
      </div>
      
      {/* Content Area - Flexible layout with proper z-index */}
      <div className="flex flex-col p-[14px] min-h-[123px] relative z-10">
        {/* Category */}
        <div 
          data-layer="Category" 
          className="Category inline-flex justify-start items-center gap-2 mb-5"
        >
          <div 
            data-layer="category-icon" 
            className="CategoryIcon w-3.5 h-3.5 flex justify-center items-center overflow-hidden"
          >
            <div 
              data-layer="Frame" 
              className="Frame w-3.5 h-3.5 relative bg-black/0 border-gray-200 overflow-hidden"
            >
              <Image
                src={categoryInfo.icon}
                alt={categoryInfo.name}
                width={14}
                height={14}
                className="w-3.5 h-3.5"
              />
            </div>
          </div>
          <div 
            data-layer="Category Name" 
            className="CategoryName justify-center text-xs font-normal font-['Outfit']"
            style={{ color: categoryInfo.color }}
          >
            {categoryInfo.name}
          </div>
        </div>
        
        {/* Market Question - Flexible height, renders above image, spans full width */}
        <div 
          data-layer="Market Question" 
          className="MarketQuestion flex-1 text-white text-lg font-semibold font-['Outfit'] leading-tight mb-3"
          style={{ marginBottom: '14px' }}
        >
          {displayQuestion}
        </div>
        
        {/* Player Info - Always at bottom */}
        <div 
          data-layer="Player Info" 
          className="PlayerInfo inline-flex justify-start items-center gap-1"
        >
          <div 
            data-layer="Player Icons" 
            className="PlayerIcons flex justify-start items-center"
          >
            <div data-layer="Ellipse 11904" className="Ellipse11904 w-4 h-4 bg-[#52617b] rounded-full border-[0.80px] border-[#1d283b]" />
            <div data-layer="Ellipse 11905" className="Ellipse11905 w-4 h-4 bg-[#52617b] rounded-full border-[0.80px] border-[#1d283b] -ml-2" />
            <div data-layer="Ellipse 11906" className="Ellipse11906 w-4 h-4 bg-[#52617b] rounded-full border-[0.80px] border-[#1d283b] -ml-2" />
            <div data-layer="Ellipse 11907" className="Ellipse11907 w-4 h-4 bg-[#52617b] rounded-full border-[0.80px] border-[#1d283b] -ml-2" />
            <div data-layer="Ellipse 11908" className="Ellipse11908 w-4 h-4 bg-[#52617b] rounded-full border-[0.80px] border-[#1d283b] -ml-2" />
          </div>
          <div 
            data-layer="Player Count" 
            className="PlayerCount text-[#d0d0d0] text-xs font-normal font-['Outfit'] ml-1"
          >
            {market.participantCount || 49} players
          </div>
        </div>
      </div>
    </div>
  );
}; 