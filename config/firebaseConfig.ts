// Firebase Configuration - TypeScript Version
// Production-ready setup for Memory Box Platform
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isExpo = typeof process.env.EXPO_PUBLIC_FIREBASE_API_KEY !== 'undefined';

// Firebase configuration with environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.warn('Missing Firebase configuration keys:', missingKeys);
  if (!isDevelopment) {
    throw new Error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
  }
}

// Initialize Firebase app
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

// Analytics (only in browser environment)
export const analytics: Analytics | null = 
  typeof window !== 'undefined' && firebaseConfig.measurementId 
    ? getAnalytics(app) 
    : null;

// Development emulators setup
if (isDevelopment && typeof window !== 'undefined') {
  // Only connect to emulators in development and browser environment
  const EMULATOR_CONFIG = {
    auth: { host: 'localhost', port: 9099 },
    firestore: { host: 'localhost', port: 8080 },
    storage: { host: 'localhost', port: 9199 },
    functions: { host: 'localhost', port: 5001 }
  };

  try {
    // Connect to Auth emulator
    if (!auth._delegate._config?.emulator) {
      connectAuthEmulator(auth, `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`, {
        disableWarnings: true
      });
    }

    // Connect to Firestore emulator
    if (!db._delegate._databaseId?.database?.includes('emulator')) {
      connectFirestoreEmulator(db, EMULATOR_CONFIG.firestore.host, EMULATOR_CONFIG.firestore.port);
    }

    // Connect to Storage emulator
    if (!storage._location?.host?.includes('emulator')) {
      connectStorageEmulator(storage, EMULATOR_CONFIG.storage.host, EMULATOR_CONFIG.storage.port);
    }

    // Connect to Functions emulator
    if (!functions._url?.includes('emulator')) {
      connectFunctionsEmulator(functions, EMULATOR_CONFIG.functions.host, EMULATOR_CONFIG.functions.port);
    }

    console.log('🔧 Connected to Firebase emulators for development');
  } catch (error) {
    console.warn('Failed to connect to Firebase emulators:', error);
  }
}

// Export configuration for debugging
export const firebaseConfigInfo = {
  projectId: firebaseConfig.projectId,
  environment: isDevelopment ? 'development' : 'production',
  platform: isExpo ? 'expo' : 'web',
  emulators: isDevelopment,
  analytics: !!analytics
};

// Log configuration (only in development)
if (isDevelopment) {
  console.log('🔥 Firebase configuration loaded:', firebaseConfigInfo);
}

export default app;
