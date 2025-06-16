import { useState, useEffect, useCallback } from 'react';

// User interface for session
interface SessionUser {
  id: string;
  username: string;
  walletAddress: string;
  profilePictureUrl?: string | null;
  isProfileComplete: boolean;
  isEligible: boolean;
  verificationLevel?: string | null;
  worldIdVerified: boolean;
  age?: number | null;
  countryCode?: string | null;
  region?: string | null;
  termsAcceptedAt?: Date | null;
  privacyAcceptedAt?: Date | null;
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(() => {
    setLoading(true);
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return { user, loading, refreshSession: checkSession };
} 