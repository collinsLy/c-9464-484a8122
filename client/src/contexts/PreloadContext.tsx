
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { userService } from '../lib/user-service';

interface PriceData {
  [symbol: string]: number;
}

interface UserAssets {
  [symbol: string]: {
    amount: number;
    usdValue: number;
  };
}

interface PreloadContextType {
  isLoading: boolean;
  userAssets: UserAssets;
  prices: PriceData;
  portfolioTotal: number;
  balance: number;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
}

const PreloadContext = createContext<PreloadContextType | undefined>(undefined);

export const PreloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);
  const [userAssets, setUserAssets] = useState<UserAssets>({});
  const [prices, setPrices] = useState<PriceData>({});
  const [portfolioTotal, setPortfolioTotal] = useState(0);
  const [balance, setBalance] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch all crypto prices in parallel
  const fetchAllPrices = useCallback(async (): Promise<PriceData> => {
    try {
      const symbols = [
        'BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT', 'DOTUSDT',
        'LINKUSDT', 'LTCUSDT', 'BCHUSDT', 'XLMUSDT', 'VETUSDT', 'FILUSDT',
        'TRXUSDT', 'ETCUSDT', 'XMRUSDT', 'EOSUSDT', 'AAVEUSDT', 'MKRUSDT',
        'COMPUSDT', 'YFIUSDT', 'SUSHIUSDT', 'SNXUSDT', 'UNIUSDT', 'CRVUSDT',
        'BALUSDT', 'RENUSDT', 'KNCUSDT', 'BANDUSDT', 'STORJUSDT', 'MANAUSDT',
        'INJUSDT', 'WLDUSDT', 'OPUSDT', 'ARBUSDT', 'AVAXUSDT', 'MATICUSDT'
      ];

      const response = await fetch('/api/v3/ticker/price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();
      const priceMap: PriceData = {};
      
      data.forEach((item: any) => {
        const symbol = item.symbol.replace('USDT', '');
        priceMap[symbol] = parseFloat(item.price);
      });

      return priceMap;
    } catch (error) {
      console.error('Error fetching prices:', error);
      // Return cached prices from localStorage if available
      const cachedPrices = localStorage.getItem('vertex_cached_prices');
      if (cachedPrices) {
        return JSON.parse(cachedPrices);
      }
      return {};
    }
  }, []);

  // Fetch user assets and balance
  const fetchUserData = useCallback(async (uid: string) => {
    try {
      const [userAssetsData, userBalance] = await Promise.all([
        userService.getUserAssets(uid),
        userService.getUserBalance(uid)
      ]);

      return {
        assets: userAssetsData || {},
        balance: userBalance || 0
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        assets: {},
        balance: 0
      };
    }
  }, []);

  // Compute portfolio value
  const computePortfolioValue = useCallback((assets: UserAssets, priceData: PriceData, userBalance: number): number => {
    let total = userBalance; // Start with USDT balance

    Object.entries(assets).forEach(([symbol, asset]) => {
      if (symbol === 'USDT') {
        total += asset.amount;
      } else {
        const price = priceData[symbol] || 0;
        total += asset.amount * price;
      }
    });

    return total;
  }, []);

  // Main data fetching function
  const fetchInitialData = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    console.log('Starting parallel data fetch for user:', user.uid);

    try {
      // Fetch prices and user data in parallel
      const [priceData, userData] = await Promise.all([
        fetchAllPrices(),
        fetchUserData(user.uid)
      ]);

      // Cache prices in localStorage
      localStorage.setItem('vertex_cached_prices', JSON.stringify(priceData));
      localStorage.setItem('vertex_prices_timestamp', Date.now().toString());

      // Update state
      setPrices(priceData);
      setUserAssets(userData.assets);
      setBalance(userData.balance);

      // Compute portfolio total
      const total = computePortfolioValue(userData.assets, priceData, userData.balance);
      setPortfolioTotal(total);

      setLastUpdated(new Date());
      console.log('Data preload complete. Portfolio total:', total);
    } catch (error) {
      console.error('Error during initial data fetch:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, fetchAllPrices, fetchUserData, computePortfolioValue]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  // Load cached data on mount
  useEffect(() => {
    const cachedPrices = localStorage.getItem('vertex_cached_prices');
    const cachedTimestamp = localStorage.getItem('vertex_prices_timestamp');
    
    if (cachedPrices && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp);
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      if (timestamp > fiveMinutesAgo) {
        setPrices(JSON.parse(cachedPrices));
        console.log('Loaded cached prices');
      }
    }
  }, []);

  // Fetch data when user logs in
  useEffect(() => {
    if (user?.uid) {
      fetchInitialData();
    } else {
      setIsLoading(false);
      setUserAssets({});
      setPrices({});
      setPortfolioTotal(0);
      setBalance(0);
      setLastUpdated(null);
    }
  }, [user?.uid, fetchInitialData]);

  // Refresh prices every 2 minutes
  useEffect(() => {
    if (!user?.uid) return;

    const interval = setInterval(async () => {
      try {
        const newPrices = await fetchAllPrices();
        setPrices(newPrices);
        
        // Recalculate portfolio total with new prices
        const total = computePortfolioValue(userAssets, newPrices, balance);
        setPortfolioTotal(total);
        
        localStorage.setItem('vertex_cached_prices', JSON.stringify(newPrices));
        localStorage.setItem('vertex_prices_timestamp', Date.now().toString());
        
        console.log('Prices updated automatically');
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [user?.uid, fetchAllPrices, computePortfolioValue, userAssets, balance]);

  const value: PreloadContextType = {
    isLoading,
    userAssets,
    prices,
    portfolioTotal,
    balance,
    refreshData,
    lastUpdated
  };

  return (
    <PreloadContext.Provider value={value}>
      {children}
    </PreloadContext.Provider>
  );
};

export const usePreloadData = (): PreloadContextType => {
  const context = useContext(PreloadContext);
  if (context === undefined) {
    throw new Error('usePreloadData must be used within a PreloadProvider');
  }
  return context;
};
