import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStripe } from '@stripe/stripe-react-native';
import * as Haptics from 'expo-haptics';
import PaymentService, { SUBSCRIPTION_PLANS } from '../services/paymentService';
import { useAppContext } from '../App';

const { width } = Dimensions.get('window');

function PricingCard({ plan, isSelected, onSelect, popular = false }) {
  const features = [
    `${plan.storage === -1 ? 'Unlimited' : plan.storage + 'GB'} Storage`,
    `${plan.folders === -1 ? 'Unlimited' : plan.folders} Folders`,
    ...(plan.features.aiFeatures ? ['🤖 AI Memory Reminders'] : []),
    ...(plan.features.vaultAccess ? ['🔒 Private Vault Access'] : []),
    ...(plan.features.familySharing ? ['👨‍👩‍👧‍👦 Family Sharing'] : []),
    ...(plan.features.adsRemoved ? ['🚫 No Advertisements'] : []),
    ...(plan.features.prioritySupport ? ['⚡ Priority Support'] : []),
    ...(plan.features.legacyPlanning ? ['📜 Legacy Planning'] : []),
    ...(plan.features.futureFeatures ? ['🌟 Future Features Included'] : [])
  ];

  return (
    <TouchableOpacity
      style={[
        styles.pricingCard,
        isSelected && styles.pricingCardSelected,
        popular && styles.pricingCardPopular
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        onSelect(plan.id);
      }}
      activeOpacity={0.9}
    >
      {popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}
      
      <LinearGradient
        colors={isSelected ? ['#6C5CE7', '#A29BFE'] : ['#FFFFFF', '#F8F9FB']}
        style={styles.pricingCardGradient}
      >
        <View style={styles.pricingCardHeader}>
          <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
            {plan.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
              ${plan.price}
            </Text>
            {plan.interval && (
              <Text style={[styles.planInterval, isSelected && styles.planIntervalSelected]}>
                /{plan.interval}
              </Text>
            )}
          </View>
          <Text style={[styles.planDescription, isSelected && styles.planDescriptionSelected]}>
            {plan.description}
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.feature}>
              <Text style={[styles.featureText, isSelected && styles.featureTextSelected]}>
                ✓ {feature}
              </Text>
            </View>
          ))}
        </View>

        {plan.id === 'lifetime' && (
          <View style={styles.lifetimeBadge}>
            <Text style={styles.lifetimeBadgeText}>🎉 Best Value - No Monthly Fees!</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function UpgradeScreen({ visible, onClose, initialPlan = null, feature = null }) {
  const { user } = useAppContext();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedPlan, setSelectedPlan] = useState(initialPlan || 'premium');
  const [loading, setLoading] = useState(false);
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  const plans = Object.values(SUBSCRIPTION_PLANS).filter(plan => plan.id !== 'free');

  const getFeatureMessage = () => {
    const messages = {
      vault: "🔒 Unlock your Private Vault with Premium! Keep your most precious memories secure with biometric protection.",
      storage: "💾 Running out of space? Upgrade to Premium for 50GB or Family for 200GB of secure storage!",
      folders: "📁 Need more organization? Premium gives you unlimited folders to perfectly organize all your memories.",
      ai: "🤖 Let AI help you rediscover forgotten memories! Premium includes smart reminders and memory suggestions.",
      family: "👨‍👩‍👧‍👦 Share memories with your whole family! Family plan lets you connect with up to 5 family members.",
      ads: "✨ Enjoy Memory Box without interruptions! Remove ads and focus on what matters - your memories."
    };
    return messages[feature] || "💎 Unlock premium features and give your memories the home they deserve.";
  };

  const initializePayment = async (planId) => {
    try {
      setLoading(true);
      const plan = SUBSCRIPTION_PLANS[planId];
      
      if (!plan.priceId) {
        Alert.alert('Error', 'Invalid plan selected');
        return;
      }

      const result = await PaymentService.createCheckoutSession(plan.priceId, user.id);
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to create payment session');
        return;
      }

      const { clientSecret, customerId } = result.data;

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Memory Box',
        customerId: customerId,
        customerEphemeralKeySecret: result.data.ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: true,
        appearance: {
          colors: {
            primary: '#6C5CE7',
          },
        },
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        return;
      }

      setPaymentInitialized(true);
    } catch (error) {
      console.error('Payment initialization error:', error);
      Alert.alert('Error', 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (!paymentInitialized) {
        await initializePayment(selectedPlan);
        return;
      }

      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { error } = await presentPaymentSheet();
      
      if (error) {
        if (error.code !== 'Canceled') {
          Alert.alert('Payment Error', error.message);
        }
        return;
      }

      // Payment successful
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Welcome to Premium! 🎉',
        'Your subscription has been activated. Enjoy unlimited access to all premium features!',
        [
          {
            text: 'Get Started',
            onPress: () => {
              onClose();
              // Refresh user data to reflect new plan
            }
          }
        ]
      );

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueFree = () => {
    Alert.alert(
      'Continue with Free?',
      'You can always upgrade later when you need more storage or premium features.',
      [
        { text: 'Upgrade Now', style: 'default' },
        { 
          text: 'Continue Free', 
          style: 'cancel',
          onPress: onClose
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#6C5CE7', '#A29BFE']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Unlock Premium</Text>
            <Text style={styles.headerSubtitle}>
              {feature ? getFeatureMessage() : "Give your memories the premium treatment they deserve"}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan === plan.id}
                onSelect={setSelectedPlan}
                popular={plan.popular}
              />
            ))}
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Why choose Premium?</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🔒</Text>
              <Text style={styles.benefitText}>Military-grade encryption keeps your memories safe</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>☁️</Text>
              <Text style={styles.benefitText}>Automatic cloud backup - never lose a memory</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🤖</Text>
              <Text style={styles.benefitText}>AI helps you rediscover forgotten moments</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.benefitText}>Share and collaborate with family members</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            disabled={loading}
          >
            <LinearGradient
              colors={['#6C5CE7', '#A29BFE']}
              style={styles.subscribeButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.subscribeButtonText}>
                    {paymentInitialized ? 'Complete Payment' : 'Continue with Premium'}
                  </Text>
                  <Text style={styles.subscribeButtonSubtext}>
                    {PaymentService.formatPrice(
                      SUBSCRIPTION_PLANS[selectedPlan].price,
                      SUBSCRIPTION_PLANS[selectedPlan].interval
                    )}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.freeButton}
            onPress={handleContinueFree}
            disabled={loading}
          >
            <Text style={styles.freeButtonText}>Continue with Free</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Cancel anytime. Your memories are always yours.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  plansContainer: {
    marginTop: 30,
  },
  pricingCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  pricingCardSelected: {
    elevation: 8,
    shadowOpacity: 0.2,
    transform: [{ scale: 1.02 }],
  },
  pricingCardPopular: {
    borderWidth: 2,
    borderColor: '#FD79A8',
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: 20,
    backgroundColor: '#FD79A8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pricingCardGradient: {
    padding: 20,
  },
  pricingCardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  planNameSelected: {
    color: 'white',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6C5CE7',
  },
  planPriceSelected: {
    color: 'white',
  },
  planInterval: {
    fontSize: 18,
    color: '#636E72',
    marginLeft: 4,
  },
  planIntervalSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  planDescription: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
  },
  planDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuresContainer: {
    marginTop: 10,
  },
  feature: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#2D3436',
  },
  featureTextSelected: {
    color: 'white',
  },
  lifetimeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  lifetimeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  benefitsContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  benefitEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  subscribeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscribeButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  freeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  freeButtonText: {
    color: '#636E72',
    fontSize: 16,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: '#B2BEC3',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default UpgradeScreen;
