import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-client';
import { validateSession } from '@/lib/auth-utils';
import { ApiResponse } from '@/types/api.types';

// Database response interface from Supabase
interface MarketDbResponse {
  id: string;
  title: string;
  status: string;
  participant_count: number;
  view_count: number;
  total_pool: number;
  created_at: string;
  end_time: string;
}

// Simplified market response for performance page
interface UserMarketSummary {
  id: string;
  title: string;
  status: string;
  participantCount: number;
  viewCount: number;
  totalPool: number;
  createdAt: string;
  endTime: string;
}

export async function GET() {
  try {
    // Validate session and get user
    const user = await validateSession();
    
    const supabase = getSupabaseAdminClient();

    // Fetch user's created markets
    const { data: markets, error } = await supabase
      .from('markets')
      .select(`
        id,
        title,
        status,
        participant_count,
        view_count,
        total_pool,
        created_at,
        end_time
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error fetching markets:', error);
      throw new Error('Database query failed');
    }

    // Transform the data to match our interface
    const transformedMarkets: UserMarketSummary[] = markets?.map((market: MarketDbResponse) => ({
      id: market.id,
      title: market.title,
      status: market.status,
      participantCount: market.participant_count || 0,
      viewCount: market.view_count || 0,
      totalPool: market.total_pool || 0,
      createdAt: market.created_at,
      endTime: market.end_time
    })) || [];

    const response: ApiResponse<UserMarketSummary[]> = {
      success: true,
      data: transformedMarkets,
      message: transformedMarkets.length === 0 ? 'No markets found' : 'Markets retrieved successfully',
      metadata: {
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Failed to fetch user markets:', error);
    
    // Handle different types of errors gracefully
    if (error instanceof Error && error.message === 'No session found') {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view your markets'
      };
      return NextResponse.json(response, { status: 401 });
    }
    
    if (error instanceof Error && error.message === 'Invalid session') {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid session',
        message: 'Your session has expired. Please log in again.'
      };
      return NextResponse.json(response, { status: 401 });
    }
    
    // Generic error for other cases
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch markets',
      message: 'Unable to retrieve your markets at this time. Please try again.'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 