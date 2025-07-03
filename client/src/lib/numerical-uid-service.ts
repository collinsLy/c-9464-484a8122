
import { doc, setDoc, getDoc, collection, query, where, getDocs, increment, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export class NumericalUidService {
  // Generate a numerical UID similar to Binance (9-digit number)
  static generateNumericalUid(): number {
    // Generate a number between 100000000 and 999999999 (9 digits)
    return Math.floor(100000000 + Math.random() * 900000000);
  }

  // Create numerical UID mapping for a user
  static async createNumericalUidMapping(firebaseUid: string): Promise<number> {
    try {
      // Check if user already has a numerical UID
      const existingMapping = await this.getNumericalUid(firebaseUid);
      if (existingMapping) {
        return existingMapping;
      }

      let numericalUid: number;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      // Generate unique numerical UID
      while (!isUnique && attempts < maxAttempts) {
        numericalUid = this.generateNumericalUid();
        
        // Check if this numerical UID already exists
        const existingUser = await this.getFirebaseUidFromNumerical(numericalUid);
        if (!existingUser) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique numerical UID after multiple attempts');
      }

      // Store the mapping
      await setDoc(doc(db, 'uid_mappings', firebaseUid), {
        firebaseUid,
        numericalUid: numericalUid!,
        createdAt: new Date().toISOString()
      });

      // Also store reverse mapping for faster lookups
      await setDoc(doc(db, 'numerical_uid_mappings', numericalUid!.toString()), {
        firebaseUid,
        numericalUid: numericalUid!,
        createdAt: new Date().toISOString()
      });

      return numericalUid!;
    } catch (error) {
      console.error('Error creating numerical UID mapping:', error);
      throw error;
    }
  }

  // Get numerical UID from Firebase UID
  static async getNumericalUid(firebaseUid: string): Promise<number | null> {
    try {
      const docRef = doc(db, 'uid_mappings', firebaseUid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().numericalUid;
      }
      return null;
    } catch (error) {
      console.error('Error getting numerical UID:', error);
      return null;
    }
  }

  // Get Firebase UID from numerical UID
  static async getFirebaseUidFromNumerical(numericalUid: number): Promise<string | null> {
    try {
      const docRef = doc(db, 'numerical_uid_mappings', numericalUid.toString());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().firebaseUid;
      }
      return null;
    } catch (error) {
      console.error('Error getting Firebase UID from numerical UID:', error);
      return null;
    }
  }

  // Validate if a numerical UID exists
  static async validateNumericalUid(numericalUid: number): Promise<boolean> {
    try {
      const firebaseUid = await this.getFirebaseUidFromNumerical(numericalUid);
      return firebaseUid !== null;
    } catch (error) {
      console.error('Error validating numerical UID:', error);
      return false;
    }
  }

  // Get user data by numerical UID
  static async getUserDataByNumericalUid(numericalUid: number): Promise<any | null> {
    try {
      const firebaseUid = await this.getFirebaseUidFromNumerical(numericalUid);
      if (!firebaseUid) return null;

      const userRef = doc(db, 'users', firebaseUid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return {
          ...userDoc.data(),
          firebaseUid,
          numericalUid
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user data by numerical UID:', error);
      return null;
    }
  }
}

export const numericalUidService = new NumericalUidService();
