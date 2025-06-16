import { NextRequest, NextResponse } from 'next/server';
import { MarketCategory, MarketStatus, CreateMarketRequest, Market, OutcomeType } from '@/types/market';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Define the expected structure for Prisma JSON outcomes
interface PrismaMarketOutcome {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  orderIndex: number;
}

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

    // Build where clause for Prisma
    const where: Record<string, unknown> = {};
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (createdBy) {
      where.createdBy = createdBy;
    }

    // Get total count for pagination
    const totalCount = await prisma.market.count({ where });

    // Get paginated markets from database
    const markets = await prisma.market.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePictureUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform database results to Market interface
    const transformedMarkets: Market[] = markets.map(market => {
      // Transform database result using proper type assertion
      const outcomes = (market.outcomes as unknown as PrismaMarketOutcome[]) || [];
      const options = outcomes.map((outcome, index) => ({
        id: outcome?.id || `opt_${index}`,
        title: outcome?.title || `Option ${index + 1}`,
        description: outcome?.description || null,
        imageUrl: outcome?.imageUrl || null,
        orderIndex: outcome?.orderIndex || index,
        odds: null,
        percentage: null,
        currentStake: null
      }));

      return {
        id: market.id,
        title: market.title,
        description: market.description,
        category: market.category as MarketCategory,
        customCategory: undefined,
        outcomeType: market.outcomeType as OutcomeType,
        options,
        minStake: market.minStake,
        maxStake: market.maxStake || undefined,
        totalPool: market.totalPool,
        startTime: market.startTime,
        endTime: market.endTime,
        resolutionTime: market.resolutionTime || undefined,
        status: market.status as MarketStatus,
        resolvedOutcome: market.resolvedOutcome || undefined,
        resolutionCriteria: market.resolutionCriteria,
        createdBy: market.creator ? {
          id: market.creator.id,
          username: market.creator.username || 'Anonymous',
          displayName: market.creator.displayName || market.creator.username || 'Anonymous',
          profilePictureUrl: market.creator.profilePictureUrl || undefined
        } : null,
        creator: market.createdBy || null,
        oracleSource: market.oracleSource || undefined,
        oracleId: market.oracleId || undefined,
        resolutionSource: undefined,
        rules: undefined,
        imageUrl: market.imageUrl || undefined,
        tags: market.tags,
        subtitle: null,
        participantCount: market.participantCount,
        viewCount: market.viewCount,
        recentParticipants: [], // Empty since we don't have predictions implemented yet
        createdAt: market.createdAt,
        updatedAt: market.updatedAt
      };
    });

    const result = {
      markets: transformedMarkets,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1
    };

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

    // Create new market in database using Prisma
    const newMarket = await prisma.market.create({
      data: {
        title: marketData.title,
        description: marketData.description,
        category: marketData.category || 'user_generated',
        outcomeType: 'binary', // Default to binary for now, could be determined by options length
        outcomes: marketData.options.map((option, index) => ({
          id: `option_${index}`,
          title: option.title,
          description: option.description || null,
          imageUrl: option.imageUrl || null,
          orderIndex: index
        })),
        status: 'active',
        minStake: 1.0,
        maxStake: 1000.0,
        totalPool: 0.0,
        startTime: new Date(),
        endTime: marketData.endDate,
        resolutionCriteria: marketData.resolutionCriteria,
        imageUrl: marketData.imageUrl || null,
        tags: marketData.tags || [],
        createdBy: user.id,
        participantCount: 0,
        viewCount: 0
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePictureUrl: true
          }
        }
      }
    });

    console.log('✅ Market created successfully:', newMarket.id);

    // Convert to Market interface format for response
    const outcomes = (newMarket.outcomes as unknown as PrismaMarketOutcome[]) || [];
    const options = outcomes.map((outcome, index) => ({
      id: outcome?.id || `opt_${index}`,
      title: outcome?.title || `Option ${index + 1}`,
      description: outcome?.description || null,
      imageUrl: outcome?.imageUrl || null,
      orderIndex: outcome?.orderIndex || index,
      odds: null,
      percentage: null,
      currentStake: null
    }));

    const transformedMarket: Market = {
      id: newMarket.id,
      title: newMarket.title,
      description: newMarket.description,
      category: newMarket.category as MarketCategory,
      customCategory: undefined, // Not used in new schema
      outcomeType: newMarket.outcomeType as OutcomeType,
      options,
      minStake: newMarket.minStake,
      maxStake: newMarket.maxStake || undefined,
      totalPool: newMarket.totalPool,
      startTime: newMarket.startTime,
      endTime: newMarket.endTime,
      resolutionTime: newMarket.resolutionTime || undefined,
      status: newMarket.status as MarketStatus,
      resolvedOutcome: newMarket.resolvedOutcome || undefined,
      resolutionCriteria: newMarket.resolutionCriteria,
      createdBy: newMarket.creator ? {
        id: newMarket.creator.id,
        username: newMarket.creator.username || 'Anonymous',
        displayName: newMarket.creator.displayName || newMarket.creator.username || 'Anonymous',
        profilePictureUrl: newMarket.creator.profilePictureUrl || undefined
      } : null,
      creator: newMarket.createdBy || null,
      oracleSource: newMarket.oracleSource || undefined,
      oracleId: newMarket.oracleId || undefined,
      resolutionSource: undefined, // Not in new schema
      rules: undefined, // Not in new schema
      imageUrl: newMarket.imageUrl || undefined,
      tags: newMarket.tags,
      subtitle: null,
      participantCount: newMarket.participantCount,
      viewCount: newMarket.viewCount,
      recentParticipants: [], // Empty since we don't have predictions implemented yet
      createdAt: newMarket.createdAt,
      updatedAt: newMarket.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: transformedMarket,
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