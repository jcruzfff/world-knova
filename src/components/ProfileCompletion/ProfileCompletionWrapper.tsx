'use client';

import { useState } from 'react';
import { SessionBasedProfileCompletion } from './SessionBasedProfileCompletion';
import { BottomSheet } from '@/components/UI/BottomSheet';
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
  initialOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

/**
 * Client-side wrapper for ProfileCompletion that handles the onComplete callback
 * Uses database-integrated ProfileCompletion with proper state management
 * Now renders in a BottomSheet for better mobile UX
 */
export const ProfileCompletionWrapper = ({ 
  user, 
  initialOpen = true,
  onClose,
  onComplete
}: ProfileCompletionWrapperProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(initialOpen);

  const handleComplete = () => {
    // Close the sheet and refresh the page data to reflect updated profile state
    setIsOpen(false);
    router.refresh();
    if (onComplete) {
      onComplete();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
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
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Complete Your Profile"
      height="auto"
      closeOnBackdropClick={false} // Prevent accidental closure
      closeOnSwipeDown={true}
    >
      <SessionBasedProfileCompletion
        user={userForCompletion}
        onCompleteAction={handleComplete}
        onSkip={onClose}
      />
    </BottomSheet>
  );
}; 