
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

export const UserService = {
  /**
   * Get user data from Firestore
   */
  getUserData: async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.error('No user document found for ID:', userId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },
  
  /**
   * Update user data in Firestore
   */
  updateUserData: async (userId: string, data: any) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, data);
      console.log('User data updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  },
  
  /**
   * Get user transactions
   */
  getUserTransactions: async (userId: string) => {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef, 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  },
  
  /**
   * Subscribe to user data changes
   */
  subscribeToUserData: (userId: string, callback: (data: any) => void) => {
    const userDocRef = doc(db, 'users', userId);
    return onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        console.error('No user document found for ID:', userId);
        callback({});
      }
    });
  },
  
  /**
   * Update user balance
   */
  updateUserBalance: async (userId: string, newBalance: number) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        balance: newBalance,
        lastUpdated: Timestamp.now()
      });
      
      // Add a transaction record
      const transactionRef = collection(db, 'transactions');
      await setDoc(doc(transactionRef), {
        userId,
        type: 'balance_update',
        amount: newBalance,
        timestamp: Timestamp.now(),
        status: 'completed'
      });
      
      return true;
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }
};

// Export UserBalanceService as an alias for backward compatibility
export const UserBalanceService = {
  updateUserBalance: UserService.updateUserBalance
};
