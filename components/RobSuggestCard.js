import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RobSuggestCard = ({ user, onActionTaken }) => {
    const [dismissed, setDismissed] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(1));

    // AI suggestions based on user's memory patterns (placeholder logic)
    const suggestions = [
        {
            id: 'memory-gap',
            type: 'reminder',
            title: "Haven't captured memories lately?",
            description: "It's been 5 days since your last upload. How about capturing today's moment?",
            action: 'Take Photo',
            actionType: 'camera',
            icon: 'camera-outline',
            color: '#007AFF'
        },
        {
            id: 'organize-memories',
            type: 'organization',
            title: 'Organize your recent uploads',
            description: "You have 12 unorganized memories. Want me to help sort them into folders?",
            action: 'Organize',
            actionType: 'organize',
            icon: 'folder-outline',
            color: '#34C759'
        },
        {
            id: 'create-letter',
            type: 'ai-feature',
            title: 'Create a memory letter',
            description: "Based on your recent family photos, I can write a beautiful letter to share memories.",
            action: 'Write Letter',
            actionType: 'letter',
            icon: 'mail-outline',
            color: '#9B59B6'
        },
        {
            id: 'memory-milestone',
            type: 'celebration',
            title: 'Celebrate 50 memories!',
            description: "You've saved 50 precious memories! Time to create a special collection?",
            action: 'Create Collection',
            actionType: 'collection',
            icon: 'trophy-outline',
            color: '#FF9500'
        }
    ];

    // Select a random suggestion (in real implementation, this would be AI-driven)
    const getCurrentSuggestion = () => {
        // This is where you'd implement actual AI logic based on:
        // - User's upload patterns
        // - Time since last upload
        // - Memory content analysis
        // - User preferences
        // - Special dates/events

        return suggestions[Math.floor(Math.random() * suggestions.length)];
    };

    const [currentSuggestion] = useState(getCurrentSuggestion());

    const handleAction = () => {
        switch (currentSuggestion.actionType) {
            case 'camera':
                // Navigate to camera/upload
                Alert.alert('Coming Soon', 'Camera integration coming soon!');
                break;
            case 'organize':
                // Navigate to organization view
                Alert.alert('Coming Soon', 'Auto-organization feature coming soon!');
                break;
            case 'letter':
                // Navigate to letter creation
                Alert.alert('Coming Soon', 'AI letter generation coming soon!');
                break;
            case 'collection':
                // Navigate to collection creation
                Alert.alert('Coming Soon', 'Collection creation coming soon!');
                break;
            default:
                Alert.alert('Action', 'Action triggered!');
        }

        if (onActionTaken) {
            onActionTaken(currentSuggestion);
        }
    };

    const handleDismiss = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setDismissed(true);
        });
    };

    if (dismissed) {
        return null;
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.card}>
                {/* Rob Avatar */}
                <View style={[styles.avatarContainer, { backgroundColor: currentSuggestion.color + '20' }]}>
                    <Ionicons
                        name="sparkles"
                        size={20}
                        color={currentSuggestion.color}
                    />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.robLabel}>Rob suggests</Text>
                        <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
                            <Ionicons name="close" size={16} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>{currentSuggestion.title}</Text>
                    <Text style={styles.description}>{currentSuggestion.description}</Text>

                    {/* Action Button */}
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: currentSuggestion.color }]}
                        onPress={handleAction}
                    >
                        <Ionicons
                            name={currentSuggestion.icon}
                            size={16}
                            color="white"
                            style={styles.actionIcon}
                        />
                        <Text style={styles.actionText}>{currentSuggestion.action}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginVertical: 10,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    robLabel: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dismissButton: {
        padding: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    actionIcon: {
        marginRight: 6,
    },
    actionText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default RobSuggestCard;
