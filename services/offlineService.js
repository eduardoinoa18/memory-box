import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, getDocs, collection, query, limit, orderBy } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import NetInfo from '@react-native-community/netinfo';

class OfflineService {
  constructor() {
    this.isOnline = true;
    this.pendingUploads = [];
    this.cacheKeys = {
      MEMORIES: 'cached_memories',
      FOLDERS: 'cached_folders',
      COLLECTIONS: 'cached_collections',
      USER_DATA: 'cached_user_data',
      PENDING_UPLOADS: 'pending_uploads',
      OFFLINE_QUEUE: 'offline_queue'
    };
    
    this.setupNetworkListener();
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;
      
      if (wasOffline && this.isOnline) {
        console.log('Back online - syncing data...');
        this.syncOfflineData();
      }
    });
  }

  // Cache Management
  async cacheData(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`Cached data for key: ${key}`);
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  async getCachedData(key, maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    try {
      const cachedString = await AsyncStorage.getItem(key);
      if (!cachedString) return null;

      const cached = JSON.parse(cachedString);
      const isExpired = Date.now() - cached.timestamp > maxAge;
      
      if (isExpired) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  async clearCache(key = null) {
    try {
      if (key) {
        await AsyncStorage.removeItem(key);
      } else {
        // Clear all cache
        const keys = Object.values(this.cacheKeys);
        await AsyncStorage.multiRemove(keys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Memory Operations
  async getMemories(userId, forceOnline = false) {
    if (this.isOnline && !forceOnline) {
      try {
        const memoriesRef = collection(firestore, `users/${userId}/memories`);
        const memoriesQuery = query(memoriesRef, orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(memoriesQuery);
        
        const memories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Cache the data
        await this.cacheData(this.cacheKeys.MEMORIES, memories);
        return { data: memories, source: 'online' };
      } catch (error) {
        console.error('Error fetching memories online:', error);
        // Fall back to cache
        const cachedMemories = await this.getCachedData(this.cacheKeys.MEMORIES);
        return { data: cachedMemories || [], source: 'cache' };
      }
    } else {
      // Use cached data
      const cachedMemories = await this.getCachedData(this.cacheKeys.MEMORIES);
      return { data: cachedMemories || [], source: 'cache' };
    }
  }

  async getMemory(userId, memoryId) {
    // First try to find in cache
    const cachedMemories = await this.getCachedData(this.cacheKeys.MEMORIES);
    const cachedMemory = cachedMemories?.find(m => m.id === memoryId);
    
    if (cachedMemory) {
      return { data: cachedMemory, source: 'cache' };
    }

    // If online, fetch from Firestore
    if (this.isOnline) {
      try {
        const memoryRef = doc(firestore, `users/${userId}/memories`, memoryId);
        const memorySnap = await getDoc(memoryRef);
        
        if (memorySnap.exists()) {
          const memory = { id: memorySnap.id, ...memorySnap.data() };
          
          // Update cache with new memory
          const updatedMemories = cachedMemories ? [...cachedMemories, memory] : [memory];
          await this.cacheData(this.cacheKeys.MEMORIES, updatedMemories);
          
          return { data: memory, source: 'online' };
        }
      } catch (error) {
        console.error('Error fetching memory online:', error);
      }
    }

    return { data: null, source: 'none' };
  }

  // Offline Upload Queue
  async addToUploadQueue(uploadData) {
    try {
      const queue = await this.getUploadQueue();
      const queueItem = {
        id: Date.now().toString(),
        ...uploadData,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      queue.push(queueItem);
      await AsyncStorage.setItem(this.cacheKeys.PENDING_UPLOADS, JSON.stringify(queue));
      
      console.log('Added to upload queue:', queueItem.id);
      return queueItem.id;
    } catch (error) {
      console.error('Error adding to upload queue:', error);
      throw error;
    }
  }

  async getUploadQueue() {
    try {
      const queueString = await AsyncStorage.getItem(this.cacheKeys.PENDING_UPLOADS);
      return queueString ? JSON.parse(queueString) : [];
    } catch (error) {
      console.error('Error getting upload queue:', error);
      return [];
    }
  }

  async updateQueueItem(itemId, updates) {
    try {
      const queue = await this.getUploadQueue();
      const itemIndex = queue.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        queue[itemIndex] = { ...queue[itemIndex], ...updates };
        await AsyncStorage.setItem(this.cacheKeys.PENDING_UPLOADS, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Error updating queue item:', error);
    }
  }

  async removeFromQueue(itemId) {
    try {
      const queue = await this.getUploadQueue();
      const filteredQueue = queue.filter(item => item.id !== itemId);
      await AsyncStorage.setItem(this.cacheKeys.PENDING_UPLOADS, JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  }

  // Offline Actions Queue
  async addOfflineAction(action) {
    try {
      const queue = await this.getOfflineQueue();
      const actionItem = {
        id: Date.now().toString(),
        ...action,
        timestamp: Date.now()
      };
      
      queue.push(actionItem);
      await AsyncStorage.setItem(this.cacheKeys.OFFLINE_QUEUE, JSON.stringify(queue));
      
      return actionItem.id;
    } catch (error) {
      console.error('Error adding offline action:', error);
      throw error;
    }
  }

  async getOfflineQueue() {
    try {
      const queueString = await AsyncStorage.getItem(this.cacheKeys.OFFLINE_QUEUE);
      return queueString ? JSON.parse(queueString) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  // Sync Functions
  async syncOfflineData() {
    if (!this.isOnline) return;

    console.log('Starting offline data sync...');
    
    try {
      await Promise.all([
        this.syncUploadQueue(),
        this.syncOfflineActions()
      ]);
      
      console.log('Offline data sync completed');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  async syncUploadQueue() {
    const queue = await this.getUploadQueue();
    const pendingItems = queue.filter(item => item.status === 'pending');
    
    console.log(`Syncing ${pendingItems.length} pending uploads...`);
    
    for (const item of pendingItems) {
      try {
        await this.updateQueueItem(item.id, { status: 'uploading' });
        
        // Process the upload based on type
        switch (item.type) {
          case 'memory':
            await this.processMemoryUpload(item);
            break;
          case 'folder':
            await this.processFolderAction(item);
            break;
          case 'collection':
            await this.processCollectionAction(item);
            break;
          default:
            console.warn('Unknown upload type:', item.type);
        }
        
        await this.removeFromQueue(item.id);
        console.log('Successfully synced upload:', item.id);
      } catch (error) {
        console.error('Error syncing upload:', item.id, error);
        await this.updateQueueItem(item.id, { 
          status: 'error', 
          error: error.message 
        });
      }
    }
  }

  async syncOfflineActions() {
    const queue = await this.getOfflineQueue();
    
    console.log(`Syncing ${queue.length} offline actions...`);
    
    for (const action of queue) {
      try {
        await this.processOfflineAction(action);
        await this.removeFromOfflineQueue(action.id);
        console.log('Successfully synced action:', action.id);
      } catch (error) {
        console.error('Error syncing action:', action.id, error);
      }
    }
  }

  async removeFromOfflineQueue(actionId) {
    try {
      const queue = await this.getOfflineQueue();
      const filteredQueue = queue.filter(action => action.id !== actionId);
      await AsyncStorage.setItem(this.cacheKeys.OFFLINE_QUEUE, JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('Error removing from offline queue:', error);
    }
  }

  // Process specific upload types
  async processMemoryUpload(item) {
    // Import upload service to avoid circular dependency
    const { uploadToFirebase } = await import('../utils/upload');
    
    const result = await uploadToFirebase(
      item.fileUri,
      item.fileName,
      item.userId,
      item.metadata
    );
    
    return result;
  }

  async processFolderAction(item) {
    // Process folder creation/update/deletion
    const { addDoc, updateDoc, deleteDoc, collection, doc } = await import('firebase/firestore');
    
    switch (item.action) {
      case 'create':
        const foldersRef = collection(firestore, `users/${item.userId}/folders`);
        await addDoc(foldersRef, item.data);
        break;
      case 'update':
        const folderRef = doc(firestore, `users/${item.userId}/folders`, item.folderId);
        await updateDoc(folderRef, item.updates);
        break;
      case 'delete':
        const deleteFolderRef = doc(firestore, `users/${item.userId}/folders`, item.folderId);
        await deleteDoc(deleteFolderRef);
        break;
    }
  }

  async processCollectionAction(item) {
    // Process collection creation/update/deletion
    const { addDoc, updateDoc, deleteDoc, collection, doc } = await import('firebase/firestore');
    
    switch (item.action) {
      case 'create':
        const collectionsRef = collection(firestore, `users/${item.userId}/collections`);
        await addDoc(collectionsRef, item.data);
        break;
      case 'update':
        const collectionRef = doc(firestore, `users/${item.userId}/collections`, item.collectionId);
        await updateDoc(collectionRef, item.updates);
        break;
      case 'delete':
        const deleteCollectionRef = doc(firestore, `users/${item.userId}/collections`, item.collectionId);
        await deleteDoc(deleteCollectionRef);
        break;
    }
  }

  async processOfflineAction(action) {
    // Process various offline actions like comments, reactions, etc.
    const { addDoc, updateDoc, collection, doc } = await import('firebase/firestore');
    
    switch (action.type) {
      case 'add_comment':
        const commentsRef = collection(
          firestore, 
          `users/${action.userId}/memories/${action.memoryId}/comments`
        );
        await addDoc(commentsRef, action.data);
        break;
        
      case 'add_reaction':
        const reactionsRef = collection(
          firestore, 
          `users/${action.userId}/memories/${action.memoryId}/reactions`
        );
        await addDoc(reactionsRef, action.data);
        break;
        
      case 'update_memory':
        const memoryRef = doc(firestore, `users/${action.userId}/memories`, action.memoryId);
        await updateDoc(memoryRef, action.updates);
        break;
        
      default:
        console.warn('Unknown offline action type:', action.type);
    }
  }

  // Utility functions
  async getCacheSize() {
    try {
      const keys = Object.values(this.cacheKeys);
      let totalSize = 0;
      
      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }

  async getCacheInfo() {
    const cacheInfo = {};
    
    for (const [name, key] of Object.entries(this.cacheKeys)) {
      try {
        const data = await this.getCachedData(key);
        cacheInfo[name] = {
          hasData: !!data,
          itemCount: Array.isArray(data) ? data.length : (data ? 1 : 0),
          lastUpdated: data ? new Date().toISOString() : null
        };
      } catch (error) {
        cacheInfo[name] = { hasData: false, error: error.message };
      }
    }
    
    const uploadQueue = await this.getUploadQueue();
    const offlineQueue = await this.getOfflineQueue();
    
    return {
      cache: cacheInfo,
      pendingUploads: uploadQueue.length,
      offlineActions: offlineQueue.length,
      isOnline: this.isOnline,
      totalCacheSize: await this.getCacheSize()
    };
  }

  // Preload essential data for offline use
  async preloadForOffline(userId) {
    if (!this.isOnline) return;
    
    console.log('Preloading data for offline use...');
    
    try {
      // Preload recent memories
      await this.getMemories(userId);
      
      // Preload folders
      const foldersRef = collection(firestore, `users/${userId}/folders`);
      const foldersSnapshot = await getDocs(foldersRef);
      const folders = foldersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      await this.cacheData(this.cacheKeys.FOLDERS, folders);
      
      // Preload collections
      const collectionsRef = collection(firestore, `users/${userId}/collections`);
      const collectionsSnapshot = await getDocs(collectionsRef);
      const collections = collectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      await this.cacheData(this.cacheKeys.COLLECTIONS, collections);
      
      console.log('Preloading completed');
    } catch (error) {
      console.error('Error preloading data:', error);
    }
  }
}

export default new OfflineService();
