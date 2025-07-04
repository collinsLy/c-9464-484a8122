import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs, increment } from 'firebase/firestore';
import { auth } from './firebase';
import { db } from './firebase';

export class UserService {
  static async createUser(userId: string, userData: {
    fullName: string,
    email: string,
    balance: number,
    phone?: string,
    profilePhoto?: string
  }) {
    try {
      // Import numerical UID service
      const { numericalUidService } = await import('./numerical-uid-service');
      
      // Generate numerical UID for the user
      const numericalUid = await numericalUidService.createNumericalUidMapping(userId);
      
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        numericalUid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tradingHistory: [],
        activeStrategies: [],
        settings: {
          notifications: true,
          demoMode: false,
          theme: 'dark'
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUserData(userId: string) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  static async updateUserData(userId: string, data: Partial<any>) {
    try {
      // Handle profile photo deletion if a new one is being set
      if (data.profilePhoto) {
        const userData = await this.getUserData(userId);
        const oldProfilePhoto = userData?.profilePhoto;
        
        // If there's an existing profile photo and it's stored in Supabase
        if (oldProfilePhoto && oldProfilePhoto.includes('supabase')) {
          try {
            const { deleteProfileImage } = await import('./supabase');
            await deleteProfileImage(oldProfilePhoto);
          } catch (error) {
            console.error('Error deleting old profile photo:', error);
            // Continue with update even if delete fails
          }
        }
        
        console.log('Updating profile photo to:', data.profilePhoto);
      }
      
      const docRef = doc(db, 'users', userId);
      
      // Add logging to debug the update
      console.log('Updating user document:', userId, 'with data:', data);
      
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      console.log('User data updated successfully');
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  static subscribeToUserData(userId: string, callback: (data: any) => void) {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  }
}

export class UserBalanceService {
  static async createUserBalance(userId: string, initialBalance: number = 0) {
    try {
      await UserService.updateUserData(userId, { 
        balance: initialBalance,
        initialBalance: initialBalance,
        totalProfitLoss: 0,
        trades: {
          totalWins: 0,
          totalLosses: 0,
          winAmount: 0,
          lossAmount: 0
        }
      });
    } catch (error) {
      console.error('Error creating user balance:', error);
      throw error;
    }
  }

  static async updateTradeStats(userId: string, isWin: boolean, amount: number, profitLoss: number) {
    try {
      const userData = await UserService.getUserData(userId);
      const trades = userData?.trades || {
        totalWins: 0,
        totalLosses: 0,
        winAmount: 0,
        lossAmount: 0
      };

      if (isWin) {
        trades.totalWins++;
        trades.winAmount += profitLoss;
      } else {
        trades.totalLosses++;
        trades.lossAmount += amount;
      }

      const totalProfitLoss = trades.winAmount - trades.lossAmount;

      await UserService.updateUserData(userId, { 
        trades,
        totalProfitLoss
      });
    } catch (error) {
      console.error('Error updating trade stats:', error);
      throw error;
    }
  }

  static subscribeToBalance(userId: string, callback: (balance: number) => void) {
    if (!userId) {
      console.error('No userId provided for balance subscription');
      return () => {};
    }

    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, async (snapshot) => {
      if (!snapshot.exists()) {
        console.log('No user document found');
        callback(0);
        return;
      }
      const userData = snapshot.data();
      const balance = userData?.balance ?? 0;
      console.log('Firebase balance update:', balance);
      callback(typeof balance === 'number' ? balance : parseFloat(String(balance)) || 0);
    }, (error) => {
      console.error('Balance subscription error:', error);
      callback(0);
    });
  }

  static async getUserBalance(userId: string): Promise<number> {
    try {
      const userData = await UserService.getUserData(userId);
      return userData?.balance ?? 0;
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  // Get total portfolio balance including all assets converted to USDT
  static async getTotalPortfolioBalance(userId: string): Promise<number> {
    try {
      const userData = await UserService.getUserData(userId);
      if (!userData) return 0;

      // Get current asset prices
      const assets = userData.assets || {};
      const assetSymbols = Object.keys(assets).filter(symbol => symbol !== 'USDT');
      
      let totalValue = 0;
      
      // Add USDT balance from main balance field
      const usdtBalance = userData.balance || 0;
      totalValue += usdtBalance;
      
      // Add USDT from assets if exists
      if (assets.USDT?.amount) {
        totalValue += Number(assets.USDT.amount);
      }

      // If no other assets, return USDT balance
      if (assetSymbols.length === 0) {
        return totalValue;
      }

      // Fetch current prices for non-USDT assets
      const symbolsQuery = assetSymbols.map(s => `${s}USDT`);
      const response = await fetch(`/api/v3/ticker/price?symbols=${JSON.stringify(symbolsQuery)}`);
      const priceData = await response.json();
      
      const prices: Record<string, number> = { USDT: 1 };
      priceData.forEach((item: { symbol: string; price: string }) => {
        const symbol = item.symbol.replace('USDT', '');
        prices[symbol] = parseFloat(item.price);
      });

      // Calculate value of other assets
      Object.entries(assets).forEach(([symbol, data]) => {
        if (symbol === 'USDT') return; // Already included above
        const amount = (data as any).amount || 0;
        const price = prices[symbol] || 0;
        const valueInUsdt = amount * price;
        totalValue += valueInUsdt;
      });

      console.log(`Total portfolio balance for trading: $${totalValue.toFixed(2)}`);
      return totalValue;
    } catch (error) {
      console.error('Error getting total portfolio balance:', error);
      // Fallback to regular balance if portfolio calculation fails
      return this.getUserBalance(userId);
    }
  }

  static subscribeToPortfolioBalance(userId: string, callback: (balance: number) => void) {
    if (!userId) {
      console.error('No userId provided for portfolio balance subscription');
      return () => {};
    }

    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, async (snapshot) => {
      if (!snapshot.exists()) {
        console.log('No user document found for portfolio balance');
        callback(0);
        return;
      }
      
      try {
        const totalBalance = await this.getTotalPortfolioBalance(userId);
        callback(totalBalance);
      } catch (error) {
        console.error('Error calculating portfolio balance:', error);
        const userData = snapshot.data();
        const fallbackBalance = userData?.balance ?? 0;
        callback(typeof fallbackBalance === 'number' ? fallbackBalance : parseFloat(String(fallbackBalance)) || 0);
      }
    }, (error) => {
      console.error('Portfolio balance subscription error:', error);
      callback(0);
    });
  }

  static async updateUserBalance(userId: string, newBalance: number) {
    try {
      await UserService.updateUserData(userId, { balance: newBalance });
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }

  static subscribeToTradeStats(userId: string, callback: (stats: any) => void) {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data()?.trades); 
      } else {
        callback(null);
      }
    });
  }

  static async calculatePLPercentage(userId: string): Promise<number> {
    try {
      const userData = await UserService.getUserData(userId);
      if (!userData) return 0; // Handle case where user data is not found

      const initialBalance = userData.initialBalance || 0;
      const currentBalance = userData.balance || 0;

      if (initialBalance === 0) return 0; // Avoid division by zero

      return ((currentBalance - initialBalance) / initialBalance) * 100;
    } catch (error) {
      console.error('Error calculating P/L percentage:', error);
      throw error;
    }
  }
}