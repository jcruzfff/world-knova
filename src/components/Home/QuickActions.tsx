'use client';

import { useRouter } from 'next/navigation';
import { GraphUp, Search, User, Trophy } from 'iconoir-react';
import { useProfileCompletion } from '@/providers/ProfileCompletionProvider';
import { useEffect } from 'react';

interface QuickActionsProps {
  user: {
    id: string;
    username: string | null;
    isProfileComplete: boolean;
    isEligible: boolean;
    age?: number | null;
    countryCode?: string | null;
    region?: string | null;
    termsAcceptedAt?: Date | null;
    privacyAcceptedAt?: Date | null;
  };
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  onClick: () => void;
  isRestricted?: boolean;
}

const ActionCard = ({ icon, title, subtitle, gradient, onClick, isRestricted }: ActionCardProps) => { 
  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-4 text-white text-left
        transform transition-all duration-200 hover:scale-105 hover:shadow-lg
        bg-gradient-to-br ${gradient}
        ${isRestricted ? 'opacity-90' : ''}
      `}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="text-2xl">{icon}</div>
          {isRestricted && (
            <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
              Profile Required
            </div>
          )}
        </div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-white/80 text-sm">{subtitle}</p>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
      </div>
    </button>
  );
};

export const QuickActions = ({ user }: QuickActionsProps) => {
  const router = useRouter();
  const { openDrawer, setUser } = useProfileCompletion();

  // Set user data in the profile completion context
  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  const handleRestrictedAction = (action: () => void) => {
    if (!user.isProfileComplete) {
      console.log('🚫 Action requires profile completion, opening drawer');
      openDrawer();
    } else {
      action();
    }
  };

  const actions = [
    {
      icon: <GraphUp />,
      title: 'Browse Markets',
      subtitle: 'Explore prediction markets',
      gradient: 'from-blue-500 to-purple-600',
      onClick: () => router.push('/markets'),
      isRestricted: false, // Allow browsing without profile completion
    },
    {
      icon: <Search />,
      title: 'Make Prediction',
      subtitle: 'Place your first bet',
      gradient: 'from-green-500 to-teal-600',
      onClick: () => handleRestrictedAction(() => {
        console.log('Navigate to prediction creation');
        // TODO: Implement prediction creation
      }),
      isRestricted: !user.isProfileComplete,
    },
    {
      icon: <User />,
      title: 'Create Market',
      subtitle: 'Start your own market',
      gradient: 'from-orange-500 to-red-600',
      onClick: () => handleRestrictedAction(() => {
        console.log('Navigate to market creation');
        // TODO: Implement market creation
      }),
      isRestricted: !user.isProfileComplete,
    },
    {
      icon: <Trophy />,
      title: 'My Predictions',
      subtitle: 'Track your performance',
      gradient: 'from-purple-500 to-pink-600',
      onClick: () => handleRestrictedAction(() => {
        console.log('Navigate to user predictions');
        // TODO: Implement user predictions
      }),
      isRestricted: !user.isProfileComplete,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
        {!user.isProfileComplete && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Complete profile to unlock all features
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </div>
    </div>
  );
}; 