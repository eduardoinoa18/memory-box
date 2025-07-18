// Firebase configuration for Landing Page
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiT8sCnJDRDB7T9nMADLEWOkLp_8BeX1c",
  authDomain: "memory-box-app.firebaseapp.com",
  projectId: "memory-box-app",
  storageBucket: "memory-box-app.firebasestorage.app",
  messagingSenderId: "651578998049",
  appId: "1:651578998049:web:8117fafd7ab9ff45c31260",
  measurementId: "G-1G4P4X3KHV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
