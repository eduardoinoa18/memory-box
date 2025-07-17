// SplashScreen.js - Beautiful animated welcome screen
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onComplete, fontsLoaded }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (fontsLoaded) {
      // Start animations sequence
      Animated.sequence([
        // Logo scale and fade in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        // Text slide up
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        // Hold for a moment
        Animated.delay(1500),
      ]).start(() => {
        // Animation complete
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [fontsLoaded, fadeAnim, scaleAnim, slideAnim, onComplete]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={[theme.colors.primaryLight, theme.colors.secondary, theme.colors.secondaryLight]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo Animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>📦</Text>
            <Text style={styles.logoText}>Memory Box</Text>
          </View>
        </Animated.View>

        {/* Tagline Animation */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.tagline}>Cherish Every Moment</Text>
          <Text style={styles.subtitle}>Your family memories, beautifully organized</Text>
        </Animated.View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    ...theme.shadows.large,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  logoText: {
    fontSize: theme.sizes.xxxl,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  tagline: {
    fontSize: theme.sizes.xl,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.sizes.md,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primaryDark,
    marginHorizontal: 4,
  },
});

// Note: Install expo-linear-gradient
// npx expo install expo-linear-gradient
