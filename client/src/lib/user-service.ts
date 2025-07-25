
import { doc, onSnapshot, updateDoc, getDoc, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, auth } from './firebase';

export class UserService {
  static subscribeToUserData(uid: string, callback: (userData: any) => void) {
    const userRef = doc(db, 'users', uid);

    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        console.error('User document does not exist');
      }
    });

    return unsubscribe;
  }

  static async updateUserData(uid: string, data: any) {
    const userRef = doc(db, 'users', uid);
    return updateDoc(userRef, data);
  }

  static async getUserData(uid: string) {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  static async getUserBalance(userId: string): Promise<number> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data().balance || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      return 0;
    }
  }

  static async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { balance: newBalance });
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }
  
  static async transferFunds(senderId: string, recipientId: string | number, amount: number): Promise<void> {
    try {
      let recipientFirebaseUid: string;
      
      // If recipientId is a number, it's a numerical UID - convert to Firebase UID
      if (typeof recipientId === 'number') {
        const { NumericalUidService } = await import('./numerical-uid-service');
        const firebaseUid = await NumericalUidService.getFirebaseUidFromNumerical(recipientId);
        if (!firebaseUid) {
          throw new Error('Recipient not found with the provided numerical UID');
        }
        recipientFirebaseUid = firebaseUid;
      } else {
        recipientFirebaseUid = recipientId;
      }
      
      // Get references to both user documents
      const senderRef = doc(db, 'users', senderId);
      const recipientRef = doc(db, 'users', recipientFirebaseUid);
      
      // Use a transaction to ensure atomic updates
      await updateDoc(senderRef, {
        balance: increment(-amount)
      });
      
      await updateDoc(recipientRef, {
        balance: increment(amount)
      });
    } catch (error) {
      console.error('Error transferring funds:', error);
      throw error;
    }
  }

  static getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }
}

export const userService = new UserService();
