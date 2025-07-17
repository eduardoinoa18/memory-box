// Firebase Configuration for Memory Box
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Production Firebase configuration fallback
const productionConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Validate required configuration
const requiredEnvVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required Firebase environment variables:', missingVars);
    console.error('Please create .env.local file with your Firebase configuration');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Production environment - connect to emulators only for explicit local development
if (__DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    // Uncomment these lines when using Firebase emulators for local development
    // try {
    //   connectAuthEmulator(auth, "http://localhost:9099");
    //   connectFirestoreEmulator(db, 'localhost', 8080);
    //   connectStorageEmulator(storage, "localhost", 9199);
    //   connectFunctionsEmulator(functions, "localhost", 5001);
    // } catch (error) {
    //   console.log("Firebase emulators already connected or not available");
    // }
}

export default app;

// Helper functions for common Firebase operations
export const firebaseHelpers = {
    // Timestamp helper
    timestamp: () => new Date().toISOString(),

    // Error handler
    handleError: (error) => {
        console.error('Firebase Error:', error);
        return {
            message: error.message || 'An error occurred',
            code: error.code || 'unknown'
        };
    },

    // Demo mode check
    isDemoMode: () => isDemoMode
};
