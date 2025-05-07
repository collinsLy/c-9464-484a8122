
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { UserService } from './user-service';

export interface Trader {
  id: string;
  name: string;
  username: string;
  avatar: string;
  roi: number;
  followers: number;
  trades: number;
  winRate: number;
  description: string;
  verified: boolean;
  fee: number;
  assets: string[];
  following?: boolean;
}

export class TraderService {
  static async getTopTraders(): Promise<Trader[]> {
    try {
      const tradersRef = collection(db, 'traders');
      const snapshot = await getDocs(tradersRef);
      
      const traders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trader[];
      
      // Get current user followed traders
      const currentUserId = UserService.getCurrentUserId();
      if (currentUserId) {
        const userDoc = await getDoc(doc(db, 'users', currentUserId));
        const userData = userDoc.data();
        const followedTraders = userData?.followedTraders || [];
        
        // Mark traders that are being followed by the current user
        return traders.map(trader => ({
          ...trader,
          following: followedTraders.includes(trader.id)
        }));
      }
      
      return traders;
    } catch (error) {
      console.error('Error fetching traders:', error);
      return [];
    }
  }
  
  static async followTrader(traderId: string): Promise<boolean> {
    try {
      const userId = UserService.getCurrentUserId();
      if (!userId) return false;
      
      // Update user's followed traders
      await updateDoc(doc(db, 'users', userId), {
        followedTraders: arrayUnion(traderId)
      });
      
      // Update trader's follower count
      const traderRef = doc(db, 'traders', traderId);
      const traderDoc = await getDoc(traderRef);
      const currentFollowers = traderDoc.data()?.followers || 0;
      
      await updateDoc(traderRef, {
        followers: currentFollowers + 1
      });
      
      return true;
    } catch (error) {
      console.error('Error following trader:', error);
      return false;
    }
  }
  
  static async unfollowTrader(traderId: string): Promise<boolean> {
    try {
      const userId = UserService.getCurrentUserId();
      if (!userId) return false;
      
      // Update user's followed traders
      await updateDoc(doc(db, 'users', userId), {
        followedTraders: arrayRemove(traderId)
      });
      
      // Update trader's follower count
      const traderRef = doc(db, 'traders', traderId);
      const traderDoc = await getDoc(traderRef);
      const currentFollowers = traderDoc.data()?.followers || 0;
      
      if (currentFollowers > 0) {
        await updateDoc(traderRef, {
          followers: currentFollowers - 1
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error unfollowing trader:', error);
      return false;
    }
  }
  
  static async getUserStats(): Promise<{
    followingCount: number;
    profitFromCopying: number;
    bestPerformer: string;
    totalCopiedTrades: number;
  }> {
    try {
      const userId = UserService.getCurrentUserId();
      if (!userId) {
        return {
          followingCount: 0,
          profitFromCopying: 0,
          bestPerformer: '',
          totalCopiedTrades: 0
        };
      }
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (!userData) {
        return {
          followingCount: 0,
          profitFromCopying: 0,
          bestPerformer: '',
          totalCopiedTrades: 0
        };
      }
      
      const followedTraders = userData.followedTraders || [];
      const tradingStats = userData.tradingStats || {
        profitFromCopying: 0,
        bestPerformer: '',
        totalCopiedTrades: 0
      };
      
      return {
        followingCount: followedTraders.length,
        profitFromCopying: tradingStats.profitFromCopying || 0,
        bestPerformer: tradingStats.bestPerformer || '',
        totalCopiedTrades: tradingStats.totalCopiedTrades || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        followingCount: 0,
        profitFromCopying: 0,
        bestPerformer: '',
        totalCopiedTrades: 0
      };
    }
  }
}
