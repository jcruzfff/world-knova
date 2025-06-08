'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Plus, Home, Trophy, GraphUp } from 'iconoir-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Updated navigation with the new 3-tab structure:
 * - Create: For making predictions (coming soon)
 * - Home: Markets page for browsing
 * - Leader: Leaderboard (coming soon)
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
        router.push('/markets');
        break;
      case 'leader':
        // TODO: Navigate to leaderboard when implemented
        console.log('Leaderboard page - Coming soon');
        break;
    }
  };

  return (
    <Tabs value={value} onValueChange={handleTabChange}>
      <TabItem value="create" icon={<Plus />} label="Create" />
      <TabItem value="home" icon={<Home />} label="Home" />
      <TabItem value="leader" icon={<Trophy />} label="Leader" />
    </Tabs>
  );
};
