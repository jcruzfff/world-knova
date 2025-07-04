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
    icon: '/user-icon.svg',
    color: '#E187FF',
    name: 'User'
  }
};

export const MarketCard = ({ market, onClick }: MarketCardProps) => {
  const displayVolume = `$${market.totalPool.toLocaleString()} WRL`;
  const categoryInfo = categoryConfig[market.category] || categoryConfig.sports;
  
  // Get the first option's image URL
  const firstOptionImage = market.options.find(option => option.imageUrl)?.imageUrl;
  const displayImage = firstOptionImage || market.imageUrl;
  
  // Debug: Enhanced image analysis
  console.log('🖼️ MarketCard Debug - Enhanced analysis:', {
    marketId: market.id,
    marketTitle: market.title,
    
    // Market-level image
    marketImageUrl: market.imageUrl,
    marketImageType: typeof market.imageUrl,
    marketImageTruthy: !!market.imageUrl,
    
    // Options analysis
    totalOptions: market.options?.length || 0,
    optionsArray: Array.isArray(market.options),
    allOptions: market.options?.map(option => ({
      id: option.id,
      title: option.title,
      imageUrl: option.imageUrl,
      imageType: typeof option.imageUrl,
      imageTruthy: !!option.imageUrl,
      orderIndex: option.orderIndex
    })) || [],
    
    // Final display logic
    firstOptionImage,
    firstOptionImageType: typeof firstOptionImage,
    displayImage,
    displayImageType: typeof displayImage,
    displayImageTruthy: !!displayImage,
    
    // Full market object sample (limited to avoid console spam)
    marketSample: {
      id: market.id,
      title: market.title?.substring(0, 50) + '...',
      category: market.category,
      status: market.status,
      imageUrl: market.imageUrl,
      optionsCount: market.options?.length
    }
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
      className="MarketCard w-full min-h-[123px] relative bg-[#1d283b] rounded-[18px] overflow-hidden cursor-pointer transition-all duration-200 hover:bg-[#243044]"
      onClick={onClick}
    >
      {/* Market Image - Fixed position hanging over right side, behind content */}
      <div 
        data-layer="Market Image" 
        className="MarketImage w-[155px] h-[155px] left-[230px] top-[13.82px] absolute origin-top-left rotate-[-9.22deg] bg-[#343e4f] rounded-lg opacity-80 z-0"
      >
        {displayImage ? (
          <Image 
            src={displayImage} 
            alt={market.title}
            fill
            className="object-cover rounded-lg"
            onLoad={() => {
              console.log('✅ MarketCard Image - Successfully loaded:', {
                marketId: market.id,
                marketTitle: market.title?.substring(0, 50) + '...',
                imageUrl: displayImage,
                source: firstOptionImage ? 'option' : 'market'
              });
            }}
            onError={(e) => {
              console.error('❌ MarketCard Image - Failed to load:', {
                marketId: market.id,
                marketTitle: market.title?.substring(0, 50) + '...',
                imageUrl: displayImage,
                source: firstOptionImage ? 'option' : 'market',
                error: e
              });
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            onLoadStart={() => {
              console.log('🔄 MarketCard Image - Starting to load:', {
                marketId: market.id,
                imageUrl: displayImage
              });
            }}
          />
        ) : (
          // Fallback for when no image is available
          <div className="w-full h-full bg-[#343e4f] rounded-lg flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-[#52617b]" 
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
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
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
          {/* Only show avatars if there are participants */}
          {market.participantCount > 0 && market.recentParticipants && market.recentParticipants.length > 0 && (
            <div 
              data-layer="Player Icons" 
              className="PlayerIcons flex justify-start items-center"
            >
              {market.recentParticipants.slice(0, 5).map((participant, index) => (
                <div 
                  key={participant.id}
                  data-layer={`Participant ${index + 1}`}
                  className={`w-4 h-4 rounded-full border-[0.80px] border-[#1d283b] ${index > 0 ? '-ml-2' : ''} relative overflow-hidden`}
                >
                  {participant.profilePictureUrl ? (
                    <Image
                      src={participant.profilePictureUrl}
                      alt={participant.username || 'User'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#52617b] flex items-center justify-center">
                      <span className="text-white text-[6px] font-bold">
                        {(participant.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div 
            data-layer="Player Count" 
            className={`PlayerCount text-[#d0d0d0] text-xs font-normal font-['Outfit'] ${market.participantCount > 0 ? 'ml-1' : ''}`}
          >
            {market.participantCount} {market.participantCount === 1 ? 'player' : 'players'}
          </div>
        </div>
      </div>
    </div>
  );
}; 