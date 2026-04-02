import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAdB3Ma9BC4xFLNRqlE-by2iHskwapVJs",
  authDomain: "asian-import-export.firebaseapp.com",
  projectId: "asian-import-export",
  storageBucket: "asian-import-export.firebasestorage.app",
  messagingSenderId: "847248802363",
  appId: "1:847248802363:web:ea669f52e53530ab12521e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
};

export default app;
