import { useState, useEffect, useCallback } from 'react';

interface WalletBalance {
  usd: number;
  eth?: string;
}

interface UseWalletBalanceReturn {
  balance: WalletBalance | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => void;
}

export function useWalletBalance(): UseWalletBalanceReturn {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/wallet/balance', {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBalance(data.balance);
      } else {
        setError(data.message || 'Failed to fetch wallet balance');
        setBalance(null);
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      setError('Failed to fetch wallet balance');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refreshBalance: fetchBalance,
  };
} 