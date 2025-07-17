/**
 * Firestore Memory Metadata Query Helper
 * Utility functions for testing and using your advanced metadata system
 */

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export class MemoryMetadataService {

    // Get user's memories with various filters
    static async getUserMemories(userId, options = {}) {
        try {
            const userMemoriesRef = collection(db, `users/${userId}/memories`);
            let q = userMemoriesRef;

            // Apply filters
            if (options.type) {
                q = query(q, where('type', '==', options.type));
            }

            if (options.tags && options.tags.length > 0) {
                q = query(q, where('tags', 'array-contains-any', options.tags));
            }

            if (options.folderId) {
                q = query(q, where('folderId', '==', options.folderId));
            }

            // Apply sorting
            const sortBy = options.sortBy || 'createdAt';
            const sortOrder = options.sortOrder || 'desc';
            q = query(q, orderBy(sortBy, sortOrder));

            // Apply limit
            if (options.limit) {
                q = query(q, limit(options.limit));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('Error fetching user memories:', error);
            throw error;
        }
    }

    // Get recent memories across all users (admin function)
    static async getRecentMemories(limitCount = 10) {
        try {
            const memoriesRef = collection(db, 'memories');
            const q = query(
                memoriesRef,
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('Error fetching recent memories:', error);
            throw error;
        }
    }

    // Search memories by description or tags
    static async searchUserMemories(userId, searchTerm) {
        try {
            const userMemoriesRef = collection(db, `users/${userId}/memories`);

            // Note: For full-text search, you'd typically use Algolia or similar
            // This is a basic tag search for demonstration
            const q = query(
                userMemoriesRef,
                where('tags', 'array-contains', searchTerm.toLowerCase())
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('Error searching memories:', error);
            throw error;
        }
    }

    // Get memory statistics for user
    static async getUserMemoryStats(userId) {
        try {
            const memories = await this.getUserMemories(userId);

            const stats = {
                total: memories.length,
                byType: {},
                totalSize: 0,
                recentCount: 0 // last 7 days
            };

            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            memories.forEach(memory => {
                // Count by type
                stats.byType[memory.type] = (stats.byType[memory.type] || 0) + 1;

                // Sum file sizes
                if (memory.fileSize) {
                    stats.totalSize += memory.fileSize;
                }

                // Count recent uploads
                if (memory.createdAt && memory.createdAt.toDate() > oneWeekAgo) {
                    stats.recentCount++;
                }
            });

            return stats;

        } catch (error) {
            console.error('Error getting memory stats:', error);
            throw error;
        }
    }

    // Get memory by ID from user collection
    static async getUserMemory(userId, memoryId) {
        try {
            const memoryRef = doc(db, `users/${userId}/memories`, memoryId);
            const memoryDoc = await getDoc(memoryRef);

            if (memoryDoc.exists()) {
                return {
                    id: memoryDoc.id,
                    ...memoryDoc.data()
                };
            } else {
                throw new Error('Memory not found');
            }

        } catch (error) {
            console.error('Error fetching memory:', error);
            throw error;
        }
    }

    // Admin function: Get all memories with filters
    static async getAllMemories(options = {}) {
        try {
            const memoriesRef = collection(db, 'memories');
            let q = memoriesRef;

            if (options.userId) {
                q = query(q, where('userId', '==', options.userId));
            }

            if (options.type) {
                q = query(q, where('type', '==', options.type));
            }

            q = query(q, orderBy('createdAt', 'desc'));

            if (options.limit) {
                q = query(q, limit(options.limit));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('Error fetching all memories:', error);
            throw error;
        }
    }
}

// Example usage functions for testing
export const testMemoryQueries = {

    // Test getting user's images
    async getUserImages(userId) {
        return await MemoryMetadataService.getUserMemories(userId, {
            type: 'image',
            limit: 20
        });
    },

    // Test getting recent uploads
    async getRecentUploads(userId) {
        return await MemoryMetadataService.getUserMemories(userId, {
            sortBy: 'createdAt',
            sortOrder: 'desc',
            limit: 10
        });
    },

    // Test tag search
    async getMemoriesByTag(userId, tag) {
        return await MemoryMetadataService.searchUserMemories(userId, tag);
    },

    // Test admin view
    async getAdminOverview() {
        return await MemoryMetadataService.getRecentMemories(50);
    }
};

export default MemoryMetadataService;
