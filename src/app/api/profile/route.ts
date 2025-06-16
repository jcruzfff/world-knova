import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * Get user profile information
 * Returns current profile state and compliance status
 */
export async function GET() {
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

    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        username: true,
        profilePictureUrl: true,
        walletAddress: true,
        worldIdVerified: true,
        verificationLevel: true,
        isProfileComplete: true,
        isEligible: true,
        age: true,
        countryCode: true,
        region: true,
        termsAcceptedAt: true,
        privacyAcceptedAt: true,
        preferredCurrency: true,
        favoriteCategories: true,
        profileVisibility: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        totalVisitDays: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 