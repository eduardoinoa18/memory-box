// Firebase Authentication Service
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, firebaseHelpers } from '../config/firebase';

export const authService = {
    // Sign in with email and password
    signIn: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get user profile from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || userData?.name || 'User',
                photoURL: user.photoURL || userData?.avatar,
                plan: userData?.plan || 'free',
                ...userData
            };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Register new user
    signUp: async (email, password, firstName, lastName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const displayName = `${firstName} ${lastName}`;

            // Update auth profile
            await updateProfile(user, {
                displayName: displayName
            });

            // Create user document in Firestore
            const userData = {
                uid: user.uid,
                email: user.email,
                name: displayName,
                firstName,
                lastName,
                plan: 'free',
                status: 'active',
                joinDate: firebaseHelpers.timestamp(),
                lastActive: firebaseHelpers.timestamp(),
                profile: {
                    avatar: null,
                    preferences: {
                        notifications: true,
                        autoBackup: true,
                        shareDefault: 'private'
                    }
                },
                usage: {
                    storageUsed: 0,
                    foldersUsed: 0,
                    filesUploaded: 0,
                    sharesCreated: 0
                },
                subscription: {
                    startDate: firebaseHelpers.timestamp(),
                    renewDate: null,
                    autoRenew: false
                }
            };

            await setDoc(doc(db, 'users', user.uid), userData);

            return {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                plan: 'free',
                ...userData
            };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Sign out
    signOut: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Listen to auth state changes
    onAuthStateChanged: (callback) => {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Get user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const userData = userDoc.exists() ? userDoc.data() : null;

                // Update last active
                if (userData) {
                    await updateDoc(doc(db, 'users', user.uid), {
                        lastActive: firebaseHelpers.timestamp()
                    });
                }

                callback({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || userData?.name || 'User',
                    photoURL: user.photoURL || userData?.avatar,
                    plan: userData?.plan || 'free',
                    ...userData
                });
            } else {
                callback(null);
            }
        });
    },

    // Get current user data
    getCurrentUser: async () => {
        const user = auth.currentUser;
        if (!user) return null;

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || userData?.name || 'User',
                photoURL: user.photoURL || userData?.avatar,
                plan: userData?.plan || 'free',
                ...userData
            };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Update user profile
    updateUserProfile: async (userId, updates) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                ...updates,
                lastModified: firebaseHelpers.timestamp()
            });
            return true;
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    }
};

export default authService;
