import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserService } from './user-service';

// Re-export UserService from user-service.ts
export { UserService };

// Additional Firebase services can be defined here
export class FirebaseService {
  // Add any additional Firebase-related services here

  static async updateDocument(collection: string, id: string, data: any) {
    try {
      const docRef = doc(db, collection, id);
      await updateDoc(docRef, data);
      return { success: true };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error };
    }
  }

  static subscribeToDocument(collection: string, id: string, callback: (data: any) => void) {
    const docRef = doc(db, collection, id);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        console.error(`Document ${collection}/${id} does not exist`);
      }
    });
  }
}