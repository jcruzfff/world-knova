'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  variant?: 'default' | 'featured';
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = ({ endTime, variant = 'default', compact = false }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (isExpired) {
    return (
      <div className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
        ${variant === 'featured' 
          ? 'bg-red-500/20 text-red-300' 
          : 'bg-red-500/20 text-red-400'
        }
      `}>
        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
        Market Ended
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  if (variant === 'featured') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-[#9CA3AF] font-medium">Ends in</div>
        <div className="flex items-center gap-3">
          {timeLeft.days > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
              <div className="text-xs text-[#9CA3AF]">days</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{timeLeft.hours.toString().padStart(2, '0')}</div>
            <div className="text-xs text-[#9CA3AF]">hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{timeLeft.minutes.toString().padStart(2, '0')}</div>
            <div className="text-xs text-[#9CA3AF]">mins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{timeLeft.seconds.toString().padStart(2, '0')}</div>
            <div className="text-xs text-[#9CA3AF]">secs</div>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <span className="text-sm font-medium text-[#9CA3AF]">
        {timeLeft.days > 0 
          ? `${timeLeft.days}d ${timeLeft.hours}h`
          : `${timeLeft.hours}h ${timeLeft.minutes}m`
        }
      </span>
    );
  }

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
      ${isUrgent 
        ? 'bg-orange-500/20 text-orange-400' 
        : 'bg-[#E9FF74]/20 text-[#E9FF74]'
      }
    `}>
      <span className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-orange-400 animate-pulse' : 'bg-[#E9FF74]'}`} />
      {timeLeft.days > 0 
        ? `${timeLeft.days}d ${timeLeft.hours}h left`
        : `${timeLeft.hours}h ${timeLeft.minutes}m left`
      }
    </div>
  );
}; 