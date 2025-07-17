// HomeScreen.js - Personalized welcome with AI memory prompts
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

// Import components (to be created)
import WelcomeHeader from '../components/WelcomeHeader';
import MemoryPrompt from '../components/MemoryPrompt';
import FolderCard from '../components/FolderCard';
import MetricCard from '../components/MetricCard';

const { width } = Dimensions.get('window');

// Sample data
const sampleUser = {
  name: "Emma",
  profileImage: null,
  plan: "premium",
};

const sampleMemoryPrompts = [
  {
    id: 1,
    text: "Remember this family dinner?",
    imageUrl: "https://via.placeholder.com/300x200/FFF9C4/1A237E?text=Family+Dinner",
    folderId: "family-moments",
    date: "2025-06-15",
  },
  {
    id: 2,
    text: "Your beach vacation photos are waiting!",
    imageUrl: "https://via.placeholder.com/300x200/B3E5FC/1A237E?text=Beach+Vacation",
    folderId: "travel-adventures",
    date: "2025-06-10",
  },
];

const sampleFolders = [
  { 
    id: 1, 
    name: "Family Moments", 
    emoji: "👨‍👩‍👧‍👦", 
    count: 87, 
    color: theme.colors.primary,
    coverImage: "https://via.placeholder.com/150x150/FFF9C4/1A237E?text=Family",
    lastUpdated: "2 hours ago" 
  },
  { 
    id: 2, 
    name: "Travel Adventures", 
    emoji: "✈️", 
    count: 45, 
    color: theme.colors.secondary,
    coverImage: "https://via.placeholder.com/150x150/B3E5FC/1A237E?text=Travel", 
    lastUpdated: "1 day ago" 
  },
  { 
    id: 3, 
    name: "Baby Mateo", 
    emoji: "👶", 
    count: 156, 
    color: theme.colors.accent,
    coverImage: "https://via.placeholder.com/150x150/E8F5E8/1A237E?text=Baby",
    lastUpdated: "3 hours ago" 
  },
];

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const totalMemories = sampleFolders.reduce((sum, folder) => sum + folder.count, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <LinearGradient
          colors={[theme.colors.primaryLight, theme.colors.primary]}
          style={styles.welcomeSection}
        >
          <WelcomeHeader 
            userName={sampleUser.name}
            greeting={getGreeting()}
            profileImage={sampleUser.profileImage}
            plan={sampleUser.plan}
          />
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Memory Journey</Text>
          <View style={styles.statsContainer}>
            <MetricCard
              title="Total Memories"
              value={totalMemories}
              icon="images"
              color={theme.colors.primaryDark}
              subtitle="precious moments"
            />
            <MetricCard
              title="Folders"
              value={sampleFolders.length}
              icon="folder"
              color={theme.colors.secondary}
              subtitle="organized"
            />
            <MetricCard
              title="This Month"
              value="24"
              icon="calendar"
              color={theme.colors.success}
              subtitle="new uploads"
            />
          </View>
        </View>

        {/* AI Memory Prompts */}
        <View style={styles.memorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Remember This? ✨</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyFolders')}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memoryPromptsContainer}
          >
            {sampleMemoryPrompts.map(prompt => (
              <MemoryPrompt
                key={prompt.id}
                prompt={prompt}
                onPress={() => console.log('Memory prompt pressed:', prompt.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Recent Folders */}
        <View style={styles.foldersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Folders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyFolders')}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.foldersGrid}>
            {sampleFolders.map(folder => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onPress={() => navigation.navigate('FolderView', { folder })}
                style={styles.folderCard}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.primaryDark }]}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}>
              <Ionicons name="folder-open" size={24} color="white" />
              <Text style={styles.actionButtonText}>New Folder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  statsSection: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.sizes.lg,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllButton: {
    fontSize: theme.sizes.sm,
    fontFamily: theme.fonts.medium,
    color: theme.colors.primaryDark,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memorySection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  memoryPromptsContainer: {
    paddingRight: theme.spacing.md,
  },
  foldersSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  foldersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  folderCard: {
    width: (width - theme.spacing.md * 3) / 2,
    marginBottom: theme.spacing.md,
  },
  actionsSection: {
    paddingHorizontal: theme.spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.medium,
  },
  actionButtonText: {
    color: 'white',
    fontSize: theme.sizes.md,
    fontFamily: theme.fonts.medium,
    marginLeft: theme.spacing.sm,
  },
});
