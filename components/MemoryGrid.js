import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    Animated,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MemoryViewer from './MemoryViewer';
import { useMemories } from '../hooks/useMemories';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 3; // 3 columns with 16px margins

const MemoryGrid = ({ folderId, searchQuery, filterType, sortBy = 'date' }) => {
    const { memories, loading, refreshing, refresh, deleteMemory, updateMemory } = useMemories(folderId);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [filteredMemories, setFilteredMemories] = useState([]);
    
    // Animation references
    const fadeInAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Filter and sort memories
        let filtered = memories || [];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(memory => 
                (memory.fileName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (memory.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (memory.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
            );
        }

        // Apply type filter
        if (filterType && filterType !== 'all') {
            filtered = filtered.filter(memory => memory.type === filterType);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.fileName || '').localeCompare(b.fileName || '');
                case 'size':
                    return (b.fileSize || 0) - (a.fileSize || 0);
                case 'type':
                    return (a.type || '').localeCompare(b.type || '');
                case 'date':
                default:
                    const aTime = a.createdAt?.toDate?.() || new Date(0);
                    const bTime = b.createdAt?.toDate?.() || new Date(0);
                    return bTime - aTime;
            }
        });

        setFilteredMemories(filtered);

        // Animate entrance
        if (filtered.length > 0) {
            Animated.parallel([
                Animated.timing(fadeInAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(slideUpAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [memories, searchQuery, filterType, sortBy]);

    const handleMemoryPress = (memory) => {
        setSelectedMemory(memory);
        setViewerVisible(true);
    };

    const handleCloseViewer = () => {
        setViewerVisible(false);
        setTimeout(() => setSelectedMemory(null), 300);
    };

    const handleDeleteMemory = async (memory) => {
        try {
            await deleteMemory(memory.id);
            Alert.alert('Success', 'Memory deleted successfully');
        } catch (error) {
            console.error('Delete memory error:', error);
            Alert.alert('Error', 'Failed to delete memory');
        }
    };

    const handleFavoriteMemory = async (memory, isFavorited) => {
        try {
            await updateMemory(memory.id, { isFavorited });
        } catch (error) {
            console.error('Favorite memory error:', error);
            Alert.alert('Error', 'Failed to update memory');
        }
    };

    const handleShareMemory = (memory) => {
        // Analytics or callback for sharing
        console.log('Memory shared:', memory.fileName);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'image':
                return 'image';
            case 'video':
                return 'videocam';
            case 'audio':
                return 'musical-note';
            case 'document':
                return 'document-text';
            default:
                return 'folder';
        }
    };

    const MemoryItem = ({ item, index }) => {
        const itemAnim = useRef(new Animated.Value(0)).current;
        const scaleAnim = useRef(new Animated.Value(1)).current;

        useEffect(() => {
            // Staggered entrance animation
            Animated.timing(itemAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 50,
                useNativeDriver: true,
            }).start();
        }, []);

        const handlePressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }).start();
        };

        const renderThumbnail = () => {
            if (item.type === 'image' && item.thumbnailUrl) {
                return (
                    <Image
                        source={{ uri: item.thumbnailUrl }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                );
            }

            return (
                <View style={[styles.thumbnail, styles.iconThumbnail]}>
                    <Ionicons 
                        name={getFileIcon(item.type)} 
                        size={40} 
                        color="#007AFF" 
                    />
                </View>
            );
        };

        return (
            <Animated.View
                style={[
                    styles.memoryItem,
                    {
                        opacity: itemAnim,
                        transform: [
                            { scale: scaleAnim },
                            {
                                translateY: itemAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                })
                            }
                        ]
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.memoryTouchable}
                    onPress={() => handleMemoryPress(item)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                >
                    <View style={styles.thumbnailContainer}>
                        {renderThumbnail()}
                        
                        {/* Favorite indicator */}
                        {item.isFavorited && (
                            <View style={styles.favoriteIndicator}>
                                <Ionicons name="heart" size={16} color="#ff4757" />
                            </View>
                        )}

                        {/* File type badge */}
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>
                                {item.type?.toUpperCase()}
                            </Text>
                        </View>

                        {/* Duration for videos/audio */}
                        {(item.type === 'video' || item.type === 'audio') && item.duration && (
                            <View style={styles.durationBadge}>
                                <Text style={styles.durationText}>
                                    {Math.floor(item.duration / 60)}:{String(Math.floor(item.duration % 60)).padStart(2, '0')}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.memoryInfo}>
                        <Text style={styles.memoryTitle} numberOfLines={1}>
                            {item.fileName || 'Untitled'}
                        </Text>
                        <Text style={styles.memoryDate}>
                            {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </Text>
                        {item.fileSize && (
                            <Text style={styles.memorySize}>
                                {formatFileSize(item.fileSize)}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No memories found</Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try a different search term' : 'Upload your first memory to get started'}
            </Text>
        </View>
    );

    const LoadingGrid = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading memories...</Text>
        </View>
    );

    if (loading && !refreshing) {
        return <LoadingGrid />;
    }

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.gridContainer,
                    {
                        opacity: fadeInAnim,
                        transform: [{ translateY: slideUpAnim }]
                    }
                ]}
            >
                <FlatList
                    data={filteredMemories}
                    renderItem={({ item, index }) => <MemoryItem item={item} index={index} />}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    numColumns={3}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            tintColor="#007AFF"
                            title="Pull to refresh"
                        />
                    }
                    ListEmptyComponent={<EmptyState />}
                    getItemLayout={(data, index) => ({
                        length: ITEM_SIZE + 24, // item height + margin
                        offset: (ITEM_SIZE + 24) * Math.floor(index / 3),
                        index,
                    })}
                    removeClippedSubviews={true}
                    initialNumToRender={15}
                    maxToRenderPerBatch={9}
                    windowSize={10}
                />
            </Animated.View>

            {/* Memory Viewer Modal */}
            <MemoryViewer
                visible={viewerVisible}
                memory={selectedMemory}
                onClose={handleCloseViewer}
                onDelete={handleDeleteMemory}
                onShare={handleShareMemory}
                onFavorite={handleFavoriteMemory}
            />

            {/* Stats footer */}
            {filteredMemories.length > 0 && (
                <View style={styles.statsFooter}>
                    <Text style={styles.statsText}>
                        {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'}
                        {searchQuery && ` matching "${searchQuery}"`}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    gridContainer: {
        flex: 1
    },
    listContent: {
        padding: 16,
        paddingBottom: 80 // Extra space for stats footer
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16
    },
    memoryItem: {
        width: ITEM_SIZE,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5
    },
    memoryTouchable: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden'
    },
    thumbnailContainer: {
        position: 'relative',
        height: ITEM_SIZE * 0.75,
        backgroundColor: '#f0f0f0'
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
    },
    iconThumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
    },
    favoriteIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 12,
        padding: 4
    },
    typeBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2
    },
    typeBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600'
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2
    },
    durationText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '500'
    },
    memoryInfo: {
        padding: 12
    },
    memoryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4
    },
    memoryDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2
    },
    memorySize: {
        fontSize: 11,
        color: '#999'
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 40
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12
    },
    statsFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderTopWidth: 1,
        borderTopColor: '#e1e5e9',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center'
    },
    statsText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500'
    }
});

export default MemoryGrid;
