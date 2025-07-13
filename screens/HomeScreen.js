import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MemoriesFeed from '../components/MemoriesFeed';
import { theme } from '../components/AllComponents';
import { MemoryBoxLogo } from '../components/AllComponents';

const HomeScreen = ({ user, navigation }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const quickUpload = () => {
        navigation?.navigate('Upload');
    };

    const handleRefreshFeed = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleAdvancedSearch = () => {
        Alert.alert('Advanced Search', 'Advanced search feature coming soon!');
    };

    const handleAIAssistant = () => {
        Alert.alert('Rob AI Assistant', 'AI assistant feature coming soon!');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Animated Logo */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.logoContainer}>
                        <MemoryBoxLogo size={50} animated={true} />
                        <View style={styles.welcomeTextContainer}>
                            <Text style={styles.welcomeText}>
                                Hello, {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}! 👋
                            </Text>
                            <Text style={styles.subtitleText}>
                                Your precious memories await
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={quickUpload}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Actions Row */}
            <View style={styles.quickActionsContainer}>
                <TouchableOpacity style={styles.quickAction} onPress={quickUpload}>
                    <Ionicons name="camera" size={20} color={theme.colors.primary} />
                    <Text style={styles.quickActionText}>Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={() => navigation?.navigate('Folders')}>
                    <Ionicons name="folder" size={20} color={theme.colors.primary} />
                    <Text style={styles.quickActionText}>Folders</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={handleRefreshFeed}>
                    <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                    <Text style={styles.quickActionText}>Refresh</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={handleAdvancedSearch}>
                    <Ionicons name="search" size={20} color={theme.colors.primary} />
                    <Text style={styles.quickActionText}>Search</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={handleAIAssistant}>
                    <Ionicons name="chatbubble-ellipses" size={20} color={theme.colors.primary} />
                    <Text style={styles.quickActionText}>Rob AI</Text>
                </TouchableOpacity>
            </View>

            {/* Memories Feed */}
            <View style={styles.feedContainer}>
                <MemoriesFeed
                    user={user}
                    refreshTrigger={refreshTrigger}
                />
            </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    welcomeTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text || '#333',
        marginBottom: 2,
    },
    subtitleText: {
        fontSize: 14,
        color: theme.colors.textSecondary || '#666',
        marginTop: 2,
    },
    uploadButton: {
        backgroundColor: theme.colors.primary || '#007AFF',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
