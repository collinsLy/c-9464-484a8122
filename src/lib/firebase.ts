
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAHSlKslQx4lRQEZX-QcfCGr5pO7qG-yWI",
  authDomain: "vertev-tradings.firebaseapp.com",
  projectId: "vertev-tradings",
  storageBucket: "vertev-tradings.firebasestorage.app",
  messagingSenderId: "47392604150",
  appId: "1:47392604150:web:1405bfcdac7efad4e411d7",
  measurementId: "G-TLR3LCX09J"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
