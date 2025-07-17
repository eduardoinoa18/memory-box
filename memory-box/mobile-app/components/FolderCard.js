// FolderCard.js - Beautiful folder cards with pastel backgrounds
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function FolderCard({ folder, onPress, style }) {
  const {
    name,
    emoji,
    count,
    color,
    coverImage,
    lastUpdated
  } = folder;

  // Create gradient colors based on the folder color
  const getGradientColors = (baseColor) => {
    return [baseColor, baseColor + '80', baseColor + '40'];
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradientColors(color)}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Cover Image */}
        <View style={styles.imageContainer}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>{emoji}</Text>
            </View>
          )}
          
          {/* Count Badge */}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>

        {/* Folder Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.folderName} numberOfLines={2}>
              {name}
            </Text>
          </View>
          
          <View style={styles.metaContainer}>
            <Text style={styles.itemCount}>
              {count} {count === 1 ? 'item' : 'items'}
            </Text>
            <Text style={styles.lastUpdated}>{lastUpdated}</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  gradient: {
    padding: theme.spacing.md,
    minHeight: 140,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  coverImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  placeholderEmoji: {
    fontSize: 28,
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  countText: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.bold,
    color: 'white',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  emoji: {
    fontSize: 20,
    marginRight: theme.spacing.xs,
  },
  folderName: {
    flex: 1,
    fontSize: theme.sizes.md,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    lineHeight: theme.sizes.md * 1.2,
  },
  metaContainer: {
    marginTop: 'auto',
  },
  itemCount: {
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textLight,
  },
  actionButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
});
