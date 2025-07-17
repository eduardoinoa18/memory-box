// WelcomeHeader.js - Personalized greeting component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function WelcomeHeader({ userName, greeting, profileImage, plan }) {
  const getPlanBadgeColor = () => {
    switch (plan) {
      case 'premium': return theme.colors.primaryDark;
      case 'family': return theme.colors.secondary;
      default: return theme.colors.textSecondary;
    }
  };

  const getPlanLabel = () => {
    switch (plan) {
      case 'premium': return 'Premium';
      case 'family': return 'Family';
      default: return 'Free';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainSection}>
        {/* Profile Image */}
        <TouchableOpacity style={styles.profileContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Ionicons name="person" size={24} color={theme.colors.textSecondary} />
            </View>
          )}
        </TouchableOpacity>

        {/* Greeting and User Info */}
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>{greeting}!</Text>
          <Text style={styles.userName}>Welcome back, {userName}</Text>
          <View style={styles.planContainer}>
            <View style={[styles.planBadge, { backgroundColor: getPlanBadgeColor() }]}>
              <Text style={styles.planText}>{getPlanLabel()}</Text>
            </View>
          </View>
        </View>

        {/* Notification Icon */}
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Inspirational Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.inspirationalMessage}>
          "Every moment is a gift. Preserve them beautifully." ✨
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
  },
  mainSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  profileContainer: {
    marginRight: theme.spacing.md,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  profilePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.sizes.md,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: theme.sizes.xl,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  planContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  planText: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.medium,
    color: 'white',
    textTransform: 'uppercase',
  },
  notificationButton: {
    position: 'relative',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  messageContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  inspirationalMessage: {
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
