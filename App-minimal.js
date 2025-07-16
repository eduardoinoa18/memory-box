import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#5577FF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>📦</Text>
          <Text style={styles.logoText}>Memory Box</Text>
        </View>
        <Text style={styles.subtitle}>Your Digital Memory Keeper</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>🎉 Welcome to Memory Box!</Text>
          <Text style={styles.welcomeText}>
            Your simplified MVP is ready! This version focuses on core features 
            with plans to add virtual gift cards later.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>📋 MVP Features</Text>
          
          <FeatureCard 
            icon="📸" 
            title="Photo Storage" 
            description="100MB free storage per user"
          />
          <FeatureCard 
            icon="👨‍👩‍👧‍👦" 
            title="Family Sharing" 
            description="Secure memory sharing with loved ones"
          />
          <FeatureCard 
            icon="🔒" 
            title="Firebase Security" 
            description="Enterprise-grade authentication"
          />
          <FeatureCard 
            icon="🎁" 
            title="Coming Soon" 
            description="Virtual gift card letters via Prizeout"
            comingSoon={true}
          />
        </View>

        <TouchableOpacity style={styles.getStartedButton}>
          <Text style={styles.getStartedText}>🚀 Get Started</Text>
        </TouchableOpacity>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>✅ Development Status</Text>
          <Text style={styles.statusText}>MVP core features complete</Text>
          <Text style={styles.statusText}>Firebase services ready</Text>
          <Text style={styles.statusText}>Simplified for quick launch</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureCard({ icon, title, description, comingSoon = false }) {
  return (
    <View style={[styles.featureCard, comingSoon && styles.comingSoonCard]}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
      {comingSoon && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#5577FF',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  comingSoonCard: {
    opacity: 0.7,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  featureIcon: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  getStartedButton: {
    backgroundColor: '#5577FF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#dcfce7',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    marginBottom: 2,
  },
});
