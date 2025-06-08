import { UserInfo } from '@/components/UserInfo';
import { Verify } from '@/components/Verify';
import { QuickActions } from '@/components/Home/QuickActions';
import { MarketHighlights } from '@/components/Home/MarketHighlights';
import { StreakDisplay } from '@/components/StreakDisplay';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { cache } from 'react';

// Cache the session check to avoid repeated parsing
const getSession = cache(async () => {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user-session')?.value;
    
    if (!userSession) {
      return null;
    }
    
    return JSON.parse(userSession);
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
});

// Cache the user data fetch to avoid repeated database calls
const getUserData = cache(async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      profilePictureUrl: true,
      walletAddress: true,
      worldIdVerified: true,
      verificationLevel: true,
      isProfileComplete: true,
      isEligible: true,
      age: true,
      countryCode: true,
      region: true,
      termsAcceptedAt: true,
      privacyAcceptedAt: true,
      currentStreak: true,
      longestStreak: true,
    },
  });
});

export default async function Home() {
  const sessionUser = await getSession();

  console.log('🏠 Home page - Session check:', {
    hasUser: !!sessionUser,
    hasUserId: !!sessionUser?.id,
    userId: sessionUser?.id,
    fullSession: sessionUser ? 'exists' : 'null'
  });

  if (!sessionUser?.id) {
    console.log('❌ Home page: No session found, redirecting to /');
    redirect('/');
  }

  console.log('✅ Home page: Session found, continuing...');

  // Get user profile from database (cached)
  const user = await getUserData(sessionUser.id);

  if (!user) {
    console.log('❌ Home page: User not found in database, redirecting to /');
    // User not found in database, redirect to login
    redirect('/');
  }

  console.log('✅ Home page: User found in database:', user.username);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <TopBar title="Knova" className="bg-white border-b border-gray-200" />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6 pb-24">
          {/* User Header */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <UserInfo 
              user={{
                id: user.id,
                username: user.username || '',
                profilePictureUrl: user.profilePictureUrl || '',
                worldIdVerified: user.worldIdVerified,
              }} 
            />
          </div>

          {/* Welcome Card for incomplete profiles */}
          {!user.isProfileComplete && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎉</span>
                <h2 className="text-xl font-bold">
                  Welcome to Knova!
                </h2>
              </div>
              <p className="text-blue-100 mb-4">
                Hey {user.username}! Explore prediction markets and see how it works. 
                When you&apos;re ready to participate, we&apos;ll help you complete your profile.
              </p>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-sm text-blue-100">
                  💡 Try exploring the markets tab to see what&apos;s available!
                </div>
              </div>
            </div>
          )}

          {/* World ID Verification */}
          {user.isProfileComplete && !user.worldIdVerified && (
            <div className="bg-white rounded-2xl border border-gray-200">
              <Verify />
            </div>
          )}

          {/* Streak Display */}
          {user.isProfileComplete && (
            <StreakDisplay 
              currentStreak={user.currentStreak || 0}
              longestStreak={user.longestStreak || 0}
            />
          )}

          {/* Quick Actions - Always show but will trigger profile completion if needed */}
          <QuickActions user={user} />

          {/* Market Highlights - Always show for exploration */}
          <MarketHighlights />

          {/* Full Access Status */}
          {user.isProfileComplete && user.worldIdVerified && user.isEligible && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎉</span>
                <h2 className="text-lg font-semibold">
                  You&apos;re All Set!
                </h2>
              </div>
              <p className="text-green-100 mb-3">
                Your profile is complete and you&apos;re verified! You can now participate in prediction markets.
              </p>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-sm text-green-100 space-y-1">
                  <p>📍 Region: {user.region}, {user.countryCode}</p>
                  <p>🔥 Current streak: {user.currentStreak} days</p>
                </div>
              </div>
            </div>
          )}

          {/* Limited Access Status */}
          {user.isProfileComplete && user.worldIdVerified && !user.isEligible && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚠️</span>
                <h2 className="text-lg font-semibold">
                  Limited Access
                </h2>
              </div>
              <p className="text-yellow-100 mb-3">
                Your profile is complete and you&apos;re verified, but prediction markets are not available in your region due to local regulations.
              </p>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-sm text-yellow-100">
                  📍 Region: {user.countryCode}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
