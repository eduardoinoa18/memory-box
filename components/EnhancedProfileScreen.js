import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './AllComponents';
import SubscriptionModal from './SubscriptionModal';
import RobAIAssistant from './RobAIAssistant';
import EnhancedMemoryTimeline from './EnhancedMemoryTimeline';
import AdvancedSearch from './AdvancedSearch';
import AdvancedFolderManager from './AdvancedFolderManager';
import MemoryCollections from './MemoryCollections';
import MemoryViewer from './MemoryViewer';
import GiftCardRedeemer from './GiftCardRedeemer';
import subscriptionService from '../services/subscriptionService';
import exportBackupService from '../services/exportBackupService';
import { PermissionStatus, PermissionGate, RoleBadge } from './PermissionComponents';
import { usePermissions } from '../hooks/usePermissions';

const EnhancedProfileScreen = ({ user, onLogout }) => {
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
  const [showGiftCardRedeemer, setShowGiftCardRedeemer] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);

  const { userRole, checkPermission } = usePermissions();

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

      return () => unsubscribe();
    }
  }, [user?.uid]);

  const getUserPlanInfo = () => {
    const planConfig = {
      free: {
        name: 'Free Plan',
        storage: '1GB',
        folders: 5,
        files: 100,
        features: ['Basic upload', 'Limited sharing', 'Standard support']
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
    if (!checkPermission('canWriteLetters')) {
      Alert.alert('Access Restricted', 'You need contributor access to write letters');
      return;
    }
    setShowRobAI(true);
  };

  const handleTimeline = () => {
    setShowTimeline(true);
  };

  const handleSearch = () => {
    setShowSearch(true);
  };

  const handleFolderManager = () => {
    if (!checkPermission('canCreateFolders')) {
      Alert.alert('Access Restricted', 'You need contributor access to manage folders');
      return;
    }
    setShowFolderManager(true);
  };

  const handleLetterGenerated = (letter, answers) => {
    Alert.alert(
      'Letter Created!',
      'Your AI-generated letter has been saved to your memories.',
      [{ text: 'OK' }]
    );
  };

  const handleMemorySelect = (memory) => {
    setSelectedMemory(memory);
    setShowMemoryViewer(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerSubtitleContainer}>
              <Text style={styles.headerSubtitle}>
                Hello, {user?.displayName || user?.email || 'User'}
              </Text>
              <RoleBadge role={userRole} size="small" />
            </View>
          </View>
        </View>

        {/* Current Plan Section */}
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

        {/* Permissions Status Section */}
        <PermissionStatus user={user} />

        {/* AI Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ AI Features</Text>

          <PermissionGate 
            permission="canWriteLetters"
            fallbackComponent={
              <View style={styles.disabledOption}>
                <Ionicons name="lock-closed" size={20} color="#ccc" />
                <Text style={styles.disabledOptionText}>Rob AI Letter Writer</Text>
                <Text style={styles.disabledBadge}>Restricted</Text>
              </View>
            }
          >
            <TouchableOpacity style={styles.profileOption} onPress={handleAILetter}>
              <Ionicons name="mail-outline" size={24} color="#9B59B6" />
              <Text style={styles.profileOptionText}>Rob AI Letter Writer</Text>
              <Text style={[styles.optionBadge, { backgroundColor: '#9B59B6' }]}>AI</Text>
            </TouchableOpacity>
          </PermissionGate>

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

          <PermissionGate 
            permission="canCreateFolders"
            fallbackComponent={
              <View style={styles.disabledOption}>
                <Ionicons name="lock-closed" size={20} color="#ccc" />
                <Text style={styles.disabledOptionText}>Advanced Folders</Text>
                <Text style={styles.disabledBadge}>Restricted</Text>
              </View>
            }
          >
            <TouchableOpacity style={styles.profileOption} onPress={handleFolderManager}>
              <Ionicons name="folder-outline" size={24} color="#F39C12" />
              <Text style={styles.profileOptionText}>Advanced Folders</Text>
              <Text style={[styles.optionBadge, { backgroundColor: '#F39C12' }]}>Organize</Text>
            </TouchableOpacity>
          </PermissionGate>

          <TouchableOpacity style={styles.profileOption} onPress={() => setShowCollections(true)}>
            <Ionicons name="albums-outline" size={24} color="#8E44AD" />
            <Text style={styles.profileOptionText}>Smart Collections</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#8E44AD' }]}>Auto</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.profileOption} 
            onPress={() => setShowGiftCardRedeemer(true)}
          >
            <Ionicons name="gift-outline" size={24} color="#ff6b6b" />
            <Text style={styles.profileOptionText}>Redeem Gift Cards</Text>
            <Text style={[styles.optionBadge, { backgroundColor: '#ff6b6b' }]}>+25% Bonus</Text>
          </TouchableOpacity>

          <PermissionGate 
            permission="canExportData"
            fallbackComponent={
              <View style={styles.disabledOption}>
                <Ionicons name="lock-closed" size={20} color="#ccc" />
                <Text style={styles.disabledOptionText}>Export & Backup</Text>
                <Text style={styles.disabledBadge}>Restricted</Text>
              </View>
            }
          >
            <TouchableOpacity 
              style={styles.profileOption} 
              onPress={() => exportBackupService.createFullBackup(user?.uid)}
            >
              <Ionicons name="cloud-download-outline" size={24} color="#16A085" />
              <Text style={styles.profileOptionText}>Export & Backup</Text>
              <Text style={[styles.optionBadge, { backgroundColor: '#16A085' }]}>Secure</Text>
            </TouchableOpacity>
          </PermissionGate>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          
          <PermissionGate 
            permission="canManageBilling"
            fallbackComponent={
              <View style={styles.disabledOption}>
                <Ionicons name="lock-closed" size={20} color="#ccc" />
                <Text style={styles.disabledOptionText}>Subscription</Text>
                <Text style={styles.disabledBadge}>Owner Only</Text>
              </View>
            }
          >
            <TouchableOpacity style={styles.profileOption} onPress={handleSubscription}>
              <Ionicons name="card-outline" size={24} color={theme.colors.primaryDark} />
              <Text style={styles.profileOptionText}>Subscription</Text>
              {currentPlan === 'free' && <Text style={styles.optionBadge}>Upgrade</Text>}
              {currentPlan !== 'free' && <Text style={[styles.optionBadge, { backgroundColor: theme.colors.success }]}>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </Text>}
            </TouchableOpacity>
          </PermissionGate>

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

          <TouchableOpacity
            style={[styles.profileOption, styles.logoutOption]}
            onPress={onLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.profileOptionText, { color: theme.colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        user={user}
        currentPlan={currentPlan}
      />

      <RobAIAssistant
        visible={showRobAI}
        onClose={() => setShowRobAI(false)}
        user={user}
        onLetterGenerated={handleLetterGenerated}
      />

      <EnhancedMemoryTimeline
        visible={showTimeline}
        onClose={() => setShowTimeline(false)}
        user={user}
        onMemoryPress={handleMemorySelect}
      />

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

      <AdvancedFolderManager
        visible={showFolderManager}
        onClose={() => setShowFolderManager(false)}
        user={user}
      />

      <MemoryCollections
        visible={showCollections}
        onClose={() => setShowCollections(false)}
        user={user}
      />

      <MemoryViewer
        visible={showMemoryViewer}
        memory={selectedMemory}
        onClose={() => {
          setShowMemoryViewer(false);
          setSelectedMemory(null);
        }}
        user={user}
      />

      <GiftCardRedeemer
        visible={showGiftCardRedeemer}
        onClose={() => setShowGiftCardRedeemer(false)}
        user={user}
        onSuccess={(data) => {
          setShowGiftCardRedeemer(false);
          // Could show success animation or update balance
        }}
      />
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
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
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  section: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
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
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  disabledOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    opacity: 0.5,
  },
  profileOptionText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  disabledOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#999',
    marginLeft: 12,
  },
  optionBadge: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 60,
  },
  disabledBadge: {
    backgroundColor: '#ccc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 60,
  },
  logoutOption: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
};

export default EnhancedProfileScreen;
