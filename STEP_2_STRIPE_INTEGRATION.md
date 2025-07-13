# 💳 STEP 2: Stripe Subscription Integration

> 📋 **NEW:** For a detailed step-by-step implementation plan, see [`STEP_2_IMPLEMENTATION_PLAN.md`](./STEP_2_IMPLEMENTATION_PLAN.md) - This provides a comprehensive, phase-by-phase guide with time estimates and verification steps.

## 🎯 OBJECTIVE
Implement complete subscription billing system with:
- Real plan checkout (Free, Premium, Family+)
- Secure customer subscriptions via Stripe
- Webhook integration for status updates
- Firebase user data synchronization

---

## 🛠️ 1. STRIPE PROJECT SETUP

### 1.1 Create Stripe Account
1. Go to: https://dashboard.stripe.com
2. Create account or sign in
3. Switch to **Test Mode** for development

### 1.2 Create Products & Pricing
In Stripe Dashboard > Products:

**Product 1: Memory Box Premium**
- Name: `Memory Box Premium`
- Description: `50GB storage, advanced features, priority support`
- Price: `$4.99/month`
- Save the Price ID: `price_1XYZ123premium`

**Product 2: Memory Box Family+**
- Name: `Memory Box Family+` 
- Description: `200GB storage, family sharing, unlimited members`
- Price: `$9.99/month`
- Save the Price ID: `price_1ABC456family`

### 1.3 Save Important Keys
From Stripe Dashboard > Developers > API Keys:
- **Publishable Key**: `pk_test_...` (client-side)
- **Secret Key**: `sk_test_...` (server-side only)

---

## 🧪 2. INSTALL STRIPE SDK

### 2.1 Client-Side Installation
```bash
# Main app dependencies
npm install @stripe/stripe-js

# For React Native (if needed)
npm install @stripe/stripe-react-native
```

### 2.2 Server-Side Installation (Firebase Functions)
```bash
# Navigate to functions directory or create it
firebase init functions
cd functions
npm install stripe
```

---

## 🔐 3. ENVIRONMENT CONFIGURATION

### 3.1 Update `.env.local`
```ini
# Existing Firebase variables...
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_key
# ... other Firebase vars ...

# Add Stripe variables
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key

# Stripe Price IDs
EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_1XYZ123premium
EXPO_PUBLIC_STRIPE_FAMILY_PRICE_ID=price_1ABC456family

# App URLs
EXPO_PUBLIC_SUCCESS_URL=https://yourdomain.com/success
EXPO_PUBLIC_CANCEL_URL=https://yourdomain.com/cancel
```

### 3.2 Update `.env.example`
```ini
# Copy the new Stripe variables to .env.example (without real values)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_premium_id_here
EXPO_PUBLIC_STRIPE_FAMILY_PRICE_ID=price_family_id_here
```

---

## 🧩 4. CLIENT-SIDE INTEGRATION

### 4.1 Create Stripe Utilities
**File**: `/utils/checkout.js`
```javascript
import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const redirectToCheckout = async (sessionId) => {
  const stripe = await getStripe();
  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};
```

### 4.2 Create Subscription Service
**File**: `/services/subscriptionService.js`
```javascript
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { functions, db } from '../config/firebase';

class SubscriptionService {
  // Create checkout session
  async createCheckoutSession(priceId, userId) {
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({ 
        priceId, 
        userId,
        successUrl: process.env.EXPO_PUBLIC_SUCCESS_URL,
        cancelUrl: process.env.EXPO_PUBLIC_CANCEL_URL
      });
      return result.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Get user subscription status
  subscribeToUserSubscription(userId, callback) {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        callback({
          plan: userData.plan || 'free',
          subscriptionStatus: userData.subscriptionStatus || 'inactive',
          customerId: userData.stripeCustomerId,
          subscriptionId: userData.stripeSubscriptionId
        });
      }
    });
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const cancelSubscription = httpsCallable(functions, 'cancelSubscription');
      const result = await cancelSubscription({ subscriptionId });
      return result.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();
```

### 4.3 Update Profile Screen
**File**: `components/SubscriptionModal.js`
```javascript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import subscriptionService from '../services/subscriptionService';
import { redirectToCheckout } from '../utils/checkout';

export default function SubscriptionModal({ visible, onClose, user }) {
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      price: '$4.99/month',
      priceId: process.env.EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
      features: [
        '50GB Storage',
        '50 Folders',
        '1000 Photos/Videos',
        'Priority Support',
        'HD Quality'
      ]
    },
    {
      id: 'family',
      name: 'Family+',
      price: '$9.99/month', 
      priceId: process.env.EXPO_PUBLIC_STRIPE_FAMILY_PRICE_ID,
      features: [
        '200GB Storage',
        '100 Folders',
        '5000 Photos/Videos',
        'Family Sharing',
        '24/7 Support',
        '4K Quality'
      ]
    }
  ];

  const handleSubscribe = async (plan) => {
    if (!user?.uid) {
      Alert.alert('Error', 'Please log in to subscribe');
      return;
    }

    setLoading(true);
    try {
      const session = await subscriptionService.createCheckoutSession(
        plan.priceId,
        user.uid
      );
      
      // Redirect to Stripe Checkout
      await redirectToCheckout(session.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to start checkout. Please try again.');
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {plans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>{plan.price}</Text>
            
            {plan.features.map((feature, index) => (
              <Text key={index} style={styles.feature}>• {feature}</Text>
            ))}
            
            <TouchableOpacity
              style={[styles.subscribeButton, loading && styles.buttonDisabled]}
              onPress={() => handleSubscribe(plan)}
              disabled={loading}
            >
              <Text style={styles.subscribeButtonText}>
                {loading ? 'Loading...' : `Subscribe to ${plan.name}`}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </Modal>
  );
}

const styles = {
  // Add your styles here
};
```

---

## 🔁 5. FIREBASE CLOUD FUNCTIONS (BACKEND)

### 5.1 Initialize Firebase Functions
```bash
# In your project root
firebase init functions
# Choose JavaScript/TypeScript
# Install dependencies: Yes
```

### 5.2 Install Dependencies
```bash
cd functions
npm install stripe
npm install cors
```

### 5.3 Create Cloud Functions
**File**: `functions/index.js`
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Create Checkout Session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { priceId, successUrl, cancelUrl } = data;
  const userId = context.auth.uid;

  try {
    // Get or create Stripe customer
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    let customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: context.auth.token.email,
        metadata: {
          firebaseUID: userId,
        },
      });
      customerId = customer.id;
      
      // Save customer ID to user document
      await admin.firestore().collection('users').doc(userId).update({
        stripeCustomerId: customerId
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      success_url: successUrl || 'https://yourdomain.com/success',
      cancel_url: cancelUrl || 'https://yourdomain.com/cancel',
      metadata: {
        firebaseUID: userId,
      },
    });

    return { id: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
  }
});

// Cancel Subscription
exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { subscriptionId } = data;

  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new functions.https.HttpsError('internal', 'Failed to cancel subscription');
  }
});

// Stripe Webhook Handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.status(400).send('Webhook signature verification failed.');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// Helper functions
async function handleCheckoutCompleted(session) {
  const firebaseUID = session.metadata.firebaseUID;
  if (!firebaseUID) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const plan = getPlanFromPriceId(subscription.items.data[0].price.id);

  await admin.firestore().collection('users').doc(firebaseUID).update({
    plan: plan,
    subscriptionStatus: 'active',
    stripeSubscriptionId: subscription.id,
    subscriptionStarted: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function handleSubscriptionUpdated(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const firebaseUID = customer.metadata.firebaseUID;
  if (!firebaseUID) return;

  const plan = getPlanFromPriceId(subscription.items.data[0].price.id);

  await admin.firestore().collection('users').doc(firebaseUID).update({
    plan: plan,
    subscriptionStatus: subscription.status
  });
}

async function handleSubscriptionDeleted(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const firebaseUID = customer.metadata.firebaseUID;
  if (!firebaseUID) return;

  await admin.firestore().collection('users').doc(firebaseUID).update({
    plan: 'free',
    subscriptionStatus: 'cancelled',
    subscriptionEnded: admin.firestore.FieldValue.serverTimestamp()
  });
}

function getPlanFromPriceId(priceId) {
  const priceToPlan = {
    [functions.config().stripe.premium_price_id]: 'premium',
    [functions.config().stripe.family_price_id]: 'family'
  };
  return priceToPlan[priceId] || 'free';
}
```

### 5.4 Configure Stripe Keys in Firebase
```bash
firebase functions:config:set stripe.secret="sk_test_your_secret_key"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
firebase functions:config:set stripe.premium_price_id="price_1XYZ123premium"
firebase functions:config:set stripe.family_price_id="price_1ABC456family"
```

### 5.5 Deploy Functions
```bash
firebase deploy --only functions
```

---

## 🔁 6. WEBHOOK SETUP

### 6.1 Configure Stripe Webhooks
1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. URL: `https://your-region-your-project.cloudfunctions.net/stripeWebhook`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Save and copy the webhook signing secret

### 6.2 Test Webhook
```bash
# Install Stripe CLI for testing
stripe listen --forward-to localhost:5001/your-project/us-central1/stripeWebhook
```

---

## 📁 7. CLEAN UP & INTEGRATION

### 7.1 Update ProfileScreen
Replace fake subscription UI with real Stripe integration:

```javascript
// In ProfileScreen component
import subscriptionService from '../services/subscriptionService';
import SubscriptionModal from './SubscriptionModal';

const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
const [subscriptionData, setSubscriptionData] = useState(null);

useEffect(() => {
  if (user?.uid) {
    const unsubscribe = subscriptionService.subscribeToUserSubscription(
      user.uid,
      setSubscriptionData
    );
    return unsubscribe;
  }
}, [user]);

// Replace fake upgrade button with:
<TouchableOpacity 
  style={styles.upgradeButton} 
  onPress={() => setShowSubscriptionModal(true)}
>
  <Text style={styles.upgradeButtonText}>
    {subscriptionData?.plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
  </Text>
</TouchableOpacity>

<SubscriptionModal 
  visible={showSubscriptionModal}
  onClose={() => setShowSubscriptionModal(false)}
  user={user}
/>
```

### 7.2 Remove Mock Code
- [ ] Delete fake plan selection logic from ProfileScreen
- [ ] Remove mock subscription handling
- [ ] Clean up any demo billing components

---

## ✅ 8. TESTING CHECKLIST

### 8.1 Test Flow
- [ ] User can view subscription plans
- [ ] Checkout session creates successfully
- [ ] Stripe Checkout page loads correctly
- [ ] Test card completes successfully (4242 4242 4242 4242)
- [ ] Webhook updates user plan in Firestore
- [ ] User sees updated plan in app immediately
- [ ] Subscription cancellation works
- [ ] Plan limits are enforced

### 8.2 Error Handling
- [ ] Network errors are handled gracefully
- [ ] Invalid payment methods show appropriate errors
- [ ] Webhook failures are logged and retried
- [ ] Authentication errors are caught

---

## 🚀 READY FOR STEP 3

Once Step 2 is complete, you'll have:
- ✅ Real subscription billing with Stripe
- ✅ Automated plan management via webhooks
- ✅ Secure payment processing
- ✅ Firebase user data synchronization

Next: Individual component Firebase integration (folders, upload, etc.)
