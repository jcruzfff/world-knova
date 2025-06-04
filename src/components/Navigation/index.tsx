'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Bank, Home, User, GraphUp } from 'iconoir-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * This component uses the UI Kit to navigate between pages
 * Bottom navigation is the most common navigation pattern in Mini Apps
 * We require mobile first design patterns for mini apps
 * Read More: https://docs.world.org/mini-apps/design/app-guidelines#mobile-first
 */

export const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState('home');

  // Update active tab based on current route
  useEffect(() => {
    if (pathname.includes('/markets')) {
      setValue('markets');
    } else if (pathname.includes('/wallet')) {
      setValue('wallet');
    } else if (pathname.includes('/profile')) {
      setValue('profile');
    } else {
      setValue('home');
    }
  }, [pathname]);

  const handleTabChange = (newValue: string) => {
    setValue(newValue);
    
    switch (newValue) {
      case 'home':
        router.push('/home');
        break;
      case 'markets':
        router.push('/markets');
        break;
      case 'wallet':
        // TODO: Implement wallet page
        console.log('Wallet page - Coming soon');
        break;
      case 'profile':
        // TODO: Implement profile page
        console.log('Profile page - Coming soon');
        break;
    }
  };

  return (
    <Tabs value={value} onValueChange={handleTabChange}>
      <TabItem value="home" icon={<Home />} label="Home" />
      <TabItem value="markets" icon={<GraphUp />} label="Markets" />
      <TabItem value="wallet" icon={<Bank />} label="Wallet" />
      <TabItem value="profile" icon={<User />} label="Profile" />
    </Tabs>
  );
};
