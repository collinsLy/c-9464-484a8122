import { useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useBalanceStore } from '@/lib/balance-store';
import { auth } from '@/lib/firebase';
import { UserService } from '@/lib/firebase-service';

interface BalanceProviderProps {
  children: ReactNode;
}

export const BalanceProvider = ({ children }: BalanceProviderProps) => {
  const { fetchBalances, updateAssetPrices, clearBalances } = useBalanceStore();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    // Listen for authentication state changes
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is logged in - immediately preload all balances
        console.log('User authenticated, preloading balances...');
        await fetchBalances(user.uid);

        // Set up real-time listener for balance updates
        unsubscribe = UserService.subscribeToUserData(user.uid, (userData) => {
          if (!userData) return;

          // Update the store with real-time data
          const store = useBalanceStore.getState();

          // Process USDT balance
          let usdtBalance = 0;
          if (userData.assets?.USDT && userData.assets.USDT.amount > 0) {
            usdtBalance = Number(userData.assets.USDT.amount);
          } else if (typeof userData.balance === 'number') {
            usdtBalance = userData.balance;
          } else if (typeof userData.balance === 'string') {
            usdtBalance = parseFloat(userData.balance) || 0;
          }

          // Calculate total portfolio value with current prices
          let totalValue = usdtBalance;
          const userAssets = userData.assets || {};

          Object.entries(userAssets).forEach(([symbol, data]: [string, any]) => {
            if (symbol === 'USDT') return;
            const amount = data.amount || 0;
            const price = store.assetPrices[symbol] || 0;
            totalValue += amount * price;
          });

          // Update store
          useBalanceStore.setState({
            totalPortfolioValue: totalValue,
            usdtBalance,
            userAssets,
            lastUpdated: Date.now(),
          });
        });
      } else {
        // User logged out - check localStorage
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          console.log('User authenticated via localStorage, preloading balances...');
          await fetchBalances(storedUserId);
        } else {
          clearBalances();
        }
      }
    });

    // Also check for immediate userId in localStorage for faster initial load
    const immediateUserId = localStorage.getItem('userId');
    if (immediateUserId && !auth.currentUser) {
      console.log('Immediate balance preload for stored user...');
      fetchBalances(immediateUserId);
    }

    // Set up price updates every 30 seconds
    const priceInterval = setInterval(async () => {
      try {
        const baseAssets = ['BTC', 'ETH', 'USDC', 'BNB', 'DOGE', 'SOL', 'XRP', 'WLD', 'ADA', 'DOT', 'LINK', 'MATIC'];
        const symbolsQuery = baseAssets.map(s => `${s}USDT`);

        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
        const data = await response.json();

        const prices: Record<string, number> = { USDT: 1 };
        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          prices[symbol] = parseFloat(item.price);
        });

        updateAssetPrices(prices);
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    }, 30000);

    return () => {
      unsubscribeAuth();
      if (unsubscribe) unsubscribe();
      clearInterval(priceInterval);
    };
  }, [fetchBalances, updateAssetPrices, clearBalances]);

  return <>{children}</>;
};