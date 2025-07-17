// MemoryPrompt.js - AI-powered memory reminders
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

export default function MemoryPrompt({ prompt, onPress }) {
  const { text, imageUrl, date } = prompt;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.primaryLight]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Memory Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.memoryImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
          
          {/* AI Badge */}
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="white" />
            <Text style={styles.aiText}>AI</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.promptText}>{text}</Text>
            <Text style={styles.dateText}>From {formatDate(date)}</Text>
          </View>
          
          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color={theme.colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          <View style={[styles.decorativeDot, { backgroundColor: theme.colors.primaryDark }]} />
          <View style={[styles.decorativeDot, { backgroundColor: theme.colors.secondary }]} />
          <View style={[styles.decorativeDot, { backgroundColor: theme.colors.accent }]} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  gradient: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  memoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  aiBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
  },
  aiText: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.bold,
    color: 'white',
    marginLeft: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  promptText: {
    fontSize: theme.sizes.md,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: theme.sizes.md * 1.3,
  },
  dateText: {
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  decorativeElements: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    flexDirection: 'row',
  },
  decorativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
    opacity: 0.6,
  },
});
