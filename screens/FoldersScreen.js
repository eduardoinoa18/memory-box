import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FolderGrid from '../components/FolderGrid';
import CreateFolderModal from '../components/CreateFolderModal';
import useFolders from '../hooks/useFolders';

const FoldersScreen = ({ user, navigation }) => {
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { folders, loading } = useFolders(user);

    const handleCreateFolder = () => {
        setShowCreateFolder(true);
    };

    const handleFolderSelect = (folder) => {
        // Navigate directly to folder view
        navigation?.navigate('FolderView', { folder });
    };

    const handleFolderLongPress = (folder) => {
        // Show folder options on long press
        Alert.alert(
            folder.name,
            `${folder.memoryCount} memories in this folder`,
            [
                {
                    text: 'View Memories',
                    onPress: () => navigation?.navigate('FolderView', { folder })
                },
                {
                    text: 'Add Memory',
                    onPress: () => navigation?.navigate('Upload', { folderId: folder.id })
                },
                {
                    text: 'Edit Folder',
                    onPress: () => {
                        // TODO: Add edit folder functionality
                        Alert.alert('Coming Soon', 'Edit folder functionality coming soon!');
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Folders</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleRefresh}>
                        <Ionicons name="refresh" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton} onPress={handleCreateFolder}>
                        <Ionicons name="add" size={24} color="#007AFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Folders Grid */}
            <View style={styles.content}>
                <FolderGrid
                    user={user}
                    onFolderSelect={handleFolderSelect}
                    onFolderLongPress={handleFolderLongPress}
                    refreshTrigger={refreshTrigger}
                    showActions={true}
                />
            </View>

            {/* Create Folder Modal */}
            <CreateFolderModal
                visible={showCreateFolder}
                onClose={() => setShowCreateFolder(false)}
                user={user}
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
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333'
    },
    headerActions: {
        flexDirection: 'row',
        gap: 10
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        flex: 1
    }
});

export default FoldersScreen;
