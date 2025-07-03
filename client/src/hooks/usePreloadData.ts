import { usePreload } from '@/contexts/PreloadContext';
import { useEffect, useState } from 'react';

interface UsePreloadDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const usePreloadData = (options: UsePreloadDataOptions = {}) => {
  const { preloadedData, isLoading, refreshData, getCachedPrice } = usePreload();
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  return {
    userBalance: preloadedData?.userBalance || 0,
    userProfile: preloadedData?.userProfile,
    prices: preloadedData?.prices || new Map(),
    marketData: preloadedData?.marketData,
    isLoading,
    lastUpdated: preloadedData?.lastUpdated,
    refreshData,
    getCachedPrice,
    isStale: preloadedData ? (Date.now() - preloadedData.lastUpdated.getTime()) > 30000 : true
  };
};

// Hook specifically for balance with real-time updates
export const usePreloadedBalance = () => {
  const { userBalance, isLoading, refreshData } = usePreloadData();
  const [displayBalance, setDisplayBalance] = useState(userBalance);

  useEffect(() => {
    setDisplayBalance(userBalance);
  }, [userBalance]);

  return {
    balance: displayBalance,
    isLoading,
    refreshBalance: refreshData
  };
};

// Hook specifically for cached prices
export const usePreloadedPrices = (symbols: string[]) => {
  const { prices, getCachedPrice, isLoading } = usePreloadData();
  const [priceData, setPriceData] = useState<{ [symbol: string]: number }>({});

  useEffect(() => {
    const newPriceData: { [symbol: string]: number } = {};
    symbols.forEach(symbol => {
      const cachedPrice = getCachedPrice(symbol);
      if (cachedPrice !== null) {
        newPriceData[symbol] = cachedPrice;
      } else if (prices.has(symbol)) {
        newPriceData[symbol] = prices.get(symbol)!;
      }
    });
    setPriceData(newPriceData);
  }, [symbols, prices, getCachedPrice]);

  return {
    prices: priceData,
    isLoading,
    getPrice: (symbol: string) => priceData[symbol] || 0
  };
};