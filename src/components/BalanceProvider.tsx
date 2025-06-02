
import { useEffect, ReactNode } from 'react';
import { useBalanceStore } from '@/lib/balance-store';
import { auth } from '@/lib/firebase';
import { UserService } from '@/lib/firebase-service';

interface BalanceProviderProps {
  children: ReactNode;
}

export const BalanceProvider = ({ children }: BalanceProviderProps) => {
  const { fetchBalances, updateAssetPrices } = useBalanceStore();

  useEffect(() => {
    const userId = auth.currentUser?.uid || localStorage.getItem('userId');
    if (!userId) return;

    // Preload balances immediately
    fetchBalances(userId);

    // Set up real-time listener for balance updates
    const unsubscribe = UserService.subscribeToUserData(userId, (userData) => {
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
      unsubscribe();
      clearInterval(priceInterval);
    };
  }, [fetchBalances, updateAssetPrices]);

  return <>{children}</>;
};
