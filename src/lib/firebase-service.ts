
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
    if (!userId) {
      console.error('No userId provided for balance subscription');
      return () => {};
    }
    
    const userRef = doc(db, 'users', userId);
    
    return onSnapshot(userRef, {
      next: (snapshot) => {
        if (!snapshot.exists()) {
          console.log('Creating new user document');
          this.createUserBalance(userId, 0)
            .then(() => callback(0))
            .catch(err => console.error('Error creating user balance:', err));
          return;
        }

        const data = snapshot.data();
        const balance = data?.balance;
        
        if (balance === undefined) {
          console.warn('No balance field in document');
          callback(0);
          return;
        }

        const numericBalance = typeof balance === 'number' ? 
          balance : 
          parseFloat(String(balance)) || 0;
        
        console.log('Updated balance:', numericBalance);
        callback(numericBalance);
      },
      error: (error) => {
        console.error('Balance subscription error:', error);
        callback(0);
      }
    });
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
