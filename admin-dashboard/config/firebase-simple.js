// Simplified Firebase Configuration for Vercel Deployment
// Using Firebase v10 with better SSR compatibility

// Firebase config with environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "memory-box-platform.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "memory-box-platform",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "memory-box-platform.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ABCDEF1234"
};

// Initialize Firebase app
let app;
let auth;
let db;
let storage;

try {
  // Only import and initialize Firebase on the client side
  if (typeof window !== 'undefined') {
    const { initializeApp, getApps } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');

    // Prevent duplicate initialization
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (error) {
  console.warn('Firebase initialization skipped (SSR):', error.message);
  // Create mock objects for server-side rendering
  app = null;
  auth = null;
  db = null;
  storage = null;
}

export { auth, db, storage };
export default app;
