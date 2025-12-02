// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyFlvsrmI-q8mtu7KuJ12Yya45PtkWL-0",
  authDomain: "chatroom-portojul-2025.firebaseapp.com",
  projectId: "chatroom-portojul-2025",
  storageBucket: "chatroom-portojul-2025.firebasestorage.app",
  messagingSenderId: "213955529798",
  appId: "1:213955529798:web:07d2b1a425ac23de1f0e47",
  measurementId: "G-8KE6PJLR6N"
};

// Init Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// Firestore
export const db = getFirestore(app);
