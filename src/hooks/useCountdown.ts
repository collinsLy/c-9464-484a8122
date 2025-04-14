
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useCountdown = (initialDays: number) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const fetchOrCreateTargetDate = async () => {
      // Try to get the stored date from localStorage first
      const storedDate = localStorage.getItem('countdownTargetDate');
      let targetDate: Date;
      
      if (storedDate) {
        // Use the date from localStorage if available
        targetDate = new Date(storedDate);
      } else {
        // Try to fetch from Firebase, but have a fallback
        try {
          // Attempt to get from Firebase
          const countdownRef = doc(db, 'system', 'countdown');
          const countdownDoc = await getDoc(countdownRef);
          
          if (!countdownDoc.exists() || !countdownDoc.data().endDate) {
            // Create a new target date
            targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + initialDays);
            
            // Try to store in Firebase, but don't let it block us if it fails
            try {
              await setDoc(countdownRef, {
                endDate: targetDate.toISOString(),
                createdAt: new Date().toISOString()
              }, { merge: true });
            } catch (firebaseError) {
              console.log("Firebase storage failed, using localStorage instead:", firebaseError);
            }
          } else {
            // Use the stored target date from Firebase
            targetDate = new Date(countdownDoc.data().endDate);
          }
        } catch (error) {
          console.log("Firebase access failed, creating local countdown:", error);
          // Create a new local target date if Firebase fails
          targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + initialDays);
        }
        
        // Store in localStorage as a backup
        localStorage.setItem('countdownTargetDate', targetDate.toISOString());
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
    };
    
    fetchOrCreateTargetDate();
  }, [initialDays]);

  return timeLeft;
};
