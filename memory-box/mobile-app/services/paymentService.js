import { initStripe } from '@stripe/stripe-react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Stripe
export const initializeStripe = () => {
  return initStripe({
    publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, // Use environment variable
    merchantIdentifier: 'merchant.com.memorybox.app',
  });
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: null,
    storage: 2, // GB
    folders: 3,
    features: {
      aiFeatures: false,
      vaultAccess: false,
      familySharing: false,
      adsRemoved: false,
      prioritySupport: false
    },
    description: 'Perfect for getting started',
    popular: false
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 2.99,
    interval: 'month',
    priceId: 'price_premium_monthly',
    storage: 50, // GB
    folders: -1, // unlimited
    features: {
      aiFeatures: true,
      vaultAccess: true,
      familySharing: false,
      adsRemoved: true,
      prioritySupport: true
    },
    description: 'For individuals who love memories',
    popular: true
  },
  family: {
    id: 'family',
    name: 'Family',
    price: 4.99,
    interval: 'month',
    priceId: 'price_family_monthly',
    storage: 200, // GB
    folders: -1, // unlimited
    members: 5,
    features: {
      aiFeatures: true,
      vaultAccess: true,
      familySharing: true,
      adsRemoved: true,
      prioritySupport: true,
      legacyPlanning: true
    },
    description: 'Share memories with your whole family',
    popular: false
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    price: 99,
    interval: 'once',
    priceId: 'price_lifetime_payment',
    storage: -1, // unlimited
    folders: -1, // unlimited
    features: {
      aiFeatures: true,
      vaultAccess: true,
      familySharing: true,
      adsRemoved: true,
      prioritySupport: true,
      legacyPlanning: true,
      futureFeatures: true
    },
    description: 'All features forever, no monthly fees',
    popular: false
  }
};

export class PaymentService {
  static async createCheckoutSession(priceId, userId) {
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({ priceId, userId });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { success: false, error: error.message };
    }
  }

  static async handleSuccessfulPayment(sessionId, userId) {
    try {
      const confirmPayment = httpsCallable(functions, 'confirmPayment');
      const result = await confirmPayment({ sessionId, userId });
      
      // Update local storage
      await AsyncStorage.setItem('userPlan', JSON.stringify(result.data.plan));
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { success: false, error: error.message };
    }
  }

  static async getCurrentSubscription(userId) {
    try {
      const getSubscription = httpsCallable(functions, 'getCurrentSubscription');
      const result = await getSubscription({ userId });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return { success: false, error: error.message };
    }
  }

  static async cancelSubscription(subscriptionId) {
    try {
      const cancelSubscription = httpsCallable(functions, 'cancelSubscription');
      const result = await cancelSubscription({ subscriptionId });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  static async createCustomerPortalSession(customerId) {
    try {
      const createPortalSession = httpsCallable(functions, 'createCustomerPortalSession');
      const result = await createPortalSession({ customerId });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error creating portal session:', error);
      return { success: false, error: error.message };
    }
  }

  static async validateEntitlements(userId) {
    try {
      const validateEntitlements = httpsCallable(functions, 'validateEntitlements');
      const result = await validateEntitlements({ userId });
      
      // Cache entitlements locally
      await AsyncStorage.setItem('userEntitlements', JSON.stringify(result.data));
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error validating entitlements:', error);
      return { success: false, error: error.message };
    }
  }

  static async checkPlanLimits(userId, action, currentUsage) {
    try {
      const entitlements = await AsyncStorage.getItem('userEntitlements');
      const userEntitlements = entitlements ? JSON.parse(entitlements) : null;
      
      if (!userEntitlements) {
        const result = await this.validateEntitlements(userId);
        if (!result.success) return { allowed: false, reason: 'Unable to validate plan' };
        userEntitlements = result.data;
      }

      const { plan, features, limits } = userEntitlements;

      switch (action) {
        case 'create_folder':
          if (limits.folders !== -1 && currentUsage.folders >= limits.folders) {
            return { 
              allowed: false, 
              reason: `${plan} plan limited to ${limits.folders} folders`,
              upgradeRequired: true
            };
          }
          break;
          
        case 'upload_file':
          if (limits.storage !== -1 && currentUsage.storage >= limits.storage) {
            return { 
              allowed: false, 
              reason: `Storage limit reached (${limits.storage}GB)`,
              upgradeRequired: true
            };
          }
          break;
          
        case 'access_vault':
          if (!features.vaultAccess) {
            return { 
              allowed: false, 
              reason: 'Vault access requires Premium plan',
              upgradeRequired: true
            };
          }
          break;
          
        case 'ai_features':
          if (!features.aiFeatures) {
            return { 
              allowed: false, 
              reason: 'AI features require Premium plan',
              upgradeRequired: true
            };
          }
          break;
          
        case 'family_sharing':
          if (!features.familySharing) {
            return { 
              allowed: false, 
              reason: 'Family sharing requires Family plan',
              upgradeRequired: true
            };
          }
          break;
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking plan limits:', error);
      return { allowed: false, reason: 'Error validating permissions' };
    }
  }

  static getPlanFeatures(planId) {
    return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
  }

  static formatPrice(price, interval) {
    if (price === 0) return 'Free';
    if (interval === 'once') return `$${price}`;
    return `$${price}/${interval}`;
  }

  static calculateSavings(monthlyPrice, yearlyPrice) {
    const yearlyCost = monthlyPrice * 12;
    const savings = yearlyCost - yearlyPrice;
    const percentage = Math.round((savings / yearlyCost) * 100);
    return { amount: savings, percentage };
  }
}

export default PaymentService;
