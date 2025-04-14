
import { useState, useEffect } from 'react';

export const useCountdown = (initialDays: number) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Use localStorage to store and retrieve the target date
    const storedTargetDate = localStorage.getItem('promotionEndDate');
    let targetDate: Date;
    
    if (!storedTargetDate) {
      // If no stored date exists, create a new one
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + initialDays);
      // Store the target date in localStorage for persistence
      localStorage.setItem('promotionEndDate', targetDate.toISOString());
    } else {
      // Use the stored target date
      targetDate = new Date(storedTargetDate);
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      // If the countdown has expired, create a new one (optional)
      if (distance < 0) {
        // Uncomment below to reset timer when it expires
        // targetDate = new Date();
        // targetDate.setDate(targetDate.getDate() + initialDays);
        // localStorage.setItem('promotionEndDate', targetDate.toISOString());
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
  }, [initialDays]);

  return timeLeft;
};
