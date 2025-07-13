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
    Platform,
    Dimensions,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
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
    getDocs,
    query,
    where,
    orderBy,
    limit
} from 'firebase/firestore';
import { storage, db } from '../../config/firebase';
import useFolders from '../../hooks/useFolders';
import FolderGrid from '../FolderGrid';
import CreateFolderModal from '../CreateFolderModal';

const { width, height } = Dimensions.get('window');

const SmartUploadSystem = ({ user, folderId, onUploadComplete, onClose }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showFolderSelector, setShowFolderSelector] = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [compressionLevel, setCompressionLevel] = useState(0.8);
    const [autoFolder, setAutoFolder] = useState(null);
    
    const { folders, loading: foldersLoading, createFolder } = useFolders(user);
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        requestPermissions();
        if (folderId) {
            const folder = folders.find(f => f.id === folderId);
            setSelectedFolder(folder || { id: folderId, name: 'Selected Folder' });
        } else {
            suggestSmartFolder();
        }
        
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [folderId, folders]);

    const requestPermissions = async () => {
        try {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const { status: audioStatus } = await Audio.requestPermissionsAsync();
        } catch (error) {
            console.error('Permission request error:', error);
        }
    };

    // AI-powered smart folder suggestion
    const suggestSmartFolder = async () => {
        try {
            // Analyze recent uploads to suggest folder
            const recentMemoriesQuery = query(
                collection(db, `users/${user.uid}/memories`),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            
            const recentSnapshot = await getDocs(recentMemoriesQuery);
            const recentMemories = recentSnapshot.docs.map(doc => doc.data());
            
            // Simple AI logic: suggest most frequently used folder
            const folderCounts = {};
            recentMemories.forEach(memory => {
                if (memory.folderId) {
                    folderCounts[memory.folderId] = (folderCounts[memory.folderId] || 0) + 1;
                }
            });
            
            const mostUsedFolderId = Object.keys(folderCounts).reduce((a, b) => 
                folderCounts[a] > folderCounts[b] ? a : b, null
            );
            
            if (mostUsedFolderId) {
                const suggestedFolder = folders.find(f => f.id === mostUsedFolderId);
                if (suggestedFolder) {
                    setAutoFolder(suggestedFolder);
                    setAiSuggestions([
                        `🤖 Rob suggests: "${suggestedFolder.name}" folder`,
                        `Based on your recent uploads`
                    ]);
                }
            }
        } catch (error) {
            console.error('Error suggesting folder:', error);
        }
    };

    // Smart file type detection and validation
    const analyzeFile = async (fileUri, fileName, mimeType) => {
        const fileType = getFileType(fileUri, mimeType);
        const fileSize = await getFileSize(fileUri);
        
        // Check for duplicates
        await checkForDuplicates(fileName, fileSize);
        
        // Validate file type
        const supportedTypes = ['image', 'video', 'audio', 'document'];
        if (!supportedTypes.includes(fileType)) {
            Alert.alert(
                'Unsupported File Type',
                `${fileType} files are not currently supported. Supported types: photos, videos, audio, documents.`
            );
            return false;
        }
        
        // Check file size limits
        const maxSizes = {
            image: 50 * 1024 * 1024,  // 50MB
            video: 500 * 1024 * 1024, // 500MB
            audio: 100 * 1024 * 1024, // 100MB
            document: 50 * 1024 * 1024 // 50MB
        };
        
        if (fileSize > maxSizes[fileType]) {
            Alert.alert(
                'File Too Large',
                `${fileType} files must be under ${Math.round(maxSizes[fileType] / (1024 * 1024))}MB`
            );
            return false;
        }
        
        return { fileType, fileSize };
    };

    const checkForDuplicates = async (fileName, fileSize) => {
        try {
            const duplicateQuery = query(
                collection(db, `users/${user.uid}/memories`),
                where('fileName', '==', fileName),
                where('fileSize', '==', fileSize)
            );
            
            const duplicateSnapshot = await getDocs(duplicateQuery);
            if (!duplicateSnapshot.empty) {
                setDuplicateWarning({
                    fileName,
                    count: duplicateSnapshot.size
                });
            }
        } catch (error) {
            console.error('Error checking duplicates:', error);
        }
    };

    const getFileSize = async (uri) => {
        try {
            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                const blob = await response.blob();
                return blob.size;
            } else {
                // For React Native, we'll estimate or use file info
                return 0; // Would need native module for accurate size
            }
        } catch (error) {
            return 0;
        }
    };

    const getFileType = (uri, mimeType) => {
        if (mimeType) {
            if (mimeType.startsWith('image/')) return 'image';
            if (mimeType.startsWith('video/')) return 'video';
            if (mimeType.startsWith('audio/')) return 'audio';
            if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
        }

        const extension = uri.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(extension)) return 'image';
        if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension)) return 'video';
        if (['mp3', 'wav', 'aac', 'm4a', 'ogg'].includes(extension)) return 'audio';
        if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';

        return 'file';
    };

    // Enhanced image compression
    const compressImage = async (uri) => {
        try {
            const compressedImage = await ImagePicker.ImageManipulator.manipulateAsync(
                uri,
                [
                    { resize: { width: 1920 } }, // Max width for good quality
                ],
                {
                    compress: compressionLevel,
                    format: ImagePicker.ImageManipulator.SaveFormat.JPEG,
                }
            );
            return compressedImage.uri;
        } catch (error) {
            console.error('Image compression error:', error);
            return uri; // Return original if compression fails
        }
    };

    const pickFromCamera = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
                exif: true
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const analyzed = await analyzeFile(asset.uri, asset.fileName || 'camera_capture.jpg', asset.type);
                
                if (analyzed) {
                    let processedUri = asset.uri;
                    if (analyzed.fileType === 'image') {
                        processedUri = await compressImage(asset.uri);
                    }
                    
                    setSelectedFiles([{
                        ...asset,
                        uri: processedUri,
                        analyzed
                    }]);
                    
                    // AI suggestion for camera captures
                    setAiSuggestions([
                        '📸 Great shot!',
                        'Rob suggests adding a description to make this memory special'
                    ]);
                }
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const pickFromLibrary = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                quality: 1,
                exif: true
            });

            if (!result.canceled && result.assets) {
                const validFiles = [];
                
                for (const asset of result.assets) {
                    const analyzed = await analyzeFile(
                        asset.uri, 
                        asset.fileName || `library_${Date.now()}.jpg`, 
                        asset.type
                    );
                    
                    if (analyzed) {
                        let processedUri = asset.uri;
                        if (analyzed.fileType === 'image') {
                            processedUri = await compressImage(asset.uri);
                        }
                        
                        validFiles.push({
                            ...asset,
                            uri: processedUri,
                            analyzed
                        });
                    }
                }
                
                setSelectedFiles(validFiles);
                
                if (validFiles.length > 1) {
                    setAiSuggestions([
                        `📚 ${validFiles.length} files selected`,
                        'Rob suggests grouping these into an event'
                    ]);
                }
            }
        } catch (error) {
            console.error('Library error:', error);
            Alert.alert('Error', 'Failed to pick from library');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                multiple: true,
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets) {
                const validFiles = [];
                
                for (const asset of result.assets) {
                    const analyzed = await analyzeFile(asset.uri, asset.name, asset.mimeType);
                    
                    if (analyzed) {
                        validFiles.push({
                            ...asset,
                            analyzed
                        });
                    }
                }
                
                setSelectedFiles(validFiles);
                
                setAiSuggestions([
                    '📄 Document uploaded',
                    'Perfect for important family documents'
                ]);
            }
        } catch (error) {
            console.error('Document picker error:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const generateStoragePath = (userId, type, filename) => {
        const timestamp = Date.now();
        const extension = filename.split('.').pop() || 'file';
        return `users/${userId}/memories/${type}/${timestamp}.${extension}`;
    };

    const uploadFile = async (file) => {
        if (!user?.uid) throw new Error('User not authenticated');

        const fileType = file.analyzed.fileType;
        const storagePath = generateStoragePath(user.uid, fileType, file.fileName || file.name);

        try {
            const response = await fetch(file.uri);
            const blob = await response.blob();
            const storageRef = ref(storage, storagePath);
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
                                fileName: file.fileName || file.name,
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
                aiProcessed: true,
                metadata: {
                    platform: Platform.OS,
                    appVersion: '1.0.0',
                    uploadMethod: 'smart_upload',
                    compressed: fileData.type === 'image',
                    autoFolder: !!autoFolder
                }
            };

            const userMemoriesRef = collection(db, `users/${user.uid}/memories`);
            const docRef = await addDoc(userMemoriesRef, memoryData);

            // Global collection for admin
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

        if (!selectedFolder && !autoFolder) {
            Alert.alert('No Folder', 'Please select a folder for your memories');
            return;
        }

        try {
            setIsUploading(true);
            const uploadResults = [];

            for (const file of selectedFiles) {
                const fileData = await uploadFile(file);
                const memoryId = await saveMemoryToFirestore(fileData);
                uploadResults.push({ id: memoryId, ...fileData });
            }

            onUploadComplete?.(uploadResults);
            
            // Success animation
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0.5, duration: 200, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true })
            ]).start();

        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', error.message);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const clearFiles = () => {
        setSelectedFiles([]);
        setDuplicateWarning(null);
        setUploadProgress(0);
    };

    const acceptAutoFolder = () => {
        setSelectedFolder(autoFolder);
        setAutoFolder(null);
        setAiSuggestions([]);
    };

    const renderFilePreview = (file, index) => {
        const isImage = file.analyzed?.fileType === 'image';
        
        return (
            <View key={index} style={styles.filePreview}>
                {isImage ? (
                    <Image source={{ uri: file.uri }} style={styles.previewImage} />
                ) : (
                    <View style={styles.fileIcon}>
                        <Ionicons 
                            name={getFileIcon(file.analyzed?.fileType)} 
                            size={40} 
                            color="#666" 
                        />
                        <Text style={styles.fileName} numberOfLines={2}>
                            {file.fileName || file.name}
                        </Text>
                    </View>
                )}
                <TouchableOpacity 
                    style={styles.removeFile}
                    onPress={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                >
                    <Ionicons name="close-circle" size={24} color="#ff4757" />
                </TouchableOpacity>
            </View>
        );
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'video': return 'videocam';
            case 'audio': return 'musical-note';
            case 'document': return 'document-text';
            default: return 'attach';
        }
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Smart Upload</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                    <View style={styles.aiSuggestionContainer}>
                        <View style={styles.aiIcon}>
                            <Ionicons name="sparkles" size={16} color="#8b5cf6" />
                        </View>
                        <View style={styles.aiSuggestionContent}>
                            {aiSuggestions.map((suggestion, index) => (
                                <Text key={index} style={styles.aiSuggestionText}>
                                    {suggestion}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}

                {/* Auto Folder Suggestion */}
                {autoFolder && (
                    <TouchableOpacity style={styles.autoFolderSuggestion} onPress={acceptAutoFolder}>
                        <View style={styles.autoFolderContent}>
                            <Ionicons name="folder" size={20} color="#10b981" />
                            <Text style={styles.autoFolderText}>
                                Add to "{autoFolder.name}" folder?
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#10b981" />
                    </TouchableOpacity>
                )}

                {/* Duplicate Warning */}
                {duplicateWarning && (
                    <View style={styles.warningContainer}>
                        <Ionicons name="warning" size={20} color="#f59e0b" />
                        <Text style={styles.warningText}>
                            Similar file "{duplicateWarning.fileName}" already exists ({duplicateWarning.count} found)
                        </Text>
                    </View>
                )}

                {/* Upload Options */}
                <View style={styles.uploadOptions}>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickFromCamera}>
                        <Ionicons name="camera" size={24} color="#007AFF" />
                        <Text style={styles.uploadButtonText}>Camera</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.uploadButton} onPress={pickFromLibrary}>
                        <Ionicons name="images" size={24} color="#007AFF" />
                        <Text style={styles.uploadButtonText}>Photos</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                        <Ionicons name="document" size={24} color="#007AFF" />
                        <Text style={styles.uploadButtonText}>Documents</Text>
                    </TouchableOpacity>
                </View>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                    <View style={styles.selectedFilesContainer}>
                        <View style={styles.selectedFilesHeader}>
                            <Text style={styles.selectedFilesTitle}>
                                Selected Files ({selectedFiles.length})
                            </Text>
                            <TouchableOpacity onPress={clearFiles}>
                                <Text style={styles.clearText}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.filePreviewContainer}>
                                {selectedFiles.map(renderFilePreview)}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Folder Selection */}
                <View style={styles.folderSection}>
                    <Text style={styles.sectionTitle}>Choose Folder</Text>
                    {selectedFolder ? (
                        <TouchableOpacity 
                            style={styles.selectedFolderButton}
                            onPress={() => setShowFolderSelector(true)}
                        >
                            <View style={[styles.folderIconSmall, { backgroundColor: selectedFolder.color || '#007AFF' }]}>
                                <Ionicons name="folder" size={16} color="white" />
                            </View>
                            <Text style={styles.selectedFolderText}>{selectedFolder.name}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            style={styles.selectFolderButton}
                            onPress={() => setShowFolderSelector(true)}
                        >
                            <Ionicons name="folder-outline" size={20} color="#666" />
                            <Text style={styles.selectFolderText}>Select Folder</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Description and Tags */}
                <View style={styles.inputSection}>
                    <Text style={styles.sectionTitle}>Description (Optional)</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Add a description to make this memory special..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                    />
                    
                    <Text style={styles.sectionTitle}>Tags (Optional)</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="family, vacation, birthday (comma separated)"
                        value={tags}
                        onChangeText={setTags}
                    />
                </View>

                {/* Upload Progress */}
                {isUploading && (
                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                            Uploading... {Math.round(uploadProgress)}%
                        </Text>
                        <View style={styles.progressBar}>
                            <View 
                                style={[styles.progressFill, { width: `${uploadProgress}%` }]} 
                            />
                        </View>
                    </View>
                )}

                {/* Upload Button */}
                <TouchableOpacity
                    style={[
                        styles.finalUploadButton,
                        { 
                            backgroundColor: selectedFiles.length > 0 && (selectedFolder || autoFolder) 
                                ? '#007AFF' 
                                : '#ccc' 
                        }
                    ]}
                    onPress={handleUpload}
                    disabled={isUploading || selectedFiles.length === 0 || (!selectedFolder && !autoFolder)}
                >
                    {isUploading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload" size={20} color="white" />
                            <Text style={styles.finalUploadButtonText}>
                                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Memory' : 'Memories'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Folder Selection Modal */}
            {showFolderSelector && (
                <View style={styles.modalOverlay}>
                    <View style={styles.folderSelectorModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Folder</Text>
                            <TouchableOpacity onPress={() => setShowFolderSelector(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.folderList}>
                            <FolderGrid
                                folders={folders}
                                onFolderSelect={(folder) => {
                                    setSelectedFolder(folder);
                                    setShowFolderSelector(false);
                                    setAutoFolder(null);
                                }}
                                showCreateButton={false}
                            />
                        </ScrollView>
                        
                        <TouchableOpacity 
                            style={styles.createFolderButton}
                            onPress={() => {
                                setShowFolderSelector(false);
                                setShowCreateFolder(true);
                            }}
                        >
                            <Ionicons name="add" size={20} color="#007AFF" />
                            <Text style={styles.createFolderText}>Create New Folder</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Create Folder Modal */}
            <CreateFolderModal
                visible={showCreateFolder}
                onClose={() => setShowCreateFolder(false)}
                onFolderCreated={(folder) => {
                    setSelectedFolder(folder);
                    setShowCreateFolder(false);
                    setAutoFolder(null);
                }}
                user={user}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    scrollView: {
        flex: 1,
        padding: 20
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    headerSpacer: {
        width: 40
    },
    aiSuggestionContainer: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#8b5cf6'
    },
    aiIcon: {
        marginRight: 8,
        marginTop: 2
    },
    aiSuggestionContent: {
        flex: 1
    },
    aiSuggestionText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2
    },
    autoFolderSuggestion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ecfdf5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#10b981'
    },
    autoFolderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    autoFolderText: {
        fontSize: 16,
        color: '#065f46',
        fontWeight: '500',
        marginLeft: 8
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f59e0b'
    },
    warningText: {
        fontSize: 14,
        color: '#92400e',
        marginLeft: 8,
        flex: 1
    },
    uploadOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24
    },
    uploadButton: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 20,
        paddingHorizontal: 16,
        minWidth: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    uploadButtonText: {
        marginTop: 8,
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500'
    },
    selectedFilesContainer: {
        marginBottom: 24
    },
    selectedFilesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    selectedFilesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
    },
    clearText: {
        fontSize: 14,
        color: '#ff4757',
        fontWeight: '500'
    },
    filePreviewContainer: {
        flexDirection: 'row',
        paddingHorizontal: 4
    },
    filePreview: {
        marginRight: 12,
        position: 'relative'
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0'
    },
    fileIcon: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    fileName: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
        width: 80
    },
    removeFile: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2
    },
    folderSection: {
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12
    },
    selectedFolderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    folderIconSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    selectedFolderText: {
        fontSize: 16,
        color: '#333',
        flex: 1
    },
    selectFolderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed'
    },
    selectFolderText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8
    },
    inputSection: {
        marginBottom: 24
    },
    textInput: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 16,
        minHeight: 50
    },
    progressContainer: {
        marginBottom: 24
    },
    progressText: {
        fontSize: 16,
        color: '#333',
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
    finalUploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: 18,
        marginBottom: 20
    },
    finalUploadButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    folderSelectorModal: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: width * 0.9,
        maxHeight: height * 0.7,
        padding: 20
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    folderList: {
        maxHeight: height * 0.4
    },
    createFolderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f8ff',
        borderRadius: 12,
        padding: 16,
        marginTop: 16
    },
    createFolderText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
        marginLeft: 8
    }
});

export default SmartUploadSystem;
