import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedMarkets, mockMarkets } from '@/lib/mockData';
import { MarketCategory, MarketStatus, CreateMarketRequest, Market } from '@/types/market';
import { cookies } from 'next/headers';

// GET /api/markets - List markets with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') as MarketCategory | null;
    const status = searchParams.get('status') as MarketStatus | null;
    const search = searchParams.get('search') || undefined;
    const createdBy = searchParams.get('createdBy') || undefined;

    console.log('Markets API GET:', { page, limit, category, status, search, createdBy });

    // Get paginated results
    const result = getPaginatedMarkets(page, limit, {
      category: category || undefined,
      status: status || undefined,
      search,
      createdBy
    });

    console.log('Markets API GET - Success:', { 
      returnedMarkets: result.markets.length, 
      totalCount: result.totalCount,
      hasFilters: !!(category || status || search || createdBy)
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Markets API GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch markets'
    }, { status: 500 });
  }
}

// POST /api/markets - Create a new market
export async function POST(request: NextRequest) {
  try {
    // Get user session from cookies
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user-session')?.value;
    
    if (!userSession) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const user = JSON.parse(userSession);
    const marketData: CreateMarketRequest = await request.json();

    console.log('🚀 Creating new market:', { 
      title: marketData.title, 
      category: marketData.category,
      userId: user.id,
      optionsCount: marketData.options?.length,
      hasEndDate: !!marketData.endDate
    });

    // Validate required fields
    if (!marketData.title || !marketData.description || !marketData.options) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, description, and options'
      }, { status: 400 });
    }

    if (marketData.options.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Market must have at least 2 options'
      }, { status: 400 });
    }

    // Generate new market ID
    const newMarketId = `market_${Date.now()}`;

    // Create new market object
    const newMarket: Market = {
      id: newMarketId,
      title: marketData.title,
      description: marketData.description,
      category: marketData.category,
      customCategory: marketData.customCategory,
      outcomeType: marketData.options.length === 2 ? 'binary' : 'multiple',
      options: marketData.options.map((option, index) => ({
        id: `opt_${index}`,
        title: option.title,
        description: option.description,
        imageUrl: option.imageUrl,
        orderIndex: index
      })),
      minStake: 1,
      maxStake: 1000,
      totalPool: 0,
      startTime: new Date(),
      endTime: marketData.endDate,
      status: 'draft', // Start as draft for user review
      resolutionCriteria: marketData.resolutionCriteria,
      createdBy: {
        id: user.id,
        username: user.username || 'Anonymous',
        displayName: user.displayName || user.username || 'Anonymous',
        profilePictureUrl: user.profilePictureUrl
      },
      imageUrl: marketData.imageUrl,
      tags: marketData.tags || [],
      participantCount: 0,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In a real app, this would save to database
    // For now, we'll add to our mock data array
    mockMarkets.push(newMarket);

    console.log('✅ Market created successfully:', newMarketId);

    return NextResponse.json({
      success: true,
      data: newMarket,
      message: 'Market created successfully as draft'
    });

  } catch (error) {
    console.error('❌ Markets API POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create market'
    }, { status: 500 });
  }
} 