
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateTargetDate = async () => {
      // Set loading state
      setIsLoading(true);
      
      // Create a new target date
      const newTargetDate = new Date();
      newTargetDate.setDate(newTargetDate.getDate() + initialDays);
      newTargetDate.setHours(23, 59, 59, 999);
      
      try {
        // Try to fetch from Firebase
        const countdownRef = doc(db, 'system', 'countdown');
        const countdownDoc = await getDoc(countdownRef);
        
        let targetDate: Date;
        
        if (!countdownDoc.exists() || !countdownDoc.data().endDate) {
          // Create a new countdown in Firebase
          targetDate = newTargetDate;
          
          try {
            await setDoc(countdownRef, {
              endDate: targetDate.toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            console.log("Created new countdown target date in Firebase:", targetDate);
          } catch (firebaseError) {
            console.error("Error setting Firebase countdown:", firebaseError);
          }
        } else {
          // Use the stored target date from Firebase
          const storedDate = countdownDoc.data().endDate;
          const parsedDate = new Date(storedDate);
          
          // Check if the stored date is in the past
          if (parsedDate.getTime() < new Date().getTime()) {
            // If expired, create a new one
            targetDate = newTargetDate;
            
            try {
              await setDoc(countdownRef, {
                endDate: targetDate.toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
              console.log("Updated expired countdown target date in Firebase:", targetDate);
            } catch (updateError) {
              console.error("Error updating Firebase countdown:", updateError);
            }
          } else {
            // Use the valid stored date
            targetDate = parsedDate;
            console.log("Using existing countdown target date from Firebase:", targetDate);
          }
        }
        
        // Store in localStorage as a backup
        localStorage.setItem('countdownTargetDate', targetDate.toISOString());
        
        // Set up interval to update the countdown
        const interval = setInterval(() => {
          const now = new Date().getTime();
          const distance = targetDate.getTime() - now;
          
          if (distance < 0) {
            clearInterval(interval);
            setDays(0);
            setHours(0);
            setMinutes(0);
            setSeconds(0);
          } else {
            setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
            setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
            setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
          }
          
          setIsLoading(false);
        }, 1000);
        
        return () => clearInterval(interval);
        
      } catch (error) {
        console.error("Error in countdown management:", error);
        
        // Fallback to local countdown if Firebase fails
        const targetDate = newTargetDate;
        localStorage.setItem('countdownTargetDate', targetDate.toISOString());
        
        const interval = setInterval(() => {
          const now = new Date().getTime();
          const distance = targetDate.getTime() - now;
          
          if (distance < 0) {
            clearInterval(interval);
            setDays(0);
            setHours(0);
            setMinutes(0);
            setSeconds(0);
          } else {
            setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
            setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
            setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
          }
          
          setIsLoading(false);
        }, 1000);
        
        return () => clearInterval(interval);
      }
    };
    
    fetchOrCreateTargetDate();
  }, [initialDays]);

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <FlipUnit digit="00" label="DAYS" />
        <FlipUnit digit="00" label="HOURS" />
        <FlipUnit digit="00" label="MINUTES" />
        <FlipUnit digit="00" label="SECONDS" />
      </div>
    );
  }

  return <FlipClock days={days} hours={hours} minutes={minutes} seconds={seconds} />;
};
