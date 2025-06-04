'use client';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakDisplay = ({ currentStreak, longestStreak }: StreakDisplayProps) => {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '🌟';
    if (streak >= 3) return '✨';
    return '📈';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return 'Prediction Master!';
    if (streak >= 14) return 'On Fire!';
    if (streak >= 7) return 'Hot Streak!';
    if (streak >= 3) return 'Getting Warm!';
    if (streak >= 1) return 'Building Momentum!';
    return 'Start Your Streak!';
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getStreakEmoji(currentStreak)}</span>
          <div>
            <h3 className="font-semibold text-lg">
              {getStreakMessage(currentStreak)}
            </h3>
            <p className="text-blue-100 text-sm">
              {currentStreak > 0 
                ? `${currentStreak} day${currentStreak === 1 ? '' : 's'} streak`
                : 'Make your first prediction'
              }
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">{currentStreak}</div>
          <div className="text-xs text-blue-200">current</div>
        </div>
      </div>

      {longestStreak > 0 && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex justify-between items-center text-sm text-blue-100">
            <span>Personal Best</span>
            <span className="font-semibold">{longestStreak} days</span>
          </div>
        </div>
      )}
    </div>
  );
}; 