
import { useState, useEffect } from 'react';

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
