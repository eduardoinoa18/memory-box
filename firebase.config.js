// Firebase Configuration for Memory Box Platform
// Production-ready setup with all services and environment variables
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Firebase config from environment variables with production defaults
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyC8P9v7K2r5HlQx9M3nB4wQ6sR7dJ2uE5f",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "memory-box-app-2025.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "memory-box-app-2025",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "memory-box-app-2025.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcd1234efgh5678",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCD123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Development emulator setup (uncomment for local development)
/*
if (__DEV__) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, "localhost", 9199);
  connectFunctionsEmulator(functions, "localhost", 5001);
}
*/

// Firestore Collections
export const COLLECTIONS = {
  users: 'users',
  folders: 'folders', 
  memories: 'memories',
  digitalLetters: 'digitalLetters',
  giftCards: 'giftCards',
  subscriptions: 'subscriptions',
  notifications: 'notifications',
  analytics: 'analytics',
  reviews: 'reviews',
  supportTickets: 'supportTickets'
};

// Storage buckets
export const STORAGE_BUCKETS = {
  memories: 'memories/',
  letters: 'letters/',
  documents: 'documents/',
  scans3d: '3d-scans/',
  avatars: 'avatars/',
  assets: 'assets/'
};

export default app;
