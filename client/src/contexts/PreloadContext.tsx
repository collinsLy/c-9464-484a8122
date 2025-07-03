import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { preloadService } from '@/lib/preload-service';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface PreloadedData {
  userBalance: number;
  userProfile: any;
  prices: Map<string, number>;
  marketData: any;
  lastUpdated: Date;
}

interface PreloadContextType {
  preloadedData: PreloadedData | null;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  getCachedPrice: (symbol: string) => number | null;
}

const PreloadContext = createContext<PreloadContextType | undefined>(undefined);

interface PreloadProviderProps {
  children: ReactNode;
}

export const PreloadProvider: React.FC<PreloadProviderProps> = ({ children }) => {
  const [preloadedData, setPreloadedData] = useState<PreloadedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoading(true);
        try {
          await preloadService.preloadUserData(user.uid);
          const data = preloadService.getPreloadedData();
          setPreloadedData(data);
        } catch (error) {
          console.error('Error during preload:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setPreloadedData(null);
        setIsLoading(false);
      }
    });

    // Listen for preload completion
    preloadService.onPreloadComplete((data) => {
      setPreloadedData(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await preloadService.refreshData();
      const data = preloadService.getPreloadedData();
      setPreloadedData(data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCachedPrice = (symbol: string): number | null => {
    return preloadService.getCachedPrice(symbol);
  };

  const value: PreloadContextType = {
    preloadedData,
    isLoading,
    refreshData,
    getCachedPrice
  };

  return (
    <PreloadContext.Provider value={value}>
      {children}
    </PreloadContext.Provider>
  );
};

export const usePreload = (): PreloadContextType => {
  const context = useContext(PreloadContext);
  if (context === undefined) {
    throw new Error('usePreload must be used within a PreloadProvider');
  }
  return context;
};