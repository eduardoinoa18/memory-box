// Firebase Storage Upload Utility with Metadata Handling
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, setDoc, updateDoc, deleteDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { storage, db, firebaseHelpers } from '../config/firebase';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export const uploadService = {
    // Main upload function with progress tracking
    uploadFile: async (file, userId, options = {}) => {
        try {
            const {
                folderId = null,
                category = 'general',
                tags = [],
                description = '',
                isPublic = false,
                compression = { enabled: true, quality: 0.8 },
                onProgress = () => { },
                onComplete = () => { },
                onError = () => { }
            } = options;

            // Validate inputs
            if (!file || !userId) {
                throw new Error('File and userId are required');
            }

            // Generate unique filename and paths
            const fileExtension = file.name?.split('.').pop() || 'unknown';
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
            const storagePath = `users/${userId}/memories/${fileName}`;

            // Process file (compression, format conversion if needed)
            const processedFile = await uploadService.processFile(file, compression);

            // Create Firebase Storage reference
            const storageRef = ref(storage, storagePath);

            // Prepare file for upload
            const fileBlob = await uploadService.prepareFileForUpload(processedFile);

            // Create upload task with resumable upload
            const uploadTask = uploadBytesResumable(storageRef, fileBlob, {
                contentType: processedFile.type || file.type,
                customMetadata: {
                    originalName: file.name || 'unknown',
                    category: category,
                    userId: userId,
                    uploadedAt: new Date().toISOString()
                }
            });

            // Return promise with upload tracking
            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Progress tracking
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        onProgress(progress, snapshot);
                    },
                    (error) => {
                        // Upload error
                        console.error('Upload error:', error);
                        onError(error);
                        reject(firebaseHelpers.handleError(error));
                    },
                    async () => {
                        try {
                            // Upload completed successfully
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                            // Create memory document in Firestore
                            const memoryData = await uploadService.createMemoryDocument(
                                userId,
                                {
                                    ...processedFile,
                                    downloadURL,
                                    storagePath,
                                    folderId,
                                    category,
                                    tags,
                                    description,
                                    isPublic
                                }
                            );

                            onComplete(memoryData);
                            resolve(memoryData);
                        } catch (error) {
                            console.error('Post-upload error:', error);
                            onError(error);
                            reject(error);
                        }
                    }
                );
            });

        } catch (error) {
            console.error('Upload service error:', error);
            throw firebaseHelpers.handleError(error);
        }
    },

    // Process file (compression, optimization)
    processFile: async (file, compressionOptions = {}) => {
        try {
            const { enabled = true, quality = 0.8, maxWidth = 1920, maxHeight = 1080 } = compressionOptions;

            // If compression is disabled or not an image, return original file info
            if (!enabled || !file.type?.startsWith('image/')) {
                return {
                    uri: file.uri,
                    type: file.type || 'application/octet-stream',
                    name: file.name || 'file',
                    size: file.size || 0
                };
            }

            // Compress image using ImageManipulator
            const manipResult = await ImageManipulator.manipulateAsync(
                file.uri,
                [
                    {
                        resize: {
                            width: maxWidth,
                            height: maxHeight
                        }
                    }
                ],
                {
                    compress: quality,
                    format: ImageManipulator.SaveFormat.JPEG,
                    base64: false
                }
            );

            // Get file size after compression
            const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);

            return {
                uri: manipResult.uri,
                type: 'image/jpeg',
                name: file.name?.replace(/\.[^/.]+$/, '.jpg') || 'image.jpg',
                size: fileInfo.size || 0,
                width: manipResult.width,
                height: manipResult.height,
                compressed: true
            };

        } catch (error) {
            console.warn('File processing failed, using original:', error);
            return {
                uri: file.uri,
                type: file.type || 'application/octet-stream',
                name: file.name || 'file',
                size: file.size || 0,
                compressed: false
            };
        }
    },

    // Prepare file for upload to Firebase Storage
    prepareFileForUpload: async (file) => {
        try {
            // Read file as blob
            const response = await fetch(file.uri);
            const blob = await response.blob();
            return blob;
        } catch (error) {
            throw new Error(`Failed to prepare file for upload: ${error.message}`);
        }
    },

    // Create memory document in Firestore
    createMemoryDocument: async (userId, fileData) => {
        try {
            const memoryId = firebaseHelpers.generateId();
            const memoryRef = doc(db, 'users', userId, 'memories', memoryId);

            const memoryData = {
                id: memoryId,
                userId: userId,
                fileName: fileData.name,
                originalName: fileData.name,
                fileType: fileData.type,
                fileSize: fileData.size,
                downloadURL: fileData.downloadURL,
                storagePath: fileData.storagePath,

                // File-specific metadata
                width: fileData.width || null,
                height: fileData.height || null,
                compressed: fileData.compressed || false,

                // Organization
                folderId: fileData.folderId,
                category: fileData.category || 'general',
                tags: fileData.tags || [],
                description: fileData.description || '',

                // Sharing and permissions
                isPublic: fileData.isPublic || false,
                sharedWith: [],

                // Timestamps
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),

                // Upload metadata
                uploadSource: 'mobile_app',
                uploadVersion: '1.0.0'
            };

            await setDoc(memoryRef, memoryData);

            // If file belongs to a folder, update folder metadata
            if (fileData.folderId) {
                await uploadService.updateFolderStats(userId, fileData.folderId, 'add');
            }

            // Update user storage stats
            await uploadService.updateUserStats(userId, fileData.size, 'add');

            return {
                ...memoryData,
                id: memoryId,
                createdAt: new Date().toISOString() // Convert for immediate use
            };

        } catch (error) {
            throw new Error(`Failed to create memory document: ${error.message}`);
        }
    },

    // Update folder statistics
    updateFolderStats: async (userId, folderId, operation = 'add') => {
        try {
            const folderRef = doc(db, 'users', userId, 'folders', folderId);
            const incrementValue = operation === 'add' ? 1 : -1;

            await updateDoc(folderRef, {
                fileCount: increment(incrementValue),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.warn('Failed to update folder stats:', error);
        }
    },

    // Update user storage statistics
    updateUserStats: async (userId, fileSize, operation = 'add') => {
        try {
            const userRef = doc(db, 'users', userId);
            const sizeIncrement = operation === 'add' ? fileSize : -fileSize;
            const countIncrement = operation === 'add' ? 1 : -1;

            await updateDoc(userRef, {
                storageUsed: increment(sizeIncrement),
                totalFiles: increment(countIncrement),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.warn('Failed to update user stats:', error);
        }
    },

    // Delete file and cleanup
    deleteFile: async (userId, memoryId) => {
        try {
            // Get memory document
            const memoryRef = doc(db, 'users', userId, 'memories', memoryId);
            const memoryDoc = await getDoc(memoryRef);

            if (!memoryDoc.exists()) {
                throw new Error('Memory not found');
            }

            const memoryData = memoryDoc.data();

            // Delete file from Storage
            if (memoryData.storagePath) {
                const storageRef = ref(storage, memoryData.storagePath);
                await deleteObject(storageRef);
            }

            // Delete Firestore document
            await deleteDoc(memoryRef);

            // Update folder stats if applicable
            if (memoryData.folderId) {
                await uploadService.updateFolderStats(userId, memoryData.folderId, 'remove');
            }

            // Update user stats
            await uploadService.updateUserStats(userId, memoryData.fileSize || 0, 'remove');

            return { success: true, deletedMemoryId: memoryId };

        } catch (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    },

    // Batch upload multiple files
    batchUpload: async (files, userId, options = {}) => {
        try {
            const {
                maxConcurrent = 3,
                onBatchProgress = () => { },
                onFileComplete = () => { },
                onBatchComplete = () => { }
            } = options;

            const results = [];
            const errors = [];
            let completed = 0;

            // Process files in batches
            for (let i = 0; i < files.length; i += maxConcurrent) {
                const batch = files.slice(i, i + maxConcurrent);

                const batchPromises = batch.map(async (file, index) => {
                    try {
                        const result = await uploadService.uploadFile(file, userId, {
                            ...options,
                            onProgress: (progress) => {
                                const globalIndex = i + index;
                                onBatchProgress(globalIndex, progress, files.length);
                            },
                            onComplete: (memoryData) => {
                                completed++;
                                onFileComplete(memoryData, completed, files.length);
                            }
                        });
                        return result;
                    } catch (error) {
                        errors.push({ file: file.name, error: error.message });
                        return null;
                    }
                });

                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults.filter(result => result !== null));
            }

            onBatchComplete(results, errors);

            return {
                success: true,
                uploaded: results.length,
                failed: errors.length,
                results,
                errors
            };

        } catch (error) {
            throw new Error(`Batch upload failed: ${error.message}`);
        }
    },

    // Get upload progress for resumable uploads
    getUploadProgress: (uploadTask) => {
        if (!uploadTask) return 0;

        return new Promise((resolve) => {
            uploadTask.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                resolve(progress);
            });
        });
    },

    // Cancel upload
    cancelUpload: (uploadTask) => {
        if (uploadTask) {
            return uploadTask.cancel();
        }
        return Promise.resolve();
    },

    // Validate file before upload
    validateFile: (file, userPlan = 'free') => {
        const limits = {
            free: { maxSize: 10 * 1024 * 1024, allowedTypes: ['image/*', 'text/*'] }, // 10MB
            premium: { maxSize: 100 * 1024 * 1024, allowedTypes: ['*'] }, // 100MB
            family: { maxSize: 500 * 1024 * 1024, allowedTypes: ['*'] } // 500MB
        };

        const planLimits = limits[userPlan] || limits.free;

        // Check file size
        if (file.size > planLimits.maxSize) {
            throw new Error(`File size exceeds ${planLimits.maxSize / (1024 * 1024)}MB limit for ${userPlan} plan`);
        }

        // Check file type for free plan
        if (userPlan === 'free' && !planLimits.allowedTypes.some(type => {
            if (type === '*') return true;
            return file.type?.startsWith(type.replace('*', ''));
        })) {
            throw new Error(`File type ${file.type} not allowed for ${userPlan} plan`);
        }

        return true;
    }
};

export default uploadService;
