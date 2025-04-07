
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
        callback(doc.data().balance);
      }
    });
  }
}
