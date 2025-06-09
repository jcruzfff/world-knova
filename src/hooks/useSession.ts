import { useState, useEffect, useCallback } from 'react';

// TODO: Add proper user type
export function useSession() {
  const [user, setUser] = useState<any>(null);
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