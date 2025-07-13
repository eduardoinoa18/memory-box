import { useState, useEffect } from 'react';
import { 
    collection, 
    query, 
    where, 
    getDocs,
    orderBy,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const useFolders = (user) => {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFolders = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, 'folders'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            
            const snapshot = await getDocs(q);
            const folderData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                displayDate: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'
            }));

            // Get memory counts for each folder
            const foldersWithCounts = await Promise.all(
                folderData.map(async (folder) => {
                    try {
                        const memoriesQuery = query(
                            collection(db, `users/${user.uid}/memories`),
                            where('folderId', '==', folder.id)
                        );
                        const memoriesSnapshot = await getDocs(memoriesQuery);
                        const memoryCount = memoriesSnapshot.size;
                        
                        // Get thumbnail from the latest memory
                        let thumbnailUrl = null;
                        if (memoriesSnapshot.docs.length > 0) {
                            const latestMemory = memoriesSnapshot.docs[0].data();
                            if (latestMemory.type === 'image') {
                                thumbnailUrl = latestMemory.fileUrl;
                            }
                        }

                        return {
                            ...folder,
                            memoryCount,
                            thumbnailUrl
                        };
                    } catch (error) {
                        console.error('Error fetching memory count for folder:', folder.id, error);
                        return {
                            ...folder,
                            memoryCount: 0,
                            thumbnailUrl: null
                        };
                    }
                })
            );

            setFolders(foldersWithCounts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching folders:', error);
            setLoading(false);
        }
    };

    const createFolder = async (folderData) => {
        try {
            const newFolder = {
                userId: user.uid,
                name: folderData.name,
                createdAt: serverTimestamp(),
                color: folderData.color || '#007AFF',
                thumbnailUrl: null,
                memoryCount: 0,
                description: folderData.description || '',
                isPrivate: true
            };

            const docRef = await addDoc(collection(db, 'folders'), newFolder);
            
            // Add to local state
            const createdFolder = {
                id: docRef.id,
                ...newFolder,
                displayDate: new Date().toLocaleDateString(),
                memoryCount: 0,
                thumbnailUrl: null
            };
            
            setFolders(prev => [createdFolder, ...prev]);
            
            return docRef.id;
        } catch (error) {
            console.error('Error creating folder:', error);
            throw error;
        }
    };

    const updateFolder = async (folderId, updates) => {
        try {
            const folderRef = doc(db, 'folders', folderId);
            await updateDoc(folderRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });
            
            // Update local state
            setFolders(prev => prev.map(folder => 
                folder.id === folderId 
                    ? { ...folder, ...updates }
                    : folder
            ));
        } catch (error) {
            console.error('Error updating folder:', error);
            throw error;
        }
    };

    const deleteFolder = async (folderId) => {
        try {
            // Remove folder reference from memories
            const memoriesQuery = query(
                collection(db, `users/${user.uid}/memories`),
                where('folderId', '==', folderId)
            );
            const memoriesSnapshot = await getDocs(memoriesQuery);
            
            const updatePromises = memoriesSnapshot.docs.map(memoryDoc => 
                updateDoc(memoryDoc.ref, { 
                    folderId: null,
                    folderName: 'General'
                })
            );
            
            await Promise.all(updatePromises);
            
            // Delete the folder
            await deleteDoc(doc(db, 'folders', folderId));
            
            // Update local state
            setFolders(prev => prev.filter(f => f.id !== folderId));
        } catch (error) {
            console.error('Error deleting folder:', error);
            throw error;
        }
    };

    const getFolderById = (folderId) => {
        return folders.find(folder => folder.id === folderId);
    };

    const refreshFolders = async () => {
        setRefreshing(true);
        await fetchFolders();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchFolders();
    }, [user?.uid]);

    return {
        folders,
        loading,
        refreshing,
        createFolder,
        updateFolder,
        deleteFolder,
        getFolderById,
        refreshFolders,
        refetch: fetchFolders
    };
};

export default useFolders;
