
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth } from './firebase';
import { db } from './firebase';

export class UserBalanceService {
  static async createUserBalance(userId: string, initialBalance: number = 0) {
    try {
      await setDoc(doc(db, 'users', userId), {
        balance: initialBalance,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating user balance:', error);
      throw error;
    }
  }

  static subscribeToBalance(userId: string, callback: (balance: number) => void) {
    if (!userId) return () => {};
    
    const userRef = doc(db, 'users', userId);
    console.log('Setting up balance subscription for user:', userId);
    
    try {
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          console.log('Received user data:', data);
          // Handle different types of balance values
          const balance = typeof data.balance === 'number' ? 
            data.balance : 
            parseFloat(data.balance?.toString() || '0');
          console.log('Parsed balance:', balance);
          callback(balance);
        } else {
          console.log('User document does not exist, creating with initial balance');
          this.createUserBalance(userId, 0);
          callback(0);
        }
      }, (error) => {
        console.error('Error in balance subscription:', error);
        callback(0);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to set up balance subscription:', error);
      callback(0);
      return () => {};
    }
  }

  static async getUserBalance(userId: string): Promise<number> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().balance : 0;
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  static async updateUserBalance(userId: string, newBalance: number) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        balance: newBalance,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }

  static subscribeToBalanceUpdates(userId: string, callback: (balance: number) => void) {
    const docRef = doc(db, 'users', userId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const balance = typeof data.balance === 'number' ? data.balance : parseFloat(data.balance) || 0;
        console.log('Firebase data update:', data); // Debug log
        callback(balance);
      } else {
        console.log('No document exists for user:', userId);
        callback(0);
      }
    }, (error) => {
      console.error('Firebase subscription error:', error);
      callback(0);
    });
  }
}
