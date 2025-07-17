// Firebase Configuration for Memory Box Admin Dashboard
// Optimized for Vercel deployment compatibility

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "memory-box-platform.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "memory-box-platform",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "memory-box-platform.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEF1234"
};

// Initialize Firebase (client-side only to avoid SSR issues)
let app = null;
let auth = null;
let db = null;
let storage = null;
let functions = null;
let analytics = null;

// Only initialize on client side
if (typeof window !== 'undefined') {
  try {
    const { initializeApp, getApps } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');
    const { getFunctions } = require('firebase/functions');
    const { getAnalytics } = require('firebase/analytics');

    // Prevent duplicate initialization
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

// Development emulator setup (uncomment for local development)
/*
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const { connectAuthEmulator } = require('firebase/auth');
  const { connectFirestoreEmulator } = require('firebase/firestore');
  const { connectStorageEmulator } = require('firebase/storage');
  const { connectFunctionsEmulator } = require('firebase/functions');
  
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

// Export services
export { auth, db, storage, functions, analytics };
export default app;
