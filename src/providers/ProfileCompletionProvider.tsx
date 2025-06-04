'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: string;
  username: string | null;
  isProfileComplete: boolean;
  isEligible: boolean;
  age?: number | null;
  countryCode?: string | null;
  region?: string | null;
  termsAcceptedAt?: Date | null;
  privacyAcceptedAt?: Date | null;
}

interface ProfileCompletionContextType {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const ProfileCompletionContext = createContext<ProfileCompletionContextType | undefined>(undefined);

export const useProfileCompletion = () => {
  const context = useContext(ProfileCompletionContext);
  if (context === undefined) {
    throw new Error('useProfileCompletion must be used within a ProfileCompletionProvider');
  }
  return context;
};

interface ProfileCompletionProviderProps {
  children: ReactNode;
}

export const ProfileCompletionProvider = ({ children }: ProfileCompletionProviderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const openDrawer = () => {
    console.log('🎭 Opening profile completion drawer');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    console.log('🎭 Closing profile completion drawer');
    setIsDrawerOpen(false);
  };

  const contextValue: ProfileCompletionContextType = {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    user,
    setUser,
  };

  return (
    <ProfileCompletionContext.Provider value={contextValue}>
      {children}
    </ProfileCompletionContext.Provider>
  );
}; 