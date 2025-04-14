
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export const useCountdown = (initialDays: number) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const fetchOrCreateTargetDate = async () => {
      try {
        // Get a reference to the global countdown document
        const countdownRef = doc(db, 'system', 'countdown');
        const countdownDoc = await getDoc(countdownRef);
        
        let targetDate: Date;
        
        if (!countdownDoc.exists() || !countdownDoc.data().endDate) {
          // If no stored date exists, create a new one
          targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + initialDays);
          
          // Store the target date in Firebase for persistence
          await setDoc(countdownRef, {
            endDate: targetDate.toISOString(),
            createdAt: new Date().toISOString()
          }, { merge: true });
        } else {
          // Use the stored target date from Firebase
          targetDate = new Date(countdownDoc.data().endDate);
        }
        
        // Set up interval to update the countdown
        const interval = setInterval(() => {
          const now = new Date().getTime();
          const distance = targetDate.getTime() - now;
          
          // If the countdown has expired
          if (distance < 0) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            clearInterval(interval);
            return;
          }
          
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error("Error managing countdown:", error);
        // Fallback to local calculation if Firebase fails
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + initialDays);
        
        const interval = setInterval(() => {
          const now = new Date().getTime();
          const distance = targetDate.getTime() - now;
          
          if (distance < 0) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            clearInterval(interval);
            return;
          }
          
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);
        
        return () => clearInterval(interval);
      }
    };
    
    fetchOrCreateTargetDate();
  }, [initialDays]);

  return timeLeft;
};
