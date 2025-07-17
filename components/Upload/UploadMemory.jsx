import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    ScrollView,
    TextInput,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    uploadBytesResumable
} from 'firebase/storage';
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc
} from 'firebase/firestore';
import { storage, db } from '../../config/firebase';
import useFolders from '../../hooks/useFolders';
import FolderGrid from '../FolderGrid';
import CreateFolderModal from '../CreateFolderModal';

const UploadMemory = ({ user, folderId, onUploadComplete, onClose }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [hasPermissions, setHasPermissions] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showFolderSelector, setShowFolderSelector] = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    
    const { folders, loading: foldersLoading, createFolder } = useFolders(user);

    useEffect(() => {
        requestPermissions();
        // Set initial folder if provided
        if (folderId) {
            setSelectedFolder({ id: folderId, name: 'Selected Folder' });
        }
    }, [folderId]);

    const requestPermissions = async () => {
        try {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const { status: audioStatus } = await Audio.requestPermissionsAsync();

            setHasPermissions(
                cameraStatus === 'granted' &&
                libraryStatus === 'granted' &&
                audioStatus === 'granted'
            );
        } catch (error) {
            console.error('Permission request error:', error);
        }
    };

    const generateStoragePath = (userId, type, filename) => {
        const timestamp = Date.now();
        const extension = filename.split('.').pop() || 'file';
        return `users/${userId}/memories/${type}/${timestamp}.${extension}`;
    };

    const getFileType = (uri, mimeType) => {
        if (mimeType) {
            if (mimeType.startsWith('image/')) return 'image';
            if (mimeType.startsWith('video/')) return 'video';
            if (mimeType.startsWith('audio/')) return 'audio';
            if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
        }

        // Fallback to extension-based detection
        const extension = uri.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
        if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return 'video';
        if (['mp3', 'wav', 'aac', 'm4a'].includes(extension)) return 'audio';
        if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) return 'document';

        return 'file';
    };

    const uploadFile = async (fileUri, fileName, mimeType) => {
        if (!user?.uid) throw new Error('User not authenticated');

        const fileType = getFileType(fileUri, mimeType);
        const storagePath = generateStoragePath(user.uid, fileType, fileName);

        try {
            let blob;
            if (Platform.OS === 'web') {
                const response = await fetch(fileUri);
                blob = await response.blob();
            } else {
                const response = await fetch(fileUri);
                blob = await response.blob();
            }

            const storageRef = ref(storage, storagePath);

            // Use resumable upload for progress tracking
            const uploadTask = uploadBytesResumable(storageRef, blob);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(progress);
                    },
                    (error) => {
                        console.error('Upload error:', error);
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve({
                                url: downloadURL,
                                path: storagePath,
                                type: fileType,
                                fileName: fileName,
                                size: uploadTask.snapshot.totalBytes
                            });
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    };

    const saveMemoryToFirestore = async (fileData) => {
        try {
            const memoryData = {
                userId: user.uid,
                userName: user.displayName || user.email || 'Anonymous',
                userEmail: user.email,
                fileUrl: fileData.url,
                fileName: fileData.fileName,
                filePath: fileData.path,
                fileSize: fileData.size,
                type: fileData.type,
                description: description.trim(),
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
                folderId: selectedFolder?.id || folderId || null,
                folderName: selectedFolder?.name || (folderId ? 'Selected Folder' : 'General'),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isPrivate: true,
                location: null,
                metadata: {
                    platform: Platform.OS,
                    appVersion: '1.0.0',
                    uploadMethod: 'manual'
                }
            };

            // Save to user's memories collection
            const userMemoriesRef = collection(db, `users/${user.uid}/memories`);
            const docRef = await addDoc(userMemoriesRef, memoryData);

            // Also save to global memories collection for admin visibility
            const globalMemoryData = {
                ...memoryData,
                memoryId: docRef.id,
                userMemoryPath: `users/${user.uid}/memories/${docRef.id}`
            };

            await addDoc(collection(db, 'memories'), globalMemoryData);

            return docRef.id;
        } catch (error) {
            console.error('Firestore save error:', error);
            throw error;
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            Alert.alert('No Files', 'Please select files to upload');
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const uploadPromises = selectedFiles.map(async (file) => {
                const fileData = await uploadFile(file.uri, file.name, file.mimeType);
                const memoryId = await saveMemoryToFirestore(fileData);
                return { ...fileData, memoryId };
            });

            const results = await Promise.all(uploadPromises);

            Alert.alert(
                'Upload Successful!',
                `${results.length} file(s) uploaded successfully`,
                [{
                    text: 'OK', onPress: () => {
                        onUploadComplete?.(results);
                        resetForm();
                    }
                }]
            );
        } catch (error) {
            console.error('Upload process error:', error);
            Alert.alert('Upload Failed', error.message || 'Failed to upload files');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const resetForm = () => {
        setSelectedFiles([]);
        setDescription('');
        setTags('');
        setUploadProgress(0);
    };

    const pickImageFromLibrary = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                quality: 0.8,
                allowsEditing: false
            });

            if (!result.canceled && result.assets) {
                const newFiles = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.fileName || `image_${Date.now()}.jpg`,
                    mimeType: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
                    type: asset.type || 'image'
                }));
                setSelectedFiles(prev => [...prev, ...newFiles]);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    const takePhotoWithCamera = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                quality: 0.8,
                allowsEditing: true
            });

            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                const newFile = {
                    uri: asset.uri,
                    name: `camera_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    type: 'image'
                };
                setSelectedFiles(prev => [...prev, newFile]);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true,
                copyToCacheDirectory: true
            });

            if (result.type !== 'cancel' && result.assets) {
                const newFiles = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.name,
                    mimeType: asset.mimeType,
                    type: 'document'
                }));
                setSelectedFiles(prev => [...prev, ...newFiles]);
            }
        } catch (error) {
            console.error('Document picker error:', error);
            Alert.alert('Error', 'Failed to pick documents');
        }
    };

    const startRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Audio recording permission is required');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
        } catch (error) {
            console.error('Recording start error:', error);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            setIsRecording(false);
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            const newFile = {
                uri,
                name: `recording_${Date.now()}.m4a`,
                mimeType: 'audio/m4a',
                type: 'audio'
            };

            setSelectedFiles(prev => [...prev, newFile]);
            setRecording(null);
        } catch (error) {
            console.error('Recording stop error:', error);
            Alert.alert('Error', 'Failed to stop recording');
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const renderFilePreview = (file, index) => (
        <View key={index} style={styles.filePreview}>
            {file.type === 'image' && (
                <Image source={{ uri: file.uri }} style={styles.previewImage} />
            )}
            {file.type !== 'image' && (
                <View style={styles.fileIcon}>
                    <Ionicons
                        name={
                            file.type === 'video' ? 'videocam' :
                                file.type === 'audio' ? 'musical-notes' :
                                    'document'
                        }
                        size={40}
                        color="#666"
                    />
                </View>
            )}
            <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFile(index)}
            >
                <Ionicons name="close-circle" size={20} color="#ff3b30" />
            </TouchableOpacity>
        </View>
    );

    if (!hasPermissions) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="warning" size={50} color="#ff9500" />
                <Text style={styles.permissionText}>
                    Camera and media permissions are required to upload memories
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
                    <Text style={styles.permissionButtonText}>Grant Permissions</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Upload Memory</Text>
                {onClose && (
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Upload Options */}
            <View style={styles.uploadOptions}>
                <TouchableOpacity style={styles.uploadButton} onPress={takePhotoWithCamera}>
                    <Ionicons name="camera" size={24} color="#007AFF" />
                    <Text style={styles.uploadButtonText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadButton} onPress={pickImageFromLibrary}>
                    <Ionicons name="images" size={24} color="#007AFF" />
                    <Text style={styles.uploadButtonText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                    <Ionicons name="document" size={24} color="#007AFF" />
                    <Text style={styles.uploadButtonText}>Document</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.uploadButton, isRecording && styles.recordingButton]}
                    onPress={isRecording ? stopRecording : startRecording}
                >
                    <Ionicons
                        name={isRecording ? "stop" : "mic"}
                        size={24}
                        color={isRecording ? "#ff3b30" : "#007AFF"}
                    />
                    <Text style={[styles.uploadButtonText, isRecording && { color: '#ff3b30' }]}>
                        {isRecording ? 'Stop' : 'Record'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Folder Selection */}
            <View style={styles.folderContainer}>
                <Text style={styles.sectionTitle}>Select Folder (Optional)</Text>
                <TouchableOpacity 
                    style={styles.folderSelector}
                    onPress={() => setShowFolderSelector(true)}
                >
                    <View style={styles.folderSelectorContent}>
                        {selectedFolder ? (
                            <>
                                <View style={[styles.folderIcon, { backgroundColor: selectedFolder.color || '#007AFF' }]}>
                                    <Ionicons name="folder" size={16} color="white" />
                                </View>
                                <Text style={styles.folderSelectorText}>{selectedFolder.name}</Text>
                                <TouchableOpacity 
                                    style={styles.clearFolderButton}
                                    onPress={() => setSelectedFolder(null)}
                                >
                                    <Ionicons name="close-circle" size={20} color="#ff3b30" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Ionicons name="folder-outline" size={20} color="#666" />
                                <Text style={styles.folderSelectorPlaceholder}>Choose folder...</Text>
                            </>
                        )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
            </View>

            {/* File Previews */}
            {selectedFiles.length > 0 && (
                <View style={styles.previewContainer}>
                    <Text style={styles.sectionTitle}>Selected Files ({selectedFiles.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedFiles.map(renderFilePreview)}
                    </ScrollView>
                </View>
            )}

            {/* Description and Tags */}
            <View style={styles.formContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.textInput}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add a description for your memory..."
                    multiline
                    numberOfLines={3}
                />

                <Text style={styles.label}>Tags (comma separated)</Text>
                <TextInput
                    style={styles.textInput}
                    value={tags}
                    onChangeText={setTags}
                    placeholder="family, vacation, birthday..."
                />
            </View>

            {/* Upload Progress */}
            {isUploading && (
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Uploading... {Math.round(uploadProgress)}%</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                    </View>
                </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
                style={[styles.uploadSubmitButton, isUploading && styles.uploadSubmitButtonDisabled]}
                onPress={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
            >
                {isUploading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <Ionicons name="cloud-upload" size={20} color="white" />
                        <Text style={styles.uploadSubmitButtonText}>
                            Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : 'Memory'}
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Folder Selector Modal */}
            {showFolderSelector && (
                <View style={styles.modalOverlay}>
                    <View style={styles.folderModal}>
                        <View style={styles.folderModalHeader}>
                            <Text style={styles.folderModalTitle}>Select Folder</Text>
                            <TouchableOpacity onPress={() => setShowFolderSelector(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.folderModalContent}>
                            <TouchableOpacity 
                                style={styles.createFolderButton}
                                onPress={() => {
                                    setShowFolderSelector(false);
                                    setShowCreateFolder(true);
                                }}
                            >
                                <Ionicons name="add" size={20} color="#007AFF" />
                                <Text style={styles.createFolderButtonText}>Create New Folder</Text>
                            </TouchableOpacity>
                            
                            <FolderGrid
                                user={user}
                                onFolderSelect={(folder) => {
                                    setSelectedFolder(folder);
                                    setShowFolderSelector(false);
                                }}
                            />
                        </View>
                    </View>
                </View>
            )}

            {/* Create Folder Modal */}
            <CreateFolderModal
                visible={showCreateFolder}
                onClose={() => setShowCreateFolder(false)}
                user={user}
            />
        </ScrollView>
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
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333'
    },
    uploadOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: 'white',
        marginTop: 10
    },
    uploadButton: {
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        minWidth: 70
    },
    recordingButton: {
        backgroundColor: '#ffe6e6'
    },
    uploadButtonText: {
        marginTop: 5,
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '500'
    },
    previewContainer: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 12
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10
    },
    filePreview: {
        marginRight: 10,
        alignItems: 'center',
        position: 'relative',
        width: 80
    },
    previewImage: {
        width: 70,
        height: 70,
        borderRadius: 8
    },
    fileIcon: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    fileName: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        textAlign: 'center'
    },
    removeButton: {
        position: 'absolute',
        top: -5,
        right: -5
    },
    formContainer: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 12
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
        marginTop: 10
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fafafa'
    },
    progressContainer: {
        margin: 10,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 12
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center'
    },
    progressBar: {
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF'
    },
    uploadSubmitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        margin: 10,
        padding: 15,
        borderRadius: 12,
        gap: 8
    },
    uploadSubmitButtonDisabled: {
        backgroundColor: '#ccc'
    },
    uploadSubmitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    permissionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginVertical: 20
    },
    permissionButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    folderContainer: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 12
    },
    folderSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fafafa'
    },
    folderSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    folderIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    folderSelectorText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        flex: 1
    },
    folderSelectorPlaceholder: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10
    },
    clearFolderButton: {
        marginLeft: 10
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    folderModal: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '90%',
        maxHeight: '80%',
        overflow: 'hidden'
    },
    folderModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    folderModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
    },
    folderModalContent: {
        flex: 1,
        padding: 10
    },
    createFolderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: '#f0f8ff',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderStyle: 'dashed'
    },
    createFolderButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8
    }
});

export default UploadMemory;
