'use client';

import { useEffect, useState } from 'react';

export function FontLoader({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simple check to ensure component is mounted
    // Next.js handles font loading automatically with next/font/google
    setIsReady(true);
  }, []);

  // Prevent hydration mismatch by ensuring consistency
  if (!isReady) {
    return <div style={{ opacity: 0 }}>{children}</div>;
  }

  return <>{children}</>;
} 