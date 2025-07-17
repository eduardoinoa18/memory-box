// Firebase Storage Service for Memory Box
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { doc, addDoc, collection, updateDoc, increment, getDoc } from 'firebase/firestore';
import { storage, db, firebaseHelpers } from '../config/firebase';

export const storageService = {
    // Plan limits
    planLimits: {
        free: { storage: 1024 * 1024 * 1024, files: 50, folders: 5 }, // 1GB
        premium: { storage: 50 * 1024 * 1024 * 1024, files: 1000, folders: 50 }, // 50GB
        family: { storage: 200 * 1024 * 1024 * 1024, files: 5000, folders: 100 } // 200GB
    },

    // Check if user can upload based on plan limits
    canUpload: async (userId, fileSize) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();
            const plan = userData?.plan || 'free';
            const limits = storageService.planLimits[plan];

            const currentUsage = userData?.usage || { storageUsed: 0, filesUploaded: 0 };

            // Check storage limit
            if (currentUsage.storageUsed + fileSize > limits.storage) {
                return {
                    canUpload: false,
                    reason: 'storage',
                    limit: limits.storage,
                    used: currentUsage.storageUsed
                };
            }

            // Check file count limit
            if (currentUsage.filesUploaded >= limits.files) {
                return {
                    canUpload: false,
                    reason: 'files',
                    limit: limits.files,
                    used: currentUsage.filesUploaded
                };
            }

            return { canUpload: true };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Upload file to Firebase Storage
    uploadFile: async (userId, file, folderId = null, metadata = {}) => {
        try {
            // Check if user can upload
            const uploadCheck = await storageService.canUpload(userId, file.size);
            if (!uploadCheck.canUpload) {
                throw new Error(`Upload limit exceeded: ${uploadCheck.reason}`);
            }

            // Generate file path
            const fileId = firebaseHelpers.generateId();
            const fileName = `${fileId}_${file.name}`;
            const filePath = `users/${userId}/memories/${fileName}`;

            // Create storage reference
            const storageRef = ref(storage, filePath);

            // Upload file
            const snapshot = await uploadBytes(storageRef, file, {
                customMetadata: {
                    userId,
                    folderId: folderId || 'root',
                    uploadDate: firebaseHelpers.timestamp(),
                    ...metadata
                }
            });

            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Save file metadata to Firestore
            const fileData = {
                id: fileId,
                userId,
                folderId: folderId || 'root',
                fileName: file.name,
                originalName: file.name,
                storagePath: filePath,
                downloadURL,
                size: file.size,
                type: file.type,
                uploadDate: firebaseHelpers.timestamp(),
                lastModified: firebaseHelpers.timestamp(),
                isShared: false,
                shareId: null,
                tags: [],
                ...metadata
            };

            await addDoc(collection(db, 'memories'), fileData);

            // Update user usage statistics
            await updateDoc(doc(db, 'users', userId), {
                'usage.storageUsed': increment(file.size),
                'usage.filesUploaded': increment(1),
                lastActive: firebaseHelpers.timestamp()
            });

            return {
                success: true,
                fileId,
                downloadURL,
                fileName: file.name,
                size: file.size,
                type: file.type
            };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Upload multiple files
    uploadMultipleFiles: async (userId, files, folderId = null) => {
        try {
            const results = [];
            const errors = [];

            for (const file of files) {
                try {
                    const result = await storageService.uploadFile(userId, file, folderId);
                    results.push(result);
                } catch (error) {
                    errors.push({ fileName: file.name, error: error.message });
                }
            }

            return {
                success: results.length > 0,
                uploaded: results,
                errors: errors,
                total: files.length,
                successful: results.length,
                failed: errors.length
            };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Delete file
    deleteFile: async (userId, fileId, storagePath) => {
        try {
            // Delete from Storage
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);

            // Delete from Firestore (this would need additional query logic)
            // For now, mark as deleted
            await updateDoc(doc(db, 'memories', fileId), {
                deleted: true,
                deletedDate: firebaseHelpers.timestamp()
            });

            return { success: true };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Get user's storage usage
    getStorageUsage: async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();
            const usage = userData?.usage || { storageUsed: 0, filesUploaded: 0 };
            const plan = userData?.plan || 'free';
            const limits = storageService.planLimits[plan];

            return {
                used: usage.storageUsed,
                total: limits.storage,
                percentage: Math.round((usage.storageUsed / limits.storage) * 100),
                filesUsed: usage.filesUploaded,
                filesLimit: limits.files,
                plan: plan
            };
        } catch (error) {
            throw firebaseHelpers.handleError(error);
        }
    },

    // Format bytes for display
    formatBytes: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

export default storageService;
