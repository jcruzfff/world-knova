'use client';
import { MiniKit } from '@worldcoin/minikit-js';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from '@/hooks/useSession';
import { useWalletBalance } from '@/hooks/useWalletBalance';

/**
 * AuthButton using the standard World Mini-App authentication pattern
 * Following the official documentation for wallet authentication
 * Updated with new Figma design - lime-green pill button
 */

interface AuthButtonProps {
  onAuthSuccess?: () => void; // Callback for when authentication succeeds
  onProfileComplete?: () => void; // Callback to trigger profile completion
  variant?: 'primary' | 'secondary' | 'tertiary';  // Keep for compatibility but will use custom design  
  className?: string;
}

export const AuthButton = ({ 
  onAuthSuccess, 
  onProfileComplete,
  className 
}: AuthButtonProps) => {
  const [isPending, setIsPending] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isInstalled } = useMiniKit();
  const { user, loading: sessionLoading, refreshSession } = useSession();
  const { balance, loading: balanceLoading } = useWalletBalance();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  console.log('🚨 AuthButton component render:', { isInstalled, isPending, user, sessionLoading });

  const onClick = useCallback(async () => {
    console.log('🚨 BASIC DEBUG: onClick handler called!');
    console.log('🚨 BASIC DEBUG: isInstalled =', isInstalled);
    console.log('🚨 BASIC DEBUG: isPending =', isPending);
    console.log('🚨 BASIC DEBUG: MiniKit object =', MiniKit);
    console.log('🚨 BASIC DEBUG: MiniKit.commandsAsync =', MiniKit.commandsAsync);
    
    console.log('🖱️ AuthButton clicked!', { isInstalled, isPending });
    
    if (!isInstalled || isPending) {
      console.log('❌ AuthButton: MiniKit not installed or operation pending', { isInstalled, isPending });
      return;
    }
    
    console.log('✅ AuthButton: Starting wallet auth flow...');
    setIsPending(true);
    
    try {
      // Step 1: Get nonce from server (following World docs exactly)
      console.log('🔑 Fetching nonce from /api/nonce...');
      const res = await fetch(`/api/nonce?t=${Date.now()}`, {
        credentials: 'include',
      });
      const { nonce } = await res.json();
      console.log('✅ Nonce received:', nonce?.substring(0, 8) + '...');

      // Step 2: Use MiniKit.commandsAsync.walletAuth (from World docs)
      console.log('📱 Calling MiniKit.commandsAsync.walletAuth...');
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: '0',
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: 'Sign in to Knova to access prediction markets',
      });
      
      console.log('📋 Final payload received:', finalPayload);
      
      if (finalPayload.status === 'error') {
        console.error('❌ Wallet auth failed:', finalPayload);
        setIsPending(false);
        return;
      }

      // Step 3: Complete SIWE verification
      console.log('✅ Wallet auth successful, calling complete-siwe...');
      const userInfo = MiniKit.user;
      console.log('👤 User info:', { username: userInfo?.username });
      
      const response = await fetch('/api/complete-siwe', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
          userInfo: {
            username: userInfo?.username,
            profilePictureUrl: userInfo?.profilePictureUrl,
          }
        }),
      });

      const data = await response.json();
      console.log('📋 Complete SIWE response:', data);

      if (data.status === 'success' && data.isValid) {
        console.log('🎉 Authentication completed successfully');
        
        // Refresh session to get user data
        await refreshSession();
        
        // Call the success callback if provided (for parent component to refresh state)
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          // Just refresh the router, no need for window.location.reload()
          router.refresh();
        }
      } else {
        console.error('❌ SIWE verification failed:', data.message);
      }
      
    } catch (error) {
      console.error('❌ AuthButton: Wallet authentication error', error);
    } finally {
      setIsPending(false);
    }
  }, [isInstalled, isPending, router, onAuthSuccess, refreshSession]);

  // Disconnect functionality
  const handleDisconnect = useCallback(async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Refresh session to clear user data
        await refreshSession();
        setIsDropdownOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('❌ Disconnect error:', error);
    }
  }, [refreshSession, router]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Debug MiniKit status
  useEffect(() => {
    console.log('🔧 AuthButton: MiniKit status check', { 
      isInstalled, 
      userAgent: navigator.userAgent,
      isWorldApp: navigator.userAgent.includes('World')
    });
  }, [isInstalled]);

  // Helper function to truncate wallet address
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format wallet balance for display
  const formatWalletBalance = () => {
    if (balanceLoading) return '...';
    if (!balance) return '$0';
    return `$${balance.usd.toLocaleString()}`;
  };

  // If user is authenticated, show wallet value
  if (user && !sessionLoading) {
    return (
      <div className={`relative ${className || ''}`} ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          data-layer="span" 
          className={`Span h-7 px-1.5 py-[3px] bg-white/5 rounded-full outline-[0.50px] outline-offset-[-0.50px] outline-[#373a46] inline-flex flex-col justify-center items-center gap-2.5 cursor-pointer hover:bg-white/10 transition-all duration-200 ${isDropdownOpen ? 'bg-white/10' : ''}`}
        >
          <div 
            data-layer="Frame 2147224426" 
            className="Frame2147224426 inline-flex justify-start items-center gap-1 whitespace-nowrap"
          >
            <Image
              src="/world-icon.svg"
              alt="World Coin"
              width={20}
              height={20}
              className="w-4 h-4"
            />
            <div 
              data-layer="wallet-value" 
              className="WalletValue text-[#d0d0d0] text-sm font-normal font-['Outfit'] whitespace-nowrap"
            >
              {formatWalletBalance()}
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-[#1d283b] border border-[#373a46] rounded-lg shadow-lg overflow-hidden z-50">
            {/* User Info Section */}
            <div className="p-4 border-b border-[#373a46]">
              <div className="flex items-start gap-3">
                {/* Avatar - fallback to user icon if no profile picture */}
                <div className="w-8 h-8 rounded-full bg-[#373a46] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.profilePictureUrl ? (
                    <Image
                      src={user.profilePictureUrl}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-4 h-4 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                
                {/* User Details */}
                <div className="flex-1 min-w-0">
                  {/* Username */}
                  <div className="text-white text-sm font-medium font-['Outfit'] truncate">
                    {user.username || 'Anonymous'}
                  </div>
                  
                  {/* Wallet Address - 8px gap below username */}
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        if (user.walletAddress) {
                          window.open(`https://etherscan.io/address/${user.walletAddress}`, '_blank');
                        }
                      }}
                      className="flex items-center gap-1 text-[#a0a0a0] text-xs font-['Outfit'] hover:text-white transition-colors group"
                    >
                      <span className="truncate">
                        {truncateAddress(user.walletAddress)}
                      </span>
                      <Image
                        src="/open-url.svg"
                        alt="Open in explorer"
                        width={12}
                        height={12}
                        className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Options */}
            <div className="py-2">
              {/* Complete Profile - Only show if profile is incomplete */}
              {!user.isProfileComplete && (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onProfileComplete?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-[#373a46] transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-[#e9ff74] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium font-['Outfit']">
                    Complete Profile
                  </span>
                </button>
              )}

              {/* Performance Option */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/performance');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-[#373a46] transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-[#a0a0a0] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium font-['Outfit']">
                  Performance
                </span>
              </button>

              {/* Disconnect Button */}
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-[#373a46] transition-colors duration-200"
              >
                <Image
                  src="/signoff-icon.svg"
                  alt="Disconnect"
                  width={16}
                  height={16}
                  className="w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm font-medium font-['Outfit']">
                  Disconnect
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className || ''}`}>
      {!isInstalled && (
        <div className="text-center p-4 bg-amber-100 rounded-lg border border-amber-300">
          <p className="text-amber-800 font-medium">Development Mode</p>
          <p className="text-amber-700 text-sm">
            This app is designed to run inside World App. 
            For testing, the authentication button is available but some features may not work.
          </p>
        </div>
      )}
      
      <button
          onClick={onClick}
          disabled={isPending || !isInstalled}
          className={`
            relative rounded-full transition-all duration-200 ease-in-out
            ${isPending || !isInstalled 
              ? 'bg-gray-300 cursor-not-allowed opacity-60' 
              : 'bg-[#e9ff74] hover:bg-[#d4e668] active:bg-[#c1d35c] cursor-pointer'
            }
          `}
        >
          <div className="flex flex-row items-center justify-center relative w-full h-full">
            <div className="flex flex-row gap-2.5 items-center justify-center px-5 py-[7px] relative w-full h-full">
              <div className="font-semibold text-[12px] text-black text-nowrap leading-normal">
                {isPending 
                  ? 'Signing in...' 
                  : !isInstalled 
                    ? 'World App Required'
                    : 'Sign in'
                }
              </div>
            </div>
          </div>
        </button>
    </div>
  );
};
