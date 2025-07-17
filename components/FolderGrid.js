import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
    collection, 
    query, 
    where, 
    getDocs,
    orderBy,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const FolderGrid = ({ user, onFolderSelect, onFolderLongPress, refreshTrigger, showActions = false }) => {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFolders = async () => {
        if (!user?.uid) return;

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

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchFolders();
        setRefreshing(false);
    };

    const handleDeleteFolder = async (folder) => {
        Alert.alert(
            'Delete Folder',
            `Are you sure you want to delete "${folder.name}"? This will not delete the memories inside it.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Remove folder reference from memories
                            const memoriesQuery = query(
                                collection(db, `users/${user.uid}/memories`),
                                where('folderId', '==', folder.id)
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
                            await deleteDoc(doc(db, 'folders', folder.id));
                            
                            // Update local state
                            setFolders(prev => prev.filter(f => f.id !== folder.id));
                            
                            Alert.alert('Success', 'Folder deleted successfully');
                        } catch (error) {
                            console.error('Error deleting folder:', error);
                            Alert.alert('Error', 'Failed to delete folder');
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        fetchFolders();
    }, [user?.uid, refreshTrigger]);

    const renderFolderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.folderItem}
            onPress={() => onFolderSelect?.(item)}
            onLongPress={() => onFolderLongPress ? onFolderLongPress(item) : (showActions && handleDeleteFolder(item))}
        >
            <View style={[styles.folderIcon, { backgroundColor: item.color || '#007AFF' }]}>
                {item.thumbnailUrl ? (
                    <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnailImage} />
                ) : (
                    <Ionicons name="folder" size={32} color="white" />
                )}
                {item.memoryCount > 0 && (
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{item.memoryCount}</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.folderInfo}>
                <Text style={styles.folderName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.folderMeta}>
                    {item.memoryCount} {item.memoryCount === 1 ? 'memory' : 'memories'}
                </Text>
                <Text style={styles.folderDate}>
                    Created {item.displayDate}
                </Text>
            </View>

            {showActions && (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteFolder(item)}
                >
                    <Ionicons name="trash-outline" size={16} color="#ff3b30" />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Folders Yet</Text>
            <Text style={styles.emptyMessage}>
                Create folders to organize your memories into albums
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading folders...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={folders}
                renderItem={renderFolderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#007AFF']}
                        tintColor="#007AFF"
                    />
                }
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666'
    },
    listContent: {
        padding: 10
    },
    folderItem: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        margin: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        minHeight: 140
    },
    folderIcon: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 10,
        position: 'relative',
        overflow: 'hidden'
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12
    },
    countBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ff3b30',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4
    },
    countText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600'
    },
    folderInfo: {
        flex: 1,
        alignItems: 'center'
    },
    folderName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4
    },
    folderMeta: {
        fontSize: 12,
        color: '#007AFF',
        marginBottom: 2
    },
    folderDate: {
        fontSize: 10,
        color: '#999'
    },
    actionButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#666',
        marginTop: 20,
        marginBottom: 10
    },
    emptyMessage: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 40
    }
});

export default FolderGrid;
