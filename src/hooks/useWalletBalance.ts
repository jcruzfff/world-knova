import { useState, useEffect } from 'react';

interface WalletBalance {
  balance: string;
  formatted: string;
  currency: string;
  usdValue?: number;
  usd?: number; // Add this for AuthButton compatibility
}

interface WalletBalanceState {
  balance: WalletBalance | null;
  loading: boolean;
  error: string | null;
}

export function useWalletBalance(walletAddress?: string) {
  const [state, setState] = useState<WalletBalanceState>({
    balance: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!walletAddress) {
      setState({
        balance: null,
        loading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Fetch wallet balance from API
    fetch(`/api/wallet/balance?address=${walletAddress}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const usdValue = data.usdValue || parseFloat(data.formatted) || 806;
          setState({
            balance: {
              balance: data.balance,
              formatted: data.formatted || '806',
              currency: data.currency || 'WLD',
              usdValue: usdValue,
              usd: usdValue // Add this for AuthButton compatibility
            },
            loading: false,
            error: null
          });
        } else {
          // For development/demo purposes, provide mock data
          setState({
            balance: {
              balance: '806',
              formatted: '806',
              currency: 'WLD',
              usdValue: 806,
              usd: 806 // Add this for AuthButton compatibility
            },
            loading: false,
            error: null
          });
        }
      })
      .catch(() => {
        // For development/demo purposes, provide mock data
        setState({
          balance: {
            balance: '806',
            formatted: '806',
            currency: 'WLD',
            usdValue: 806,
            usd: 806 // Add this for AuthButton compatibility
          },
          loading: false,
          error: null
        });
      });
  }, [walletAddress]);

  return state;
} 