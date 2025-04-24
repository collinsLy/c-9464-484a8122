
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

  static getCurrentUserId(): string | null {
    return auth.currentUser?.uid || localStorage.getItem('userId');
  }
}

export const userService = new UserService();



  static async transferFunds(senderUid: string, recipientUid: string, amount: number): Promise<void> {
    try {
      // Input validation
      if (senderUid === recipientUid) {
        throw new Error('Cannot transfer funds to yourself');
      }
      if (amount <= 0) {
        throw new Error('Transfer amount must be positive');
      }

      const senderRef = doc(db, 'users', senderUid);
      const recipientRef = doc(db, 'users', recipientUid);

      await db.runTransaction(async (transaction) => {
        const senderDoc = await transaction.get(senderRef);
        const recipientDoc = await transaction.get(recipientRef);

        if (!senderDoc.exists() || !recipientDoc.exists()) {
          throw new Error('Sender or recipient not found');
        }

        const senderBalance = senderDoc.data().balance || 0;
        if (senderBalance < amount) {
          throw new Error('Insufficient funds');
        }

        const recipientBalance = recipientDoc.data().balance || 0;
        
        // Update balances
        transaction.update(senderRef, { 
          balance: senderBalance - amount,
          updatedAt: new Date().toISOString()
        });
        
        transaction.update(recipientRef, { 
          balance: recipientBalance + amount,
          updatedAt: new Date().toISOString()
        });

        // Create transaction record
        const transactionData = {
          type: 'Transfer',
          senderUid,
          recipientUid, 
          amount,
          status: 'Completed',
          timestamp: new Date().toISOString(),
          txId: `TX${Date.now()}`
        };

        // Add to both users' transaction history
        transaction.update(senderRef, {
          transactions: arrayUnion(transactionData)
        });
        transaction.update(recipientRef, {
          transactions: arrayUnion(transactionData)
        });
      });

    } catch (error) {
      console.error('Error transferring funds:', error);
      throw error;
    }
  }
