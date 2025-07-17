import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MemoriesFeed from '../components/MemoriesFeed';
import { theme } from '../components/AllComponents';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ user, navigation }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [recentMemories, setRecentMemories] = useState([]);

    const quickUpload = () => {
        navigation?.navigate('Upload');
    };

    const handleRefreshFeed = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    // Memory categories for quick access
    const memoryCategories = [
        { id: 'mateo', name: 'Mateo', icon: '👦', color: '#6B9AFF' },
        { id: 'school', name: 'School', icon: '📚', color: '#FFD700' },
        { id: 'vacation', name: 'Vacation', icon: '🏝️', color: '#96E6B3' },
        { id: 'family', name: 'Family Photos', icon: '📸', color: '#B3D9FF' }
    ];

    const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Emma';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    {/* App Logo and Title */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoIcon}>
                            <Text style={styles.logoEmoji}>📦</Text>
                            <Text style={styles.heartEmoji}>�</Text>
                        </View>
                        <Text style={styles.appTitle}>Memory Box</Text>
                    </View>
                    
                    {/* Profile Icon */}
                    <TouchableOpacity 
                        style={styles.profileIcon}
                        onPress={() => navigation?.navigate('Profile')}
                    >
                        <Ionicons name="person-circle" size={32} color="#6B9AFF" />
                    </TouchableOpacity>
                </View>

                {/* Welcome Section */}
                <Text style={styles.welcomeText}>Welcome back, {userName}</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Featured Memory Card */}
                <View style={styles.featuredCard}>
                    <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop' }}
                        style={styles.featuredImage}
                        defaultSource={require('../assets/default-memory.png')}
                    />
                    <View style={styles.featuredOverlay}>
                        <View style={styles.reminderBadge}>
                            <Ionicons name="warning" size={16} color="#FF6B35" />
                            <Text style={styles.reminderText}>Remember this?</Text>
                        </View>
                        <Text style={styles.featuredTitle}>Mateo on the beach, Apr. 1, 2022</Text>
                    </View>
                </View>

                {/* Memory Categories Grid */}
                <View style={styles.categoriesGrid}>
                    {memoryCategories.map((category) => (
                        <TouchableOpacity 
                            key={category.id}
                            style={[styles.categoryCard, { backgroundColor: category.color }]}
                            onPress={() => navigation?.navigate('Folders', { categoryFilter: category.id })}
                        >
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                            <Text style={styles.categoryName}>{category.name}</Text>
                            {category.id === 'school' && (
                                <View style={styles.schoolNote}>
                                    <Text style={styles.schoolNoteText}>DAD!</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Memories Section */}
                <View style={styles.recentSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Memories</Text>
                        <TouchableOpacity onPress={() => navigation?.navigate('Folders')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <MemoriesFeed
                        user={user}
                        refreshTrigger={refreshTrigger}
                        limit={3}
                        showHeader={false}
                    />
                </View>
            </ScrollView>

            {/* Floating Add Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={quickUpload}
            >
                <LinearGradient
                    colors={['#6B9AFF', '#5577FF']}
                    style={styles.addButtonGradient}
                >
                    <Ionicons name="add" size={24} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B8E6FF', // Light blue background like in the image
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: '#B8E6FF',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        position: 'relative',
        marginRight: 10,
    },
    logoEmoji: {
        fontSize: 32,
    },
    heartEmoji: {
        fontSize: 16,
        position: 'absolute',
        top: -5,
        right: -5,
    },
    appTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    profileIcon: {
        padding: 5,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 5,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    featuredCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    featuredImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#E5E7EB',
    },
    featuredOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 15,
    },
    reminderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3CD',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    reminderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF6B35',
        marginLeft: 4,
    },
    featuredTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    categoryCard: {
        width: (width - 60) / 2, // Two columns with padding
        height: 120,
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        justifyContent: 'space-between',
        position: 'relative',
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    schoolNote: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        transform: [{ rotate: '-5deg' }],
    },
    schoolNoteText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    recentSection: {
        marginBottom: 100, // Space for floating button
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    seeAllText: {
        fontSize: 16,
        color: '#6B9AFF',
        fontWeight: '600',
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    addButtonGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        gap: 10,
    },
    quickAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        gap: 6,
    },
    quickActionText: {
        fontSize: 12,
        color: theme.colors.primary || '#007AFF',
        fontWeight: '600',
    },
    feedContainer: {
        flex: 1,
    },
});

export default HomeScreen;
