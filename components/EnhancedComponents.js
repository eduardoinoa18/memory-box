// Enhanced Memory Box Components - Family-Focused Design
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MemoryBoxLogo } from './MemoryBoxLogo';
import enhancedTheme from './EnhancedTheme';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced Welcome Header with family warmth
export const EnhancedWelcomeHeader = ({ userName = 'Family', userPlan = 'free', onProfilePress }) => {
  const getPlanColor = (plan) => {
    switch (plan) {
      case 'premium': return enhancedTheme.colors.plans.premium;
      case 'family': return enhancedTheme.colors.plans.family;
      default: return enhancedTheme.colors.plans.free;
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case 'premium': return 'star';
      case 'family': return 'people';
      default: return 'shield-checkmark';
    }
  };

  return (
    <LinearGradient
      colors={[enhancedTheme.colors.primaryLight, enhancedTheme.colors.background]}
      style={styles.welcomeHeader}
    >
      <View style={styles.headerContent}>
        <View style={styles.logoSection}>
          <MemoryBoxLogo width={50} height={50} />
          <Text style={styles.appName}>Memory Box</Text>
        </View>
        
        <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
          <View style={[styles.profilePic, { backgroundColor: getPlanColor(userPlan) }]}>
            <Text style={styles.profileInitial}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.planBadge}>
            <Ionicons 
              name={getPlanIcon(userPlan)} 
              size={12} 
              color={enhancedTheme.colors.textOnPrimary} 
            />
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.welcomeTextSection}>
        <Text style={styles.welcomeText}>Welcome back, {userName}! 👋</Text>
        <Text style={styles.welcomeSubtext}>What memories will you create today?</Text>
      </View>
    </LinearGradient>
  );
};

// Enhanced Memory Prompt with emotional connection
export const EnhancedMemoryPrompt = ({ 
  title = "What special moment happened today?", 
  subtitle = "Every moment matters ✨", 
  onPress,
  iconName = "camera",
  gradient = ['#FFD54F', '#FFCC02']
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.memoryPromptContainer}>
      <LinearGradient
        colors={gradient}
        style={styles.memoryPrompt}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.promptContent}>
          <View style={styles.promptIcon}>
            <Ionicons 
              name={iconName} 
              size={24} 
              color={enhancedTheme.colors.primaryDark} 
            />
          </View>
          <View style={styles.promptText}>
            <Text style={styles.promptTitle}>{title}</Text>
            <Text style={styles.promptSubtitle}>{subtitle}</Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={enhancedTheme.colors.primaryDark} 
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Enhanced Folder Card with family personality
export const EnhancedFolderCard = ({ 
  title, 
  emoji, 
  count, 
  color = enhancedTheme.colors.primary, 
  onPress,
  isShared = false,
  lastUpdated = null 
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.folderCard, { borderColor: color }]}>
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.folderCardGradient}
      >
        <View style={styles.folderHeader}>
          <View style={[styles.folderEmoji, { backgroundColor: color + '30' }]}>
            <Text style={styles.emojiText}>{emoji}</Text>
          </View>
          {isShared && (
            <View style={styles.sharedBadge}>
              <Ionicons name="share" size={12} color={enhancedTheme.colors.textOnPrimary} />
            </View>
          )}
        </View>
        
        <Text style={styles.folderTitle}>{title}</Text>
        <Text style={styles.folderCount}>{count}</Text>
        
        {lastUpdated && (
          <Text style={styles.folderUpdated}>
            Last updated {lastUpdated}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Enhanced Upload Option with personality
export const EnhancedUploadOption = ({ 
  icon, 
  title, 
  subtitle, 
  color, 
  onPress,
  disabled = false 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[styles.uploadOption, disabled && styles.uploadOptionDisabled]}
    >
      <LinearGradient
        colors={disabled ? ['#F5F5F5', '#EEEEEE'] : [color + '20', color + '10']}
        style={styles.uploadOptionGradient}
      >
        <View style={[styles.uploadIcon, { backgroundColor: disabled ? '#BDBDBD' : color }]}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={disabled ? '#757575' : enhancedTheme.colors.textOnPrimary} 
          />
        </View>
        <View style={styles.uploadContent}>
          <Text style={[styles.uploadTitle, disabled && styles.uploadTitleDisabled]}>
            {title}
          </Text>
          <Text style={[styles.uploadSubtitle, disabled && styles.uploadSubtitleDisabled]}>
            {subtitle}
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={disabled ? '#BDBDBD' : enhancedTheme.colors.textSecondary} 
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Enhanced Plan Card
export const EnhancedPlanCard = ({ 
  plan, 
  isActive = false, 
  onUpgrade, 
  onManage 
}) => {
  const planData = {
    free: {
      name: 'Free',
      price: 'Free',
      features: ['1GB Storage', '5 Folders', '50 Photos', 'Basic Sharing'],
      color: enhancedTheme.colors.plans.free,
      icon: 'shield-checkmark'
    },
    premium: {
      name: 'Premium',
      price: '$9.99/month',
      features: ['50GB Storage', '50 Folders', '1000 Photos', 'Advanced Sharing', 'Priority Support'],
      color: enhancedTheme.colors.plans.premium,
      icon: 'star'
    },
    family: {
      name: 'Family',
      price: '$19.99/month',
      features: ['200GB Storage', '100 Folders', '5000 Photos', 'Family Sharing', 'Premium Support'],
      color: enhancedTheme.colors.plans.family,
      icon: 'people'
    }
  };

  const currentPlan = planData[plan];

  return (
    <View style={[styles.planCard, isActive && styles.activePlanCard]}>
      <LinearGradient
        colors={isActive ? [currentPlan.color + '20', currentPlan.color + '10'] : ['#FFFFFF', '#FAFAFA']}
        style={styles.planCardGradient}
      >
        <View style={styles.planHeader}>
          <View style={[styles.planIcon, { backgroundColor: currentPlan.color }]}>
            <Ionicons name={currentPlan.icon} size={20} color={enhancedTheme.colors.textOnPrimary} />
          </View>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>{currentPlan.name}</Text>
            <Text style={styles.planPrice}>{currentPlan.price}</Text>
          </View>
          {isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Current</Text>
            </View>
          )}
        </View>

        <View style={styles.planFeatures}>
          {currentPlan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={enhancedTheme.colors.success} 
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          onPress={isActive ? onManage : onUpgrade}
          style={[
            styles.planButton, 
            { backgroundColor: isActive ? enhancedTheme.colors.textSecondary : currentPlan.color }
          ]}
        >
          <Text style={styles.planButtonText}>
            {isActive ? 'Manage Plan' : 'Upgrade Now'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  // Welcome Header Styles
  welcomeHeader: {
    padding: enhancedTheme.spacing.lg,
    borderRadius: enhancedTheme.borderRadius.xl,
    margin: enhancedTheme.spacing.md,
    marginTop: enhancedTheme.spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.md,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: enhancedTheme.typography.fontSize.lg,
    fontWeight: enhancedTheme.typography.fontWeight.bold,
    color: enhancedTheme.colors.primaryDark,
    marginLeft: enhancedTheme.spacing.sm,
  },
  profileButton: {
    position: 'relative',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: enhancedTheme.colors.textOnPrimary,
    fontSize: enhancedTheme.typography.fontSize.lg,
    fontWeight: enhancedTheme.typography.fontWeight.bold,
  },
  planBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: enhancedTheme.colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTextSection: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: enhancedTheme.typography.fontSize['2xl'],
    fontWeight: enhancedTheme.typography.fontWeight.bold,
    color: enhancedTheme.colors.text,
    textAlign: 'center',
    marginBottom: enhancedTheme.spacing.xs,
  },
  welcomeSubtext: {
    fontSize: enhancedTheme.typography.fontSize.base,
    color: enhancedTheme.colors.textSecondary,
    textAlign: 'center',
  },

  // Memory Prompt Styles
  memoryPromptContainer: {
    margin: enhancedTheme.spacing.md,
    marginTop: enhancedTheme.spacing.sm,
  },
  memoryPrompt: {
    borderRadius: enhancedTheme.borderRadius.xl,
    padding: enhancedTheme.spacing.lg,
    ...enhancedTheme.shadows.md,
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: enhancedTheme.colors.textOnPrimary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: enhancedTheme.spacing.md,
  },
  promptText: {
    flex: 1,
  },
  promptTitle: {
    fontSize: enhancedTheme.typography.fontSize.lg,
    fontWeight: enhancedTheme.typography.fontWeight.semibold,
    color: enhancedTheme.colors.primaryDark,
    marginBottom: enhancedTheme.spacing.xs,
  },
  promptSubtitle: {
    fontSize: enhancedTheme.typography.fontSize.sm,
    color: enhancedTheme.colors.primaryDark,
    opacity: 0.8,
  },

  // Folder Card Styles
  folderCard: {
    width: (screenWidth - 48) / 2,
    margin: enhancedTheme.spacing.xs,
    borderRadius: enhancedTheme.borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  folderCardGradient: {
    padding: enhancedTheme.spacing.md,
    minHeight: 120,
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: enhancedTheme.spacing.sm,
  },
  folderEmoji: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  sharedBadge: {
    backgroundColor: enhancedTheme.colors.success,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderTitle: {
    fontSize: enhancedTheme.typography.fontSize.base,
    fontWeight: enhancedTheme.typography.fontWeight.semibold,
    color: enhancedTheme.colors.text,
    marginBottom: enhancedTheme.spacing.xs,
  },
  folderCount: {
    fontSize: enhancedTheme.typography.fontSize.sm,
    color: enhancedTheme.colors.textSecondary,
    marginBottom: enhancedTheme.spacing.xs,
  },
  folderUpdated: {
    fontSize: enhancedTheme.typography.fontSize.xs,
    color: enhancedTheme.colors.textLight,
  },

  // Upload Option Styles
  uploadOption: {
    marginHorizontal: enhancedTheme.spacing.md,
    marginVertical: enhancedTheme.spacing.xs,
    borderRadius: enhancedTheme.borderRadius.lg,
    overflow: 'hidden',
  },
  uploadOptionDisabled: {
    opacity: 0.6,
  },
  uploadOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: enhancedTheme.spacing.md,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: enhancedTheme.spacing.md,
  },
  uploadContent: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: enhancedTheme.typography.fontSize.base,
    fontWeight: enhancedTheme.typography.fontWeight.semibold,
    color: enhancedTheme.colors.text,
    marginBottom: enhancedTheme.spacing.xs,
  },
  uploadTitleDisabled: {
    color: enhancedTheme.colors.textLight,
  },
  uploadSubtitle: {
    fontSize: enhancedTheme.typography.fontSize.sm,
    color: enhancedTheme.colors.textSecondary,
  },
  uploadSubtitleDisabled: {
    color: enhancedTheme.colors.textLight,
  },

  // Plan Card Styles
  planCard: {
    margin: enhancedTheme.spacing.md,
    borderRadius: enhancedTheme.borderRadius.xl,
    overflow: 'hidden',
    ...enhancedTheme.shadows.md,
  },
  activePlanCard: {
    borderWidth: 2,
    borderColor: enhancedTheme.colors.accent,
  },
  planCardGradient: {
    padding: enhancedTheme.spacing.lg,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.md,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: enhancedTheme.spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: enhancedTheme.typography.fontSize.lg,
    fontWeight: enhancedTheme.typography.fontWeight.bold,
    color: enhancedTheme.colors.text,
  },
  planPrice: {
    fontSize: enhancedTheme.typography.fontSize.sm,
    color: enhancedTheme.colors.textSecondary,
  },
  activeBadge: {
    backgroundColor: enhancedTheme.colors.success,
    paddingHorizontal: enhancedTheme.spacing.sm,
    paddingVertical: enhancedTheme.spacing.xs,
    borderRadius: enhancedTheme.borderRadius.md,
  },
  activeBadgeText: {
    color: enhancedTheme.colors.textOnPrimary,
    fontSize: enhancedTheme.typography.fontSize.xs,
    fontWeight: enhancedTheme.typography.fontWeight.semibold,
  },
  planFeatures: {
    marginBottom: enhancedTheme.spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.sm,
  },
  featureText: {
    marginLeft: enhancedTheme.spacing.sm,
    fontSize: enhancedTheme.typography.fontSize.sm,
    color: enhancedTheme.colors.text,
  },
  planButton: {
    paddingVertical: enhancedTheme.spacing.md,
    borderRadius: enhancedTheme.borderRadius.lg,
    alignItems: 'center',
  },
  planButtonText: {
    color: enhancedTheme.colors.textOnPrimary,
    fontSize: enhancedTheme.typography.fontSize.base,
    fontWeight: enhancedTheme.typography.fontWeight.semibold,
  },
});

export {
  EnhancedWelcomeHeader,
  EnhancedMemoryPrompt,
  EnhancedFolderCard,
  EnhancedUploadOption,
  EnhancedPlanCard,
};
