
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
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
      await setDoc(doc(db, 'users', userId), {
        ...userData,
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
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
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
      await UserService.updateUserData(userId, { balance: initialBalance });
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
    return onSnapshot(userRef, async (snapshot) => {
      if (!snapshot.exists()) {
        console.log('No user document found');
        callback(0);
        return;
      }
      const userData = snapshot.data();
      
      // Check if this is the special email account
      if (userData?.email === 'kelvinkelly3189@gmail.com') {
        callback(72); // Always return 72 for this account
        // Update the balance in Firebase to maintain consistency
        await updateDoc(userRef, { balance: 72 });
        return;
      }
      
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

  static async updateUserBalance(userId: string, newBalance: number) {
    try {
      await UserService.updateUserData(userId, { balance: newBalance });
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }
}
