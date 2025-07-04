import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';
import { ApiResponse } from '@/types/api.types';

// Temporary prediction interface for the empty response
interface Prediction {
  id: string;
  userId: string;
  marketId: string;
  outcome: string;
  stake: number;
  odds: number;
  potentialPayout: number;
  status: 'active' | 'won' | 'lost' | 'refunded';
  payout?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    // Validate session and get user
    await validateSession();
    
    // TODO: Replace with actual predictions query when prediction system is implemented
    // For now, return empty array to show the UI structure
    
    // When predictions are implemented, this would look like:
    // const { data: predictions, error } = await supabase
    //   .from('predictions')
    //   .select(`
    //     *,
    //     market:markets(id, title, end_time)
    //   `)
    //   .eq('user_id', user.id)
    //   .order('created_at', { ascending: false });
    
    // if (error) {
    //   throw error;
    // }
    
    const predictions: Prediction[] = [];
    
    const response: ApiResponse<Prediction[]> = {
      success: true,
      data: predictions,
      message: predictions.length === 0 ? 'No predictions found' : 'Predictions retrieved successfully',
      metadata: {
        timestamp: new Date(),
        requestId: crypto.randomUUID()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Failed to fetch user predictions:', error);
    
    // Handle different types of errors gracefully
    if (error instanceof Error && error.message === 'No session found') {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Authentication required',
        message: 'Please log in to view your predictions'
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
      error: 'Failed to fetch predictions',
      message: 'Unable to retrieve your predictions at this time. Please try again.'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 