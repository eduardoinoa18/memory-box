// MetricCard.js - Beautiful metric display cards
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function MetricCard({ title, value, icon, color, subtitle, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>

      {/* Trend Arrow */}
      <View style={styles.trendContainer}>
        <Ionicons name="trending-up" size={16} color={theme.colors.success} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    borderLeftWidth: 4,
    ...theme.shadows.small,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: theme.sizes.xl,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  title: {
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: theme.sizes.xs,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textLight,
  },
  trendContainer: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
});
