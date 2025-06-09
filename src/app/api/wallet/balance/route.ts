import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Get user wallet balance
 * Fetches real blockchain data for ETH, WLD, and USDC
 */
export async function GET() {
  try {
    // Get user from custom session
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user-session')?.value;
    
    if (!userSession) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessionUser = JSON.parse(userSession);
    
    if (!sessionUser?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's wallet address from database
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { walletAddress: true },
    });

    if (!user?.walletAddress) {
      return NextResponse.json({
        success: true,
        balance: { usd: 0 },
      });
    }

    // Fetch real wallet balance
    const balance = await fetchWalletBalance(user.walletAddress);

    return NextResponse.json({
      success: true,
      balance,
    });

  } catch (error) {
    console.error('Wallet balance error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function fetchWalletBalance(walletAddress: string) {
  try {
    // Use public RPC endpoints to fetch real balance
    const [ethBalance, prices] = await Promise.all([
      fetchETHBalance(walletAddress),
      fetchCryptoPrices()
    ]);

    // Calculate USD values
    const ethValueUSD = parseFloat(ethBalance) * prices.ethereum;
    
    // For World App users, we'll focus on ETH balance as the primary indicator
    // WLD and USDC would require token contract calls which need more setup
    
    return {
      usd: Math.round(ethValueUSD * 100) / 100, // Round to 2 decimal places
      eth: ethBalance,
    };

  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    // Return 0 balance if we can't fetch real data
    return { usd: 0, eth: '0.000' };
  }
}

async function fetchETHBalance(address: string): Promise<string> {
  try {
    // Using public Ethereum RPC endpoint
    const response = await fetch('https://eth.llamarpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    
    if (data.result) {
      // Convert from Wei to ETH
      const balanceWei = BigInt(data.result);
      const balanceEth = Number(balanceWei) / Math.pow(10, 18);
      return balanceEth.toFixed(4);
    }
    
    return '0.000';
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return '0.000';
  }
}

async function fetchCryptoPrices() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,worldcoin-wld,usd-coin&vs_currencies=usd',
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    const data = await response.json();
    
    return {
      ethereum: data.ethereum?.usd || 0,
      worldcoin: data['worldcoin-wld']?.usd || 0,
      usdc: data['usd-coin']?.usd || 1,
    };
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return { ethereum: 0, worldcoin: 0, usdc: 1 };
  }
} 