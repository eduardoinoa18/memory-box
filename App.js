// Memory Box - Production App with Cross-Platform Optimization
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  AppState
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';

// Firebase imports
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

// Error Boundary for production stability
import ErrorBoundary from './components/ErrorBoundary';

// Import essential components
import { 
  theme, 
  MemoryBoxLogo,
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
  MemoryViewer
} from './components/AllComponents';

import AuthScreen from './components/AuthScreen';

// Import services
import demoDataService from './services/demoDataService';
import authService from './services/authService';
import subscriptionService from './services/subscriptionService';
import exportBackupService from './services/exportBackupService';
import offlineService from './services/offlineService';

// Import screens
import HomeScreen from './screens/HomeScreen';
import FoldersScreen from './screens/FoldersScreen';
import FolderViewScreen from './screens/FolderViewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// HomeScreen is now imported from ./screens/HomeScreen.js

// Create a Stack Navigator for Folders to support navigation to FolderView
function FoldersStack({ user }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FoldersList">
        {(props) => <FoldersScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="FolderView">
        {(props) => <FolderViewScreen {...props} user={user} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// FoldersScreen is now imported from ./screens/FoldersScreen.js

// Upload Screen
function UploadScreen({ user, navigation }) {
  const [recentMemories, setRecentMemories] = useState([]);

  const handleMemoryAdded = (memoryData) => {
    // Update recent memories list
    setRecentMemories(prev => [memoryData, ...prev.slice(0, 9)]); // Keep last 10

    // Show success feedback
    Alert.alert(
      'Memory Saved!',
      `"${memoryData.fileName}" has been uploaded successfully.`,
      [
        { text: 'OK' },
        { text: 'View in Folders', onPress: () => navigation?.navigate('Folders') }
      ]
    );
  };

  return (
    <PermissionGate
      permission="canUploadMemories"
      fallbackComponent={
        <SafeAreaView style={styles.container}>
          <View style={styles.restrictedContainer}>
            <Ionicons name="cloud-upload-outline" size={80} color="#ddd" />
            <Text style={styles.restrictedTitle}>Upload Restricted</Text>
            <Text style={styles.restrictedMessage}>
              You need contributor access to upload memories. Contact your family owner to upgrade your permissions.
            </Text>
          </View>
        </SafeAreaView>
      }
    >
      <EnhancedUploadScreen
        user={user}
        onMemoryAdded={handleMemoryAdded}
        recentMemories={recentMemories}
      />
    </PermissionGate>
  );
}

// Family Screen
function FamilyScreen({ user }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Family & Sharing</Text>
          <Text style={styles.headerSubtitle}>Manage your family members and permissions</Text>
        </View>
      </View>
      
      <FamilyAccountsManager user={user} />
    </SafeAreaView>
  );
}

// Enhanced Profile Screen Component
function EnhancedProfileScreen({ user, onLogout }) {
  const [notifications, setNotifications] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);

  // New state for advanced features
  const [showRobAI, setShowRobAI] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showMemoryViewer, setShowMemoryViewer] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);

  // Subscribe to real-time subscription updates
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscriptionService.subscribeToUserSubscription(
        user.uid,
        (data) => {
          setSubscriptionData(data);
          console.log('Subscription data updated:', data);
        }
      );
      return unsubscribe;
    }
  }, [user]);

  const getUserPlanInfo = () => {
    if (!subscriptionData) {
      return {
        name: 'Free Plan',
        storage: '1GB',
        folders: 5,
        files: 50,
        features: ['Basic photo upload', 'Limited folders', 'Basic sharing']
      };
    }

    // Get plan info from real subscription data
    const planConfig = {
      free: {
        name: 'Free Plan',
        storage: '1GB',
        folders: 5,
        files: 50,
        features: ['Basic photo upload', 'Limited folders', 'Basic sharing']
      },
      premium: {
        name: 'Premium Plan',
        storage: '50GB',
        folders: 50,
        files: 1000,
        features: ['HD video upload', 'Advanced scanning', 'Priority support', 'Extended sharing']
      },
      family: {
        name: 'Family Plan',
        storage: '200GB',
        folders: 100,
        files: 5000,
        features: ['Multiple accounts', 'Unlimited sharing', '24/7 support', 'Advanced features']
      }
    };

    const currentPlan = subscriptionData.plan || 'free';
    return planConfig[currentPlan] || planConfig.free;
  };

  const planInfo = getUserPlanInfo();
  const currentPlan = subscriptionData?.plan || 'free';
  const subscriptionStatus = subscriptionData?.status || 'inactive';
  const isSubscriptionActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  const handleSubscription = () => {
    setShowSubscriptionModal(true);
  };

  const handleNotifications = () => {
    setNotifications(!notifications);
    Alert.alert(
      'Notifications',
      notifications ? 'Notifications disabled' : 'Notifications enabled'
    );
  };

  const handleAILetter = () => {
    setShowRobAI(true);
  };

  const handleTimeline = () => {
    setShowTimeline(true);
  };

  const handleSearch = () => {
    setShowSearch(true);
  };

  const handleLetterGenerated = (letter, answers) => {
    Alert.alert(
      'Letter Created!',
      'Your AI-generated letter has been saved to your memories.',
      [{ text: 'OK' }]
    );
  };

  const handleMemorySelect = (memory) => {
    setShowSearch(false);
    Alert.alert(
      memory.title || 'Memory',
      memory.description || 'No description available',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Help & Support',
      'How can we help you?',
      [
        { text: 'FAQ', onPress: () => Alert.alert('FAQ', 'Frequently asked questions coming soon!') },
        { text: 'Contact Support', onPress: () => Alert.alert('Support', 'Email: support@memorybox.app') },
        { text: 'Feature Request', onPress: () => Alert.alert('Feedback', 'Thank you! We value your input.') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImageText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>

          <View style={styles.subscriptionBadge}>
            <Text style={styles.subscriptionText}>{planInfo.name}</Text>
            {subscriptionStatus !== 'inactive' && (
              <Text style={styles.subscriptionStatus}>
                Status: {subscriptionStatus}
              </Text>
            )}
          </View>
        </View>

        {/* Plan Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <View style={styles.planCard}>
            <Text style={styles.planName}>{planInfo.name}</Text>
            <Text style={styles.planDetails}>
              • Storage: {planInfo.storage}{'\n'}
              • Folders: {planInfo.folders}{'\n'}
              • Files: {planInfo.files}
            </Text>
            {currentPlan === 'free' && (
              <TouchableOpacity style={styles.upgradeButton} onPress={handleSubscription}>
                <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
              </TouchableOpacity>
            )}
            {currentPlan !== 'free' && (
              <TouchableOpacity style={styles.upgradeButton} onPress={handleSubscription}>
                <Text style={styles.upgradeButtonText}>Manage Subscription</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* AI Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ AI Features</Text>

          <TouchableOpacity style={styles.profileOption} onPress={handleAILetter}>
            <Ionicons name="mail-outline" size={24} color="#9B59B6" />
            <Text style={styles.profileOptionText}>Rob AI Letter Writer</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#9B59B6' }]}>AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={handleTimeline}>
            <Ionicons name="analytics-outline" size={24} color="#3498DB" />
            <Text style={styles.profileOptionText}>Memory Timeline</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#3498DB' }]}>Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={handleSearch}>
            <Ionicons name="search-outline" size={24} color="#E74C3C" />
            <Text style={styles.profileOptionText}>Smart Search</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#E74C3C' }]}>Advanced</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={() => setShowFolderManager(true)}>
            <Ionicons name="folder-outline" size={24} color="#F39C12" />
            <Text style={styles.profileOptionText}>Advanced Folders</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#F39C12' }]}>Organize</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={() => setShowCollections(true)}>
            <Ionicons name="albums-outline" size={24} color="#8E44AD" />
            <Text style={styles.profileOptionText}>Smart Collections</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#8E44AD' }]}>Auto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={() => exportBackupService.createFullBackup(user?.uid)}>
            <Ionicons name="cloud-download-outline" size={24} color="#16A085" />
            <Text style={styles.profileOptionText}>Export & Backup</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#16A085' }]}>Secure</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          <TouchableOpacity style={styles.profileOption} onPress={handleSubscription}>
            <Ionicons name="card-outline" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.profileOptionText}>Subscription</Text>
            {currentPlan === 'free' && <Text style={styles.optionBadge}>Upgrade</Text>}
            {currentPlan !== 'free' && <Text style={[styles.optionBadge, { backgroundColor: theme.colors.success }]}>
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={handleNotifications}>
            <Ionicons
              name={notifications ? "notifications" : "notifications-off"}
              size={24}
              color={theme.colors.primaryDark}
            />
            <Text style={styles.profileOptionText}>Notifications</Text>
            <Text style={[styles.optionBadge, { backgroundColor: notifications ? theme.colors.success : theme.colors.textSecondary }]}>
              {notifications ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={handleSupport}>
            <Ionicons name="help-circle-outline" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.profileOptionText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption}>
            <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.profileOptionText}>Privacy & Security</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption}>
            <Ionicons name="share-outline" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.profileOptionText}>Share App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileOption, styles.logoutOption]}
            onPress={onLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.profileOptionText, { color: theme.colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Permissions Status Section */}
        <PermissionStatus user={user} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <View style={styles.planCard}>
            <Text style={styles.planName}>{planInfo.name}</Text>
            <Text style={styles.planDetails}>
              • Storage: {planInfo.storage}{'\n'}
              • Folders: {planInfo.folders}{'\n'}
              • Files: {planInfo.files}
            </Text>
            {currentPlan === 'free' && (
              <TouchableOpacity style={styles.upgradeButton} onPress={handleSubscription}>
                <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
              </TouchableOpacity>
            )}
            {currentPlan !== 'free' && (
              <TouchableOpacity style={styles.upgradeButton} onPress={handleSubscription}>
                <Text style={styles.upgradeButtonText}>Manage Subscription</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* AI Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ AI Features</Text>

          <TouchableOpacity style={styles.profileOption} onPress={handleAILetter}>
            <Ionicons name="mail-outline" size={24} color="#9B59B6" />
            <Text style={styles.profileOptionText}>Rob AI Letter Writer</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#9B59B6' }]}>AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={handleTimeline}>
            <Ionicons name="analytics-outline" size={24} color="#3498DB" />
            <Text style={styles.profileOptionText}>Memory Timeline</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#3498DB' }]}>Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={handleSearch}>
            <Ionicons name="search-outline" size={24} color="#E74C3C" />
            <Text style={styles.profileOptionText}>Smart Search</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#E74C3C' }]}>Advanced</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={() => setShowFolderManager(true)}>
            <Ionicons name="folder-outline" size={24} color="#F39C12" />
            <Text style={styles.profileOptionText}>Advanced Folders</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#F39C12' }]}>Organize</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={() => setShowCollections(true)}>
            <Ionicons name="albums-outline" size={24} color="#8E44AD" />
            <Text style={styles.profileOptionText}>Smart Collections</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#8E44AD' }]}>Auto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={() => exportBackupService.createFullBackup(user?.uid)}>
            <Ionicons name="cloud-download-outline" size={24} color="#16A085" />
            <Text style={styles.profileOptionText}>Export & Backup</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#16A085' }]}>Secure</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          <TouchableOpacity style={styles.profileOption} onPress={handleSubscription}>
            <Ionicons name="card-outline" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.profileOptionText}>Subscription</Text>
            {currentPlan === 'free' && <Text style={styles.optionBadge}>Upgrade</Text>}
            {currentPlan !== 'free' && <Text style={[styles.optionBadge, { backgroundColor: theme.colors.success }]}>
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={handleNotifications}>
            <Ionicons
              name={notifications ? "notifications" : "notifications-off"}
              size={24}
              color={theme.colors.primaryDark}
            />
            <Text style={styles.profileOptionText}>Notifications</Text>
            <Text style={[styles.optionBadge, { backgroundColor: notifications ? theme.colors.success : theme.colors.textSecondary }]}>
              {notifications ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption} onPress={handleSupport}>
            <Ionicons name="help-circle-outline" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.profileOptionText}>Help & Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption}>
            <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.profileOptionText}>Privacy & Security</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileOption}>
            <Ionicons name="share-outline" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.profileOptionText}>Share App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileOption, styles.logoutOption]}
            onPress={onLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.profileOptionText, { color: theme.colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        user={user}
        currentPlan={currentPlan}
      />

      {/* Rob AI Assistant Modal */}
      <RobAIAssistant
        visible={showRobAI}
        onClose={() => setShowRobAI(false)}
        user={user}
        onLetterGenerated={handleLetterGenerated}
      />

      {/* Enhanced Memory Timeline Modal */}
      <EnhancedMemoryTimeline
        visible={showTimeline}
        onClose={() => setShowTimeline(false)}
        user={user}
        onMemoryPress={handleMemorySelect}
      />

      {/* Advanced Search Modal */}
      <AdvancedSearch
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        user={user}
        onMemorySelect={(memory) => {
          setSelectedMemory(memory);
          setShowSearch(false);
          setShowMemoryViewer(true);
        }}
      />

      {/* Advanced Folder Manager Modal */}
      <AdvancedFolderManager
        visible={showFolderManager}
        onClose={() => setShowFolderManager(false)}
        user={user}
        onFolderSelect={(folder) => {
          setShowFolderManager(false);
          Alert.alert('Folder Selected', `Opening ${folder.name}`);
        }}
      />

      {/* Memory Collections Modal */}
      <MemoryCollections
        visible={showCollections}
        onClose={() => setShowCollections(false)}
        user={user}
        onCollectionSelect={(collection) => {
          setShowCollections(false);
          Alert.alert('Collection Selected', `Opening ${collection.name}`);
        }}
      />

      {/* Memory Viewer Modal */}
      <MemoryViewer
        visible={showMemoryViewer}
        onClose={() => setShowMemoryViewer(false)}
        memory={selectedMemory}
        user={user}
        onEdit={(memory) => {
          setShowMemoryViewer(false);
          Alert.alert('Edit Memory', 'Opening edit view...');
        }}
        onShare={(memory) => {
          Alert.alert('Share Memory', 'Sharing functionality coming soon!');
        }}
      />
    </SafeAreaView>
  );
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app services and demo data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Initialize demo data service
        await demoDataService.initialize();
        
        // Initialize offline service
        if (offlineService?.initialize) {
          await offlineService.initialize();
        }
        
        // If in demo mode, auto-login with demo user
        if (demoDataService.isDemoMode()) {
          const demoUser = await demoDataService.signInDemo();
          if (demoUser) {
            setUser(demoUser);
            console.log('Demo mode activated with demo user');
          }
        }
        
        setIsInitialized(true);
        console.log('App initialization complete');
      } catch (error) {
        console.error('App initialization error:', error);
        setIsInitialized(true); // Continue even if initialization fails
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Firebase auth state listener (only when not in demo mode)
  useEffect(() => {
    if (demoDataService.isDemoMode() || !isInitialized) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to app user format
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          plan: 'free', // Default plan, can be updated from Firestore
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isInitialized]);

  const handleLogin = async (userData) => {
    try {
      if (demoDataService.isDemoMode()) {
        // In demo mode, set the demo user
        const demoUser = await demoDataService.signInDemo();
        setUser(demoUser);
      } else {
        // Firebase auth will automatically trigger the auth state change
        // User state is managed by onAuthStateChanged listener
        setUser(userData);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'There was an issue signing in. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              if (demoDataService.isDemoMode()) {
                // In demo mode, just clear the user state
                setUser(null);
              } else {
                await authService.signOut();
                // User state will be updated by onAuthStateChanged
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <MemoryBoxLogo size={60} animated={true} />
        <Text style={styles.loadingText}>Loading your memories...</Text>
      </View>
    );
  }

  // Authentication screen
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Main app
  return (
    <PermissionsProvider user={user}>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor={theme.colors.background} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Folders') {
                iconName = focused ? 'folder' : 'folder-outline';
              } else if (route.name === 'Upload') {
                iconName = focused ? 'add-circle' : 'add-circle-outline';
              } else if (route.name === 'Family') {
                iconName = focused ? 'people' : 'people-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={24} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primaryDark,
            tabBarInactiveTintColor: theme.colors.textLight,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              paddingBottom: 8,
              paddingTop: 8,
              height: 60,
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home">
            {(props) => <HomeScreen {...props} user={user} />}
          </Tab.Screen>
          <Tab.Screen name="Folders">
            {(props) => <FoldersStack {...props} user={user} />}
          </Tab.Screen>
          <Tab.Screen name="Upload">
            {(props) => <UploadScreen {...props} user={user} />}
          </Tab.Screen>
          <Tab.Screen name="Family">
            {(props) => <FamilyScreen {...props} user={user} />}
          </Tab.Screen>
          <Tab.Screen name="Profile">
            {(props) => <EnhancedProfileScreen {...props} user={user} onLogout={handleLogout} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </PermissionsProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  folderRow: {
    flexDirection: 'row',
  },
  foldersContainer: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  comingSoonIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: 16,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  subscriptionBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscriptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  subscriptionStatus: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    marginVertical: 4,
    borderRadius: 12,
  },
  profileOptionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  optionBadge: {
    fontSize: 12,
    color: theme.colors.primaryDark,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logoutOption: {
    marginTop: 16,
  },
  planCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  planDetails: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  quickActionText: {
    fontSize: 12,
    color: theme.colors.primaryDark,
    marginTop: 4,
    textAlign: 'center',
  },
});
