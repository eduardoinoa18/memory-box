// All Components Export File
// Central export point for all reusable components

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Theme Configuration
export const theme = {
  colors: {
    primary: '#667eea',
    primaryDark: '#5a6fd8',
    secondary: '#764ba2',
    accent: '#f093fb',
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
    textLight: '#bdc3c7',
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c',
    border: '#ecf0f1',
    shadow: 'rgba(0,0,0,0.1)'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32
  }
};

// Memory Box Logo Component with Enhanced Animation
export const MemoryBoxLogo = ({ size = 40, animated = false, color = '#667eea' }) => {
  const [heartAnimation] = useState(new Animated.Value(0));
  const [boxAnimation] = useState(new Animated.Value(0));
  const [showHeart, setShowHeart] = useState(!animated);

  useEffect(() => {
    if (animated) {
      // Start with heart animation
      setShowHeart(true);
      
      // Heart beating and moving into box
      const heartSequence = Animated.sequence([
        // Heart beats
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Heart moves into box
        Animated.timing(heartAnimation, {
          toValue: 2,
          duration: 800,
          useNativeDriver: true,
        }),
      ]);

      // Box appears after heart
      const boxSequence = Animated.timing(boxAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      });

      Animated.stagger(200, [heartSequence, boxSequence]).start(() => {
        if (animated) {
          // Restart animation for continuous loop
          heartAnimation.setValue(0);
          boxAnimation.setValue(0);
          setTimeout(() => {
            if (animated) {
              Animated.stagger(200, [heartSequence, boxSequence]).start();
            }
          }, 2000);
        }
      });
    }
  }, [animated, heartAnimation, boxAnimation]);

  const heartScale = heartAnimation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 1.3, 0.8],
  });

  const heartTranslateX = heartAnimation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 0, size * 0.1],
  });

  const heartOpacity = heartAnimation.interpolate({
    inputRange: [0, 1, 1.5, 2],
    outputRange: [1, 1, 1, 0.3],
  });

  const boxScale = boxAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const boxOpacity = boxAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <View style={[logoStyles.container, { width: size, height: size }]}>
      {/* Memory Box Container */}
      <Animated.View
        style={[
          logoStyles.boxContainer,
          {
            transform: [{ scale: boxScale }],
            opacity: boxOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={[logoStyles.gradient, { borderRadius: size / 4 }]}
        >
          <Text style={[logoStyles.boxText, { fontSize: size * 0.3 }]}>📦</Text>
        </LinearGradient>
      </Animated.View>

      {/* Animated Heart */}
      {showHeart && (
        <Animated.View
          style={[
            logoStyles.heartContainer,
            {
              transform: [
                { scale: heartScale },
                { translateX: heartTranslateX },
              ],
              opacity: heartOpacity,
            },
          ]}
        >
          <Text style={[logoStyles.heartText, { fontSize: size * 0.25 }]}>❤️</Text>
        </Animated.View>
      )}

      {/* Sparkle effects for engagement */}
      {animated && (
        <>
          <Animated.View
            style={[
              logoStyles.sparkle,
              {
                top: size * 0.1,
                right: size * 0.1,
                opacity: boxOpacity,
              },
            ]}
          >
            <Text style={{ fontSize: size * 0.15 }}>✨</Text>
          </Animated.View>
          <Animated.View
            style={[
              logoStyles.sparkle,
              {
                bottom: size * 0.1,
                left: size * 0.1,
                opacity: heartOpacity,
              },
            ]}
          >
            <Text style={{ fontSize: size * 0.12 }}>💫</Text>
          </Animated.View>
        </>
      )}
    </View>
  );
};

const logoStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  boxContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  boxText: {
    fontWeight: 'bold',
  },
  heartContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heartText: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 5,
  },
});

// Welcome Header Component
export const WelcomeHeader = ({ user, onProfilePress }) => {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.textContainer}>
        <Text style={headerStyles.greeting}>{greeting()}</Text>
        <Text style={headerStyles.name}>{user?.name || 'Welcome'}</Text>
        <Text style={headerStyles.subtitle}>Let's preserve your precious memories</Text>
      </View>
      <View style={headerStyles.avatarContainer}>
        <Text style={headerStyles.avatarText}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </Text>
      </View>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: 'white',
  },
});

// Memory Prompt Component
export const MemoryPrompt = ({ onPress }) => {
  const prompts = [
    "What made you smile today?",
    "Share a special family moment",
    "Capture today's adventure",
    "Record a voice message for loved ones",
    "What are you grateful for today?",
    "Tell us about your favorite memory"
  ];

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  return (
    <View style={promptStyles.container}>
      <Text style={promptStyles.title}>✨ Memory Inspiration</Text>
      <Text style={promptStyles.prompt}>{randomPrompt}</Text>
      <View style={promptStyles.actions}>
        <Text style={promptStyles.actionText}>Tap anywhere to start creating</Text>
      </View>
    </View>
  );
};

const promptStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  prompt: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

// Folder Card Component
export const FolderCard = ({ folder, onPress, onLongPress }) => {
  return (
    <View style={folderStyles.container}>
      <View style={[folderStyles.header, { backgroundColor: folder.color || theme.colors.primary }]}>
        <Text style={folderStyles.icon}>📁</Text>
        <Text style={folderStyles.memoryCount}>{folder.memoryCount || 0}</Text>
      </View>
      <View style={folderStyles.content}>
        <Text style={folderStyles.name} numberOfLines={1}>
          {folder.name}
        </Text>
        <Text style={folderStyles.description} numberOfLines={2}>
          {folder.description}
        </Text>
        <View style={folderStyles.footer}>
          <Text style={folderStyles.date}>
            {folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : 'Recently'}
          </Text>
          {folder.isShared && (
            <Text style={folderStyles.shared}>👥 Shared</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const folderStyles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  icon: {
    fontSize: theme.fontSize.xl,
  },
  memoryCount: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  content: {
    padding: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  shared: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

// Advanced Components for Production App

// Enhanced Upload Screen Component
export const EnhancedUploadScreen = ({ user, onMemoryAdded, recentMemories }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enhanced Upload Screen</Text>
      <Text style={styles.description}>Full featured upload with drag & drop, batch processing, and AI categorization</Text>
    </View>
  );
};

// Family Accounts Manager Component
export const FamilyAccountsManager = ({ user }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Family Accounts Manager</Text>
      <Text style={styles.description}>Manage family members, permissions, and sharing settings</Text>
    </View>
  );
};

// Permission Gate Component
export const PermissionGate = ({ permission, children, fallbackComponent }) => {
  // For now, just render children - in production this would check user permissions
  return children || fallbackComponent;
};

// Permissions Provider Component
export const PermissionsProvider = ({ user, children }) => {
  return children;
};

// Permission Status Component
export const PermissionStatus = ({ user }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Permission Status</Text>
      <Text style={styles.description}>Account type: Premium Member</Text>
    </View>
  );
};

// Subscription Modal Component
export const SubscriptionModal = ({ visible, onClose, user, currentPlan }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Subscription Management</Text>
        <Text style={styles.description}>Current Plan: {currentPlan}</Text>
      </View>
    </View>
  );
};

// Rob AI Assistant Component
export const RobAIAssistant = ({ visible, onClose, user, onLetterGenerated }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Rob AI Letter Writer</Text>
        <Text style={styles.description}>Generate personalized letters from your memories using AI</Text>
      </View>
    </View>
  );
};

// Enhanced Memory Timeline Component
export const EnhancedMemoryTimeline = ({ visible, onClose, user, onMemoryPress }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Memory Timeline</Text>
        <Text style={styles.description}>View your memories organized chronologically with insights</Text>
      </View>
    </View>
  );
};

// Advanced Search Component
export const AdvancedSearch = ({ visible, onClose, user, onMemorySelect }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Advanced Search</Text>
        <Text style={styles.description}>Search your memories by date, location, people, and content</Text>
      </View>
    </View>
  );
};

// Advanced Folder Manager Component
export const AdvancedFolderManager = ({ visible, onClose, user, onFolderSelect }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Advanced Folder Manager</Text>
        <Text style={styles.description}>Organize folders with smart categorization and bulk operations</Text>
      </View>
    </View>
  );
};

// Memory Collections Component
export const MemoryCollections = ({ visible, onClose, user, onCollectionSelect }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Smart Collections</Text>
        <Text style={styles.description}>Auto-generated collections based on themes, events, and people</Text>
      </View>
    </View>
  );
};

// Memory Viewer Component
export const MemoryViewer = ({ visible, onClose, memory, user, onEdit, onShare }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Memory Viewer</Text>
        <Text style={styles.description}>View and edit memory details with enhanced features</Text>
      </View>
    </View>
  );
};

// Additional styles for new components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
});

// Export all components
export default {
  theme,
  MemoryBoxLogo,
  WelcomeHeader,
  MemoryPrompt,
  FolderCard,
  EnhancedUploadScreen,
  FamilyAccountsManager,
  PermissionGate,
  PermissionsProvider,
  PermissionStatus,
  SubscriptionModal,
  RobAIAssistant,
  EnhancedMemoryTimeline,
  AdvancedSearch,
  AdvancedFolderManager,
  MemoryCollections,
  MemoryViewer,
};
