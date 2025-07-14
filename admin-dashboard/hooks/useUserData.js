import { useState, useEffect } from 'react';
// TODO: Re-enable Firebase when ready
/*
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    limit 
} from 'firebase/firestore';
import { db } from '../config/firebase';
*/

export function useUserData(userId) {
    const [user, setUser] = useState(null);
    const [folders, setFolders] = useState([]);
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalMemories: 0,
        totalFolders: 0,
        storageUsed: 0,
        lastActive: null,
        planType: 'free'
    });

    useEffect(() => {
        if (!userId) return;
        
        // Mock user data for demo
        const mockUser = {
            id: userId,
            email: 'user@example.com',
            displayName: 'Demo User',
            planType: 'premium',
            createdAt: new Date(),
            lastActive: new Date(),
            profilePicture: '/api/placeholder/40/40'
        };
        
        const mockStats = {
            totalMemories: 156,
            totalFolders: 12,
            storageUsed: 2.4, // GB
            lastActive: new Date(),
            planType: 'premium'
        };
        
        setTimeout(() => {
            setUser(mockUser);
            setStats(mockStats);
            setLoading(false);
        }, 500);

        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch user basic info
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);
                
                if (!userSnap.exists()) {
                    throw new Error('User not found');
                }
                
                const userData = { id: userSnap.id, ...userSnap.data() };
                setUser(userData);

                // Fetch user's folders
                const foldersQuery = query(
                    collection(db, 'folders'), 
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc')
                );
                const foldersSnap = await getDocs(foldersQuery);
                const foldersData = foldersSnap.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || new Date()
                }));
                setFolders(foldersData);

                // Fetch user's memories (limit to recent 50 for performance)
                const memoriesQuery = query(
                    collection(db, `users/${userId}/memories`),
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );
                const memoriesSnap = await getDocs(memoriesQuery);
                const memoriesData = memoriesSnap.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || new Date()
                }));
                setMemories(memoriesData);

                // Calculate statistics
                const totalMemoriesQuery = query(
                    collection(db, `users/${userId}/memories`)
                );
                const totalMemoriesSnap = await getDocs(totalMemoriesQuery);
                
                const totalSize = totalMemoriesSnap.docs.reduce((acc, doc) => {
                    return acc + (doc.data().fileSize || 0);
                }, 0);

                const lastActiveMemory = memoriesData[0];
                
                setStats({
                    totalMemories: totalMemoriesSnap.size,
                    totalFolders: foldersData.length,
                    storageUsed: totalSize,
                    lastActive: lastActiveMemory?.createdAt || userData.createdAt?.toDate?.() || new Date(),
                    planType: userData.plan || 'free'
                });

            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const refreshData = async () => {
        if (!userId) return;
        
        setLoading(true);
        // Re-run the fetch logic
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = { id: userSnap.id, ...userSnap.data() };
            setUser(userData);
        }
        
        setLoading(false);
    };

    return {
        user,
        folders,
        memories,
        stats,
        loading,
        error,
        refreshData
    };
}
