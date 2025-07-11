
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
export const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
