
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

export const handleSignOut = async () => {
  try {
    await signOut(auth);
    window.location.href = '/';
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
