// Firebase Services for Memory Box Platform
// Comprehensive backend integration
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable
} from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { auth, db, storage, functions, COLLECTIONS } from './firebase.config';

// 🔐 AUTHENTICATION SERVICES
export const authService = {
  // Register new user
  async register(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, {
        displayName: userData.name
      });

      // Create user document
      await setDoc(doc(db, COLLECTIONS.users, user.uid), {
        name: userData.name,
        email: email,
        subscription: 'free',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        profile: {
          avatar: null,
          bio: '',
          location: '',
          preferences: {
            notifications: true,
            aiSuggestions: true,
            emailUpdates: true
          }
        },
        stats: {
          foldersCreated: 0,
          memoriesUploaded: 0,
          lettersCreated: 0,
          storageUsed: 0
        }
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last active
      await updateDoc(doc(db, COLLECTIONS.users, userCredential.user.uid), {
        lastActive: serverTimestamp()
      });

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Google Sign In
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists, if not create profile
      const userDoc = await getDoc(doc(db, COLLECTIONS.users, result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, COLLECTIONS.users, result.user.uid), {
          name: result.user.displayName,
          email: result.user.email,
          subscription: 'free',
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
          profile: {
            avatar: result.user.photoURL,
            bio: '',
            location: '',
            preferences: {
              notifications: true,
              aiSuggestions: true,
              emailUpdates: true
            }
          },
          stats: {
            foldersCreated: 0,
            memoriesUploaded: 0,
            lettersCreated: 0,
            storageUsed: 0
          }
        });
      }

      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 📁 FOLDER SERVICES
export const folderService = {
  // Create new folder
  async createFolder(userId, folderData) {
    try {
      const folderRef = await addDoc(collection(db, COLLECTIONS.folders), {
        ...folderData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        memoryCount: 0,
        size: 0,
        isShared: false,
        sharedWith: [],
        tags: folderData.tags || [],
        cover: folderData.cover || null
      });

      // Update user stats
      await updateDoc(doc(db, COLLECTIONS.users, userId), {
        'stats.foldersCreated': increment(1)
      });

      return { success: true, folderId: folderRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user folders
  async getUserFolders(userId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.folders),
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

  // Share folder
  async shareFolder(folderId, userEmail, permission = 'view') {
    try {
      await updateDoc(doc(db, COLLECTIONS.folders, folderId), {
        isShared: true,
        [`sharedWith.${userEmail}`]: {
          permission,
          sharedAt: serverTimestamp()
        }
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 📷 MEMORY SERVICES
export const memoryService = {
  // Upload memory
  async uploadMemory(userId, folderId, memoryData, file) {
    try {
      let downloadURL = null;
      
      if (file) {
        // Upload file to storage
        const fileRef = ref(storage, `memories/${userId}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);
        
        await uploadTask;
        downloadURL = await getDownloadURL(fileRef);
      }

      // Create memory document
      const memoryRef = await addDoc(collection(db, COLLECTIONS.memories), {
        ...memoryData,
        userId,
        folderId,
        fileUrl: downloadURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        comments: [],
        tags: memoryData.tags || [],
        aiAnalysis: null // Will be populated by cloud function
      });

      // Update folder memory count
      await updateDoc(doc(db, COLLECTIONS.folders, folderId), {
        memoryCount: increment(1),
        updatedAt: serverTimestamp()
      });

      // Update user stats
      await updateDoc(doc(db, COLLECTIONS.users, userId), {
        'stats.memoriesUploaded': increment(1)
      });

      return { success: true, memoryId: memoryRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get folder memories
  async getFolderMemories(folderId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.memories),
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
  }
};

// 💌 DIGITAL LETTER SERVICES
export const letterService = {
  // Create digital letter
  async createLetter(userId, letterData) {
    try {
      const letterRef = await addDoc(collection(db, COLLECTIONS.digitalLetters), {
        ...letterData,
        userId,
        createdAt: serverTimestamp(),
        status: 'draft', // draft, sent, delivered, opened
        recipients: letterData.recipients || [],
        template: letterData.template || 'classic',
        animations: letterData.animations || [],
        attachedMemories: letterData.attachedMemories || []
      });

      // Update user stats
      await updateDoc(doc(db, COLLECTIONS.users, userId), {
        'stats.lettersCreated': increment(1)
      });

      return { success: true, letterId: letterRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send digital letter
  async sendLetter(letterId, recipients) {
    try {
      // Call cloud function to send letter
      const sendLetterFunction = httpsCallable(functions, 'sendDigitalLetter');
      const result = await sendLetterFunction({ letterId, recipients });

      await updateDoc(doc(db, COLLECTIONS.digitalLetters, letterId), {
        status: 'sent',
        sentAt: serverTimestamp(),
        recipients
      });

      return { success: true, result: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 💳 SUBSCRIPTION SERVICES
export const subscriptionService = {
  // Create Stripe checkout session
  async createCheckoutSession(userId, priceId, successUrl, cancelUrl) {
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({
        userId,
        priceId,
        successUrl,
        cancelUrl
      });

      return { success: true, sessionUrl: result.data.sessionUrl };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user subscription
  async getUserSubscription(userId) {
    try {
      const subDoc = await getDoc(doc(db, COLLECTIONS.subscriptions, userId));
      if (subDoc.exists()) {
        return { success: true, subscription: subDoc.data() };
      } else {
        return { success: true, subscription: null };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Cancel subscription
  async cancelSubscription(userId) {
    try {
      const cancelSubscription = httpsCallable(functions, 'cancelSubscription');
      await cancelSubscription({ userId });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 🤖 AI SERVICES
export const aiService = {
  // Get AI memory suggestions
  async getMemorySuggestions(userId) {
    try {
      const getAISuggestions = httpsCallable(functions, 'getAISuggestions');
      const result = await getAISuggestions({ userId });

      return { success: true, suggestions: result.data.suggestions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Analyze memory with AI
  async analyzeMemory(memoryId, fileUrl) {
    try {
      const analyzeMemory = httpsCallable(functions, 'analyzeMemory');
      const result = await analyzeMemory({ memoryId, fileUrl });

      return { success: true, analysis: result.data.analysis };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// 📊 ANALYTICS SERVICES
export const analyticsService = {
  // Track user event
  async trackEvent(userId, eventName, eventData) {
    try {
      await addDoc(collection(db, COLLECTIONS.analytics), {
        userId,
        eventName,
        eventData,
        timestamp: serverTimestamp(),
        platform: 'mobile'
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default {
  auth: authService,
  folders: folderService,
  memories: memoryService,
  letters: letterService,
  subscriptions: subscriptionService,
  ai: aiService,
  analytics: analyticsService
};
