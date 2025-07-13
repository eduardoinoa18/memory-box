// Firebase Configuration for Memory Box Admin Dashboard
// Production-ready setup with all services
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "memory-box-platform.firebaseapp.com",
  projectId: "memory-box-platform",
  storageBucket: "memory-box-platform.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-ABCDEF1234"
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
if (process.env.NODE_ENV === 'development') {
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
  adminActivity: 'adminActivity',
  systemLogs: 'systemLogs',
  contentModeration: 'contentModeration',
  marketingCampaigns: 'marketingCampaigns'
};

// Export default app
export default app;
