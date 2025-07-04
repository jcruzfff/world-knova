import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase-client';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('📡 Markets API - GET request received');
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('📋 Markets API - Request parameters:', { category, status, limit, offset });

    // Get markets using Supabase
    const { data: markets, error, count } = await supabaseService.getMarkets({
      category: category || undefined,
      status: status || undefined,
      limit,
      offset,
    });

    if (error) {
      console.error('❌ Markets API - Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch markets' },
        { status: 500 }
      );
    }

    console.log('✅ Markets API - Markets fetched successfully:', {
      count: markets?.length || 0,
      totalCount: count || 0
    });

    // Debug: Log image information in API response
    if (markets && markets.length > 0) {
      console.log('🖼️ Markets API - Image analysis before response:',
        markets.slice(0, 3).map(market => ({
          id: market.id,
          title: market.title?.substring(0, 50) + '...',
          imageUrl: market.imageUrl,
          hasImageUrl: !!market.imageUrl,
          optionsCount: market.options?.length || 0,
          optionsWithImages: market.options?.filter(option => option.imageUrl).length || 0,
          sampleOptionImages: market.options?.slice(0, 2).map(option => ({
            id: option.id,
            imageUrl: option.imageUrl,
            hasImage: !!option.imageUrl
          })) || []
        }))
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    const response = {
      success: true,
      data: {
        markets,
        totalCount: count || 0,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        currentPage,
        totalPages,
      },
    };

    console.log('📤 Markets API - Sending response:', {
      success: true,
      marketsCount: markets?.length || 0,
      totalCount: count || 0,
      currentPage,
      totalPages
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Markets API - Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from session
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

    const body = await request.json();
    const {
      title,
      description,
      category,
      customCategory,
      options,
      endDate,
      resolutionCriteria,
      tags = [],
      imageUrl,
      minStake = 10,
      maxStake
    } = body;

    // Validation
    if (!title || !description || !category || !options || !endDate || !resolutionCriteria) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { success: false, message: 'At least 2 options are required' },
        { status: 400 }
      );
    }

    // Transform options to include required fields
    const transformedOptions = options.map((option, index) => ({
      id: `option_${index + 1}`,
      title: option.title,
      description: option.description || null,
      imageUrl: option.imageUrl || null,
      orderIndex: index,
    }));

    // Create market using Supabase
    const { data: market, error } = await supabaseService.createMarket({
      title,
      description,
      category,
      custom_category: customCategory || null,
      outcome_type: 'multiple',
      options: transformedOptions,
      min_stake: minStake,
      max_stake: maxStake,
      total_pool: 0,
      start_time: new Date().toISOString(),
      end_time: new Date(endDate).toISOString(),
      status: 'active',
      resolution_criteria: resolutionCriteria,
      created_by: sessionUser.id,
      image_url: imageUrl || null,
      tags: tags,
      participant_count: 0,
      view_count: 0,
    });

    if (error) {
      console.error('Market creation error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create market' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: market,
      message: 'Market created successfully',
    });

  } catch (error) {
    console.error('Market creation API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 