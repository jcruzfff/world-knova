import { cookies } from 'next/headers';
import { supabaseService } from '@/lib/supabase-client';
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

    // Update user profile using Supabase
    const { data: updatedUser, error: updateError } = await supabaseService.updateUser(sessionUser.id, {
      age,
      country_code: countryCode.toUpperCase(),
      region,
      is_eligible: isEligible,
      is_profile_complete: true,
      terms_accepted_at: termsAccepted ? new Date().toISOString() : undefined,
      privacy_accepted_at: privacyAccepted ? new Date().toISOString() : undefined,
      // Initialize default preferences for new users
      preferred_currency: 'WLD',
      favorite_categories: [],
      profile_visibility: 'public',
      // Initialize streak tracking
      current_streak: 1,
      longest_streak: 1,
      last_active_date: new Date().toISOString(),
      total_visit_days: 1,
    });

    if (updateError) {
      console.error('User update error:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Log compliance action using direct Supabase client
    const { error: complianceError } = await supabaseService['client']
      .from('compliance_logs')
      .insert([{
        user_id: sessionUser.id,
        action: 'profile_completion',
        result: isEligible ? 'passed' : 'failed',
        details: {
          age,
          countryCode: countryCode.toUpperCase(),
          region,
          termsAccepted,
          privacyAccepted,
          eligibilityReason: isEligible ? 'country_allowed' : 'country_restricted',
        },
        ip_address: clientIP,
        user_agent: userAgent,
      }]);

    if (complianceError) {
      console.error('Compliance log error:', complianceError);
      // Don't fail the request, just log the error
    }

    // Create initial activity entry using direct Supabase client
    const { error: activityError } = await supabaseService['client']
      .from('user_activities')
      .insert([{
        user_id: sessionUser.id,
        type: 'profile_completion',
        title: `Welcome to Knova! Profile completed successfully.`,
        details: {
          isEligible,
          countryCode: countryCode.toUpperCase(),
          region,
        },
        is_public: false, // Keep profile completion private
      }]);

    if (activityError) {
      console.error('User activity error:', activityError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: isEligible 
        ? 'Profile completed successfully! You can now participate in prediction markets.'
        : 'Profile completed, but prediction markets are not available in your region due to local regulations.',
      user: {
        id: updatedUser!.id,
        isEligible: updatedUser!.isEligible,
        isProfileComplete: updatedUser!.isProfileComplete,
        currentStreak: updatedUser!.currentStreak,
        age: updatedUser!.age,
        countryCode: updatedUser!.countryCode,
        region: updatedUser!.region,
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