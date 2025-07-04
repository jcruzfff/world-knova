'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/hooks/useSession';
import { Market, MarketOption } from '@/types';
import Image from 'next/image';

interface MarketDetailSheetProps {
  isOpen: boolean;
  onCloseAction: () => void;
  market: Market | null;
}

// Player icons component for avatars
const PlayerIcons = ({ count }: { count: number }) => {
  const displayCount = Math.min(count, 3);
  const avatars = Array.from({ length: displayCount }, (_, i) => i);
  
  return (
    <div className="flex items-center">
      <div className="flex -space-x-1">
        {avatars.map((_, index) => (
          <div
            key={index}
            className="w-6 h-6 bg-[#52617b] rounded-full border-[1.2px] border-[#1d283b]"
          />
        ))}
      </div>
    </div>
  );
};

// Comment component
interface Comment {
  id: string;
  author: string;
  timeAgo: string;
  text: string;
  avatar?: string;
}

const CommentItem = ({ comment }: { comment: Comment }) => (
  <div className="flex gap-3 py-3">
    <div className="relative w-8 h-8">
      <Image 
        className="rounded-full border-gray-200" 
        src={comment.avatar || "https://placehold.co/32x32"} 
        alt={comment.author}
        width={32}
        height={32}
      />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white text-sm font-semibold">{comment.author}</span>
        <span className="text-gray-400 text-xs">{comment.timeAgo}</span>
      </div>
      <p className="text-gray-300 text-sm leading-tight">{comment.text}</p>
    </div>
  </div>
);

export const MarketDetailSheet = ({ isOpen, onCloseAction, market }: MarketDetailSheetProps) => {
  const { user } = useSession();
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Touch handling for swipe-to-close - improved implementation
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  
     // Prevent body scroll when sheet is open and reset drag state
   useEffect(() => {
     if (isOpen) {
       // Prevent body scroll
       document.body.style.overflow = 'hidden';
       document.body.style.position = 'fixed';
       document.body.style.width = '100%';
       document.body.style.top = '0';
     } else {
       // Restore body scroll and reset drag state
       document.body.style.overflow = '';
       document.body.style.position = '';
       document.body.style.width = '';
       document.body.style.top = '';
       
       // Reset drag state when sheet closes
       setIsDragging(false);
       setCurrentTranslateY(0);
     }

     return () => {
       // Cleanup on unmount
       document.body.style.overflow = '';
       document.body.style.position = '';
       document.body.style.width = '';
       document.body.style.top = '';
     };
   }, [isOpen]);

  // Improved touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const sheetElement = sheetRef.current;
    
    if (!sheetElement) return;
    
    // Only allow dragging from the timer header area (84px)
    const sheetRect = sheetElement.getBoundingClientRect();
    const touchY = touch.clientY;
    const relativeY = touchY - sheetRect.top;
    
    // Allow dragging only from top 84px (timer header area)
    if (relativeY <= 84) {
      setIsDragging(true);
      setDragStartY(touchY);
      setCurrentTranslateY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault(); // Prevent background scrolling
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartY;
    
    // Only allow downward dragging
    if (deltaY > 0) {
      setCurrentTranslateY(deltaY);
      
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged down more than 100px, close the sheet
    if (currentTranslateY > 100) {
      onCloseAction();
    } else {
      // Spring back to original position with smooth animation
      setCurrentTranslateY(0);
    }
  };

  // Handle backdrop click - only close if clicking outside sheet content
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCloseAction();
    }
  };
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Alex Chen',
      timeAgo: '2m ago',
      text: 'Option A looks more professional but Option B has better UX flow. Tough choice!'
    },
    {
      id: '2', 
      author: 'Sarah Kim',
      timeAgo: '5m ago',
      text: 'Going all in on Option A! The color scheme is perfect for the target audience.'
    },
    {
      id: '3',
      author: 'Mike Rodriguez', 
      timeAgo: '8m ago',
      text: 'Option B has more personality. Sometimes bold choices win in the market.'
    }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleMakePrediction = async (outcome: string) => {
    if (!user) {
      // Handle user authentication
      console.log('User needs to authenticate');
      return;
    }
    
    // You could open a prediction modal here or handle inline
    console.log('Making prediction:', {
      marketId: market?.id,
      outcome,
      userId: user.id
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: user.username || 'Anonymous',
      timeAgo: 'now',
      text: newComment.trim()
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  // Simple countdown timer - will be replaced with smart contract logic
  const CountdownHeader = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
      // Quick fix: simple timer without complex dependencies
      const interval = setInterval(() => {
        if (!market?.endTime) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        const now = new Date().getTime();
        const end = new Date(market.endTime).getTime();
        const difference = end - now;

        if (difference > 0) {
          setTimeLeft({
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          });
        } else {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);

      return () => clearInterval(interval);
    }, []); // Empty dependency array - simple and works

    return (
      <span className="text-center text-[#e9ff74] text-[23px] font-semibold font-['Outfit'] leading-loose">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    );
  };

  if (!isOpen || !market) return null;

  return (
    <>
      {/* Backdrop - reduced opacity so users can see Knova title and wallet */}
      <div 
        className={`fixed inset-0 bg-black/10 z-40 transition-opacity duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Drawer - slides up from bottom to 72px from top with smooth easing */}
      <div 
        className="fixed left-0 right-0 top-[72px] z-50 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{ 
          transform: isOpen ? 'translateY(0)' : 'translateY(100vh)'
        }}
      >
        <div 
          ref={sheetRef}
          className="bg-[#0f111a] rounded-t-[34px] shadow-2xl h-[calc(100vh-72px)] overflow-hidden"
          style={{ 
            transform: `translateY(${currentTranslateY}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {/* Timer header container - matches exact design specifications */}
          <div 
            className="w-[402px] h-[84px] relative rounded-tl-[32px] rounded-tr-[32px] overflow-hidden mx-auto touch-manipulation"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={onCloseAction}
          >
            {/* Header background */}
            <div className="w-[402px] h-[84px] left-0 top-0 absolute bg-[#2a3445] rounded-tl-[32px] rounded-tr-[32px]" />
            
            {/* Draggable handle - Vector 1479 */}
            <div className="w-[82px] h-0 left-[160px] top-[7px] absolute outline-[3px] outline-offset-[-1.50px] outline-[#6e81a1] hover:outline-[#8a96b0] transition-colors duration-200" />
            
            {/* Time remaining label */}
            <div className="left-[146px] top-[22px] absolute justify-start text-[#d0d0d0] text-base font-normal font-['Outfit']">
              Time remaining
            </div>
            
            {/* Time remaining value */}
            <div className="left-[158px] top-[42px] absolute text-center justify-start text-[#e9ff74] text-[23px] font-semibold font-['Outfit'] leading-loose">
              <CountdownHeader />
            </div>
          </div>

          {/* Scrollable Content - prevent event bubbling to draggable area */}
          <div 
            ref={contentRef}
            className="overflow-y-auto h-[calc(100vh-72px-84px)] overscroll-contain"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Market question */}
            <div className="px-4 py-6">
              <h1 className="text-white text-[23px] font-semibold font-['Outfit'] leading-loose">
                {market.title}
              </h1>
            </div>

            {/* Options grid */}
            <div className="px-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                {market.options.slice(0, 2).map((option: MarketOption) => (
                  <div key={option.id} className="relative">
                    {/* Option image or placeholder */}
                    <div className="w-full h-[181px] bg-[#343e4f] rounded-t-[14px] overflow-hidden">
                      {option.imageUrl ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={option.imageUrl} 
                            alt={option.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[#6e81a1] text-lg font-medium">
                            {option.title}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Option button */}
                    <button
                      onClick={() => handleMakePrediction(option.title)}
                      className="w-full h-9 bg-[#e9ff74] rounded-b-[14px] flex items-center justify-center hover:bg-[#d4e866] transition-colors"
                    >
                      <span className="text-black text-base font-semibold font-['Outfit']">
                        {option.title}
                      </span>
                    </button>
                    
                    {/* Option description */}
                    {option.description && (
                      <div className="mt-2 text-center">
                        <span className="text-white text-base font-semibold font-['Outfit']">
                          {option.description}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom content with stats and comments */}
            <div className="bg-[#0f111a] px-4 py-6">
              {/* Stats section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  {/* Total Pool */}
                  <div>
                    <p className="text-[#d0d0d0] text-base font-normal font-['Outfit'] mb-1">Total Pool</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 border border-white rounded-sm" />
                      <span className="text-white text-[23px] font-semibold font-['Outfit'] leading-loose">
                        ${market.totalPool?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>

                  {/* Players */}
                  <div className="text-right">
                    <p className="text-[#d0d0d0] text-base font-normal font-['Outfit'] mb-1">Players</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      <PlayerIcons count={market.participantCount || 0} />
                      <span className="text-white text-[23px] font-semibold font-['Outfit'] leading-loose">
                        {market.participantCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-[#343e4f]/20 pt-6">
                  {/* Comments header */}
                  <h2 className="text-white text-lg font-semibold font-['Roboto'] leading-7 mb-4">
                    Comments ({comments.length})
                  </h2>

                  {/* Comment input */}
                  <div className="bg-[#22273c] rounded-[20px] p-3 mb-6 flex items-center gap-3">
                    <div className="relative w-8 h-8">
                      <Image 
                        className="rounded-full border-gray-200" 
                        src={user?.profilePictureUrl || "https://placehold.co/32x32"} 
                        alt="Your avatar"
                        width={32}
                        height={32}
                      />
                    </div>
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-transparent text-[#adaebc] text-base font-normal font-['Roboto'] outline-none placeholder:text-[#6e81a1]"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="w-4 h-4 flex items-center justify-center"
                    >
                      <div className="w-4 h-4 bg-[#e9ff74] rounded" />
                    </button>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {comments.map((comment) => (
                      <CommentItem key={comment.id} comment={comment} />
                    ))}
                    
                    {/* Load more comments button */}
                    <button className="w-full py-2 text-center text-blue-400 text-sm font-normal font-['Roboto']">
                      Load more comments
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 