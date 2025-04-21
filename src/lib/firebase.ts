import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB5vwzOrdvqfIEOlBpYOfJR71xPVapIUQs",
  authDomain: "vertex-trading-app.firebaseapp.com",
  projectId: "vertex-trading-app",
  storageBucket: "vertex-trading-app.appspot.com",
  messagingSenderId: "329510122666",
  appId: "1:329510122666:web:2825eae9be14abe0adc5f8",
  measurementId: "G-ZQXHFW9TGW"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, db, storage, googleProvider };