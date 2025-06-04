'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, ResponseEvent } from '@worldcoin/minikit-js';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AuthButton using the standard World Mini-App authentication pattern
 * Following the official documentation for wallet authentication
 */
export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const [nonce, setNonce] = useState<string | null>(null);
  const { isInstalled } = useMiniKit();
  const router = useRouter();
  
  console.log('🚨 AuthButton component render:', { isInstalled, isPending });

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
      
      setNonce(nonce);

      // Step 2: Use MiniKit.commandsAsync.walletAuth (from World docs)
      console.log('📱 Calling MiniKit.commandsAsync.walletAuth...');
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.walletAuth({
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
        router.refresh();
        router.push('/home');
      } else {
        console.error('❌ SIWE verification failed:', data.message);
      }
      
    } catch (error) {
      console.error('❌ AuthButton: Wallet authentication error', error);
    } finally {
      setIsPending(false);
    }
  }, [isInstalled, isPending, router]);

  // Debug MiniKit status
  useEffect(() => {
    console.log('🔧 AuthButton: MiniKit status check', { 
      isInstalled, 
      userAgent: navigator.userAgent,
      isWorldApp: navigator.userAgent.includes('World')
    });
  }, [isInstalled]);

  return (
    <div className="flex flex-col items-center gap-4">
      {!isInstalled && (
        <div className="text-center p-4 bg-amber-100 rounded-lg border border-amber-300">
          <p className="text-amber-800 font-medium">Development Mode</p>
          <p className="text-amber-700 text-sm">
            This app is designed to run inside World App. 
            For testing, the authentication button is available but some features may not work.
          </p>
        </div>
      )}
      
      <LiveFeedback
        label={{
          failed: 'Failed to login',
          pending: 'Logging in',
          success: 'Logged in',
        }}
        state={isPending ? 'pending' : undefined}
      >
        <Button
          onClick={onClick}
          disabled={isPending || !isInstalled}
          size="lg"
          variant="primary"
        >
          {isInstalled ? '🔄 [NEW] Login with Wallet' : 'World App Required'}
        </Button>
      </LiveFeedback>
    </div>
  );
};
