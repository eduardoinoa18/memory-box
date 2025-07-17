import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    ScrollView,
    TextInput,
    Alert,
    Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AnimatedLetter = ({ visible, letter, onClose, onSave, onDelete, isEditing = false }) => {
    const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
    const [letterContent, setLetterContent] = useState('');
    const [letterTitle, setLetterTitle] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('classic');
    const [isEditing_, setIsEditing_] = useState(isEditing);
    
    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const envelopeRotation = useRef(new Animated.Value(0)).current;
    const paperSlideUp = useRef(new Animated.Value(height)).current;
    const letterOpacity = useRef(new Animated.Value(0)).current;
    
    // Lottie animation ref
    const lottieRef = useRef(null);

    const themes = {
        classic: {
            name: 'Classic',
            background: ['#f8f9fa', '#ffffff'],
            paperColor: '#ffffff',
            textColor: '#333333',
            accentColor: '#d4af37',
            icon: 'document-text'
        },
        vintage: {
            name: 'Vintage',
            background: ['#f4e4bc', '#ede0c8'],
            paperColor: '#f9f6f0',
            textColor: '#5d4e37',
            accentColor: '#8b4513',
            icon: 'library'
        },
        modern: {
            name: 'Modern',
            background: ['#667eea', '#764ba2'],
            paperColor: '#ffffff',
            textColor: '#333333',
            accentColor: '#667eea',
            icon: 'phone-portrait'
        },
        romantic: {
            name: 'Romantic',
            background: ['#ffecd2', '#fcb69f'],
            paperColor: '#fff5f5',
            textColor: '#8b5a5a',
            accentColor: '#ff6b6b',
            icon: 'heart'
        },
        nature: {
            name: 'Nature',
            background: ['#a8edea', '#fed6e3'],
            paperColor: '#f0fff4',
            textColor: '#2d5016',
            accentColor: '#228b22',
            icon: 'leaf'
        }
    };

    useEffect(() => {
        if (visible) {
            setLetterContent(letter?.content || '');
            setLetterTitle(letter?.title || 'Untitled Letter');
            setSelectedTheme(letter?.theme || 'classic');
            setIsEnvelopeOpen(false);
            setIsEditing_(isEditing);
            
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
        } else {
            // Reset all animations
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
            paperSlideUp.setValue(height);
            letterOpacity.setValue(0);
            envelopeRotation.setValue(0);
        }
    }, [visible, letter]);

    const handleEnvelopePress = () => {
        if (isEnvelopeOpen) return;
        
        setIsEnvelopeOpen(true);
        
        // Play Lottie animation
        lottieRef.current?.play();
        
        // Envelope opening sequence
        Animated.sequence([
            // Slight rotation and scale
            Animated.parallel([
                Animated.timing(envelopeRotation, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]),
            // Paper slides up
            Animated.timing(paperSlideUp, {
                toValue: 100,
                duration: 600,
                useNativeDriver: true,
            }),
            // Letter content fades in
            Animated.timing(letterOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handleClose = () => {
        if (isEnvelopeOpen) {
            // Close letter animation
            Animated.sequence([
                Animated.timing(letterOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(paperSlideUp, {
                    toValue: height,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.parallel([
                    Animated.timing(envelopeRotation, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    })
                ])
            ]).start(() => {
                setIsEnvelopeOpen(false);
            });
        } else {
            // Close modal
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
        }
    };

    const handleSave = () => {
        if (!letterContent.trim()) {
            Alert.alert('Empty Letter', 'Please write something before saving');
            return;
        }

        const letterData = {
            id: letter?.id || Date.now().toString(),
            title: letterTitle,
            content: letterContent,
            theme: selectedTheme,
            createdAt: letter?.createdAt || new Date(),
            updatedAt: new Date()
        };

        onSave?.(letterData);
        setIsEditing_(false);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${letterTitle}\n\n${letterContent}`,
                title: letterTitle
            });
        } catch (error) {
            console.error('Share error:', error);
            Alert.alert('Share Failed', 'Unable to share this letter');
        }
    };

    const renderEnvelope = () => {
        const theme = themes[selectedTheme];
        
        return (
            <Animated.View
                style={[
                    styles.envelopeContainer,
                    {
                        transform: [
                            { scale: scaleAnim },
                            {
                                rotateZ: envelopeRotation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '2deg']
                                })
                            }
                        ]
                    }
                ]}
            >
                <LinearGradient
                    colors={theme.background}
                    style={styles.envelope}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Envelope flap */}
                    <View style={[styles.envelopeFlap, { borderBottomColor: theme.accentColor }]} />
                    
                    {/* Wax seal */}
                    <View style={[styles.waxSeal, { backgroundColor: theme.accentColor }]}>
                        <Ionicons name={theme.icon} size={16} color="white" />
                    </View>
                    
                    {/* Letter preview */}
                    <View style={styles.letterPreview}>
                        <Text style={[styles.letterPreviewTitle, { color: theme.textColor }]}>
                            {letterTitle}
                        </Text>
                        <Text style={[styles.letterPreviewText, { color: theme.textColor }]} numberOfLines={3}>
                            {letterContent || 'Tap to open and read this letter...'}
                        </Text>
                    </View>
                    
                    {/* Tap indicator */}
                    {!isEnvelopeOpen && (
                        <View style={styles.tapIndicator}>
                            <Ionicons name="hand-left" size={20} color={theme.accentColor} />
                            <Text style={[styles.tapText, { color: theme.accentColor }]}>Tap to open</Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Lottie Animation Overlay */}
                <LottieView
                    ref={lottieRef}
                    style={styles.lottieOverlay}
                    source={require('../assets/animations/envelope-open.json')} // You'll need to add this
                    autoPlay={false}
                    loop={false}
                />

                {/* Touch area */}
                <TouchableOpacity
                    style={styles.envelopeTouchArea}
                    onPress={handleEnvelopePress}
                    disabled={isEnvelopeOpen}
                    activeOpacity={0.9}
                />
            </Animated.View>
        );
    };

    const renderLetter = () => {
        const theme = themes[selectedTheme];
        
        return (
            <Animated.View
                style={[
                    styles.letterContainer,
                    {
                        transform: [{ translateY: paperSlideUp }],
                        opacity: letterOpacity
                    }
                ]}
            >
                <LinearGradient
                    colors={[theme.paperColor, theme.paperColor]}
                    style={styles.letterPaper}
                >
                    {/* Letter header */}
                    <View style={styles.letterHeader}>
                        <View style={styles.letterHeaderLeft}>
                            <Text style={[styles.letterTitleText, { color: theme.textColor }]}>
                                {letterTitle}
                            </Text>
                            <Text style={[styles.letterDate, { color: theme.textColor }]}>
                                {letter?.createdAt?.toLocaleDateString() || new Date().toLocaleDateString()}
                            </Text>
                        </View>
                        
                        <View style={styles.letterActions}>
                            {isEditing_ ? (
                                <>
                                    <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                                        <Ionicons name="checkmark" size={20} color={theme.accentColor} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing_(false)}>
                                        <Ionicons name="close" size={20} color="#999" />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing_(true)}>
                                        <Ionicons name="create" size={20} color={theme.accentColor} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                        <Ionicons name="share" size={20} color={theme.accentColor} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Letter content */}
                    <ScrollView style={styles.letterContent} showsVerticalScrollIndicator={false}>
                        {isEditing_ ? (
                            <View>
                                <TextInput
                                    style={[styles.titleInput, { color: theme.textColor, borderColor: theme.accentColor }]}
                                    value={letterTitle}
                                    onChangeText={setLetterTitle}
                                    placeholder="Letter title..."
                                    placeholderTextColor={theme.textColor + '80'}
                                />
                                <TextInput
                                    style={[styles.contentInput, { color: theme.textColor }]}
                                    value={letterContent}
                                    onChangeText={setLetterContent}
                                    placeholder="Write your letter here..."
                                    placeholderTextColor={theme.textColor + '80'}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>
                        ) : (
                            <Text style={[styles.letterText, { color: theme.textColor }]}>
                                {letterContent || 'This letter is empty. Tap edit to write something beautiful.'}
                            </Text>
                        )}
                    </ScrollView>

                    {/* Letter signature */}
                    <View style={styles.letterSignature}>
                        <Text style={[styles.signatureText, { color: theme.textColor }]}>
                            With love,
                        </Text>
                        <Text style={[styles.signatureName, { color: theme.accentColor }]}>
                            💌 You
                        </Text>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    const renderThemeSelector = () => {
        if (!isEditing_ || !isEnvelopeOpen) return null;
        
        return (
            <View style={styles.themeSelector}>
                <Text style={styles.themeSelectorTitle}>Choose Theme</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {Object.keys(themes).map((themeKey) => {
                        const theme = themes[themeKey];
                        const isSelected = selectedTheme === themeKey;
                        
                        return (
                            <TouchableOpacity
                                key={themeKey}
                                style={[
                                    styles.themeOption,
                                    isSelected && styles.themeOptionSelected
                                ]}
                                onPress={() => setSelectedTheme(themeKey)}
                            >
                                <LinearGradient
                                    colors={theme.background}
                                    style={styles.themePreview}
                                >
                                    <Ionicons name={theme.icon} size={16} color={theme.accentColor} />
                                </LinearGradient>
                                <Text style={styles.themeOptionText}>{theme.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <LinearGradient
                colors={themes[selectedTheme].background}
                style={styles.container}
            >
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Envelope */}
                    {renderEnvelope()}

                    {/* Letter */}
                    {renderLetter()}

                    {/* Theme selector */}
                    {renderThemeSelector()}
                </Animated.View>
            </LinearGradient>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        flex: 1,
        width: '100%',
        position: 'relative'
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    envelopeContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -120,
        marginLeft: -150,
        width: 300,
        height: 200
    },
    envelope: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10
    },
    envelopeFlap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        borderBottomWidth: 2,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    waxSeal: {
        position: 'absolute',
        top: 40,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5
    },
    letterPreview: {
        marginTop: 40,
        flex: 1
    },
    letterPreviewTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8
    },
    letterPreviewText: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8
    },
    tapIndicator: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    tapText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500'
    },
    lottieOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    envelopeTouchArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    letterContainer: {
        position: 'absolute',
        top: 80,
        left: 20,
        right: 20,
        bottom: 80
    },
    letterPaper: {
        flex: 1,
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8
    },
    letterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)'
    },
    letterHeaderLeft: {
        flex: 1
    },
    letterTitleText: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4
    },
    letterDate: {
        fontSize: 14,
        opacity: 0.7
    },
    letterActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8
    },
    letterContent: {
        flex: 1,
        marginBottom: 24
    },
    titleInput: {
        fontSize: 18,
        fontWeight: '600',
        borderBottomWidth: 1,
        paddingVertical: 8,
        marginBottom: 16
    },
    contentInput: {
        fontSize: 16,
        lineHeight: 24,
        minHeight: 200,
        textAlignVertical: 'top'
    },
    letterText: {
        fontSize: 16,
        lineHeight: 24
    },
    letterSignature: {
        alignItems: 'flex-end',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)'
    },
    signatureText: {
        fontSize: 14,
        fontStyle: 'italic',
        opacity: 0.8
    },
    signatureName: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4
    },
    themeSelector: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        padding: 16
    },
    themeSelectorTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333'
    },
    themeOption: {
        alignItems: 'center',
        marginRight: 16
    },
    themeOptionSelected: {
        transform: [{ scale: 1.1 }]
    },
    themePreview: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4
    },
    themeOptionText: {
        fontSize: 12,
        color: '#666'
    }
});

export default AnimatedLetter;
