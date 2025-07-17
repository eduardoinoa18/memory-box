const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

admin.initializeApp();
const db = admin.firestore();

// Create Stripe checkout session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  try {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to create checkout session');
    }

    const { priceId } = data;
    const userId = context.auth.uid;

    if (!priceId) {
      throw new functions.https.HttpsError('invalid-argument', 'Price ID is required');
    }

    // Get or create Stripe customer
    let customer = await getOrCreateStripeCustomer(userId);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: priceId.includes('lifetime') ? 'payment' : 'subscription',
      success_url: 'memorybox://payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'memorybox://payment-cancel',
      metadata: {
        userId: userId,
        priceId: priceId,
      },
    });

    // Create ephemeral key for mobile
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2020-08-27' }
    );

    return {
      sessionId: session.id,
      clientSecret: session.client_secret,
      customerId: customer.id,
      ephemeralKey: ephemeralKey.secret,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create checkout session');
  }
});

// Handle Stripe webhooks
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// Get current subscription
exports.getCurrentSubscription = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const billing = userData.billing || {};

    return {
      plan: billing.plan || 'free',
      status: billing.status || 'active',
      currentPeriodEnd: billing.currentPeriodEnd,
      cancelAtPeriodEnd: billing.cancelAtPeriodEnd || false,
      features: billing.features || getDefaultFeatures('free'),
      usage: billing.usage || { storage: 0, folders: 0, uploads: 0 }
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw new functions.https.HttpsError('internal', 'Unable to get subscription');
  }
});

// Cancel subscription
exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { subscriptionId } = data;
    const userId = context.auth.uid;

    if (!subscriptionId) {
      throw new functions.https.HttpsError('invalid-argument', 'Subscription ID is required');
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update user document
    await db.collection('users').doc(userId).update({
      'billing.cancelAtPeriodEnd': true,
      'billing.canceledAt': admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, subscription };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new functions.https.HttpsError('internal', 'Unable to cancel subscription');
  }
});

// Create customer portal session
exports.createCustomerPortalSession = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const customerId = userDoc.data().billing?.stripeCustomerId;
    
    if (!customerId) {
      throw new functions.https.HttpsError('not-found', 'No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'memorybox://billing',
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create portal session');
  }
});

// Validate user entitlements
exports.validateEntitlements = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const billing = userData.billing || {};
    const plan = billing.plan || 'free';
    
    // Check if subscription is still active
    let isActive = true;
    if (plan !== 'free' && plan !== 'lifetime') {
      const now = new Date();
      const periodEnd = billing.currentPeriodEnd?.toDate();
      
      if (!periodEnd || now > periodEnd) {
        isActive = false;
      }
    }

    const features = getDefaultFeatures(isActive ? plan : 'free');
    const limits = getDefaultLimits(isActive ? plan : 'free');

    return {
      plan: isActive ? plan : 'free',
      status: billing.status || 'active',
      features,
      limits,
      usage: billing.usage || { storage: 0, folders: 0, uploads: 0 }
    };
  } catch (error) {
    console.error('Error validating entitlements:', error);
    throw new functions.https.HttpsError('internal', 'Unable to validate entitlements');
  }
});

// Helper functions
async function getOrCreateStripeCustomer(userId) {
  const userDoc = await db.collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  let customerId = userData.billing?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData.email,
      metadata: {
        userId: userId,
      },
    });

    customerId = customer.id;

    await db.collection('users').doc(userId).update({
      'billing.stripeCustomerId': customerId,
    });

    return customer;
  }

  return await stripe.customers.retrieve(customerId);
}

async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer;
  const userId = await getUserIdFromCustomer(customerId);
  
  if (!userId) return;

  const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
  
  await db.collection('users').doc(userId).update({
    'billing.plan': plan,
    'billing.status': subscription.status,
    'billing.subscriptionId': subscription.id,
    'billing.currentPeriodStart': new Date(subscription.current_period_start * 1000),
    'billing.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
    'billing.features': getDefaultFeatures(plan),
    'billing.limits': getDefaultLimits(plan),
  });

  // Log subscription creation
  await db.collection('subscriptions').doc(subscription.id).set({
    userId,
    customerId,
    status: subscription.status,
    plan,
    amount: subscription.items.data[0].price.unit_amount,
    currency: subscription.items.data[0].price.currency,
    interval: subscription.items.data[0].price.recurring.interval,
    createdAt: new Date(subscription.created * 1000),
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  const userId = await getUserIdFromCustomer(customerId);
  
  if (!userId) return;

  const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
  
  await db.collection('users').doc(userId).update({
    'billing.plan': plan,
    'billing.status': subscription.status,
    'billing.currentPeriodStart': new Date(subscription.current_period_start * 1000),
    'billing.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
    'billing.cancelAtPeriodEnd': subscription.cancel_at_period_end,
  });

  // Update subscription log
  await db.collection('subscriptions').doc(subscription.id).update({
    status: subscription.status,
    plan,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handleSubscriptionCanceled(subscription) {
  const customerId = subscription.customer;
  const userId = await getUserIdFromCustomer(customerId);
  
  if (!userId) return;

  await db.collection('users').doc(userId).update({
    'billing.plan': 'free',
    'billing.status': 'canceled',
    'billing.features': getDefaultFeatures('free'),
    'billing.limits': getDefaultLimits('free'),
    'billing.canceledAt': admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update subscription log
  await db.collection('subscriptions').doc(subscription.id).update({
    status: 'canceled',
    canceledAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer;
  const userId = await getUserIdFromCustomer(customerId);
  
  if (!userId) return;

  await db.collection('users').doc(userId).update({
    'billing.lastPaymentStatus': 'succeeded',
    'billing.lastPaymentAt': admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;
  const userId = await getUserIdFromCustomer(customerId);
  
  if (!userId) return;

  await db.collection('users').doc(userId).update({
    'billing.lastPaymentStatus': 'failed',
    'billing.lastPaymentFailedAt': admin.firestore.FieldValue.serverTimestamp(),
  });

  // TODO: Send payment failure notification
}

async function handleCheckoutCompleted(session) {
  const customerId = session.customer;
  const userId = session.metadata.userId;
  
  if (!userId) return;

  // Handle one-time payments (lifetime plan)
  if (session.mode === 'payment') {
    const plan = getPlanFromPriceId(session.metadata.priceId);
    
    await db.collection('users').doc(userId).update({
      'billing.plan': plan,
      'billing.status': 'active',
      'billing.features': getDefaultFeatures(plan),
      'billing.limits': getDefaultLimits(plan),
      'billing.purchasedAt': admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

async function getUserIdFromCustomer(customerId) {
  const usersSnapshot = await db.collection('users')
    .where('billing.stripeCustomerId', '==', customerId)
    .limit(1)
    .get();
  
  if (usersSnapshot.empty) {
    console.error('User not found for customer:', customerId);
    return null;
  }

  return usersSnapshot.docs[0].id;
}

function getPlanFromPriceId(priceId) {
  const priceMapping = {
    'price_premium_monthly': 'premium',
    'price_family_monthly': 'family',
    'price_lifetime_payment': 'lifetime',
  };
  
  return priceMapping[priceId] || 'free';
}

function getDefaultFeatures(plan) {
  const features = {
    free: {
      aiFeatures: false,
      vaultAccess: false,
      familySharing: false,
      adsRemoved: false,
      prioritySupport: false,
    },
    premium: {
      aiFeatures: true,
      vaultAccess: true,
      familySharing: false,
      adsRemoved: true,
      prioritySupport: true,
    },
    family: {
      aiFeatures: true,
      vaultAccess: true,
      familySharing: true,
      adsRemoved: true,
      prioritySupport: true,
      legacyPlanning: true,
    },
    lifetime: {
      aiFeatures: true,
      vaultAccess: true,
      familySharing: true,
      adsRemoved: true,
      prioritySupport: true,
      legacyPlanning: true,
      futureFeatures: true,
    },
  };
  
  return features[plan] || features['free'];
}

function getDefaultLimits(plan) {
  const limits = {
    free: {
      storage: 2, // GB
      folders: 3,
      familyMembers: 1,
    },
    premium: {
      storage: 50, // GB
      folders: -1, // unlimited
      familyMembers: 1,
    },
    family: {
      storage: 200, // GB
      folders: -1, // unlimited
      familyMembers: 5,
    },
    lifetime: {
      storage: -1, // unlimited
      folders: -1, // unlimited
      familyMembers: 5,
    },
  };
  
  return limits[plan] || limits['free'];
}
