import { useState, useEffect } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { Clock } from 'lucide-react';

interface FlipUnitProps {
  digit: string;
  label: string;
}

const FlipUnit = ({ digit, label }: FlipUnitProps) => {
  return (
    <div className="flip-clock-unit">
      <div className="flip-clock-card relative bg-black/60 rounded-lg w-16 h-20 flex items-center justify-center shadow-lg perspective border border-accent/20">
        <div className="absolute w-full h-[2px] bg-black/40 top-1/2 z-10"></div>
        <div className="text-3xl font-bold text-white">{digit}</div>
      </div>
      <div className="text-xs text-white/60 text-center mt-2">{label}</div>
    </div>
  );
};

interface FlipClockProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const FlipClock = ({ days, hours, minutes, seconds }: FlipClockProps) => {
  return (
    <div className="flex gap-4">
      <FlipUnit digit={days.toString().padStart(2, '0')} label="DAYS" />
      <FlipUnit digit={hours.toString().padStart(2, '0')} label="HOURS" />
      <FlipUnit digit={minutes.toString().padStart(2, '0')} label="MINUTES" />
      <FlipUnit digit={seconds.toString().padStart(2, '0')} label="SECONDS" />
    </div>
  );
};

interface CountdownDisplayProps {
  initialDays?: number;
}

export const CountdownDisplay = ({ initialDays = 7 }: CountdownDisplayProps) => {
  // Use the useCountdown hook to get the time left
  const timeLeft = useCountdown(initialDays);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after the initial countdown values are loaded
    // or when any of the timeLeft values change from their initial state
    if (timeLeft.days > 0 || timeLeft.hours > 0 || 
        timeLeft.minutes > 0 || timeLeft.seconds > 0) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <FlipUnit digit="--" label="DAYS" />
        <FlipUnit digit="--" label="HOURS" />
        <FlipUnit digit="--" label="MINUTES" />
        <FlipUnit digit="--" label="SECONDS" />
      </div>
    );
  }

  return <FlipClock 
    days={timeLeft.days} 
    hours={timeLeft.hours} 
    minutes={timeLeft.minutes} 
    seconds={timeLeft.seconds} 
  />;
};