
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserService } from './firebase-service';

interface BalanceState {
  totalPortfolioValue: number;
  usdtBalance: number;
  userAssets: Record<string, any>;
  assetPrices: Record<string, number>;
  isLoading: boolean;
  lastUpdated: number;
  error: string | null;
}

interface BalanceStore extends BalanceState {
  // Actions
  fetchBalances: (userId: string) => Promise<void>;
  updateAssetPrices: (prices: Record<string, number>) => void;
  clearBalances: () => void;
  refreshBalances: (userId: string) => Promise<void>;
  // Getters
  getAssetBalance: (symbol: string) => number;
  getTotalPortfolioValue: () => number;
}

const initialState: BalanceState = {
  totalPortfolioValue: 0,
  usdtBalance: 0,
  userAssets: {},
  assetPrices: {},
  isLoading: false,
  lastUpdated: 0,
  error: null,
};

export const useBalanceStore = create<BalanceStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchBalances: async (userId: string) => {
        const state = get();
        const now = Date.now();
        
        // Skip if data is fresh (less than 30 seconds old) and not empty
        if (state.lastUpdated && (now - state.lastUpdated) < 30000 && !state.isLoading && state.totalPortfolioValue > 0) {
          console.log('Using cached balance data');
          return;
        }

        console.log('Fetching fresh balance data...');
        set({ isLoading: true, error: null });

        try {
          const userData = await UserService.getUserData(userId);
          if (!userData) {
            throw new Error('No user data found');
          }

          // Process USDT balance
          let usdtBalance = 0;
          if (userData.assets?.USDT && userData.assets.USDT.amount > 0) {
            usdtBalance = Number(userData.assets.USDT.amount);
          } else if (typeof userData.balance === 'number') {
            usdtBalance = userData.balance;
          } else if (typeof userData.balance === 'string') {
            usdtBalance = parseFloat(userData.balance) || 0;
          }

          // Process other assets
          const userAssets = userData.assets || {};
          
          // Fetch current asset prices
          const baseAssets = ['BTC', 'ETH', 'USDC', 'BNB', 'DOGE', 'SOL', 'XRP', 'WLD', 'ADA', 'DOT', 'LINK', 'MATIC'];
          const symbolsQuery = baseAssets.map(s => `${s}USDT`);
          
          let assetPrices: Record<string, number> = { USDT: 1 };
          
          try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
            const priceData = await response.json();
            
            priceData.forEach((item: any) => {
              const symbol = item.symbol.replace('USDT', '');
              assetPrices[symbol] = parseFloat(item.price);
            });
          } catch (priceError) {
            console.warn('Failed to fetch asset prices:', priceError);
          }

          // Calculate total portfolio value
          let totalValue = usdtBalance;
          Object.entries(userAssets).forEach(([symbol, data]: [string, any]) => {
            if (symbol === 'USDT') return;
            const amount = data.amount || 0;
            const price = assetPrices[symbol] || 0;
            totalValue += amount * price;
          });

          set({
            totalPortfolioValue: totalValue,
            usdtBalance,
            userAssets,
            assetPrices,
            isLoading: false,
            lastUpdated: now,
            error: null,
          });

        } catch (error) {
          console.error('Error fetching balances:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch balances',
          });
        }
      },

      updateAssetPrices: (prices: Record<string, number>) => {
        const state = get();
        const updatedPrices = { ...state.assetPrices, ...prices };
        
        // Recalculate total portfolio value with new prices
        let totalValue = state.usdtBalance;
        Object.entries(state.userAssets).forEach(([symbol, data]: [string, any]) => {
          if (symbol === 'USDT') return;
          const amount = data.amount || 0;
          const price = updatedPrices[symbol] || 0;
          totalValue += amount * price;
        });

        set({
          assetPrices: updatedPrices,
          totalPortfolioValue: totalValue,
          lastUpdated: Date.now(),
        });
      },

      refreshBalances: async (userId: string) => {
        set({ lastUpdated: 0 }); // Force refresh
        await get().fetchBalances(userId);
      },

      clearBalances: () => {
        set(initialState);
      },

      getAssetBalance: (symbol: string) => {
        const state = get();
        if (symbol === 'USDT') {
          return state.usdtBalance;
        }
        return state.userAssets[symbol]?.amount || 0;
      },

      getTotalPortfolioValue: () => {
        return get().totalPortfolioValue;
      },
    }),
    {
      name: 'balance-storage',
      partialize: (state) => ({
        totalPortfolioValue: state.totalPortfolioValue,
        usdtBalance: state.usdtBalance,
        userAssets: state.userAssets,
        assetPrices: state.assetPrices,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
