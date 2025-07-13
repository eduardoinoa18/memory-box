import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UploadMemory from '../components/Upload/UploadMemory';

/**
 * Test screen for demonstrating UploadMemory component
 * This is more advanced than the basic example in Step 4B
 */
const UploadTestScreen = ({ user, navigation }) => {
    const [showUpload, setShowUpload] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([]);

    const handleUploadComplete = (results) => {
        Alert.alert(
            'Upload Successful! 🎉',
            `${results.length} file(s) uploaded successfully`,
            [
                {
                    text: 'View Files',
                    onPress: () => {
                        setUploadHistory(prev => [...prev, ...results]);
                        setShowUpload(false);
                    }
                },
                {
                    text: 'Upload More',
                    onPress: () => {
                        setUploadHistory(prev => [...prev, ...results]);
                    }
                }
            ]
        );
    };

    const handleClose = () => {
        setShowUpload(false);
    };

    if (showUpload) {
        return (
            <UploadMemory
                user={user}
                folderId={null}
                onUploadComplete={handleUploadComplete}
                onClose={handleClose}
            />
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Memory Upload Test</Text>
                <Text style={styles.subtitle}>
                    Testing Firebase Storage with folder structure
                </Text>
            </View>

            {/* Upload Button */}
            <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => setShowUpload(true)}
            >
                <Ionicons name="cloud-upload" size={24} color="white" />
                <Text style={styles.uploadButtonText}>Upload Memory</Text>
            </TouchableOpacity>

            {/* Features List */}
            <View style={styles.featuresContainer}>
                <Text style={styles.sectionTitle}>✅ Upload Features</Text>

                <View style={styles.feature}>
                    <Ionicons name="camera" size={20} color="#007AFF" />
                    <Text style={styles.featureText}>Camera Photos & Videos</Text>
                </View>

                <View style={styles.feature}>
                    <Ionicons name="images" size={20} color="#007AFF" />
                    <Text style={styles.featureText}>Gallery Selection (Multiple)</Text>
                </View>

                <View style={styles.feature}>
                    <Ionicons name="document" size={20} color="#007AFF" />
                    <Text style={styles.featureText}>Documents (PDF, DOC, etc.)</Text>
                </View>

                <View style={styles.feature}>
                    <Ionicons name="mic" size={20} color="#007AFF" />
                    <Text style={styles.featureText}>Audio Recording</Text>
                </View>

                <View style={styles.feature}>
                    <Ionicons name="analytics" size={20} color="#007AFF" />
                    <Text style={styles.featureText}>Upload Progress Tracking</Text>
                </View>

                <View style={styles.feature}>
                    <Ionicons name="folder" size={20} color="#007AFF" />
                    <Text style={styles.featureText}>Auto Folder Organization</Text>
                </View>
            </View>

            {/* Folder Structure */}
            <View style={styles.structureContainer}>
                <Text style={styles.sectionTitle}>📁 Storage Structure</Text>
                <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>users/&#123;userId&#125;/memories/&#123;type&#125;/&#123;timestamp&#125;.&#123;ext&#125;</Text>
                </View>

                <Text style={styles.exampleTitle}>Examples:</Text>
                <Text style={styles.exampleText}>• users/abc123/memories/image/1701234567890.jpg</Text>
                <Text style={styles.exampleText}>• users/abc123/memories/video/1701234567891.mp4</Text>
                <Text style={styles.exampleText}>• users/abc123/memories/audio/1701234567892.mp3</Text>
                <Text style={styles.exampleText}>• users/abc123/memories/document/1701234567893.pdf</Text>
            </View>

            {/* Upload History */}
            {uploadHistory.length > 0 && (
                <View style={styles.historyContainer}>
                    <Text style={styles.sectionTitle}>📋 Recent Uploads ({uploadHistory.length})</Text>
                    {uploadHistory.slice(-3).map((upload, index) => (
                        <View key={index} style={styles.historyItem}>
                            <Ionicons
                                name={
                                    upload.type === 'image' ? 'image' :
                                        upload.type === 'video' ? 'videocam' :
                                            upload.type === 'audio' ? 'musical-notes' :
                                                'document'
                                }
                                size={16}
                                color="#666"
                            />
                            <Text style={styles.historyText}>{upload.fileName}</Text>
                            <Text style={styles.historyType}>{upload.type}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation?.goBack?.()}
            >
                <Ionicons name="arrow-back" size={20} color="#007AFF" />
                <Text style={styles.backButtonText}>Back to App</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 5
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        margin: 20,
        padding: 16,
        borderRadius: 12,
        gap: 8
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600'
    },
    featuresContainer: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 12
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12
    },
    featureText: {
        fontSize: 15,
        color: '#333'
    },
    structureContainer: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 12
    },
    codeBlock: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10
    },
    codeText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#333'
    },
    exampleTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5
    },
    exampleText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
        marginBottom: 2
    },
    historyContainer: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 12
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 8
    },
    historyText: {
        flex: 1,
        fontSize: 14,
        color: '#333'
    },
    historyType: {
        fontSize: 12,
        color: '#666',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
        padding: 12,
        gap: 8
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500'
    }
});

export default UploadTestScreen;
