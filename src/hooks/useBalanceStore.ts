
import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';

// Assuming you have a balance store - adjust the import path as needed
// import { useBalanceStore as useStore } from '@/stores/balanceStore';

interface Asset {
  symbol: string;
  amount: number;
  value: number;
  // Add other asset properties as needed
}

interface BalanceState {
  assets: Asset[];
  isLoading: boolean;
  // Add other balance state properties
}

// Create a stable hook that prevents unnecessary re-renders
export const useBalanceStore = () => {
  // Replace this with your actual store hook
  // const balances = useStore((state) => state.balances, shallow);
  
  // For now, using a mock - replace with your actual store
  const balances = {
    assets: [
      { symbol: 'USDT', amount: 1000, value: 1000 },
      { symbol: 'USDC', amount: 500, value: 500 },
      { symbol: 'DOGE', amount: 1000, value: 80 }
    ],
    isLoading: false
  };

  // Memoize assets to prevent unnecessary re-renders
  const assets = useMemo(() => balances?.assets || [], [balances]);

  return {
    balances,
    assets,
    isLoading: balances?.isLoading || false
  };
};
