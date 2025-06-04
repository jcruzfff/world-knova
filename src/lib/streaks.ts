import { prisma } from '@/lib/prisma';

export interface StreakUpdate {
  currentStreak: number;
  longestStreak: number;
  totalVisitDays: number;
  isNewDay: boolean;
  streakBroken: boolean;
}

/**
 * Update user's daily streak and activity tracking
 * Handles streak continuation, breaking, and activity logging
 */
export async function updateUserStreak(userId: string): Promise<StreakUpdate> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
      totalVisitDays: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user was active today already
  const lastActiveDate = user.lastActiveDate 
    ? new Date(user.lastActiveDate.getFullYear(), user.lastActiveDate.getMonth(), user.lastActiveDate.getDate())
    : null;

  // If already active today, return current stats
  if (lastActiveDate && lastActiveDate.getTime() === today.getTime()) {
    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalVisitDays: user.totalVisitDays,
      isNewDay: false,
      streakBroken: false,
    };
  }

  const isNewDay = true;
  let currentStreak = user.currentStreak;
  let longestStreak = user.longestStreak;
  let streakBroken = false;

  // Calculate if streak should continue or break
  if (lastActiveDate) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If last active was yesterday, continue streak
    if (lastActiveDate.getTime() === yesterday.getTime()) {
      currentStreak += 1;
    } else {
      // Streak broken - reset to 1
      streakBroken = currentStreak > 1; // Only consider it "broken" if they had a streak
      currentStreak = 1;
    }
  } else {
    // First time visiting
    currentStreak = 1;
  }

  // Update longest streak if current is higher
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  const totalVisitDays = user.totalVisitDays + 1;

  // Update user in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak,
      lastActiveDate: now,
      totalVisitDays,
    },
  });

  // Log streak activity
  await prisma.userActivity.create({
    data: {
      userId,
      type: 'streak',
      title: streakBroken 
        ? `Streak reset - started a new streak! Day ${currentStreak}`
        : currentStreak === 1 
          ? 'Started your first streak! Welcome back.'
          : `Streak day ${currentStreak}! Keep it going! 🔥`,
      details: {
        currentStreak,
        longestStreak,
        totalVisitDays,
        streakBroken,
        isNewRecord: currentStreak === longestStreak && currentStreak > 1,
      },
      isPublic: true, // Streak achievements can be public
    },
  });

  // Log streak milestones
  if (currentStreak > 1 && (currentStreak % 7 === 0 || currentStreak % 30 === 0 || currentStreak === longestStreak)) {
    let achievementTitle = '';
    if (currentStreak % 30 === 0) {
      achievementTitle = `🏆 ${currentStreak}-day streak milestone! Incredible dedication!`;
    } else if (currentStreak % 7 === 0) {
      achievementTitle = `⭐ ${currentStreak}-day streak! A full week of engagement!`;
    } else if (currentStreak === longestStreak && currentStreak > user.longestStreak) {
      achievementTitle = `🎉 New personal record! ${currentStreak}-day streak!`;
    }

    if (achievementTitle) {
      await prisma.userActivity.create({
        data: {
          userId,
          type: 'achievement',
          title: achievementTitle,
          details: {
            type: 'streak_milestone',
            streak: currentStreak,
            milestone: currentStreak % 30 === 0 ? 'monthly' : currentStreak % 7 === 0 ? 'weekly' : 'personal_record',
          },
          isPublic: true,
        },
      });
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalVisitDays,
    isNewDay,
    streakBroken,
  };
}

/**
 * Get user streak statistics
 */
export async function getUserStreakStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
      totalVisitDays: true,
    },
  });

  if (!user) {
    return null;
  }

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastActiveDate = user.lastActiveDate 
    ? new Date(user.lastActiveDate.getFullYear(), user.lastActiveDate.getMonth(), user.lastActiveDate.getDate())
    : null;

  const isActiveToday = lastActiveDate && lastActiveDate.getTime() === todayDate.getTime();
  
  // Check if streak is at risk (last active was not yesterday or today)
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const isStreakAtRisk = !isActiveToday && 
    (!lastActiveDate || lastActiveDate.getTime() < yesterday.getTime()) &&
    user.currentStreak > 0;

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    totalVisitDays: user.totalVisitDays,
    isActiveToday,
    isStreakAtRisk,
    lastActiveDate: user.lastActiveDate,
  };
} 