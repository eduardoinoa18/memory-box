import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image,
    Dimensions,
    Animated,
    PanGestureHandler,
    State,
    Alert,
    Share,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import AILetterAssistant from './AILetterAssistant';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGate } from './PermissionComponents';

const { width, height } = Dimensions.get('window');

const MemoryViewer = ({ visible, memory, onClose, onDelete, onShare, onFavorite, user }) => {
    const [loading, setLoading] = useState(true);
    const [imageScale, setImageScale] = useState(1);
    const [imageTranslateX, setImageTranslateX] = useState(0);
    const [imageTranslateY, setImageTranslateY] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    
    const { checkPermission } = usePermissions();
    
    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const controlsOpacity = useRef(new Animated.Value(1)).current;
    const heartScale = useRef(new Animated.Value(1)).current;
    
    // Gesture handling
    const panRef = useRef();
    const pinchRef = useRef();
    const doubleTapRef = useRef();
    
    useEffect(() => {
        if (visible) {
            setLoading(true);
            setIsFavorited(memory?.isFavorited || false);
            
            // Entrance animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                })
            ]).start();
            
            // Auto-hide controls for immersive experience
            const timer = setTimeout(() => {
                if (memory?.type === 'image' || memory?.type === 'video') {
                    hideControls();
                }
            }, 3000);
            
            return () => clearTimeout(timer);
        } else {
            // Reset state when modal closes
            setImageScale(1);
            setImageTranslateX(0);
            setImageTranslateY(0);
            setIsZoomed(false);
            setShowControls(true);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
            controlsOpacity.setValue(1);
        }
    }, [visible, memory]);

    const hideControls = () => {
        Animated.timing(controlsOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setShowControls(false));
    };

    const showControlsTemp = () => {
        setShowControls(true);
        Animated.timing(controlsOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
        
        // Auto-hide again after 3 seconds
        setTimeout(hideControls, 3000);
    };

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            onClose();
        });
    };

    const handleFavorite = async () => {
        // Heart animation
        Animated.sequence([
            Animated.timing(heartScale, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(heartScale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            })
        ]).start();

        setIsFavorited(!isFavorited);
        onFavorite?.(memory, !isFavorited);
    };

    const handleShare = async () => {
        try {
            if (memory?.fileUrl) {
                await Share.share({
                    message: memory.description || 'Check out this memory!',
                    url: memory.fileUrl,
                    title: memory.fileName || 'Shared Memory'
                });
                onShare?.(memory);
            }
        } catch (error) {
            console.error('Share error:', error);
            Alert.alert('Share Failed', 'Unable to share this memory');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Memory',
            'Are you sure you want to delete this memory? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        handleClose();
                        setTimeout(() => onDelete?.(memory), 300);
                    }
                }
            ]
        );
    };

    const handleDoubleTap = () => {
        if (memory?.type === 'image') {
            const newScale = isZoomed ? 1 : 2;
            setImageScale(newScale);
            setIsZoomed(!isZoomed);
            
            if (!isZoomed) {
                // Reset position when zooming in
                setImageTranslateX(0);
                setImageTranslateY(0);
            }
        }
    };

    const renderImageViewer = () => (
        <View style={styles.imageContainer}>
            <TouchableOpacity 
                style={styles.imageViewer}
                onPress={showControlsTemp}
                onLongPress={() => {}} // Placeholder for future features
                delayLongPress={500}
            >
                <Animated.View
                    style={[
                        styles.imageWrapper,
                        {
                            transform: [
                                { scale: imageScale },
                                { translateX: imageTranslateX },
                                { translateY: imageTranslateY }
                            ]
                        }
                    ]}
                >
                    <Image
                        source={{ uri: memory.fileUrl }}
                        style={styles.fullImage}
                        resizeMode="contain"
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            Alert.alert('Error', 'Failed to load image');
                        }}
                    />
                </Animated.View>
                
                {/* Double tap overlay */}
                <TouchableOpacity
                    style={styles.doubleTapOverlay}
                    onPress={handleDoubleTap}
                    activeOpacity={1}
                />
            </TouchableOpacity>

            {/* Zoom indicator */}
            {isZoomed && (
                <View style={styles.zoomIndicator}>
                    <Ionicons name="search" size={16} color="white" />
                    <Text style={styles.zoomText}>Zoom: {Math.round(imageScale * 100)}%</Text>
                </View>
            )}
        </View>
    );

    const renderVideoViewer = () => (
        <View style={styles.videoContainer}>
            <Video
                source={{ uri: memory.fileUrl }}
                style={styles.video}
                useNativeControls
                resizeMode="contain"
                isLooping={false}
                shouldPlay={false}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    Alert.alert('Error', 'Failed to load video');
                }}
                onPlaybackStatusUpdate={(status) => {
                    setIsPlaying(status.isPlaying);
                }}
            />
        </View>
    );

    const renderAudioViewer = () => (
        <View style={styles.audioContainer}>
            <View style={styles.audioPlayer}>
                <View style={styles.audioIcon}>
                    <Ionicons name="musical-note" size={64} color="#007AFF" />
                </View>
                <Text style={styles.audioTitle}>{memory.fileName}</Text>
                <Text style={styles.audioDescription}>
                    {memory.description || 'Audio recording'}
                </Text>
                
                {/* Audio controls would go here */}
                <TouchableOpacity style={styles.playButton}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDocumentViewer = () => (
        <View style={styles.documentContainer}>
            {memory.fileUrl.toLowerCase().includes('.pdf') ? (
                <WebView
                    source={{ uri: memory.fileUrl }}
                    style={styles.documentViewer}
                    startInLoadingState={true}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        Alert.alert('Error', 'Failed to load document');
                    }}
                />
            ) : (
                <View style={styles.documentPlaceholder}>
                    <Ionicons name="document-text" size={64} color="#666" />
                    <Text style={styles.documentTitle}>{memory.fileName}</Text>
                    <Text style={styles.documentDescription}>
                        {memory.description || 'Document file'}
                    </Text>
                    <TouchableOpacity style={styles.downloadButton}>
                        <Ionicons name="download" size={20} color="#007AFF" />
                        <Text style={styles.downloadText}>Download to View</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderContent = () => {
        switch (memory?.type) {
            case 'image':
                return renderImageViewer();
            case 'video':
                return renderVideoViewer();
            case 'audio':
                return renderAudioViewer();
            case 'document':
                return renderDocumentViewer();
            default:
                return (
                    <View style={styles.unsupportedContainer}>
                        <Ionicons name="alert-circle" size={64} color="#666" />
                        <Text style={styles.unsupportedText}>Unsupported file type</Text>
                    </View>
                );
        }
    };

    if (!memory) return null;

    return (
        <Modal
            visible={visible}
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <StatusBar hidden />
            <Animated.View 
                style={[
                    styles.container,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                {/* Content */}
                <View style={styles.content}>
                    {renderContent()}
                </View>

                {/* Loading indicator */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <Animated.View style={styles.loadingSpinner}>
                            <Ionicons name="hourglass" size={32} color="white" />
                        </Animated.View>
                        <Text style={styles.loadingText}>Loading memory...</Text>
                    </View>
                )}

                {/* Controls overlay */}
                {showControls && (
                    <Animated.View 
                        style={[
                            styles.controlsOverlay,
                            { opacity: controlsOpacity }
                        ]}
                    >
                        {/* Top controls */}
                        <View style={styles.topControls}>
                            <TouchableOpacity 
                                style={styles.controlButton}
                                onPress={handleClose}
                            >
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                            
                            <View style={styles.topRightControls}>
                                <PermissionGate permission="canWriteLetters">
                                    <TouchableOpacity 
                                        style={styles.controlButton}
                                        onPress={() => setShowAIAssistant(true)}
                                    >
                                        <Ionicons name="mail" size={24} color="white" />
                                    </TouchableOpacity>
                                </PermissionGate>
                                
                                <PermissionGate permission="canShareMemories">
                                    <TouchableOpacity 
                                        style={styles.controlButton}
                                        onPress={handleShare}
                                    >
                                        <Ionicons name="share" size={24} color="white" />
                                    </TouchableOpacity>
                                </PermissionGate>
                                
                                <PermissionGate 
                                    permission="canDeleteMemories" 
                                    itemOwnerId={memory?.userId}
                                >
                                    <TouchableOpacity 
                                        style={styles.controlButton}
                                        onPress={handleDelete}
                                    >
                                        <Ionicons name="trash" size={24} color="white" />
                                    </TouchableOpacity>
                                </PermissionGate>
                            </View>
                        </View>

                        {/* Bottom controls */}
                        <View style={styles.bottomControls}>
                            <View style={styles.memoryInfo}>
                                <Text style={styles.memoryTitle} numberOfLines={1}>
                                    {memory.fileName || 'Untitled Memory'}
                                </Text>
                                {memory.description && (
                                    <Text style={styles.memoryDescription} numberOfLines={2}>
                                        {memory.description}
                                    </Text>
                                )}
                                <Text style={styles.memoryDate}>
                                    {memory.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                                </Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.favoriteButton}
                                onPress={handleFavorite}
                            >
                                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                                    <Ionicons 
                                        name={isFavorited ? "heart" : "heart-outline"} 
                                        size={28} 
                                        color={isFavorited ? "#ff4757" : "white"} 
                                    />
                                </Animated.View>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}

                {/* Gesture overlay for images */}
                {memory?.type === 'image' && (
                    <View style={styles.gestureOverlay} pointerEvents="none" />
                )}
            </Animated.View>

            {/* AI Letter Assistant Modal */}
            <AILetterAssistant
                visible={showAIAssistant}
                onClose={() => setShowAIAssistant(false)}
                onLetterGenerated={(letter) => {
                    setShowAIAssistant(false);
                    // Could navigate to letters screen or show success message
                }}
                memory={memory}
                user={user}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageViewer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    fullImage: {
        width: '100%',
        height: '100%'
    },
    doubleTapOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    zoomIndicator: {
        position: 'absolute',
        top: 100,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    zoomText: {
        color: 'white',
        fontSize: 12,
        marginLeft: 4
    },
    videoContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center'
    },
    video: {
        width: '100%',
        height: '100%'
    },
    audioContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    audioPlayer: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 40,
        width: '100%',
        maxWidth: 300
    },
    audioIcon: {
        marginBottom: 20
    },
    audioTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        marginBottom: 8
    },
    audioDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 24
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    documentContainer: {
        flex: 1,
        width: '100%'
    },
    documentViewer: {
        flex: 1,
        width: '100%'
    },
    documentPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    documentTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 8
    },
    documentDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 24
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,122,255,0.2)',
        borderColor: '#007AFF',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12
    },
    downloadText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8
    },
    unsupportedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    unsupportedText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    loadingSpinner: {
        marginBottom: 16
    },
    loadingText: {
        color: 'white',
        fontSize: 16
    },
    controlsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between'
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20
    },
    topRightControls: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12
    },
    bottomControls: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 50,
        paddingHorizontal: 20
    },
    memoryInfo: {
        flex: 1,
        marginRight: 16
    },
    memoryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4
    },
    memoryDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4
    },
    memoryDate: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)'
    },
    favoriteButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    gestureOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }
});

export default MemoryViewer;
