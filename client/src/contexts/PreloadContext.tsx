
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserService } from '@/lib/user-service';

interface Asset {
  symbol: string;
  amount: number;
  price: number;
  value: number;
}

interface Portfolio {
  assets: Asset[];
  totalValue: number;
  usdtBalance: number;
  dailyChange: number;
  profitLoss: number;
  profitLossPercent: number;
  isLoading: boolean;
  lastUpdated: Date;
}

interface PreloadContextType {
  portfolio: Portfolio | null;
  isLoading: boolean;
  refreshPortfolio: () => Promise<void>;
}

const PreloadContext = createContext<PreloadContextType | null>(null);

export const PreloadProvider = ({ children }: { children: ReactNode }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const fetchPrices = async (): Promise<Record<string, number>> => {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
      const symbolsQuery = JSON.stringify(symbols);
      
      const response = await fetch(`/api/v3/ticker/price?symbols=${symbolsQuery}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch prices');
      
      const data = await response.json();
      const prices: Record<string, number> = { USDT: 1 };
      
      data.forEach((item: any) => {
        const symbol = item.symbol.replace('USDT', '');
        prices[symbol] = parseFloat(item.price);
      });
      
      return prices;
    } catch (error) {
      console.error('Error fetching prices:', error);
      return { USDT: 1 };
    }
  };

  const calculatePortfolio = async (userId: string): Promise<Portfolio> => {
    try {
      const [userData, prices] = await Promise.all([
        UserService.getUserData(userId),
        fetchPrices()
      ]);

      if (!userData) {
        return {
          assets: [],
          totalValue: 0,
          usdtBalance: 0,
          dailyChange: 0,
          profitLoss: 0,
          profitLossPercent: 0,
          isLoading: false,
          lastUpdated: new Date()
        };
      }

      const usdtBalance = typeof userData.balance === 'number' ? userData.balance : 
                         (typeof userData.balance === 'string' ? parseFloat(userData.balance) : 0);

      const assets: Asset[] = [];
      let totalValue = usdtBalance;

      // Add USDT as an asset
      assets.push({
        symbol: 'USDT',
        amount: usdtBalance,
        price: 1,
        value: usdtBalance
      });

      // Calculate other assets
      if (userData.assets) {
        Object.entries(userData.assets).forEach(([symbol, data]: [string, any]) => {
          if (symbol === 'USDT') return; // Skip USDT as it's already included
          
          const amount = data.amount || 0;
          const price = prices[symbol] || 0;
          const value = amount * price;
          
          if (amount > 0) {
            assets.push({
              symbol,
              amount,
              price,
              value
            });
            totalValue += value;
          }
        });
      }

      // Calculate profit/loss
      const initialBalance = userData.initialBalance || usdtBalance;
      const totalProfitLoss = userData.totalProfitLoss || 0;
      const profitLossPercent = initialBalance > 0 ? (totalProfitLoss / initialBalance) * 100 : 0;

      // Calculate daily change
      const previousDayBalance = userData.previousDayBalance || 0;
      const dailyChange = previousDayBalance > 0 
        ? ((totalValue - previousDayBalance) / previousDayBalance) * 100 
        : 0;

      return {
        assets,
        totalValue,
        usdtBalance,
        dailyChange,
        profitLoss: totalProfitLoss,
        profitLossPercent,
        isLoading: false,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error calculating portfolio:', error);
      return {
        assets: [],
        totalValue: 0,
        usdtBalance: 0,
        dailyChange: 0,
        profitLoss: 0,
        profitLossPercent: 0,
        isLoading: false,
        lastUpdated: new Date()
      };
    }
  };

  const refreshPortfolio = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const newPortfolio = await calculatePortfolio(currentUser);
      setPortfolio(newPortfolio);
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user.uid);
        setIsLoading(true);
        
        try {
          const portfolioData = await calculatePortfolio(user.uid);
          setPortfolio(portfolioData);
        } catch (error) {
          console.error('Error preloading portfolio:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentUser(null);
        setPortfolio(null);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Periodic refresh every 30 seconds
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      refreshPortfolio();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <PreloadContext.Provider value={{ portfolio, isLoading, refreshPortfolio }}>
      {children}
    </PreloadContext.Provider>
  );
};

export const usePreload = () => {
  const context = useContext(PreloadContext);
  if (!context) {
    throw new Error('usePreload must be used within a PreloadProvider');
  }
  return context;
};
