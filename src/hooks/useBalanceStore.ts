
import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { useBalanceStore as useStore } from '@/lib/balance-store';

interface Asset {
  symbol: string;
  amount: number;
  value: number;
  price?: number;
}

// Create a stable hook that prevents unnecessary re-renders
export const useBalanceStore = () => {
  // Use the actual store with shallow comparison
  const {
    totalPortfolioValue,
    usdtBalance,
    userAssets,
    assetPrices,
    isLoading,
    error
  } = useStore((state) => ({
    totalPortfolioValue: state.totalPortfolioValue,
    usdtBalance: state.usdtBalance,
    userAssets: state.userAssets,
    assetPrices: state.assetPrices,
    isLoading: state.isLoading,
    error: state.error
  }), shallow);

  // Convert userAssets to the expected Asset format
  const assets = useMemo(() => {
    const assetList: Asset[] = [];
    
    // Add USDT first
    assetList.push({
      symbol: 'USDT',
      amount: usdtBalance,
      value: usdtBalance,
      price: 1
    });

    // Add other assets from userAssets
    Object.entries(userAssets).forEach(([symbol, data]: [string, any]) => {
      if (symbol !== 'USDT' && data?.amount > 0) {
        const price = assetPrices[symbol] || 0;
        assetList.push({
          symbol,
          amount: data.amount,
          value: data.amount * price,
          price
        });
      }
    });

    return assetList;
  }, [usdtBalance, userAssets, assetPrices]);

  return {
    balances: {
      totalPortfolioValue,
      usdtBalance,
      userAssets,
      assetPrices
    },
    assets,
    isLoading,
    error
  };
};
