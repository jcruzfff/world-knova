import { cookies } from 'next/headers';
import { SupabaseService } from './supabase-client';

interface User {
  id: string;
  email?: string;
  walletAddress: string;
  username?: string;
  displayName?: string;
  profilePictureUrl?: string;
  isProfileComplete: boolean;
  isEligible: boolean;
  verificationLevel?: string | null;
  worldIdVerified: boolean;
  age?: number | null;
  countryCode?: string | null;
  region?: string | null;
  termsAcceptedAt?: Date | null;
  privacyAcceptedAt?: Date | null;
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function validateSession(): Promise<User> {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user-session')?.value;

    if (!userSession) {
      throw new Error('No session found');
    }

    let sessionUser;
    try {
      sessionUser = JSON.parse(userSession);
    } catch {
      throw new Error('Invalid session');
    }

    if (!sessionUser?.id || !isValidUUID(sessionUser.id)) {
      throw new Error('Invalid session');
    }

    // Get fresh user data from database
    const supabaseService = new SupabaseService();
    const userResponse = await supabaseService.getUserById(sessionUser.id);

    if (!userResponse.data) {
      throw new Error('Invalid session');
    }

    // Transform database user to session user format
    const user = userResponse.data;
    return {
      id: user.id,
      email: user.email || undefined,
      walletAddress: user.walletAddress,
      username: user.username || undefined,
      displayName: user.displayName || undefined,
      profilePictureUrl: user.profilePictureUrl || undefined,
      isProfileComplete: user.isProfileComplete,
      isEligible: user.isEligible,
      verificationLevel: user.verificationLevel,
      worldIdVerified: user.worldIdVerified,
      age: user.age,
      countryCode: user.countryCode,
      region: user.region,
      termsAcceptedAt: user.termsAcceptedAt,
      privacyAcceptedAt: user.privacyAcceptedAt,
    };

  } catch (error) {
    console.error('❌ Error validating session:', error);
    throw error; // Re-throw the error so API routes can handle it appropriately
  }
} 