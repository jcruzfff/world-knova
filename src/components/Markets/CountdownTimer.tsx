'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  variant?: 'default' | 'featured';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = ({ endTime, variant = 'default' }: CountdownTimerProps) => {
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
          ? 'bg-red-500/20 text-red-100' 
          : 'bg-red-100 text-red-600'
        }
      `}>
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        Market Ended
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  if (variant === 'featured') {
    return (
      <div className="space-y-2">
        <div className="text-xs opacity-80 font-medium">Ends in</div>
        <div className="flex items-center gap-3">
          {timeLeft.days > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-xs opacity-80">days</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
            <div className="text-xs opacity-80">hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
            <div className="text-xs opacity-80">mins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
            <div className="text-xs opacity-80">secs</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
      ${isUrgent 
        ? 'bg-orange-100 text-orange-600' 
        : 'bg-blue-100 text-blue-600'
      }
    `}>
      <span className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`} />
      {timeLeft.days > 0 
        ? `${timeLeft.days}d ${timeLeft.hours}h left`
        : `${timeLeft.hours}h ${timeLeft.minutes}m left`
      }
    </div>
  );
}; 