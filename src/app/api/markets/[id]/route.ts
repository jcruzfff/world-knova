import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Market ID is required' },
        { status: 400 }
      );
    }

    // Get market using Supabase
    const { data: market, error } = await supabaseService.getMarketById(id);

    if (error) {
      console.error('Market fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch market' },
        { status: 500 }
      );
    }

    if (!market) {
      return NextResponse.json(
        { success: false, message: 'Market not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: market,
    });

  } catch (error) {
    console.error('Market API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 