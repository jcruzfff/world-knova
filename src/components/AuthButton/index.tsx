'use client';
import { MiniKit } from '@worldcoin/minikit-js';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from '@/hooks/useSession';

/**
 * AuthButton using the standard World Mini-App authentication pattern
 * Following the official documentation for wallet authentication
 * Updated with new Figma design - lime-green pill button
 */

interface AuthButtonProps {
  onAuthSuccess?: () => void; // Callback for when authentication succeeds
  variant?: 'primary' | 'secondary' | 'tertiary';  // Keep for compatibility but will use custom design  
  className?: string;
}

export const AuthButton = ({ 
  onAuthSuccess, 
  className 
}: AuthButtonProps) => {
  const [isPending, setIsPending] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isInstalled } = useMiniKit();
  const { user, loading: sessionLoading, refreshSession } = useSession();
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

  // If user is authenticated, show wallet value
  if (user && !sessionLoading) {
    return (
      <div className={`relative ${className || ''}`} ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          data-layer="span" 
          className={`Span w-[70px] h-7 px-1.5 py-[3px] bg-white/5 rounded-full  outline-[0.50px] outline-offset-[-0.50px] outline-[#373a46] inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-200 ${isDropdownOpen ? 'bg-white/10' : ''}`}
        >
          <div 
            data-layer="Frame 2147224426" 
            className="Frame2147224426 self-stretch inline-flex justify-start items-center gap-1"
          >
            <Image
              src="/world-icon.svg"
              alt="World Coin"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            <div 
              data-layer="wallet-value" 
              className="WalletValue justify-start text-[#d0d0d0] text-xs font-normal font-['Outfit']"
            >
              $806
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-[#1d283b] border border-[#373a46] rounded-lg shadow-lg overflow-hidden z-50">
            {/* User Info Section */}
            <div className="p-4 border-b border-[#373a46]">
              <div className="flex items-center gap-3">
                {user.profile_picture_url && (
                  <Image
                    src={user.profile_picture_url}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium font-['Outfit'] truncate">
                    {user.username || 'Anonymous'}
                  </div>
                  <div className="text-[#a0a0a0] text-xs font-['Outfit'] truncate">
                    {truncateAddress(user.wallet_address)}
                  </div>
                </div>
              </div>
            </div>

            {/* Disconnect Button */}
            <div className="p-2">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-[#373a46] rounded-md transition-colors duration-200"
              >
                <Image
                  src="/signoff-icon.svg"
                  alt="Disconnect"
                  width={16}
                  height={16}
                  className="w-4 h-4"
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
