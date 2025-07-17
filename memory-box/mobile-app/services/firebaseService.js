// Firebase Configuration and Services
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration - use environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth Service
export const authService = {
  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return auth.onAuthStateChanged(callback);
  }
};

// Folders Service
export const foldersService = {
  // Create a new folder
  createFolder: async (userId, folderData) => {
    try {
      const docRef = await addDoc(collection(db, 'folders'), {
        ...folderData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user's folders
  getUserFolders: async (userId) => {
    try {
      const q = query(
        collection(db, 'folders'), 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const folders = [];
      querySnapshot.forEach((doc) => {
        folders.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, folders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update folder
  updateFolder: async (folderId, updates) => {
    try {
      const folderRef = doc(db, 'folders', folderId);
      await updateDoc(folderRef, {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete folder
  deleteFolder: async (folderId) => {
    try {
      await deleteDoc(doc(db, 'folders', folderId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Memories Service
export const memoriesService = {
  // Upload a memory (file + metadata)
  uploadMemory: async (userId, folderId, file, metadata) => {
    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `memories/${userId}/${folderId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Add memory document to Firestore
      const docRef = await addDoc(collection(db, 'memories'), {
        userId,
        folderId,
        url: downloadURL,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ...metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return { success: true, id: docRef.id, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get memories for a folder
  getFolderMemories: async (folderId) => {
    try {
      const q = query(
        collection(db, 'memories'),
        where('folderId', '==', folderId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const memories = [];
      querySnapshot.forEach((doc) => {
        memories.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, memories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete memory
  deleteMemory: async (memoryId, storageUrl) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'memories', memoryId));
      
      // Delete from Firebase Storage
      const fileRef = ref(storage, storageUrl);
      await deleteObject(fileRef);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Activities Service
export const activitiesService = {
  // Log an activity
  logActivity: async (userId, activityData) => {
    try {
      const docRef = await addDoc(collection(db, 'activities'), {
        userId,
        ...activityData,
        createdAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user activities
  getUserActivities: async (userId, limit = 20) => {
    try {
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      const querySnapshot = await getDocs(q);
      const activities = [];
      querySnapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, activities };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Local Storage Service (for offline data)
export const localStorageService = {
  // Save data locally
  saveData: async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Load data locally
  loadData: async (key, defaultValue = null) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return { 
        success: true, 
        data: data ? JSON.parse(data) : defaultValue 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove data locally
  removeData: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Clear all local data
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Settings Service
export const settingsService = {
  // Save user settings
  saveSettings: async (userId, settings) => {
    try {
      const docRef = doc(db, 'userSettings', userId);
      await updateDoc(docRef, {
        ...settings,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user settings
  getUserSettings: async (userId) => {
    try {
      const docRef = doc(db, 'userSettings', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, settings: docSnap.data() };
      } else {
        // Return default settings
        const defaultSettings = {
          notifications: true,
          biometricLock: false,
          autoBackup: true,
          theme: 'auto',
          reminderFrequency: 'weekly'
        };
        return { success: true, settings: defaultSettings };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Sharing Service
export const sharingService = {
  // Create share link
  createShareLink: async (folderId, permissions = 'view') => {
    try {
      const shareData = {
        folderId,
        permissions,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        token: generateShareToken()
      };

      const docRef = await addDoc(collection(db, 'shareLinks'), shareData);
      return { 
        success: true, 
        shareLink: `https://memorybox.app/shared/${docRef.id}`,
        token: shareData.token
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Verify share link
  verifyShareLink: async (shareId, token) => {
    try {
      const docRef = doc(db, 'shareLinks', shareId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const shareData = docSnap.data();
        const now = new Date();
        
        if (shareData.token === token && shareData.expiresAt.toDate() > now) {
          return { success: true, shareData };
        } else {
          return { success: false, error: 'Invalid or expired share link' };
        }
      } else {
        return { success: false, error: 'Share link not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Helper function to generate share token
function generateShareToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// AI Service (for memory reminders and suggestions)
export const aiService = {
  // Generate memory reminder
  generateMemoryReminder: async (userId) => {
    try {
      // Simple rule-based AI for now
      const { success, folders } = await foldersService.getUserFolders(userId);
      if (!success) return { success: false, error: 'Failed to get folders' };

      const oldFolders = folders.filter(folder => {
        const lastUpdated = new Date(folder.updatedAt);
        const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 30;
      });

      if (oldFolders.length > 0) {
        const randomFolder = oldFolders[Math.floor(Math.random() * oldFolders.length)];
        return {
          success: true,
          reminder: {
            type: 'folder_revisit',
            title: `Remember "${randomFolder.name}"?`,
            message: `You haven't visited this folder in a while. Take a trip down memory lane!`,
            folderId: randomFolder.id,
            action: 'VIEW_FOLDER'
          }
        };
      }

      return { success: true, reminder: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Generate folder suggestions based on upload patterns
  generateFolderSuggestions: async (userId) => {
    try {
      // This could be enhanced with ML in the future
      const suggestions = [
        { name: "Travel Adventures", emoji: "✈️", color: "#4ECDC4" },
        { name: "Family Moments", emoji: "👨‍👩‍👧‍👦", color: "#FF6B6B" },
        { name: "Work & Career", emoji: "💼", color: "#96CEB4" },
        { name: "Hobbies & Interests", emoji: "🎨", color: "#DDA0DD" },
        { name: "Special Events", emoji: "🎉", color: "#FFEAA7" }
      ];

      return { success: true, suggestions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default {
  authService,
  foldersService,
  memoriesService,
  activitiesService,
  localStorageService,
  settingsService,
  sharingService,
  aiService
};
