// Firebase Folder Management Service
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    increment,
    getDoc,
    deleteDoc
} from 'firebase/firestore';
import { db, firebaseHelpers } from '../config/firebase';

export const folderService = {
    // Plan limits for folders
    planLimits: {
        free: { folders: 5 },
        premium: { folders: 50 },
        family: { folders: 100 }
    },

    // Check if user can create more folders
    canCreateFolder: async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();
            const plan = userData?.plan || 'free';
            const limits = folderService.planLimits[plan];

            const currentFolders = userData?.usage?.foldersUsed || 0;

            if (currentFolders >= limits.folders) {
                return {
                    canCreate: false,
                    limit: limits.folders,
                    used: currentFolders
                };
            }

            return { canCreate: true };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Create new folder
    createFolder: async (userId, folderName, description = '', parentId = null) => {
        try {
            // Check if user can create folder
            const folderCheck = await folderService.canCreateFolder(userId);
            if (!folderCheck.canCreate) {
                throw new Error(`Folder limit exceeded. Maximum ${folderCheck.limit} folders allowed on your plan.`);
            }

            // Create folder data
            const folderData = {
                userId,
                name: folderName,
                description,
                parentId: parentId || 'root',
                createdDate: firebaseHelpers.timestamp(),
                lastModified: firebaseHelpers.timestamp(),
                fileCount: 0,
                size: 0,
                isShared: false,
                shareId: null,
                tags: [],
                color: '#4CAF50', // Default green color
                emoji: '📁' // Default folder emoji
            };

            // Add folder to Firestore
            const docRef = await addDoc(collection(db, 'folders'), folderData);

            // Update user folder count
            await updateDoc(doc(db, 'users', userId), {
                'usage.foldersUsed': increment(1),
                lastActive: firebaseHelpers.timestamp()
            });

            return {
                success: true,
                folderId: docRef.id,
                folder: { id: docRef.id, ...folderData }
            };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Get user's folders
    getUserFolders: async (userId, parentId = 'root') => {
        try {
            const foldersQuery = query(
                collection(db, 'folders'),
                where('userId', '==', userId),
                where('parentId', '==', parentId)
            );

            const querySnapshot = await getDocs(foldersQuery);
            const folders = [];

            querySnapshot.forEach((doc) => {
                folders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Sort by creation date (newest first)
            folders.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

            return folders;
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Get folder by ID
    getFolderById: async (folderId) => {
        try {
            const folderDoc = await getDoc(doc(db, 'folders', folderId));

            if (!folderDoc.exists()) {
                throw new Error('Folder not found');
            }

            return {
                id: folderDoc.id,
                ...folderDoc.data()
            };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Update folder
    updateFolder: async (folderId, updates) => {
        try {
            await updateDoc(doc(db, 'folders', folderId), {
                ...updates,
                lastModified: firebaseHelpers.timestamp()
            });

            return { success: true };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Delete folder
    deleteFolder: async (userId, folderId) => {
        try {
            // Check if folder has files (should move them to root or prevent deletion)
            const folder = await folderService.getFolderById(folderId);

            if (folder.fileCount > 0) {
                throw new Error('Cannot delete folder with files. Please move files first.');
            }

            // Delete folder document
            await deleteDoc(doc(db, 'folders', folderId));

            // Update user folder count
            await updateDoc(doc(db, 'users', userId), {
                'usage.foldersUsed': increment(-1),
                lastActive: firebaseHelpers.timestamp()
            });

            return { success: true };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Get folder statistics
    getFolderStats: async (folderId) => {
        try {
            // Query memories in this folder
            const memoriesQuery = query(
                collection(db, 'memories'),
                where('folderId', '==', folderId)
            );

            const querySnapshot = await getDocs(memoriesQuery);
            let totalSize = 0;
            let fileCount = 0;
            const fileTypes = {};

            querySnapshot.forEach((doc) => {
                const memory = doc.data();
                totalSize += memory.size || 0;
                fileCount++;

                const type = memory.type?.split('/')[0] || 'other';
                fileTypes[type] = (fileTypes[type] || 0) + 1;
            });

            return {
                fileCount,
                totalSize,
                fileTypes,
                formattedSize: folderService.formatBytes(totalSize)
            };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Generate share link for folder
    generateShareLink: async (folderId, userId) => {
        try {
            const shareId = firebaseHelpers.generateId();

            // Update folder with share information
            await updateDoc(doc(db, 'folders', folderId), {
                isShared: true,
                shareId: shareId,
                sharedDate: firebaseHelpers.timestamp(),
                sharedBy: userId
            });

            // Create share document for tracking
            await addDoc(collection(db, 'shares'), {
                shareId,
                folderId,
                userId,
                type: 'folder',
                createdDate: firebaseHelpers.timestamp(),
                accessCount: 0,
                lastAccessed: null
            });

            return {
                success: true,
                shareId,
                shareUrl: `https://memorybox.app/share/${shareId}`
            };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Format bytes helper
    formatBytes: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

export default folderService;
