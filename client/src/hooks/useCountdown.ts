
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useCountdown = (initialDays: number = 7) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createNewTargetDate = () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + initialDays);
      targetDate.setHours(23, 59, 59, 999);
      return targetDate;
    };

    const setUpCountdown = (targetDate: Date) => {
      // Store in localStorage for persistence
      localStorage.setItem('countdownTargetDate', targetDate.toISOString());
      
      // Calculate time remaining
      const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        
        if (distance < 0) {
          // Countdown expired
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          setLoading(false);
          return;
        }
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setLoading(false);
      };
      
      // Initial update
      updateCountdown();
      
      // Update every second
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    };

    const initializeCountdown = async () => {
      setLoading(true);
      
      // Try to get from localStorage first
      const storedDateStr = localStorage.getItem('countdownTargetDate');
      let targetDate: Date;

      if (storedDateStr) {
        // Use the stored date
        targetDate = new Date(storedDateStr);
        
        // Check if the stored date is in the past
        if (targetDate.getTime() <= new Date().getTime()) {
          // Create a new target date
          targetDate = createNewTargetDate();
        }
      } else {
        // Try to get from Firebase
        try {
          const countdownRef = doc(db, 'system', 'countdown');
          const countdownDoc = await getDoc(countdownRef);
          
          if (countdownDoc.exists() && countdownDoc.data().endDate) {
            targetDate = new Date(countdownDoc.data().endDate);
            
            // Check if Firebase date is in the past
            if (targetDate.getTime() <= new Date().getTime()) {
              targetDate = createNewTargetDate();
            }
          } else {
            // No valid date in Firebase, create new one
            targetDate = createNewTargetDate();
            
            // Try to store in Firebase
            try {
              await setDoc(countdownRef, {
                endDate: targetDate.toISOString(),
                createdAt: new Date().toISOString()
              }, { merge: true });
            } catch (error) {
              console.error("Failed to store countdown in Firebase:", error);
            }
          }
        } catch (error) {
          console.error("Failed to access Firebase:", error);
          // Fallback to creating a new target date
          targetDate = createNewTargetDate();
        }
      }
      
      // Set up the countdown with the determined target date
      return setUpCountdown(targetDate);
    };

    // Start the countdown
    const cleanup = initializeCountdown();
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [initialDays]);

  return timeLeft;
};
