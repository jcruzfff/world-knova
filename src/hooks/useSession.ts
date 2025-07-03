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

interface SessionState {
  user: SessionUser | null;
  loading: boolean;
  error?: string | null;
  sessionCleared?: boolean; // New flag to indicate session was cleared
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    user: null,
    loading: true,
    error: null,
    sessionCleared: false
  });

  const clearSession = useCallback(() => {
    setState({
      user: null,
      loading: false,
      error: null,
      sessionCleared: true
    });
  }, []);

  const checkSession = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setState({
            user: data.user,
            loading: false,
            error: null,
            sessionCleared: false
          });
        } else {
          // Check if the server cleared the session
          if (data.action === 'session_cleared') {
            console.log('🧹 Server cleared invalid session:', data.message);
            setState({
              user: null,
              loading: false,
              error: data.message || 'Session was cleared',
              sessionCleared: true
            });
          } else {
            setState({
              user: null,
              loading: false,
              error: data.message || 'Authentication failed',
              sessionCleared: false
            });
          }
        }
      })
      .catch(error => {
        console.error('Session check error:', error);
        setState({
          user: null,
          loading: false,
          error: 'Network error',
          sessionCleared: false
        });
      });
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return { 
    user: state.user, 
    loading: state.loading, 
    error: state.error,
    sessionCleared: state.sessionCleared,
    refreshSession: checkSession,
    clearSession
  };
} 