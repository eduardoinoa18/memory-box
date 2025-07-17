import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MemoryGrid from '../components/MemoryGrid';
import UploadModal from '../components/UploadModal';

const FolderViewScreen = ({ route, navigation, user }) => {
    const { folder } = route.params;
    const [showUploadModal, setShowUploadModal] = useState(false);

    const handleAddMemory = () => {
        setShowUploadModal(true);
    };

    const handleMemoryUploaded = () => {
        setShowUploadModal(false);
    };

    useEffect(() => {
        // MemoryGrid handles its own data fetching
    }, [user?.uid, folder?.id]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                
                <View style={styles.folderInfo}>
                    <View style={[styles.folderIcon, { backgroundColor: folder?.color || '#007AFF' }]}>
                        <Ionicons name="folder" size={20} color="white" />
                    </View>
                    <View>
                        <Text style={styles.folderName}>{folder?.name || 'Folder'}</Text>
                        <Text style={styles.memoryCount}>
                            {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={handleAddMemory}
                >
                    <Ionicons name="add" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* Memories List */}
            <View style={styles.content}>
                <MemoryGrid
                    folderId={folder.id}
                    searchQuery=""
                    filterType="all"
                    sortBy="date"
                />
            </View>

            {/* Upload Modal */}
            <UploadModal
                visible={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                user={user}
                folderId={folder?.id}
                onUploadComplete={handleMemoryUploaded}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    folderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 15
    },
    folderIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    folderName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
    },
    memoryCount: {
        fontSize: 14,
        color: '#666',
        marginTop: 2
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10
    },
    emptyMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30
    },
    addMemoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        gap: 8
    },
    addMemoryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    }
});

export default FolderViewScreen;
