import { cookies } from 'next/headers';
import { updateUserStreak } from '@/lib/streaks';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Track daily user activity and update streaks
 * Called when user visits the app to maintain engagement tracking
 */
export async function POST(req: NextRequest) {
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

    // Update user's streak and activity
    const streakUpdate = await updateUserStreak(sessionUser.id);

    return NextResponse.json({
      success: true,
      data: {
        currentStreak: streakUpdate.currentStreak,
        longestStreak: streakUpdate.longestStreak,
        totalVisitDays: streakUpdate.totalVisitDays,
        isNewDay: streakUpdate.isNewDay,
        streakBroken: streakUpdate.streakBroken,
        message: streakUpdate.isNewDay 
          ? streakUpdate.streakBroken
            ? `Streak reset! Starting fresh with day 1. 🔄`
            : streakUpdate.currentStreak === 1
              ? `Welcome back! Starting your streak journey! 🌟`
              : `Day ${streakUpdate.currentStreak} streak! Keep it going! 🔥`
          : `Already counted for today! Current streak: ${streakUpdate.currentStreak} days`,
      },
    });

  } catch (error) {
    console.error('Daily activity tracking error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to track activity' },
      { status: 500 }
    );
  }
}

/**
 * Get current streak statistics
 */
export async function GET(req: NextRequest) {
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

    const { getUserStreakStats } = await import('@/lib/streaks');
    const stats = await getUserStreakStats(sessionUser.id);

    if (!stats) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Get streak stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get streak stats' },
      { status: 500 }
    );
  }
} 