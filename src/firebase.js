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

// Login with popup (default method)
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific error cases
    if (error.code === 'auth/popup-blocked') {
      return {
        success: false,
        error: 'Popup diblokir oleh browser. Silakan coba metode redirect atau izinkan popup.',
        code: error.code
      };
    } else if (error.code === 'auth/popup-closed-by-user') {
      return {
        success: false,
        error: 'Login dibatalkan. Silakan coba lagi.',
        code: error.code
      };
    } else if (error.code === 'auth/unauthorized-domain') {
      return {
        success: false,
        error: 'Domain tidak diauthorize. Hubungi administrator.',
        code: error.code
      };
    } else {
      return {
        success: false,
        error: `Login gagal: ${error.message}`,
        code: error.code
      };
    }
  }
};

// Login with redirect (fallback method if popup is blocked)
export const loginWithGoogleRedirect = async () => {
  try {
    const { signInWithRedirect } = await import('firebase/auth');
    await signInWithRedirect(auth, provider);
    return { success: true };
  } catch (error) {
    console.error("Redirect login error:", error);
    return {
      success: false,
      error: `Login gagal: ${error.message}`,
      code: error.code
    };
  }
};

export const logout = () => signOut(auth);

// Firestore
export const db = getFirestore(app);
