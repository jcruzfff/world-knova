'use client';
import { MiniKit } from '@worldcoin/minikit-js';
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

const ErudaProvider = dynamic(
  () => import('@/providers/Eruda').then((c) => c.ErudaProvider),
  { ssr: false },
);

// Import the ProfileCompletionProvider
const ProfileCompletionProvider = dynamic(
  () => import('@/providers/ProfileCompletionProvider').then((c) => c.ProfileCompletionProvider),
  { ssr: false },
);

// Custom MiniKit Provider that handles installation properly
function CustomMiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Only install MiniKit if we're in a browser environment
    if (typeof window !== 'undefined') {
      const appId = process.env.NEXT_PUBLIC_APP_ID;
      
      // Debug logging to verify environment variables
      console.log('Environment variables check:');
      console.log('NEXT_PUBLIC_APP_ID:', appId);
      console.log('NEXT_PUBLIC_ACTION:', process.env.NEXT_PUBLIC_ACTION);
      
      if (!appId) {
        console.error('NEXT_PUBLIC_APP_ID is not defined in environment variables');
        return;
      }

      try {
        // Install MiniKit with the app ID
        MiniKit.install(appId);
        console.log('MiniKit installed successfully with App ID:', appId);
        
        // Check if we're actually in World App (not browser)
        if (MiniKit.isInstalled()) {
          console.log('Running inside World App');
          // Only call commands here if you need to trigger something on start
          // For now, we'll just log the installation status
        } else {
          console.log('MiniKit is not installed - running in browser mode');
        }
      } catch (error) {
        console.log('MiniKit installation failed (this is expected in browser mode):', error);
      }
    }
  }, []);

  return <MiniKitProvider>{children}</MiniKitProvider>;
}

// Define props for ClientProviders
interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * ClientProvider wraps the app with essential context providers.
 *
 * - ErudaProvider:
 *     - Should be used only in development.
 *     - Enables an in-browser console for logging and debugging.
 *
 * - CustomMiniKitProvider:
 *     - Properly handles MiniKit installation to prevent race conditions.
 *     - Avoids calling commands during initialization when not in World App.
 *     - Provides MiniKitProvider context for components.
 *
 * - ProfileCompletionProvider:
 *     - Manages the profile completion drawer state globally.
 *     - Allows any component to trigger the profile completion flow.
 *
 * Note: We use a custom session system with cookies instead of NextAuth
 * to avoid conflicts with the World Mini-App authentication flow.
 */
export const Providers = ({ children }: ClientProvidersProps) => {
  return (
    <ErudaProvider>
      <CustomMiniKitProvider>
        <ProfileCompletionProvider>
          {children}
        </ProfileCompletionProvider>
      </CustomMiniKitProvider>
    </ErudaProvider>
  );
};

// Also export as default for flexibility
export default Providers;
