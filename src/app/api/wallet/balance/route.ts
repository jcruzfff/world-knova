import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-client';

// UUID validation function
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user-session')?.value;

    if (!userSession) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    let sessionUser;
    try {
      sessionUser = JSON.parse(userSession);
    } catch {
      console.log('🧹 [Wallet] Invalid session format, clearing...');
      cookieStore.delete('user-session');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid session format',
        action: 'session_cleared'
      }, { status: 401 });
    }

    // Validate the user ID format
    if (!sessionUser.id || !isValidUUID(sessionUser.id)) {
      console.log('🧹 [Wallet] Invalid user ID format, clearing session:', sessionUser.id);
      cookieStore.delete('user-session');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid user ID format - session cleared',
        action: 'session_cleared'
      }, { status: 401 });
    }

    const userResponse = await supabaseService.getUserById(sessionUser.id);
    
    if (userResponse.error || !userResponse.data) {
      console.log('🔍 [Wallet] User not found or error:', userResponse.error);
      cookieStore.delete('user-session');
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Access user data properly from the response
    const user = userResponse.data;

    // Mock wallet balance data for now
    // In a real implementation, this would fetch from blockchain
    const balances = [
      {
        currency: 'WLD',
        balance: '0',
        formatted: '0 WLD',
        decimals: 18
      },
      {
        currency: 'USDC',
        balance: '0',
        formatted: '0 USDC',
        decimals: 6
      },
      {
        currency: 'ETH',
        balance: '0',
        formatted: '0 ETH',
        decimals: 18
      }
    ];

    return NextResponse.json({
      success: true,
      balances,
      totalUsdValue: 0,
      walletAddress: user.walletAddress
    });

  } catch (error) {
    console.error('Wallet balance API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 