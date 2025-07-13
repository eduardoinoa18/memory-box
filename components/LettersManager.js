import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Animated,
    Alert,
    RefreshControl,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedLetter from './AnimatedLetter';
import AILetterAssistant from './AILetterAssistant';
import { useLetters } from '../hooks/useLetters';

const { width } = Dimensions.get('window');

const LettersManager = ({ user, memory }) => {
    const { letters, loading, refreshing, refresh, saveLetter, deleteLetter } = useLetters(user?.uid);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [showLetter, setShowLetter] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideUpAnim, {
                toValue: 0,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const themes = {
        classic: {
            background: ['#f8f9fa', '#ffffff'],
            accentColor: '#d4af37'
        },
        vintage: {
            background: ['#f4e4bc', '#ede0c8'],
            accentColor: '#8b4513'
        },
        modern: {
            background: ['#667eea', '#764ba2'],
            accentColor: '#667eea'
        },
        romantic: {
            background: ['#ffecd2', '#fcb69f'],
            accentColor: '#ff6b6b'
        },
        nature: {
            background: ['#a8edea', '#fed6e3'],
            accentColor: '#228b22'
        }
    };

    const handleCreateLetter = () => {
        setSelectedLetter(null);
        setIsEditing(true);
        setShowLetter(true);
    };

    const handleCreateWithAI = () => {
        setShowAIAssistant(true);
    };

    const handleLetterPress = (letter) => {
        setSelectedLetter(letter);
        setIsEditing(false);
        setShowLetter(true);
    };

    const handleSaveLetter = async (letterData) => {
        try {
            await saveLetter(letterData);
            setShowLetter(false);
            Alert.alert('Success', 'Letter saved successfully!');
        } catch (error) {
            console.error('Save letter error:', error);
            Alert.alert('Error', 'Failed to save letter');
        }
    };

    const handleDeleteLetter = async (letter) => {
        Alert.alert(
            'Delete Letter',
            'Are you sure you want to delete this letter?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteLetter(letter.id);
                            setShowLetter(false);
                        } catch (error) {
                            console.error('Delete letter error:', error);
                            Alert.alert('Error', 'Failed to delete letter');
                        }
                    }
                }
            ]
        );
    };

    const handleAILetterGenerated = (letterData) => {
        setSelectedLetter(letterData);
        setIsEditing(true);
        setShowLetter(true);
    };

    const formatDate = (date) => {
        if (!date) return 'Unknown date';
        const letterDate = date.toDate ? date.toDate() : new Date(date);
        return letterDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getLetterPreview = (content) => {
        if (!content) return 'Empty letter';
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    };

    const LetterCard = ({ item, index }) => {
        const cardAnim = useRef(new Animated.Value(0)).current;
        const theme = themes[item.theme] || themes.classic;

        useEffect(() => {
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }).start();
        }, []);

        return (
            <Animated.View
                style={[
                    styles.letterCard,
                    {
                        opacity: cardAnim,
                        transform: [{
                            translateY: cardAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 0]
                            })
                        }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.letterCardTouchable}
                    onPress={() => handleLetterPress(item)}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={theme.background}
                        style={styles.letterCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Letter header */}
                        <View style={styles.letterCardHeader}>
                            <View style={styles.letterCardHeaderLeft}>
                                <Text style={[styles.letterCardTitle, { color: theme.accentColor }]} numberOfLines={1}>
                                    {item.title || 'Untitled Letter'}
                                </Text>
                                <Text style={styles.letterCardDate}>
                                    {formatDate(item.createdAt)}
                                </Text>
                            </View>
                            
                            <View style={styles.letterCardBadges}>
                                {item.aiGenerated && (
                                    <View style={styles.aiBadge}>
                                        <Ionicons name="sparkles" size={12} color="white" />
                                    </View>
                                )}
                                <View style={[styles.themeBadge, { backgroundColor: theme.accentColor }]}>
                                    <Text style={styles.themeBadgeText}>{item.theme?.toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Letter preview */}
                        <Text style={styles.letterCardPreview} numberOfLines={3}>
                            {getLetterPreview(item.content)}
                        </Text>

                        {/* Letter footer */}
                        <View style={styles.letterCardFooter}>
                            <View style={styles.letterCardFooterLeft}>
                                <Ionicons name="mail" size={16} color={theme.accentColor} />
                                <Text style={[styles.letterCardType, { color: theme.accentColor }]}>
                                    Digital Letter
                                </Text>
                            </View>
                            
                            <TouchableOpacity
                                style={styles.quickActionButton}
                                onPress={() => {
                                    setSelectedLetter(item);
                                    setIsEditing(true);
                                    setShowLetter(true);
                                }}
                            >
                                <Ionicons name="create" size={16} color={theme.accentColor} />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <Ionicons name="mail-outline" size={64} color="#ccc" />
            </View>
            <Text style={styles.emptyTitle}>No Letters Yet</Text>
            <Text style={styles.emptySubtitle}>
                Create your first digital letter to capture precious moments and memories
            </Text>
            
            <View style={styles.emptyActions}>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateLetter}>
                    <Ionicons name="create" size={20} color="white" />
                    <Text style={styles.createButtonText}>Write Letter</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.aiButton} onPress={handleCreateWithAI}>
                    <Ionicons name="sparkles" size={20} color="#007AFF" />
                    <Text style={styles.aiButtonText}>AI Assistant</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const HeaderActions = () => (
        <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleCreateLetter}>
                <Ionicons name="create" size={20} color="#007AFF" />
                <Text style={styles.headerButtonText}>Write</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.headerButtonAI} onPress={handleCreateWithAI}>
                <Ionicons name="sparkles" size={20} color="white" />
                <Text style={styles.headerButtonTextAI}>Rob AI</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Animated.View 
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideUpAnim }]
                }
            ]}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>Digital Letters</Text>
                    <Text style={styles.headerSubtitle}>
                        {letters.length} {letters.length === 1 ? 'letter' : 'letters'}
                    </Text>
                </View>
                
                <HeaderActions />
            </View>

            {/* Letters list */}
            <FlatList
                data={letters}
                renderItem={({ item, index }) => <LetterCard item={item} index={index} />}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        tintColor="#007AFF"
                    />
                }
                ListEmptyComponent={<EmptyState />}
                numColumns={1}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />

            {/* Animated Letter Modal */}
            <AnimatedLetter
                visible={showLetter}
                letter={selectedLetter}
                onClose={() => setShowLetter(false)}
                onSave={handleSaveLetter}
                onDelete={handleDeleteLetter}
                isEditing={isEditing}
            />

            {/* AI Letter Assistant Modal */}
            <AILetterAssistant
                visible={showAIAssistant}
                onClose={() => setShowAIAssistant(false)}
                onLetterGenerated={handleAILetterGenerated}
                memory={memory}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e5e9'
    },
    headerLeft: {
        flex: 1
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666'
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginLeft: 8
    },
    headerButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginLeft: 4
    },
    headerButtonAI: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginLeft: 8
    },
    headerButtonTextAI: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginLeft: 4
    },
    listContent: {
        padding: 20,
        paddingBottom: 40
    },
    letterCard: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5
    },
    letterCardTouchable: {
        borderRadius: 16,
        overflow: 'hidden'
    },
    letterCardGradient: {
        padding: 20,
        minHeight: 160
    },
    letterCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    letterCardHeaderLeft: {
        flex: 1,
        marginRight: 12
    },
    letterCardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4
    },
    letterCardDate: {
        fontSize: 12,
        color: '#666',
        opacity: 0.8
    },
    letterCardBadges: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    aiBadge: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6
    },
    themeBadge: {
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2
    },
    themeBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: 'white'
    },
    letterCardPreview: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        opacity: 0.8,
        flex: 1,
        marginBottom: 16
    },
    letterCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    letterCardFooterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    letterCardType: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 6
    },
    quickActionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40
    },
    emptyIcon: {
        marginBottom: 20
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32
    },
    emptyActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 25,
        paddingHorizontal: 24,
        paddingVertical: 12,
        marginRight: 12
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: '#007AFF',
        borderWidth: 2,
        borderRadius: 25,
        paddingHorizontal: 24,
        paddingVertical: 12
    },
    aiButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        marginLeft: 8
    }
});

export default LettersManager;
