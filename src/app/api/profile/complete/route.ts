import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Countries where prediction markets are generally restricted
const RESTRICTED_COUNTRIES = [
  'US', // United States (complex state-by-state laws)
  'FR', // France (strict gambling laws)
  'TR', // Turkey
  'CN', // China
  'KR', // South Korea
  'SG', // Singapore (strict regulation)
];

// Minimum age for prediction market participation
const MIN_AGE = 18;

/**
 * Complete user profile with compliance checking
 * Handles age verification, region eligibility, and terms acceptance
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

    const body = await req.json();
    const { age, countryCode, region, termsAccepted, privacyAccepted } = body;

    // Validation
    if (!age || age < MIN_AGE) {
      return NextResponse.json(
        { success: false, message: `You must be at least ${MIN_AGE} years old to participate` },
        { status: 400 }
      );
    }

    if (!countryCode || !region) {
      return NextResponse.json(
        { success: false, message: 'Country and region are required' },
        { status: 400 }
      );
    }

    if (!termsAccepted || !privacyAccepted) {
      return NextResponse.json(
        { success: false, message: 'You must accept the terms and privacy policy' },
        { status: 400 }
      );
    }

    // Check if country is restricted
    const isEligible = !RESTRICTED_COUNTRIES.includes(countryCode.toUpperCase());
    
    // Get client IP and user agent for compliance logging
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        age,
        countryCode: countryCode.toUpperCase(),
        region,
        isEligible,
        isProfileComplete: true,
        termsAcceptedAt: termsAccepted ? new Date() : undefined,
        privacyAcceptedAt: privacyAccepted ? new Date() : undefined,
        // Initialize default preferences for new users
        preferredCurrency: 'WLD',
        favoriteCategories: [],
        profileVisibility: 'public',
        // Initialize streak tracking
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date(),
        totalVisitDays: 1,
      },
    });

    // Log compliance action
    await prisma.complianceLog.create({
      data: {
        userId: sessionUser.id,
        action: 'profile_completion',
        result: isEligible ? 'approved' : 'restricted',
        details: {
          age,
          countryCode: countryCode.toUpperCase(),
          region,
          termsAccepted,
          privacyAccepted,
          eligibilityReason: isEligible ? 'country_allowed' : 'country_restricted',
        },
        ipAddress: clientIP,
        userAgent,
      },
    });

    // Create initial activity entry
    await prisma.userActivity.create({
      data: {
        userId: sessionUser.id,
        type: 'profile_completion',
        title: `Welcome to Knova! Profile completed successfully.`,
        details: {
          isEligible,
          countryCode: countryCode.toUpperCase(),
          region,
        },
        isPublic: false, // Keep profile completion private
      },
    });

    return NextResponse.json({
      success: true,
      message: isEligible 
        ? 'Profile completed successfully! You can now participate in prediction markets.'
        : 'Profile completed, but prediction markets are not available in your region due to local regulations.',
      user: {
        id: updatedUser.id,
        isEligible: updatedUser.isEligible,
        isProfileComplete: updatedUser.isProfileComplete,
        currentStreak: updatedUser.currentStreak,
        age: updatedUser.age,
        countryCode: updatedUser.countryCode,
        region: updatedUser.region,
      },
    });

  } catch (error) {
    console.error('Profile completion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 