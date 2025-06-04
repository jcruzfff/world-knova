'use client';

import { SessionBasedProfileCompletion } from './SessionBasedProfileCompletion';
import { useRouter } from 'next/navigation';

interface ProfileCompletionWrapperProps {
  user: {
    id: string;
    isProfileComplete: boolean;
    isEligible: boolean;
    age?: number | null;
    countryCode?: string | null;
    region?: string | null;
    termsAcceptedAt?: Date | null;
    privacyAcceptedAt?: Date | null;
    username?: string | null;
  };
}

/**
 * Client-side wrapper for ProfileCompletion that handles the onComplete callback
 * Uses database-integrated ProfileCompletion with proper state management
 */
export const ProfileCompletionWrapper = ({ user }: ProfileCompletionWrapperProps) => {
  const router = useRouter();

  const handleComplete = () => {
    // Refresh the page data to reflect updated profile state
    router.refresh();
  };

  // Convert user data to expected format
  const userForCompletion = {
    id: user.id,
    isProfileComplete: user.isProfileComplete,
    isEligible: user.isEligible,
    age: user.age || undefined,
    countryCode: user.countryCode || undefined,
    region: user.region || undefined,
    username: user.username || undefined,
  };

  return (
    <SessionBasedProfileCompletion
      user={userForCompletion}
      onComplete={handleComplete}
    />
  );
}; 