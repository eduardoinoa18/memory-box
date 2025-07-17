// Memory Box Mobile App - Full Featured Version
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Context for app state management
const AppContext = createContext();
const useAppContext = () => useContext(AppContext);

// Enhanced theme
const theme = {
  colors: {
    primary: '#6C5CE7',
    secondary: '#A29BFE',
    accent: '#FD79A8',
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#E17055',
    background: '#F8F9FB',
    surface: '#FFFFFF',
    text: '#2D3436',
    textSecondary: '#636E72',
    textLight: '#B2BEC3',
    border: '#DDD6FE',
    shadow: 'rgba(108, 92, 231, 0.1)',
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  }
};

// Sample data (will be replaced with Firebase data)
const initialFolders = [
  { 
    id: '1', 
    name: "Family Moments", 
    emoji: "👨‍👩‍👧‍👦", 
    count: 87, 
    color: "#FF6B6B", 
    lastUpdated: new Date().toISOString(),
    description: "Our precious family memories",
    isPrivate: false,
    createdAt: new Date().toISOString(),
    tags: ['family', 'love', 'together']
  },
  { 
    id: '2', 
    name: "Travel Adventures", 
    emoji: "✈️", 
    count: 45, 
    color: "#4ECDC4", 
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    description: "Adventures around the world",
    isPrivate: false,
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    tags: ['travel', 'adventure', 'explore']
  },
  { 
    id: '3', 
    name: "Baby Mateo", 
    emoji: "👶", 
    count: 156, 
    color: "#45B7D1", 
    lastUpdated: new Date(Date.now() - 10800000).toISOString(),
    description: "Mateo's first years",
    isPrivate: false,
    createdAt: new Date(Date.now() - 31536000000).toISOString(),
    tags: ['baby', 'mateo', 'milestones']
  },
  { 
    id: '4', 
    name: "Private Vault", 
    emoji: "🔒", 
    count: 23, 
    color: "#6C5CE7", 
    lastUpdated: new Date(Date.now() - 432000000).toISOString(),
    description: "Protected memories",
    isPrivate: true,
    createdAt: new Date(Date.now() - 15552000000).toISOString(),
    tags: ['private', 'secure', 'personal']
  }
];

const recentActivities = [
  { 
    id: '1', 
    emoji: "📸", 
    title: "New photo added to Baby Mateo", 
    time: "2 hours ago", 
    type: "upload",
    folderId: '3'
  },
  { 
    id: '2', 
    emoji: "💭", 
    title: "Memory reminder: Family vacation photos", 
    time: "1 day ago", 
    type: "reminder",
    folderId: '1'
  },
  { 
    id: '3', 
    emoji: "🔗", 
    title: "Family Moments shared with Maria", 
    time: "3 days ago", 
    type: "share",
    folderId: '1'
  },
  { 
    id: '4', 
    emoji: "🆕", 
    title: "New folder 'Summer 2025' created", 
    time: "1 week ago", 
    type: "create",
    folderId: 'new'
  },
  { 
    id: '5', 
    emoji: "🤖", 
    title: "AI curated 5 beautiful moments", 
    time: "2 days ago", 
    type: "ai",
    folderId: 'multiple'
  },
];

// App Context Provider
function AppProvider({ children }) {
  const [folders, setFolders] = useState(initialFolders);
  const [activities, setActivities] = useState(recentActivities);
  const [user, setUser] = useState({
    name: 'Eduardo',
    email: 'eduardo@memorybox.com',
    avatar: null,
    plan: 'free', // free, premium, family
    storageUsed: 2.4, // GB
    storageLimit: 15, // GB
  });
  const [settings, setSettings] = useState({
    notifications: true,
    biometricLock: false,
    autoBackup: true,
    theme: 'auto', // light, dark, auto
    reminderFrequency: 'weekly', // daily, weekly, monthly
  });

  // Storage functions
  const saveData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadData = async (key, defaultValue) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Error loading data:', error);
      return defaultValue;
    }
  };

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      const savedFolders = await loadData('folders', initialFolders);
      const savedActivities = await loadData('activities', recentActivities);
      const savedSettings = await loadData('settings', settings);
      
      setFolders(savedFolders);
      setActivities(savedActivities);
      setSettings(savedSettings);
    };

    initializeApp();
  }, []);

  // Save data when state changes
  useEffect(() => {
    saveData('folders', folders);
  }, [folders]);

  useEffect(() => {
    saveData('activities', activities);
  }, [activities]);

  useEffect(() => {
    saveData('settings', settings);
  }, [settings]);

  const contextValue = {
    folders,
    setFolders,
    activities,
    setActivities,
    user,
    setUser,
    settings,
    setSettings,
    theme,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Enhanced Components
function FloatingActionButton({ onPress, icon = "+", style, color = theme.colors.primary }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity 
      style={[styles.fab, { backgroundColor: color }, style]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={styles.fabText}>{icon}</Text>
    </TouchableOpacity>
  );
}

function FolderCard({ folder, onPress, onLongPress, viewMode = 'grid' }) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress(folder);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onLongPress(folder);
  };

  const cardStyle = viewMode === 'grid' ? styles.folderCard : styles.folderCardList;

  return (
    <TouchableOpacity 
      style={[cardStyle, { borderLeftColor: folder.color }]} 
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[folder.color + '10', folder.color + '05']}
        style={styles.folderGradient}
      >
        <View style={styles.folderHeader}>
          <Text style={styles.folderEmoji}>{folder.emoji}</Text>
          <View style={[styles.folderCount, { backgroundColor: folder.color + '20' }]}>
            <Text style={[styles.folderCountText, { color: folder.color }]}>
              {folder.count || 0}
            </Text>
          </View>
          {folder.isPrivate && (
            <View style={styles.privateIcon}>
              <Text style={styles.privateIconText}>🔒</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.folderName} numberOfLines={2}>{folder.name}</Text>
        <Text style={styles.folderDescription} numberOfLines={1}>{folder.description}</Text>
        
        <View style={styles.folderFooter}>
          <Text style={styles.folderSubtext}>{folder.count || 0} memories</Text>
          <Text style={styles.folderLastUpdated}>
            {new Date(folder.lastUpdated).toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function ActivityCard({ activity, onPress }) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress(activity);
  };

  return (
    <TouchableOpacity 
      style={styles.activityCard} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.activityIcon}>
        <Text style={styles.activityEmoji}>{activity.emoji}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle} numberOfLines={2}>{activity.title}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
      <View style={styles.activityArrow}>
        <Text style={styles.activityArrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

function StatCard({ title, value, trend, color, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.statCard, { borderTopColor: color }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color + '10', color + '05']}
        style={styles.statGradient}
      >
        <Text style={[styles.statNumber, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{title}</Text>
        <Text style={styles.statTrend}>{trend}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Create Folder Modal
function CreateFolderModal({ visible, onClose, onCreateFolder }) {
  const [folderName, setFolderName] = useState('');
  const [folderEmoji, setFolderEmoji] = useState('📁');
  const [folderColor, setFolderColor] = useState('#6C5CE7');
  const [folderDescription, setFolderDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const colors = ['#6C5CE7', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF7675'];
  const emojis = ['📁', '👨‍👩‍👧‍👦', '✈️', '👶', '🎉', '🎓', '💼', '🏠', '🎨', '🎵', '📚', '🍳'];

  const handleCreate = () => {
    if (!folderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    const newFolder = {
      id: Date.now().toString(),
      name: folderName,
      emoji: folderEmoji,
      color: folderColor,
      description: folderDescription,
      isPrivate: isPrivate,
      count: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      tags: []
    };

    onCreateFolder(newFolder);
    
    // Reset form
    setFolderName('');
    setFolderEmoji('📁');
    setFolderColor('#6C5CE7');
    setFolderDescription('');
    setIsPrivate(false);
    
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Folder</Text>
          <TouchableOpacity onPress={handleCreate}>
            <Text style={styles.modalCreateButton}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Folder Name</Text>
            <TextInput
              style={styles.textInput}
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Enter folder name"
              maxLength={50}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              value={folderDescription}
              onChangeText={setFolderDescription}
              placeholder="Describe this folder"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Choose Emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiContainer}>
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.emojiButton,
                    folderEmoji === emoji && styles.emojiButtonSelected
                  ]}
                  onPress={() => setFolderEmoji(emoji)}
                >
                  <Text style={styles.emojiButtonText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Choose Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorContainer}>
              {colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    folderColor === color && styles.colorButtonSelected
                  ]}
                  onPress={() => setFolderColor(color)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <View>
                <Text style={styles.formLabel}>Private Folder</Text>
                <Text style={styles.formHint}>Requires biometric authentication</Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: '#DDD6FE', true: theme.colors.primary + '50' }}
                thumbColor={isPrivate ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Screens
function HomeScreen() {
  const { folders, activities, user } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    
    Alert.alert("Refreshed! ✨", "Your memory vault is up to date");
  };

  const totalMemories = folders.reduce((sum, folder) => sum + folder.count, 0);
  const storagePercent = Math.round((user.storageUsed / user.storageLimit) * 100);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Welcome Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.welcomeHeader}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeGreeting}>Good morning, {user.name}! 👋</Text>
            <Text style={styles.welcomeSubtext}>Your memories are safe and organized</Text>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert("Camera", "Camera feature coming soon!")}
          >
            <Text style={styles.quickActionEmoji}>📷</Text>
            <Text style={styles.quickActionText}>Capture</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert("Upload", "Upload feature coming soon!")}
          >
            <Text style={styles.quickActionEmoji}>📤</Text>
            <Text style={styles.quickActionText}>Upload</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert("Scan", "Scan feature coming soon!")}
          >
            <Text style={styles.quickActionEmoji}>📄</Text>
            <Text style={styles.quickActionText}>Scan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert("Voice", "Voice memo feature coming soon!")}
          >
            <Text style={styles.quickActionEmoji}>🎤</Text>
            <Text style={styles.quickActionText}>Voice</Text>
          </TouchableOpacity>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Memories"
            value={totalMemories.toString()}
            trend="↗️ Growing"
            color={theme.colors.primary}
            onPress={() => Alert.alert("Total Memories 📊", `You have ${totalMemories} precious memories saved!`)}
          />
          
          <StatCard
            title="Folders"
            value={folders.length.toString()}
            trend="📁 Organized"
            color={theme.colors.success}
            onPress={() => Alert.alert("Folders 📁", `${folders.length} organized folders.`)}
          />
          
          <StatCard
            title="Storage"
            value={`${user.storageUsed}GB`}
            trend={`💾 ${100 - storagePercent}% free`}
            color={storagePercent > 80 ? theme.colors.warning : theme.colors.accent}
            onPress={() => Alert.alert("Storage 💾", `${user.storageUsed}GB of ${user.storageLimit}GB used (${storagePercent}%)`)}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => Alert.alert("Activity", "View all activities")}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {activities.slice(0, 4).map(activity => (
            <ActivityCard 
              key={activity.id}
              activity={activity}
              onPress={() => Alert.alert(activity.title, `Activity from ${activity.time}`)}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FoldersScreen({ navigation }) {
  const { folders, setFolders, setActivities } = useAppContext();
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const handleCreateFolder = (newFolder) => {
    setFolders(prev => [...prev, newFolder]);
    
    // Add activity
    const newActivity = {
      id: Date.now().toString(),
      emoji: "🆕",
      title: `New folder '${newFolder.name}' created`,
      time: "Just now",
      type: "create",
      folderId: newFolder.id
    };
    
    setActivities(prev => [newActivity, ...prev]);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Success! 🎉", `Folder "${newFolder.name}" created successfully`);
  };

  const handleFolderPress = (folder) => {
    navigation.navigate('FolderView', { folder });
  };

  const handleFolderLongPress = (folder) => {
    Alert.alert(
      folder.name,
      "What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Edit", onPress: () => Alert.alert("Edit", "Edit feature coming soon!") },
        { text: "Share", onPress: () => Alert.alert("Share", "Share feature coming soon!") },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Delete Folder",
              `Are you sure you want to delete "${folder.name}"? This cannot be undone.`,
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Delete", 
                  style: "destructive",
                  onPress: () => {
                    setFolders(prev => prev.filter(f => f.id !== folder.id));
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderFolder = ({ item }) => (
    <FolderCard 
      folder={item} 
      onPress={handleFolderPress}
      onLongPress={handleFolderLongPress}
      viewMode={viewMode}
    />
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.foldersHeader}>
        <Text style={styles.screenTitle}>My Folders</Text>
        <View style={styles.foldersHeaderActions}>
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Text style={styles.viewModeButtonText}>
              {viewMode === 'grid' ? '☰' : '⊞'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={folders}
        renderItem={renderFolder}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={styles.foldersContainer}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton 
        onPress={() => setShowCreateModal(true)}
        icon="+"
      />

      <CreateFolderModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateFolder={handleCreateFolder}
      />
    </SafeAreaView>
  );
}

function FolderViewScreen({ route, navigation }) {
  const { folder } = route.params;

  useEffect(() => {
    navigation.setOptions({
      title: folder.name,
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => Alert.alert("Options", "Folder options coming soon!")}
        >
          <Text style={styles.headerButtonText}>⋯</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, folder.name]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.folderViewHeader}>
        <View style={styles.folderViewInfo}>
          <Text style={styles.folderViewEmoji}>{folder.emoji}</Text>
          <View>
            <Text style={styles.folderViewName}>{folder.name}</Text>
            <Text style={styles.folderViewDescription}>{folder.description}</Text>
            <Text style={styles.folderViewCount}>{folder.count} memories</Text>
          </View>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyStateEmoji}>📷</Text>
        <Text style={styles.emptyStateTitle}>No memories yet</Text>
        <Text style={styles.emptyStateText}>
          Start adding photos, videos, or documents to this folder
        </Text>
        <TouchableOpacity 
          style={styles.emptyStateButton}
          onPress={() => Alert.alert("Upload", "Upload feature coming soon!")}
        >
          <Text style={styles.emptyStateButtonText}>Add First Memory</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function UploadScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.uploadContainer}>
        <Text style={styles.screenTitle}>Add Memories</Text>
        
        <View style={styles.uploadOptions}>
          <TouchableOpacity 
            style={styles.uploadOption}
            onPress={() => Alert.alert("Camera", "Camera feature coming soon!")}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.uploadOptionGradient}
            >
              <Text style={styles.uploadOptionEmoji}>📷</Text>
              <Text style={styles.uploadOptionTitle}>Camera</Text>
              <Text style={styles.uploadOptionSubtitle}>Take a photo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.uploadOption}
            onPress={() => Alert.alert("Gallery", "Gallery feature coming soon!")}
          >
            <LinearGradient
              colors={[theme.colors.accent, theme.colors.warning]}
              style={styles.uploadOptionGradient}
            >
              <Text style={styles.uploadOptionEmoji}>🖼️</Text>
              <Text style={styles.uploadOptionTitle}>Gallery</Text>
              <Text style={styles.uploadOptionSubtitle}>Choose from library</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.uploadOption}
            onPress={() => Alert.alert("Scan", "Document scan coming soon!")}
          >
            <LinearGradient
              colors={[theme.colors.success, '#00D2A4']}
              style={styles.uploadOptionGradient}
            >
              <Text style={styles.uploadOptionEmoji}>📄</Text>
              <Text style={styles.uploadOptionTitle}>Scan</Text>
              <Text style={styles.uploadOptionSubtitle}>Document or text</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.uploadOption}
            onPress={() => Alert.alert("Voice", "Voice memo coming soon!")}
          >
            <LinearGradient
              colors={['#A29BFE', '#6C5CE7']}
              style={styles.uploadOptionGradient}
            >
              <Text style={styles.uploadOptionEmoji}>🎤</Text>
              <Text style={styles.uploadOptionTitle}>Voice</Text>
              <Text style={styles.uploadOptionSubtitle}>Record a memo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function VaultScreen() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlock = () => {
    Alert.alert(
      "Biometric Authentication",
      "Use Face ID or fingerprint to unlock your private vault",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Unlock", 
          onPress: () => {
            // Simulate biometric authentication
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsUnlocked(true);
          }
        }
      ]
    );
  };

  if (!isUnlocked) {
    return (
      <SafeAreaView style={[styles.screen, styles.vaultLocked]}>
        <View style={styles.vaultLockContainer}>
          <Text style={styles.vaultLockEmoji}>🔒</Text>
          <Text style={styles.vaultLockTitle}>Private Vault</Text>
          <Text style={styles.vaultLockSubtitle}>
            Your most private memories are protected with biometric authentication
          </Text>
          <TouchableOpacity 
            style={styles.unlockButton}
            onPress={handleUnlock}
          >
            <Text style={styles.unlockButtonText}>Unlock with Face ID</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.vaultHeader}>
        <Text style={styles.vaultHeaderTitle}>🔓 Private Vault</Text>
        <TouchableOpacity 
          style={styles.lockButton}
          onPress={() => setIsUnlocked(false)}
        >
          <Text style={styles.lockButtonText}>Lock</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyStateEmoji}>🔐</Text>
        <Text style={styles.emptyStateTitle}>Vault is empty</Text>
        <Text style={styles.emptyStateText}>
          Add your most private and sensitive memories here
        </Text>
        <TouchableOpacity 
          style={styles.emptyStateButton}
          onPress={() => Alert.alert("Add to Vault", "Private upload coming soon!")}
        >
          <Text style={styles.emptyStateButtonText}>Add Private Memory</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SettingsScreen() {
  const { user, settings, setSettings } = useAppContext();

  const settingsOptions = [
    {
      emoji: "🔔",
      title: "Notifications",
      subtitle: "Memory reminders and updates",
      type: "switch",
      key: "notifications",
      value: settings.notifications
    },
    {
      emoji: "👆",
      title: "Biometric Lock",
      subtitle: "Face ID for vault access",
      type: "switch", 
      key: "biometricLock",
      value: settings.biometricLock
    },
    {
      emoji: "☁️",
      title: "Auto Backup",
      subtitle: "Automatically backup new memories",
      type: "switch",
      key: "autoBackup", 
      value: settings.autoBackup
    },
    {
      emoji: "🎨",
      title: "Theme",
      subtitle: `Current: ${settings.theme}`,
      type: "navigation",
      onPress: () => Alert.alert("Theme", "Theme selection coming soon!")
    },
    {
      emoji: "💾",
      title: "Storage",
      subtitle: `${user.storageUsed}GB of ${user.storageLimit}GB used`,
      type: "navigation",
      onPress: () => Alert.alert("Storage", "Storage management coming soon!")
    },
    {
      emoji: "👤",
      title: "Account",
      subtitle: user.email,
      type: "navigation",
      onPress: () => Alert.alert("Account", "Account settings coming soon!")
    },
    {
      emoji: "🔗",
      title: "Share App",
      subtitle: "Tell others about Memory Box",
      type: "navigation",
      onPress: () => Alert.alert("Share", "Share feature coming soon!")
    },
    {
      emoji: "❓",
      title: "Help & Support",
      subtitle: "Get help or send feedback",
      type: "navigation",
      onPress: () => Alert.alert("Support", "Support coming soon!")
    }
  ];

  const handleSwitchChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    Haptics.selectionAsync();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <Text style={styles.profilePlan}>
              {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
            </Text>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsContainer}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingsOption}
              onPress={option.onPress}
              disabled={option.type === 'switch'}
              activeOpacity={option.type === 'switch' ? 1 : 0.7}
            >
              <Text style={styles.settingsOptionEmoji}>{option.emoji}</Text>
              <View style={styles.settingsOptionContent}>
                <Text style={styles.settingsOptionTitle}>{option.title}</Text>
                <Text style={styles.settingsOptionSubtitle}>{option.subtitle}</Text>
              </View>
              {option.type === 'switch' ? (
                <Switch
                  value={option.value}
                  onValueChange={(value) => handleSwitchChange(option.key, value)}
                  trackColor={{ false: '#DDD6FE', true: theme.colors.primary + '50' }}
                  thumbColor={option.value ? theme.colors.primary : '#f4f3f4'}
                />
              ) : (
                <Text style={styles.settingsOptionArrow}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>Memory Box</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoCopyright}>© 2025 Memory Box Inc.</Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Stack Navigator for Folders
function FoldersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FoldersList" 
        component={FoldersScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FolderView" 
        component={FolderViewScreen}
        options={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
}

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? '🏠' : '🏠';
          } else if (route.name === 'Folders') {
            iconName = focused ? '📁' : '📁';
          } else if (route.name === 'Upload') {
            iconName = focused ? '📤' : '📤';
          } else if (route.name === 'Vault') {
            iconName = focused ? '🔒' : '🔒';
          } else if (route.name === 'Settings') {
            iconName = focused ? '⚙️' : '⚙️';
          }

          return <Text style={{ fontSize: 20 }}>{iconName}</Text>;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Folders" component={FoldersStack} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <AppProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Welcome Header
  welcomeHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeGreeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 3,
  },
  statGradient: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statTrend: {
    fontSize: 10,
    color: theme.colors.textLight,
  },

  // Sections
  sectionContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewAllButton: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },

  // Activity Cards
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    elevation: 1,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  activityEmoji: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  activityArrow: {
    padding: theme.spacing.sm,
  },
  activityArrowText: {
    fontSize: 18,
    color: theme.colors.textLight,
  },

  // Folders Screen
  foldersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  foldersHeaderActions: {
    flexDirection: 'row',
  },
  viewModeButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
  },
  viewModeButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  foldersContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },

  // Folder Cards
  folderCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.xs,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  folderCardList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.xs,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  folderGradient: {
    padding: theme.spacing.md,
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  folderEmoji: {
    fontSize: 32,
  },
  folderCount: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  folderCountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  privateIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  privateIconText: {
    fontSize: 16,
  },
  folderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  folderDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  folderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  folderSubtext: {
    fontSize: 11,
    color: theme.colors.textLight,
  },
  folderLastUpdated: {
    fontSize: 11,
    color: theme.colors.textLight,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalCancelButton: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  modalCreateButton: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    padding: theme.spacing.lg,
  },

  // Form
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  formHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Emoji/Color Selectors
  emojiContainer: {
    marginTop: theme.spacing.sm,
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    borderColor: theme.colors.primary,
  },
  emojiButtonText: {
    fontSize: 24,
  },
  colorContainer: {
    marginTop: theme.spacing.sm,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: theme.colors.text,
  },

  // Folder View
  folderViewHeader: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  folderViewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderViewEmoji: {
    fontSize: 48,
    marginRight: theme.spacing.md,
  },
  folderViewName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  folderViewDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  folderViewCount: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  headerButton: {
    padding: theme.spacing.sm,
  },
  headerButtonText: {
    fontSize: 18,
    color: theme.colors.primary,
  },

  // Upload Screen
  uploadContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  uploadOptions: {
    flex: 1,
    justifyContent: 'center',
  },
  uploadOption: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  uploadOptionGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  uploadOptionEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  uploadOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  uploadOptionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Vault Screen
  vaultLocked: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaultLockContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  vaultLockEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  vaultLockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  vaultLockSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  unlockButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  vaultHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  lockButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  lockButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyStateButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Settings Screen
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  profilePlan: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: theme.spacing.xs,
  },
  settingsContainer: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingsOptionEmoji: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  settingsOptionContent: {
    flex: 1,
  },
  settingsOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  settingsOptionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  settingsOptionArrow: {
    fontSize: 18,
    color: theme.colors.textLight,
  },
  appInfo: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  appInfoVersion: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  appInfoCopyright: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
});
