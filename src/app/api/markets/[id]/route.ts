import { NextRequest, NextResponse } from 'next/server';
import { getMarketById } from '@/lib/mockData';

// GET /api/markets/[id] - Get specific market by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: marketId } = await params;
    console.log('📊 Market detail API GET:', { marketId });

    // Get market by ID
    const market = getMarketById(marketId);

    if (!market) {
      return NextResponse.json({
        success: false,
        error: 'Market not found'
      }, { status: 404 });
    }

    // Increment view count (in real app, this would be logged properly)
    market.viewCount += 1;

    console.log('✅ Market found:', { id: market.id, title: market.title });

    return NextResponse.json({
      success: true,
      data: market
    });

  } catch (error) {
    console.error('❌ Market detail API GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch market'
    }, { status: 500 });
  }
} 