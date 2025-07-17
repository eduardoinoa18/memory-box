import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
    ScrollView,
    Alert,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    doc,
    deleteDoc
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import RobSuggestCard from './RobSuggestCard';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 2; // 2 columns with margins

const MemoriesFeed = ({ 
    user, 
    refreshTrigger, 
    memories: externalMemories, 
    refreshing: externalRefreshing, 
    onRefresh: externalOnRefresh, 
    folderFilter 
}) => {
    const [memories, setMemories] = useState(externalMemories || []);
    const [loading, setLoading] = useState(!externalMemories);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all'); // all, image, video, audio, document
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name
    const [viewMode, setViewMode] = useState('grid'); // grid, list
    const [showRobSuggestion, setShowRobSuggestion] = useState(true);

    // Filter and sort memories
    const filteredMemories = useMemo(() => {
        let filtered = memories;

        // Apply type filter
        if (filter !== 'all') {
            filtered = filtered.filter(memory => memory.type === filter);
        }

        // Apply sorting
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.createdAt?.seconds * 1000) - new Date(b.createdAt?.seconds * 1000);
                case 'name':
                    return (a.fileName || '').localeCompare(b.fileName || '');
                case 'newest':
                default:
                    return new Date(b.createdAt?.seconds * 1000) - new Date(a.createdAt?.seconds * 1000);
            }
        });

        return filtered;
    }, [memories, filter, sortBy]);

    const fetchMemories = async () => {
        if (!user?.uid) return;

        try {
            // Use user's personal collection for fast access
            const userMemoriesRef = collection(db, `users/${user.uid}/memories`);
            const q = query(
                userMemoriesRef,
                orderBy('createdAt', 'desc'),
                limit(100) // Limit for performance
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamp to readable date
                displayDate: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'
            }));

            setMemories(items);
            setLoading(false);
        } catch (error) {
            console.error('Error loading memories:', error);
            Alert.alert('Error', 'Failed to load memories');
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        if (externalOnRefresh) {
            externalOnRefresh();
        } else {
            setRefreshing(true);
            await fetchMemories();
            setRefreshing(false);
        }
    };

    const handleDeleteMemory = async (memory) => {
        Alert.alert(
            'Delete Memory',
            `Are you sure you want to delete "${memory.fileName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete from Firebase Storage
                            if (memory.filePath) {
                                const storageRef = ref(storage, memory.filePath);
                                await deleteObject(storageRef);
                            }

                            // Delete from user's collection
                            const userMemoryRef = doc(db, `users/${user.uid}/memories`, memory.id);
                            await deleteDoc(userMemoryRef);

                            // Delete from global collection (find by memoryId)
                            // Note: In production, you might want to use a cloud function for this

                            // Update local state
                            setMemories(prev => prev.filter(m => m.id !== memory.id));

                            Alert.alert('Success', 'Memory deleted successfully');
                        } catch (error) {
                            console.error('Error deleting memory:', error);
                            Alert.alert('Error', 'Failed to delete memory');
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        if (externalMemories) {
            setMemories(externalMemories);
            setLoading(false);
        } else {
            fetchMemories();
        }
    }, [user?.uid, refreshTrigger, externalMemories]);

    const renderFilterButton = (filterType, label, icon) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                filter === filterType && styles.filterButtonActive
            ]}
            onPress={() => setFilter(filterType)}
        >
            <Ionicons
                name={icon}
                size={16}
                color={filter === filterType ? '#007AFF' : '#666'}
            />
            <Text style={[
                styles.filterButtonText,
                filter === filterType && styles.filterButtonTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderGridItem = ({ item }) => (
        <TouchableOpacity
            style={styles.gridItem}
            onLongPress={() => handleDeleteMemory(item)}
        >
            {item.type === 'image' ? (
                <Image
                    source={{ uri: item.fileUrl }}
                    style={styles.gridImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.fileIconContainer}>
                    <Ionicons
                        name={
                            item.type === 'video' ? 'videocam' :
                                item.type === 'audio' ? 'musical-notes' :
                                    item.type === 'document' ? 'document' :
                                        'folder'
                        }
                        size={40}
                        color="#666"
                    />
                </View>
            )}

            <View style={styles.gridItemInfo}>
                <Text style={styles.gridItemTitle} numberOfLines={1}>
                    {item.fileName || 'Untitled'}
                </Text>
                <Text style={styles.gridItemDate}>
                    {item.displayDate}
                </Text>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {item.tags.slice(0, 2).map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                        {item.tags.length > 2 && (
                            <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderListItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listItem}
            onLongPress={() => handleDeleteMemory(item)}
        >
            {item.type === 'image' ? (
                <Image
                    source={{ uri: item.fileUrl }}
                    style={styles.listImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.listIconContainer}>
                    <Ionicons
                        name={
                            item.type === 'video' ? 'videocam' :
                                item.type === 'audio' ? 'musical-notes' :
                                    item.type === 'document' ? 'document' :
                                        'folder'
                        }
                        size={24}
                        color="#666"
                    />
                </View>
            )}

            <View style={styles.listItemInfo}>
                <Text style={styles.listItemTitle}>
                    {item.fileName || 'Untitled'}
                </Text>

                {item.description && (
                    <Text style={styles.listItemDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.listItemMeta}>
                    <Text style={styles.listItemDate}>{item.displayDate}</Text>
                    <Text style={styles.listItemType}>{item.type}</Text>
                    {item.fileSize && (
                        <Text style={styles.listItemSize}>
                            {(item.fileSize / 1024 / 1024).toFixed(1)} MB
                        </Text>
                    )}
                </View>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {item.tags.slice(0, 3).map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                        {item.tags.length > 3 && (
                            <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const handleRobSuggestionAction = (suggestion) => {
        // Handle Rob AI suggestion actions
        console.log('Rob suggestion action taken:', suggestion);
        // In a real implementation, this would trigger navigation or actions
        // based on the suggestion type
    };

    const getEmptyStateMessage = () => {
        if (filter === 'all') {
            return 'No memories yet. Start uploading to see them here!';
        }
        return `No ${filter} files found. Try a different filter or upload some ${filter} files.`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading your memories...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Memories</Text>
                <Text style={styles.headerSubtitle}>
                    {filteredMemories.length} {filter === 'all' ? 'total' : filter} memories
                </Text>
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {renderFilterButton('all', 'All', 'grid')}
                {renderFilterButton('image', 'Photos', 'image')}
                {renderFilterButton('video', 'Videos', 'videocam')}
                {renderFilterButton('audio', 'Audio', 'musical-notes')}
                {renderFilterButton('document', 'Docs', 'document')}
            </ScrollView>

            {/* Sort and View Controls */}
            <View style={styles.controlsContainer}>
                <View style={styles.sortContainer}>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'newest' && styles.sortButtonActive]}
                        onPress={() => setSortBy('newest')}
                    >
                        <Text style={[styles.sortButtonText, sortBy === 'newest' && styles.sortButtonTextActive]}>
                            Newest
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'oldest' && styles.sortButtonActive]}
                        onPress={() => setSortBy('oldest')}
                    >
                        <Text style={[styles.sortButtonText, sortBy === 'oldest' && styles.sortButtonTextActive]}>
                            Oldest
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
                        onPress={() => setSortBy('name')}
                    >
                        <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
                            Name
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
                        onPress={() => setViewMode('grid')}
                    >
                        <Ionicons name="grid" size={16} color={viewMode === 'grid' ? '#007AFF' : '#666'} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
                        onPress={() => setViewMode('list')}
                    >
                        <Ionicons name="list" size={16} color={viewMode === 'list' ? '#007AFF' : '#666'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Rob AI Suggestions */}
            {showRobSuggestion && memories.length > 0 && (
                <RobSuggestCard
                    user={user}
                    onActionTaken={handleRobSuggestionAction}
                />
            )}

            {/* Memories List */}
            {filteredMemories.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="folder-open" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>No Memories Found</Text>
                    <Text style={styles.emptyMessage}>{getEmptyStateMessage()}</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredMemories}
                    keyExtractor={(item) => item.id}
                    renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    key={viewMode} // Force re-render when switching view modes
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={externalRefreshing !== undefined ? externalRefreshing : refreshing}
                            onRefresh={handleRefresh}
                            colors={['#007AFF']}
                            tintColor="#007AFF"
                        />
                    }
                />
            )}
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
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333'
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2
    },
    filtersContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    filtersContent: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 10
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 10
    },
    filterButtonActive: {
        backgroundColor: '#e3f2fd'
    },
    filterButtonText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
        fontWeight: '500'
    },
    filterButtonTextActive: {
        color: '#007AFF'
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    sortContainer: {
        flexDirection: 'row',
        gap: 8
    },
    sortButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#f0f0f0'
    },
    sortButtonActive: {
        backgroundColor: '#e3f2fd'
    },
    sortButtonText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500'
    },
    sortButtonTextActive: {
        color: '#007AFF'
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 2
    },
    viewButton: {
        padding: 8,
        borderRadius: 6
    },
    viewButtonActive: {
        backgroundColor: 'white'
    },
    listContent: {
        padding: 10
    },
    // Grid View Styles
    gridItem: {
        width: ITEM_WIDTH,
        backgroundColor: 'white',
        borderRadius: 12,
        margin: 5,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    gridImage: {
        width: '100%',
        height: ITEM_WIDTH,
        backgroundColor: '#f0f0f0'
    },
    fileIconContainer: {
        width: '100%',
        height: ITEM_WIDTH,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center'
    },
    gridItemInfo: {
        padding: 10
    },
    gridItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2
    },
    gridItemDate: {
        fontSize: 12,
        color: '#666'
    },
    // List View Styles
    listItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        margin: 5,
        padding: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1
    },
    listImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0'
    },
    listIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center'
    },
    listItemInfo: {
        flex: 1,
        marginLeft: 12
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4
    },
    listItemDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6
    },
    listItemMeta: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 6
    },
    listItemDate: {
        fontSize: 12,
        color: '#666'
    },
    listItemType: {
        fontSize: 12,
        color: '#007AFF',
        textTransform: 'capitalize'
    },
    listItemSize: {
        fontSize: 12,
        color: '#666'
    },
    // Tags
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 4
    },
    tag: {
        backgroundColor: '#e3f2fd',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2
    },
    tagText: {
        fontSize: 10,
        color: '#007AFF',
        fontWeight: '500'
    },
    moreTagsText: {
        fontSize: 10,
        color: '#666',
        fontStyle: 'italic'
    },
    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
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
        lineHeight: 22
    }
});

export default MemoriesFeed;
