// Enhanced Firebase Service - Production Ready
// Combines authentication, storage, and database operations
import { 
  auth, 
  db, 
  storage, 
  functions, 
  COLLECTIONS, 
  STORAGE_BUCKETS 
} from '../config/firebaseConfig';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
  getMetadata
} from 'firebase/storage';

import { httpsCallable } from 'firebase/functions';

// Types
export interface MemoryBoxUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  familyIds: string[];
  subscription: 'free' | 'premium' | 'family'; // Keep for future use
  storageUsed: number;
  storageLimit: number; // 100MB for free users initially
  createdAt: Timestamp;
  lastActive: Timestamp;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  privacy: 'private' | 'family' | 'public';
  autoBackup: boolean;
  qualityPreference: 'original' | 'compressed';
}

export interface Memory {
  id: string;
  userId: string;
  familyId?: string;
  folderId?: string;
  title: string;
  description?: string;
  type: 'photo' | 'video' | 'audio' | 'document' | 'note';
  fileUrl?: string;
  thumbnailUrl?: string;
  metadata: MemoryMetadata;
  tags: string[];
  sharedWith: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MemoryMetadata {
  fileSize?: number;
  duration?: number;
  dimensions?: { width: number; height: number };
  location?: { lat: number; lng: number; address?: string };
  capturedAt?: Timestamp;
}

export interface Folder {
  id: string;
  userId: string;
  familyId?: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  memoryCount: number;
  sharedWith: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Authentication Services
export class AuthService {
  static async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(user, { displayName });
      
      // Create user document
      await this.createUserProfile(user, { displayName });
      
      return user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string): Promise<User> {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last active
      await UserService.updateLastActive(user.uid);
      
      return user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user exists, create if not
      const userDoc = await UserService.getUser(user.uid);
      if (!userDoc) {
        await this.createUserProfile(user, {
          displayName: user.displayName || 'Google User'
        });
      }
      
      return user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  private static async createUserProfile(user: User, additionalData: any): Promise<void> {
    const userRef = doc(db, COLLECTIONS.users, user.uid);
    
    const userData: Partial<MemoryBoxUser> = {
      uid: user.uid,
      email: user.email!,
      displayName: additionalData.displayName,
      photoURL: user.photoURL || undefined,
      familyIds: [],
      subscription: 'free',
      storageUsed: 0,
      storageLimit: 100 * 1024 * 1024, // 100MB for free users
      createdAt: serverTimestamp() as Timestamp,
      lastActive: serverTimestamp() as Timestamp,
      preferences: {
        notifications: true,
        privacy: 'private',
        autoBackup: false,
        qualityPreference: 'original'
      }
    };

    await setDoc(userRef, userData);
  }
}

// User Management Service
export class UserService {
  static async getUser(uid: string): Promise<MemoryBoxUser | null> {
    try {
      const userRef = doc(db, COLLECTIONS.users, uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as MemoryBoxUser;
      }
      
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  static async updateUser(uid: string, updates: Partial<MemoryBoxUser>): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.users, uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  static async updateLastActive(uid: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.users, uid);
      await updateDoc(userRef, {
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error('Update last active error:', error);
      // Don't throw - this is not critical
    }
  }

  static async deleteUser(uid: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.users, uid);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }
}

// Memory Management Service
export class MemoryService {
  static async createMemory(memoryData: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const memoriesRef = collection(db, COLLECTIONS.memories);
      const docRef = await addDoc(memoriesRef, {
        ...memoryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Create memory error:', error);
      throw error;
    }
  }

  static async getMemory(memoryId: string): Promise<Memory | null> {
    try {
      const memoryRef = doc(db, COLLECTIONS.memories, memoryId);
      const memorySnap = await getDoc(memoryRef);
      
      if (memorySnap.exists()) {
        return { id: memorySnap.id, ...memorySnap.data() } as Memory;
      }
      
      return null;
    } catch (error) {
      console.error('Get memory error:', error);
      throw error;
    }
  }

  static async getUserMemories(userId: string, folderId?: string): Promise<Memory[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.memories),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (folderId) {
        q = query(
          collection(db, COLLECTIONS.memories),
          where('userId', '==', userId),
          where('folderId', '==', folderId),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Memory[];
    } catch (error) {
      console.error('Get user memories error:', error);
      throw error;
    }
  }

  static async updateMemory(memoryId: string, updates: Partial<Memory>): Promise<void> {
    try {
      const memoryRef = doc(db, COLLECTIONS.memories, memoryId);
      await updateDoc(memoryRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Update memory error:', error);
      throw error;
    }
  }

  static async deleteMemory(memoryId: string): Promise<void> {
    try {
      const memoryRef = doc(db, COLLECTIONS.memories, memoryId);
      await deleteDoc(memoryRef);
    } catch (error) {
      console.error('Delete memory error:', error);
      throw error;
    }
  }

  static subscribeToUserMemories(
    userId: string, 
    callback: (memories: Memory[]) => void,
    folderId?: string
  ) {
    let q = query(
      collection(db, COLLECTIONS.memories),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (folderId) {
      q = query(
        collection(db, COLLECTIONS.memories),
        where('userId', '==', userId),
        where('folderId', '==', folderId),
        orderBy('createdAt', 'desc')
      );
    }

    return onSnapshot(q, (snapshot) => {
      const memories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Memory[];
      callback(memories);
    });
  }
}

// Storage Service
export class StorageService {
  static async uploadFile(
    file: File | Blob,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      
      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } else {
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      }
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  }

  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  static async getFileMetadata(path: string) {
    try {
      const storageRef = ref(storage, path);
      return await getMetadata(storageRef);
    } catch (error) {
      console.error('Get file metadata error:', error);
      throw error;
    }
  }

  static generateStoragePath(userId: string, type: keyof typeof STORAGE_BUCKETS, fileName: string): string {
    const timestamp = Date.now();
    const bucket = STORAGE_BUCKETS[type];
    return `${bucket}${userId}/${timestamp}_${fileName}`;
  }
}

// Folder Management Service
export class FolderService {
  static async createFolder(folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'memoryCount'>): Promise<string> {
    try {
      const foldersRef = collection(db, COLLECTIONS.folders);
      const docRef = await addDoc(foldersRef, {
        ...folderData,
        memoryCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Create folder error:', error);
      throw error;
    }
  }

  static async getUserFolders(userId: string): Promise<Folder[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.folders),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Folder[];
    } catch (error) {
      console.error('Get user folders error:', error);
      throw error;
    }
  }

  static async updateFolder(folderId: string, updates: Partial<Folder>): Promise<void> {
    try {
      const folderRef = doc(db, COLLECTIONS.folders, folderId);
      await updateDoc(folderRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Update folder error:', error);
      throw error;
    }
  }

  static async deleteFolder(folderId: string): Promise<void> {
    try {
      const folderRef = doc(db, COLLECTIONS.folders, folderId);
      await deleteDoc(folderRef);
    } catch (error) {
      console.error('Delete folder error:', error);
      throw error;
    }
  }

  static async incrementMemoryCount(folderId: string): Promise<void> {
    try {
      const folderRef = doc(db, COLLECTIONS.folders, folderId);
      const folderSnap = await getDoc(folderRef);
      
      if (folderSnap.exists()) {
        const currentCount = folderSnap.data().memoryCount || 0;
        await updateDoc(folderRef, {
          memoryCount: currentCount + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Increment memory count error:', error);
      throw error;
    }
  }
}

// Cloud Functions Service (Simplified for MVP)
export class CloudFunctionsService {
  // Core Functions
  static sendNotification = httpsCallable(functions, 'sendNotification');
  static trackEvent = httpsCallable(functions, 'trackEvent');
  static exportUserData = httpsCallable(functions, 'exportUserData');
  
  // Future Features (Coming Soon)
  // static createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');
  // static initiatePrizeoutGiftCard = httpsCallable(functions, 'initiatePrizeoutGiftCard');
  // static createVirtualLetter = httpsCallable(functions, 'createVirtualLetter');
}

// Batch Operations Service
export class BatchService {
  static async batchUpdateMemories(updates: { id: string; data: Partial<Memory> }[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ id, data }) => {
        const memoryRef = doc(db, COLLECTIONS.memories, id);
        batch.update(memoryRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Batch update memories error:', error);
      throw error;
    }
  }

  static async batchDeleteMemories(memoryIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      memoryIds.forEach(id => {
        const memoryRef = doc(db, COLLECTIONS.memories, id);
        batch.delete(memoryRef);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Batch delete memories error:', error);
      throw error;
    }
  }
}

// Family Management Service
export class FamilyService {
  static async createFamily(familyData: {
    name: string;
    description?: string;
    ownerId: string;
  }): Promise<string> {
    try {
      const familiesRef = collection(db, COLLECTIONS.families || 'families');
      const docRef = await addDoc(familiesRef, {
        ...familyData,
        members: [familyData.ownerId],
        inviteCode: FamilyService.generateInviteCode(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update user's family list
      await UserService.updateUser(familyData.ownerId, {
        familyIds: [docRef.id]
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Create family error:', error);
      throw error;
    }
  }

  static async joinFamily(userId: string, inviteCode: string): Promise<void> {
    try {
      const familiesRef = collection(db, COLLECTIONS.families || 'families');
      const q = query(familiesRef, where('inviteCode', '==', inviteCode));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Invalid invite code');
      }
      
      const familyDoc = querySnapshot.docs[0];
      const familyData = familyDoc.data();
      
      // Add user to family members
      const updatedMembers = [...familyData.members, userId];
      await updateDoc(familyDoc.ref, {
        members: updatedMembers,
        updatedAt: serverTimestamp()
      });
      
      // Update user's family list
      const user = await UserService.getUser(userId);
      if (user) {
        const updatedFamilyIds = [...(user.familyIds || []), familyDoc.id];
        await UserService.updateUser(userId, {
          familyIds: updatedFamilyIds
        });
      }
    } catch (error) {
      console.error('Join family error:', error);
      throw error;
    }
  }

  static async shareMemoryWithFamily(memoryId: string, familyId: string): Promise<void> {
    try {
      await MemoryService.updateMemory(memoryId, {
        familyId,
        sharedWith: [] // Clear individual shares when sharing with family
      });
    } catch (error) {
      console.error('Share memory with family error:', error);
      throw error;
    }
  }

  private static generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

// Advanced Memory Operations
export class AdvancedMemoryService extends MemoryService {
  static async uploadMemoryWithFile(
    userId: string,
    file: File | Blob,
    memoryData: Omit<Memory, 'id' | 'fileUrl' | 'thumbnailUrl' | 'createdAt' | 'updatedAt'>,
    onUploadProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Generate storage path
      const fileName = `memory_${Date.now()}`;
      const storagePath = StorageService.generateStoragePath(userId, 'memories', fileName);
      
      // Upload file
      const fileUrl = await StorageService.uploadFile(file, storagePath, onUploadProgress);
      
      // Create thumbnail for images/videos
      let thumbnailUrl: string | undefined;
      if (memoryData.type === 'photo' || memoryData.type === 'video') {
        thumbnailUrl = await this.generateThumbnail(file, userId);
      }
      
      // Create memory record
      const memoryId = await this.createMemory({
        ...memoryData,
        userId,
        fileUrl,
        thumbnailUrl
      });
      
      // Update folder memory count if applicable
      if (memoryData.folderId) {
        await FolderService.incrementMemoryCount(memoryData.folderId);
      }
      
      // Update user storage usage
      await this.updateUserStorageUsage(userId, file.size);
      
      return memoryId;
    } catch (error) {
      console.error('Upload memory with file error:', error);
      throw error;
    }
  }

  static async bulkUploadMemories(
    userId: string,
    files: { file: File | Blob; memoryData: Partial<Memory> }[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<string[]> {
    try {
      const memoryIds: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const { file, memoryData } = files[i];
        
        const memoryId = await this.uploadMemoryWithFile(
          userId,
          file,
          {
            title: memoryData.title || `Memory ${i + 1}`,
            type: this.detectFileType(file),
            metadata: {},
            tags: memoryData.tags || [],
            sharedWith: memoryData.sharedWith || [],
            ...memoryData
          } as Omit<Memory, 'id' | 'fileUrl' | 'thumbnailUrl' | 'createdAt' | 'updatedAt'>
        );
        
        memoryIds.push(memoryId);
        
        if (onProgress) {
          onProgress(i + 1, files.length);
        }
      }
      
      return memoryIds;
    } catch (error) {
      console.error('Bulk upload memories error:', error);
      throw error;
    }
  }

  static async searchMemories(
    userId: string,
    searchQuery: string,
    filters?: {
      type?: Memory['type'];
      dateRange?: { start: Date; end: Date };
      tags?: string[];
      folderId?: string;
    }
  ): Promise<Memory[]> {
    try {
      // This is a simplified search - in production, you'd use Algolia or similar
      let q = query(
        collection(db, COLLECTIONS.memories),
        where('userId', '==', userId)
      );

      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters?.folderId) {
        q = query(q, where('folderId', '==', filters.folderId));
      }

      if (filters?.tags && filters.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filters.tags));
      }

      const querySnapshot = await getDocs(q);
      let memories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Memory[];

      // Filter by search query (title and description)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        memories = memories.filter(memory => 
          memory.title.toLowerCase().includes(query) ||
          memory.description?.toLowerCase().includes(query)
        );
      }

      // Filter by date range
      if (filters?.dateRange) {
        memories = memories.filter(memory => {
          const createdAt = memory.createdAt.toDate();
          return createdAt >= filters.dateRange!.start && createdAt <= filters.dateRange!.end;
        });
      }

      return memories;
    } catch (error) {
      console.error('Search memories error:', error);
      throw error;
    }
  }

  private static async generateThumbnail(file: File | Blob, userId: string): Promise<string> {
    // This would typically use a cloud function or client-side canvas manipulation
    // For now, return the same URL (implement thumbnail generation as needed)
    try {
      // Placeholder for thumbnail generation
      const thumbnailPath = StorageService.generateStoragePath(userId, 'memories', `thumb_${Date.now()}`);
      // In a real implementation, you'd resize the image/video frame
      return await StorageService.uploadFile(file, thumbnailPath);
    } catch (error) {
      console.error('Generate thumbnail error:', error);
      return ''; // Return empty string if thumbnail generation fails
    }
  }

  private static detectFileType(file: File | Blob): Memory['type'] {
    const type = file.type;
    if (type.startsWith('image/')) return 'photo';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    return 'document';
  }

  private static async updateUserStorageUsage(userId: string, sizeInBytes: number): Promise<void> {
    try {
      const user = await UserService.getUser(userId);
      if (user) {
        const newStorageUsed = user.storageUsed + sizeInBytes;
        await UserService.updateUser(userId, {
          storageUsed: newStorageUsed
        });
      }
    } catch (error) {
      console.error('Update user storage usage error:', error);
      // Don't throw - this is not critical
    }
  }
}

// Analytics Service
export class AnalyticsService {
  static async trackUserAction(
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const analyticsRef = collection(db, COLLECTIONS.analytics || 'analytics');
      await addDoc(analyticsRef, {
        userId,
        action,
        metadata: metadata || {},
        timestamp: serverTimestamp(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      });
    } catch (error) {
      console.error('Track user action error:', error);
      // Don't throw - analytics shouldn't break the app
    }
  }

  static async getUserAnalytics(userId: string, dateRange: { start: Date; end: Date }) {
    try {
      const analyticsRef = collection(db, COLLECTIONS.analytics || 'analytics');
      const q = query(
        analyticsRef,
        where('userId', '==', userId),
        where('timestamp', '>=', dateRange.start),
        where('timestamp', '<=', dateRange.end),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Get user analytics error:', error);
      throw error;
    }
  }
}

// Notification Service
export class NotificationService {
  static async sendNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      type: 'memory_shared' | 'family_invite' | 'subscription' | 'general';
      data?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      const notificationsRef = collection(db, COLLECTIONS.notifications);
      await addDoc(notificationsRef, {
        userId,
        ...notification,
        read: false,
        createdAt: serverTimestamp()
      });

      // Also trigger push notification via cloud function
      await CloudFunctionsService.sendNotification({
        data: { userId, ...notification }
      });
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<any[]> {
    try {
      let q = query(
        collection(db, COLLECTIONS.notifications),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (unreadOnly) {
        q = query(q, where('read', '==', false));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, COLLECTIONS.notifications, notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }
}

// Export all services
export {
  auth,
  db,
  storage,
  functions,
  COLLECTIONS,
  STORAGE_BUCKETS
};
