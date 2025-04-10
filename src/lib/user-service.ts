
import { db, auth } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

class UserService {
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

export const userService = new UserService();
