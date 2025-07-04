'use client';

/* eslint-disable react/prop-types */
import { MarketDetailProps } from './types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { MarketOption } from '@/types';
import Image from 'next/image';

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

export const MarketDetail = ({ market }: MarketDetailProps) => {
  const router = useRouter();
  const { user } = useSession();
  const { balance } = useWalletBalance(user?.walletAddress);
  
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
      marketId: market.id,
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
        <div className="bg-[#0f111a] rounded-t-[36px] h-full px-4 py-6">
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
  );
}; 