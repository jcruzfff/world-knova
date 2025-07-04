'use client';

import { MarketDetailProps } from './types';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { MarketOption, Market } from '@/types';
import { PredictionData } from './types';
import Image from 'next/image';
import { PredictionWagerOverlay } from './PredictionWagerOverlay';

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

// Add these new interfaces and components at the top, after the existing imports

// Comment component with database integration  
interface Comment {
  id: string;
  marketId: string;
  userId: string;
  content: string;
  author: string;
  avatar?: string | null;
  timeAgo: string;
  createdAt: Date;
}

const CommentAvatar = ({ avatar, author }: { avatar?: string | null; author: string }) => {
  if (avatar) {
    return (
      <Image 
        className="rounded-full border-gray-200" 
        src={avatar} 
        alt={author}
        width={32}
        height={32}
      />
    );
  }
  
  // Show first letter if no avatar
  const firstLetter = author.charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-[#6e81a1] flex items-center justify-center">
      <span className="text-white text-sm font-semibold">{firstLetter}</span>
    </div>
  );
};

const CommentItem = ({ comment }: { comment: Comment }) => (
  <div className="flex gap-3 py-3">
    <div className="relative w-8 h-8">
      <CommentAvatar avatar={comment.avatar} author={comment.author} />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white text-sm font-semibold">{comment.author}</span>
        <span className="text-gray-400 text-xs">{comment.timeAgo}</span>
      </div>
      <p className="text-gray-300 text-sm leading-tight">{comment.content}</p>
    </div>
  </div>
);

export const MarketDetail = ({ market: initialMarket }: MarketDetailProps) => {
  const router = useRouter();
  const { user } = useSession();
  const { balance } = useWalletBalance(user?.walletAddress);
  
  // Local market state to handle updates
  const [market, setMarket] = useState<Market>(initialMarket);
  
  // Update local market when prop changes
  useEffect(() => {
    setMarket(initialMarket);
  }, [initialMarket]);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  
  // Wagering overlay state
  const [isWagerOverlayOpen, setIsWagerOverlayOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptionData, setSelectedOptionData] = useState<MarketOption | null>(null);

  const fetchComments = useCallback(async () => {
    if (!market?.id) return;
    
    setIsLoadingComments(true);
    setCommentsError(null);
    
    try {
      const response = await fetch(`/api/markets/${market.id}/comments`);
      
      if (!response.ok) {
        // If it's a 404 or server error, just show empty comments
        console.log('Comments API not available, showing empty state');
        setComments([]);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setComments(data.data.comments || []);
      } else {
        // Don't show error for missing comments, just show empty state
        console.log('No comments available:', data.error);
        setComments([]);
      }
    } catch (error) {
      // Network or parsing errors - just show empty state instead of error
      console.log('Comment fetching failed, showing empty state:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  }, [market?.id]);

  // Fetch comments when component mounts
  useEffect(() => {
    if (market?.id) {
      fetchComments();
    }
  }, [market?.id, fetchComments]);

  const handleMakePrediction = (optionTitle: string) => {
    if (!user) {
      // Handle user authentication - could show auth modal
      console.log('User needs to authenticate');
      return;
    }
    
    // Find the full option data
    const optionData = market.options.find(opt => opt.title === optionTitle);
    
    setSelectedOption(optionTitle);
    setSelectedOptionData(optionData || null);
    setIsWagerOverlayOpen(true);
  };

  const handleCloseWagerOverlay = () => {
    setIsWagerOverlayOpen(false);
    setSelectedOption(null);
    setSelectedOptionData(null);
  };

  // Handle prediction submission - update market stats
  const handlePredictionMade = useCallback((predictionData: PredictionData) => {
    console.log('Prediction made:', predictionData);
    
    // Update market state optimistically
    setMarket(prevMarket => ({
      ...prevMarket,
      totalPool: prevMarket.totalPool + predictionData.stake,
      participantCount: prevMarket.participantCount + 1, // Increment by 1 for each prediction
    }));
  }, []);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !market?.id || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    
    try {
      const response = await fetch(`/api/markets/${market.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim()
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new comment to the beginning of the list
        setComments(prev => [data.data.comment, ...prev]);
        setNewComment('');
        setCommentsError(null);
      } else {
        setCommentsError(data.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setCommentsError('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Format countdown timer specifically for the header design
  const CountdownHeader = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
      const updateTimer = () => {
        const now = new Date().getTime();
        const end = new Date(market.endTime).getTime();
        const difference = end - now;

        if (difference > 0) {
          setTimeLeft({
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          });
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }, []);  

    return (
      <span className="text-center text-[#e9ff74] text-[23px] font-semibold font-['Outfit'] leading-loose">
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    );
  };

  return (
    <div className="w-full max-w-[402px] h-screen relative bg-[#0f111a] overflow-hidden mx-auto">
      {/* Header with back button and wallet */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="w-[30px] h-[30px] bg-[#131f30] rounded-full flex items-center justify-center"
        >
          <svg className="w-6 h-6 text-white rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Wallet balance */}
        <div className="bg-white/5 rounded-full border border-[#373a46] px-3 py-1 flex items-center gap-2">
          <div className="w-4 h-4 border border-white rounded-sm" />
          <span className="text-[#d0d0d0] text-xs font-normal font-['Outfit']">
            ${balance?.formatted || '0'}
          </span>
        </div>
      </div>

      {/* Main content container */}
      <div className="bg-[#1d283a] rounded-t-[34px] h-[calc(100vh-82px)] overflow-hidden">
        {/* Timer header */}
        <div className="h-[84px] bg-[#2a3445] relative">
          <div className="w-[82px] h-[3px] bg-[#6e81a1] absolute top-2 left-1/2 transform -translate-x-1/2 rounded-full" />
          <div className="absolute top-[22px] left-1/2 transform -translate-x-1/2">
            <p className="text-[#d0d0d0] text-base font-normal font-['Outfit'] text-center">Time remaining</p>
          </div>
          <div className="absolute top-[42px] left-1/2 transform -translate-x-1/2">
            <CountdownHeader />
          </div>
        </div>

        {/* Market question */}
        <div className="px-4 py-6">
          <h1 className="text-white text-[23px] font-semibold font-['Outfit'] leading-loose">
            {market.title}
          </h1>
        </div>

        {/* Options grid */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3 items-end">
            {market.options.slice(0, 2).map((option: MarketOption) => (
              <div key={option.id} className="relative flex flex-col">
                {/* Option image or placeholder - clickable */}
                <div 
                  className="w-full h-[181px] bg-[#343e4f] rounded-t-[14px] overflow-hidden cursor-pointer hover:bg-[#3a4553] transition-colors"
                  onClick={() => handleMakePrediction(option.title)}
                >
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
                
                {/* Option button - consistent height with text wrapping */}
                <button
                  onClick={() => handleMakePrediction(option.title)}
                  className="w-full min-h-[44px] bg-[#e9ff74] rounded-b-[14px] flex items-center justify-center hover:bg-[#d4e866] transition-colors px-2 py-2"
                >
                  <span className="text-black text-base font-semibold font-['Outfit'] text-center leading-tight">
                    {option.title}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom content with stats and comments */}
        <div className="bg-[#0f111a] rounded-t-[36px] h-full px-4 py-6">
          {/* Stats section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              {/* Total Pool */}
              <div>
                <p className="text-[#d0d0d0] text-base font-normal font-['Outfit'] mb-1">Total Pool</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 relative">
                    <Image 
                      src="/world-icon.svg" 
                      alt="World Currency"
                      width={16}
                      height={16}
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-white text-[23px] font-semibold font-['Outfit'] leading-loose">
                    {market.totalPool?.toLocaleString() || '0'}
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
                  {user && (
                    <CommentAvatar 
                      avatar={user.profilePictureUrl} 
                      author={user.username || 'You'} 
                    />
                  )}
                </div>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? "Add a comment..." : "Sign in to comment"}
                  className="flex-1 bg-transparent text-[#adaebc] text-base font-normal font-['Roboto'] outline-none placeholder:text-[#6e81a1]"
                  onKeyPress={(e) => e.key === 'Enter' && !isSubmittingComment && handleAddComment()}
                  disabled={!user || isSubmittingComment}
                  maxLength={500}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || !user || isSubmittingComment}
                  className="w-6 h-6 flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-40"
                >
                  {isSubmittingComment ? (
                    <div className="w-4 h-4 border-2 border-[#6e81a1] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Image 
                      src="/send-icon.svg" 
                      alt="Send comment"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  )}
                </button>
              </div>

              {/* Error message */}
              {commentsError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                  <p className="text-red-400 text-sm">{commentsError}</p>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {isLoadingComments ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-6 h-6 border-2 border-[#6e81a1] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-gray-400">Loading comments...</p>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wagering Overlay */}
      <PredictionWagerOverlay
        isOpen={isWagerOverlayOpen}
        onCloseAction={handleCloseWagerOverlay}
        market={market}
        selectedOption={selectedOption}
        selectedOptionData={selectedOptionData}
        onPredictionMade={handlePredictionMade}
      />
    </div>
  );
}; 