// Firebase Admin Service for Dashboard
import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    deleteDoc,
    updateDoc,
    addDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { ref, deleteObject, getDownloadURL, listAll } from 'firebase/storage';
import { db, storage } from '../../config/firebase';

class FirebaseAdminService {
    // User Management
    async getUsers(pageSize = 50, lastUser = null) {
        try {
            let q = query(
                collection(db, 'users'),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            if (lastUser) {
                q = query(q, startAfter(lastUser));
            }

            const snapshot = await getDocs(q);
            const users = [];

            snapshot.forEach(doc => {
                const userData = doc.data();
                users.push({
                    id: doc.id,
                    ...userData,
                    lastActive: userData.lastActive?.toDate() || null,
                    createdAt: userData.createdAt?.toDate() || null,
                });
            });

            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    async getUserStats() {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const memoriesSnapshot = await getDocs(collection(db, 'memories'));
            const foldersSnapshot = await getDocs(collection(db, 'folders'));

            // Count active users (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const activeUsersQuery = query(
                collection(db, 'users'),
                where('lastActive', '>=', Timestamp.fromDate(thirtyDaysAgo))
            );
            const activeUsersSnapshot = await getDocs(activeUsersQuery);

            // Calculate storage usage
            let totalStorageUsed = 0;
            usersSnapshot.forEach(doc => {
                const user = doc.data();
                if (user.usage?.storageUsed) {
                    totalStorageUsed += user.usage.storageUsed;
                }
            });

            return {
                totalUsers: usersSnapshot.size,
                activeUsers: activeUsersSnapshot.size,
                totalMemories: memoriesSnapshot.size,
                totalFolders: foldersSnapshot.size,
                totalStorageUsed: totalStorageUsed,
                storageUsedGB: Math.round((totalStorageUsed / (1024 * 1024 * 1024)) * 100) / 100
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            // Delete user's memories
            const memoriesQuery = query(
                collection(db, 'memories'),
                where('userId', '==', userId)
            );
            const memoriesSnapshot = await getDocs(memoriesQuery);

            const deletePromises = [];
            memoriesSnapshot.forEach(doc => {
                deletePromises.push(deleteDoc(doc.ref));
            });

            // Delete user's folders
            const foldersQuery = query(
                collection(db, 'folders'),
                where('userId', '==', userId)
            );
            const foldersSnapshot = await getDocs(foldersQuery);

            foldersSnapshot.forEach(doc => {
                deletePromises.push(deleteDoc(doc.ref));
            });

            // Delete user storage files (requires careful handling)
            const userStorageRef = ref(storage, `users/${userId}`);
            try {
                const userFiles = await listAll(userStorageRef);
                userFiles.items.forEach(fileRef => {
                    deletePromises.push(deleteObject(fileRef));
                });
            } catch (storageError) {
                console.log('No storage files found for user or storage error:', storageError);
            }

            // Delete user document
            deletePromises.push(deleteDoc(doc(db, 'users', userId)));

            await Promise.all(deletePromises);
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Memory Management
    async getMemories(pageSize = 50, lastMemory = null) {
        try {
            let q = query(
                collection(db, 'memories'),
                orderBy('uploadedAt', 'desc'),
                limit(pageSize)
            );

            if (lastMemory) {
                q = query(q, startAfter(lastMemory));
            }

            const snapshot = await getDocs(q);
            const memories = [];

            snapshot.forEach(doc => {
                const memoryData = doc.data();
                memories.push({
                    id: doc.id,
                    ...memoryData,
                    uploadedAt: memoryData.uploadedAt?.toDate() || null,
                });
            });

            return memories;
        } catch (error) {
            console.error('Error fetching memories:', error);
            throw error;
        }
    }

    async deleteMemory(memoryId) {
        try {
            const memoryDoc = await getDoc(doc(db, 'memories', memoryId));
            if (!memoryDoc.exists()) {
                throw new Error('Memory not found');
            }

            const memoryData = memoryDoc.data();

            // Delete file from storage if exists
            if (memoryData.storagePath) {
                const fileRef = ref(storage, memoryData.storagePath);
                try {
                    await deleteObject(fileRef);
                } catch (storageError) {
                    console.log('File not found in storage or already deleted:', storageError);
                }
            }

            // Delete memory document
            await deleteDoc(doc(db, 'memories', memoryId));
            return { success: true };
        } catch (error) {
            console.error('Error deleting memory:', error);
            throw error;
        }
    }

    // Analytics
    async getAnalytics() {
        try {
            const stats = await this.getUserStats();

            // Get recent activity (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const recentMemoriesQuery = query(
                collection(db, 'memories'),
                where('uploadedAt', '>=', Timestamp.fromDate(sevenDaysAgo))
            );
            const recentMemoriesSnapshot = await getDocs(recentMemoriesQuery);

            const recentUsersQuery = query(
                collection(db, 'users'),
                where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
            );
            const recentUsersSnapshot = await getDocs(recentUsersQuery);

            return {
                ...stats,
                recentMemories: recentMemoriesSnapshot.size,
                newUsers: recentUsersSnapshot.size,
                growthRate: stats.totalUsers > 0 ? (recentUsersSnapshot.size / stats.totalUsers * 100).toFixed(1) : 0
            };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }

    // System Health
    async getSystemHealth() {
        try {
            // Check if Firebase is responsive
            const testQuery = query(collection(db, 'users'), limit(1));
            const startTime = Date.now();
            await getDocs(testQuery);
            const responseTime = Date.now() - startTime;

            return {
                status: 'healthy',
                responseTime: responseTime,
                timestamp: new Date().toISOString(),
                services: {
                    firestore: responseTime < 2000 ? 'healthy' : 'slow',
                    storage: 'healthy', // Would need separate test
                    auth: 'healthy' // Would need separate test
                }
            };
        } catch (error) {
            console.error('System health check failed:', error);
            return {
                status: 'error',
                responseTime: null,
                timestamp: new Date().toISOString(),
                error: error.message,
                services: {
                    firestore: 'error',
                    storage: 'unknown',
                    auth: 'unknown'
                }
            };
        }
    }
}

export default new FirebaseAdminService();
