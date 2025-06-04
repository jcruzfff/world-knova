'use client';

import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';

const Eruda = dynamic(() => import('./eruda-provider').then((c) => c.Eruda), {
  ssr: false,
  loading: () => null, // Don't show loading state
});

export const ErudaProvider = (props: { children: ReactNode }) => {
  const [shouldLoadEruda, setShouldLoadEruda] = useState(false);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if Eruda should be enabled
    const isProduction = process.env.NODE_ENV === 'production';
    const erudaEnabled = process.env.NEXT_PUBLIC_ENABLE_ERUDA === 'true';
    
    // Detect if we're running in World App (MiniKit environment)
    const isWorldApp = typeof window !== 'undefined' && 
      (window.navigator.userAgent.includes('WorldApp') || 
       window.location.protocol === 'https:' && window.location.hostname.includes('ngrok'));
    
    // Don't load Eruda in production, when disabled, or in World App
    if (isProduction || !erudaEnabled || isWorldApp) {
      console.log('Eruda disabled:', { isProduction, erudaEnabled, isWorldApp });
      setShouldLoadEruda(false);
      return;
    }
    
    setShouldLoadEruda(true);
  }, []);

  // Return children without Eruda if it shouldn't be loaded
  if (!shouldLoadEruda) {
    return <>{props.children}</>;
  }

  // Wrap with error boundary-like behavior for Eruda
  return (
    <ErrorBoundaryEruda>
      <Eruda>{props.children}</Eruda>
    </ErrorBoundaryEruda>
  );
};

// Simple error boundary for Eruda to prevent app crashes
function ErrorBoundaryEruda({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Check if error is related to Eruda chunks
      if (event.error?.message?.includes('Eruda') || 
          event.error?.message?.includes('_app-pages-browser_src_providers_Eruda')) {
        console.warn('Eruda loading failed, continuing without debug tools:', event.error);
        setHasError(true);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
