import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Market, MarketCategory, MarketStatus, OutcomeType } from '@/types/market';

// Define the expected structure for Prisma JSON outcomes
interface PrismaMarketOutcome {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  orderIndex: number;
}

// GET /api/markets/[id] - Get a specific market by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🎯 Market API GET - Fetching market:', id);

    const market = await prisma.market.findUnique({
      where: { id },
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

    if (!market) {
      console.log('❌ Market not found:', id);
      return NextResponse.json({
        success: false,
        error: 'Market not found'
      }, { status: 404 });
    }

    console.log('✅ Market found:', { id: market.id, title: market.title });

    // Transform database result to Market interface using proper type assertion
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

    const transformedMarket: Market = {
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

    return NextResponse.json({
      success: true,
      data: transformedMarket
    });

  } catch (error) {
    console.error('❌ Market API GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch market'
    }, { status: 500 });
  }
} 