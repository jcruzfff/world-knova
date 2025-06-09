'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Updated navigation with the new 3-tab structure matching Figma design:
 * - Create: For making predictions (coming soon)
 * - Home: Markets page for browsing
 * - Leaders: Leaderboard (coming soon)
 */

export const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState('home');

  // Update active tab based on current route
  useEffect(() => {
    if (pathname.includes('/create')) {
      setValue('create');
    } else if (pathname.includes('/leader')) {
      setValue('leader');
    } else {
      // Default to home (markets)
      setValue('home');
    }
  }, [pathname]);

  const handleTabChange = (newValue: string) => {
    setValue(newValue);
    
    switch (newValue) {
      case 'create':
        // TODO: Navigate to create page when implemented
        console.log('Create page - Coming soon');
        break;
      case 'home':
        router.push('/');
        break;
      case 'leader':
        // TODO: Navigate to leaderboard when implemented
        console.log('Leaderboard page - Coming soon');
        break;
    }
  };

  const tabs = [
    { 
      id: 'create', 
      iconSrc: '/create-icon.svg', 
      iconActiveSrc: '/create-icon-active.svg',
      label: 'Create' 
    },
    { 
      id: 'home', 
      iconSrc: '/home-icon.svg', 
      iconActiveSrc: '/home-icon-active.svg',
      label: 'Home' 
    },
    { 
      id: 'leader', 
      iconSrc: '/leader-icon.svg', 
      iconActiveSrc: '/leader-icon-active.svg',
      label: 'Leaders' 
    },
  ];

  return (
    <div className="bg-[#0F111A] border-t border-[#1D283B] px-4 py-2 pb-4">
      <div className="flex justify-center">
        <div className="flex justify-between items-center w-full max-w-sm">
          {tabs.map((tab) => {
            const isActive = value === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex flex-col items-center justify-center py-2 flex-1
                  transition-colors duration-200
                  ${isActive ? 'text-[#E9FF74]' : 'text-[#A0A0A0] hover:text-white'}
                `}
              >
                <div className="w-6 h-6 mb-1 relative">
                  <Image
                    src={isActive ? tab.iconActiveSrc : tab.iconSrc}
                    alt={tab.label}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <span className="text-xs font-medium">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
