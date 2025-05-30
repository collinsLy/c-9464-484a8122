
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export async function setUserBalance(email: string, balance: number) {
  try {
    // Query users collection to find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No user found with email: ${email}`);
      return false;
    }
    
    // Update the user's balance
    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'users', userDoc.id);
    
    await updateDoc(userRef, {
      balance: balance,
      initialBalance: balance, // Also set initial balance to prevent P/L calculations
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Successfully updated balance for ${email} to $${balance}`);
    return true;
    
  } catch (error) {
    console.error('Error updating user balance:', error);
    return false;
  }
}

// Function to set the specific user's balance to $72
export async function setKelvinBalance() {
  return await setUserBalance('kelvinkelly3189@gmail.com', 72);
}
