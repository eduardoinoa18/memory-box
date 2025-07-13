import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const FOLDER_COLORS = [
    '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE',
    '#FF2D92', '#5AC8FA', '#FFCC00', '#FF6B6B', '#4ECDC4'
];

const CreateFolderModal = ({ visible, onClose, user }) => {
    const [folderName, setFolderName] = useState('');
    const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!folderName.trim()) {
            Alert.alert('Error', 'Please enter a folder name');
            return;
        }

        if (!user?.uid) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        try {
            setIsCreating(true);
            
            const folderData = {
                userId: user.uid,
                name: folderName.trim(),
                createdAt: serverTimestamp(),
                color: selectedColor,
                thumbnailUrl: null,
                memoryCount: 0,
                description: '',
                isPrivate: true
            };

            await addDoc(collection(db, 'folders'), folderData);
            
            Alert.alert('Success', 'Folder created successfully!');
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error creating folder:', error);
            Alert.alert('Error', 'Failed to create folder');
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setFolderName('');
        setSelectedColor(FOLDER_COLORS[0]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Folder</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.label}>Folder Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={folderName}
                            onChangeText={setFolderName}
                            placeholder="Enter folder name..."
                            placeholderTextColor="#999"
                            maxLength={50}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Choose Color</Text>
                        <View style={styles.colorGrid}>
                            {FOLDER_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColor
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                >
                                    {selectedColor === color && (
                                        <Ionicons name="checkmark" size={20} color="white" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.previewContainer}>
                            <Text style={styles.previewLabel}>Preview</Text>
                            <View style={[styles.folderPreview, { backgroundColor: selectedColor }]}>
                                <Ionicons name="folder" size={32} color="white" />
                                <Text style={styles.previewText}>
                                    {folderName.trim() || 'Folder Name'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.createButton, isCreating && styles.createButtonDisabled]}
                        onPress={handleCreate}
                        disabled={isCreating || !folderName.trim()}
                    >
                        {isCreating ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="add" size={20} color="white" />
                                <Text style={styles.createButtonText}>Create Folder</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
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
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
    },
    content: {
        flex: 1,
        padding: 20
    },
    section: {
        marginBottom: 25
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        backgroundColor: 'white'
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12
    },
    colorOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#333'
    },
    previewContainer: {
        alignItems: 'center'
    },
    previewLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10
    },
    folderPreview: {
        width: 120,
        height: 120,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    previewText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 5,
        textAlign: 'center'
    },
    footer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0'
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 12,
        gap: 8
    },
    createButtonDisabled: {
        backgroundColor: '#ccc'
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    }
});

export default CreateFolderModal;
