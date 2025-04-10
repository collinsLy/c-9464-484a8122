import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
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

  async getUserBalance(userId: string): Promise<number> {
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

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { balance: newBalance });
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }

  getCurrentUserId(): string | null {
    return auth.currentUser?.uid || localStorage.getItem('userId');
  }
}

//Keeping the export for backward compatibility, but encourage use of static methods.
export const userService = new UserService();