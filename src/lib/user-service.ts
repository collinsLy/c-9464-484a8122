
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
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

      // Using a transaction to ensure atomicity
      return db.runTransaction(async (transaction) => {
        // Get both user documents
        const senderDoc = await transaction.get(senderRef);
        const recipientDoc = await transaction.get(recipientRef);

        // Validate user existence
        if (!senderDoc.exists()) {
          throw new Error('Sender account not found');
        }
        if (!recipientDoc.exists()) {
          throw new Error('Recipient account not found');
        }

        // Get current balances
        const senderBalance = senderDoc.data()?.balance || 0;
        const recipientBalance = recipientDoc.data()?.balance || 0;

        // Validate sufficient balance
        if (senderBalance < amount) {
          throw new Error('Insufficient funds');
        }

        // Create transaction record
        const transactionData = {
          type: 'transfer',
          senderUid,
          recipientUid,
          amount,
          timestamp: new Date().toISOString(),
          status: 'completed',
          txId: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        // Update sender balance
        transaction.update(senderRef, {
          balance: senderBalance - amount,
          updatedAt: new Date().toISOString(),
          transactions: arrayUnion({
            ...transactionData,
            direction: 'outgoing'
          })
        });

        // Update recipient balance
        transaction.update(recipientRef, {
          balance: recipientBalance + amount,
          updatedAt: new Date().toISOString(),
          transactions: arrayUnion({
            ...transactionData,
            direction: 'incoming'
          })
        });
      });
    } catch (error) {
      console.error('Error transferring funds:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
