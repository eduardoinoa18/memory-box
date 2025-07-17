// Firebase Cloud Functions for Memory Box Platform
// Backend business logic and integrations
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY);
const { OpenAI } = require('openai');
const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Initialize OpenAI for AI features
const openai = new OpenAI({
  apiKey: functions.config().openai?.api_key || process.env.OPENAI_API_KEY,
});

// Initialize SendGrid
sgMail.setApiKey(functions.config().sendgrid?.api_key || process.env.SENDGRID_API_KEY);

// Initialize Twilio
const twilioClient = twilio(
  functions.config().twilio?.account_sid || process.env.TWILIO_ACCOUNT_SID,
  functions.config().twilio?.auth_token || process.env.TWILIO_AUTH_TOKEN
);

// 🔐 USER MANAGEMENT FUNCTIONS

// Triggered when a new user signs up
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
      subscription: {
        tier: 'free',
        status: 'active',
        startDate: admin.firestore.FieldValue.serverTimestamp()
      },
      profile: {
        bio: '',
        location: '',
        preferences: {
          notifications: true,
          aiSuggestions: true,
          emailUpdates: true
        }
      },
      stats: {
        foldersCreated: 0,
        memoriesUploaded: 0,
        lettersCreated: 0,
        storageUsed: 0
      },
      usage: {
        aiSuggestionsUsed: 0,
        lastResetDate: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    // Create Stripe customer
    if (functions.config().stripe?.secret_key) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName,
        metadata: {
          firebaseUID: user.uid  // Consistent with webhook handlers
        }
      });

      // Update user document with Stripe customer ID
      await db.collection('users').doc(user.uid).update({
        stripeCustomerId: customer.id
      });
    }

    // Send welcome email (implement with your email service)
    console.log(`New user created: ${user.email}`);

  } catch (error) {
    console.error('Error creating user:', error);
  }
});

// 💳 SUBSCRIPTION MANAGEMENT FUNCTIONS

// Create Stripe checkout session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create checkout session'
    );
  }

  const { priceId, successUrl, cancelUrl } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  // Validation
  if (!priceId) {
    throw new functions.https.HttpsError('invalid-argument', 'Price ID is required');
  }

  try {
    console.log('Creating checkout session for user:', userId);

    // Get or create Stripe customer
    const userDoc = await db.collection('users').doc(userId).get();
    let customerId = userDoc.data()?.stripeCustomerId;

    if (!customerId) {
      console.log('Creating new Stripe customer for user:', userId);
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUID: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID to user document
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customerId,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      customer: customerId,
      success_url: successUrl || 'http://localhost:19006/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl || 'http://localhost:19006/pricing',
      metadata: {
        firebaseUID: userId,
      },
      subscription_data: {
        metadata: {
          firebaseUID: userId,
        },
      },
    });

    console.log('Checkout session created:', session.id);
    return { id: session.id, url: session.url };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', `Failed to create checkout session: ${error.message}`);
  }
});

// Create Customer Portal Session
exports.createCustomerPortalSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { customerId } = data;

  if (!customerId) {
    throw new functions.https.HttpsError('invalid-argument', 'Customer ID is required');
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'http://localhost:19006/profile',
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create customer portal session');
  }
});

// Cancel subscription
exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { subscriptionId } = data;

  if (!subscriptionId) {
    throw new functions.https.HttpsError('invalid-argument', 'Subscription ID is required');
  }

  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    console.log('Subscription cancelled:', subscriptionId);
    return { success: true, cancelAt: subscription.cancel_at };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new functions.https.HttpsError('internal', 'Failed to cancel subscription');
  }
});

// Handle Stripe webhook events
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe?.webhook_secret;

  if (!endpointSecret) {
    console.error('Webhook secret not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object);
        break;
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// 🔗 ALTERNATIVE WEBHOOK ENDPOINT WITH EXPRESS
// This provides better raw body handling for webhook verification
const webhookApp = express();
webhookApp.use(cors({ origin: true }));

// Raw body middleware for webhook signature verification
webhookApp.use('/stripe', express.raw({ type: 'application/json' }));

webhookApp.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe?.webhook_secret;

  if (!endpointSecret) {
    console.error('Webhook secret not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object);
        break;
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// Export the express app as a function
exports.webhooks = functions.https.onRequest(webhookApp);

// Webhook Helper Functions
async function handleCheckoutCompleted(session) {
  try {
    const firebaseUID = session.metadata?.firebaseUID;
    if (!firebaseUID) {
      console.error('No Firebase UID in checkout session metadata');
      return;
    }

    const updateData = {
      lastCheckoutCompleted: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    // Handle subscription checkout
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const plan = getPlanFromPriceId(subscription.items.data[0].price.id);

      updateData.plan = plan;
      updateData.stripeStatus = 'active';
      updateData.subscriptionId = subscription.id;
      updateData.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      updateData.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      updateData.subscriptionStarted = admin.firestore.FieldValue.serverTimestamp();

      console.log(`Subscription checkout completed for user ${firebaseUID}, plan: ${plan}`);
    }

    // Handle one-time payment
    if (session.payment_intent && !session.subscription) {
      updateData.lastOneTimePayment = admin.firestore.FieldValue.serverTimestamp();
      updateData.lastPaymentAmount = session.amount_total;
      console.log(`One-time payment completed for user ${firebaseUID}, amount: ${session.amount_total}`);
    }

    await db.collection('users').doc(firebaseUID).update(updateData);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const firebaseUID = customer.metadata?.firebaseUID || subscription.metadata?.firebaseUID;

    if (!firebaseUID) {
      console.error('No Firebase UID found in subscription metadata');
      return;
    }

    const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
    const updateData = {
      plan: plan,
      stripeStatus: subscription.status,
      subscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      subscriptionStarted: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      billing: {
        interval: subscription.items.data[0].price.recurring.interval,
        intervalCount: subscription.items.data[0].price.recurring.interval_count,
        amount: subscription.items.data[0].price.unit_amount,
        currency: subscription.items.data[0].price.currency
      }
    };

    await db.collection('users').doc(firebaseUID).update(updateData);
    console.log(`Subscription created for user ${firebaseUID}, plan: ${plan}, status: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const firebaseUID = customer.metadata?.firebaseUID || subscription.metadata?.firebaseUID;

    if (!firebaseUID) {
      console.error('No Firebase UID found in subscription metadata');
      return;
    }

    const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
    const updateData = {
      plan: plan,
      stripeStatus: subscription.status,
      subscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    // Handle different subscription statuses
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      updateData.plan = 'free';
      updateData.subscriptionEnded = admin.firestore.FieldValue.serverTimestamp();
    } else if (subscription.status === 'past_due') {
      updateData.paymentIssue = true;
      updateData.lastPaymentAttempt = admin.firestore.FieldValue.serverTimestamp();
    } else if (subscription.status === 'active') {
      updateData.paymentIssue = false;
    }

    await db.collection('users').doc(firebaseUID).update(updateData);
    console.log(`Subscription updated for user ${firebaseUID}: ${subscription.status}, plan: ${plan}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const firebaseUID = customer.metadata?.firebaseUID || subscription.metadata?.firebaseUID;

    if (!firebaseUID) {
      console.error('No Firebase UID found in subscription metadata');
      return;
    }

    const updateData = {
      plan: 'free',
      stripeStatus: 'canceled',
      subscriptionEnded: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      paymentIssue: false
    };

    await db.collection('users').doc(firebaseUID).update(updateData);
    console.log(`Subscription deleted for user ${firebaseUID}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    console.log('Payment succeeded for invoice:', invoice.id);

    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await stripe.customers.retrieve(subscription.customer);
      const firebaseUID = customer.metadata?.firebaseUID || subscription.metadata?.firebaseUID;

      if (firebaseUID) {
        const updateData = {
          lastPaymentSucceeded: admin.firestore.FieldValue.serverTimestamp(),
          paymentIssue: false,
          lastInvoiceId: invoice.id,
          lastPaymentAmount: invoice.amount_paid,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };

        // If this was a recovery from past_due, reactivate the subscription
        if (subscription.status === 'active') {
          const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
          updateData.plan = plan;
          updateData.stripeStatus = 'active';
        }

        await db.collection('users').doc(firebaseUID).update(updateData);
        console.log(`Payment succeeded for user ${firebaseUID}, amount: ${invoice.amount_paid}`);
      }
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    console.log('Payment failed for invoice:', invoice.id);

    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await stripe.customers.retrieve(subscription.customer);
      const firebaseUID = customer.metadata?.firebaseUID || subscription.metadata?.firebaseUID;

      if (firebaseUID) {
        const updateData = {
          lastPaymentFailed: admin.firestore.FieldValue.serverTimestamp(),
          paymentIssue: true,
          failedInvoiceId: invoice.id,
          failureReason: invoice.last_finalization_error?.message || 'Payment failed',
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };

        // If subscription becomes past_due, update status but keep plan until final failure
        if (subscription.status === 'past_due') {
          updateData.stripeStatus = 'past_due';
        } else if (subscription.status === 'unpaid' || subscription.status === 'canceled') {
          updateData.plan = 'free';
          updateData.stripeStatus = subscription.status;
          updateData.subscriptionEnded = admin.firestore.FieldValue.serverTimestamp();
        }

        await db.collection('users').doc(firebaseUID).update(updateData);
        console.log(`Payment failed for user ${firebaseUID}, status: ${subscription.status}`);

        // TODO: Send email notification about payment failure
        // await sendPaymentFailureEmail(firebaseUID, invoice);
      }
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    console.log('Payment intent succeeded:', paymentIntent.id);

    // Update payment history or analytics if needed
    if (paymentIntent.metadata?.firebaseUID) {
      await db.collection('users').doc(paymentIntent.metadata.firebaseUID).update({
        lastPaymentIntentSucceeded: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  try {
    console.log('Payment intent failed:', paymentIntent.id);

    if (paymentIntent.metadata?.firebaseUID) {
      await db.collection('users').doc(paymentIntent.metadata.firebaseUID).update({
        lastPaymentIntentFailed: admin.firestore.FieldValue.serverTimestamp(),
        lastPaymentError: paymentIntent.last_payment_error?.message || 'Payment failed',
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleCustomerCreated(customer) {
  try {
    console.log('Customer created:', customer.id);

    if (customer.metadata?.firebaseUID) {
      await db.collection('users').doc(customer.metadata.firebaseUID).update({
        stripeCustomerId: customer.id,
        customerCreated: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error handling customer created:', error);
  }
}

async function handleCustomerUpdated(customer) {
  try {
    console.log('Customer updated:', customer.id);

    if (customer.metadata?.firebaseUID) {
      const updateData = {
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };

      // Update email if it changed
      if (customer.email) {
        updateData.stripeEmail = customer.email;
      }

      await db.collection('users').doc(customer.metadata.firebaseUID).update(updateData);
    }
  } catch (error) {
    console.error('Error handling customer updated:', error);
  }
}

async function handlePaymentMethodAttached(paymentMethod) {
  try {
    console.log('Payment method attached:', paymentMethod.id);

    if (paymentMethod.customer) {
      const customer = await stripe.customers.retrieve(paymentMethod.customer);
      if (customer.metadata?.firebaseUID) {
        await db.collection('users').doc(customer.metadata.firebaseUID).update({
          hasPaymentMethod: true,
          lastPaymentMethodAdded: admin.firestore.FieldValue.serverTimestamp(),
          paymentMethodType: paymentMethod.type,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error handling payment method attached:', error);
  }
}

// 🤖 AI-POWERED FEATURES

// Generate AI memory suggestions
exports.getAISuggestions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const userId = context.auth.uid;

  try {
    // Get user data and recent memories
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Check usage limits
    const tier = userData?.subscription?.tier || 'free';
    const limits = {
      free: 5,
      premium: 25,
      family: -1 // unlimited
    };

    const monthlyLimit = limits[tier];
    if (monthlyLimit > 0 && userData?.usage?.aiSuggestionsUsed >= monthlyLimit) {
      throw new functions.https.HttpsError('resource-exhausted', 'AI suggestions limit reached');
    }

    // Get recent memories for context
    const memoriesSnapshot = await db.collection('memories')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const memories = memoriesSnapshot.docs.map(doc => doc.data());

    // Generate AI suggestions using OpenAI
    const suggestions = await generateAISuggestions(memories, userData);

    // Update usage counter
    await db.collection('users').doc(userId).update({
      'usage.aiSuggestionsUsed': admin.firestore.FieldValue.increment(1)
    });

    return { suggestions };
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate suggestions');
  }
});

async function generateAISuggestions(memories, userData) {
  // If no OpenAI key, return default suggestions
  if (!functions.config().openai?.api_key) {
    return [
      {
        id: 1,
        type: 'memory_reminder',
        title: '📸 Remember This Day?',
        description: 'Your recent memories could use some organization!',
        action: 'Create Folder',
        engagement: 'medium'
      }
    ];
  }

  try {
    const prompt = `
    Based on the following user memories and profile, generate 3-4 personalized memory suggestions:
    
    User Profile: ${JSON.stringify(userData.profile || {})}
    Recent Memories: ${memories.slice(0, 5).map(m => ({ title: m.title, date: m.createdAt, tags: m.tags })).join(', ')}
    
    Generate suggestions for:
    1. Memory organization
    2. Sharing opportunities
    3. Digital letter creation
    4. Memory preservation
    
    Return as JSON array with: id, type, title, description, action, engagement
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    });

    const suggestions = JSON.parse(response.choices[0].message.content);
    return suggestions;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    // Return fallback suggestions
    return [
      {
        id: 1,
        type: 'memory_reminder',
        title: '📸 Organize Your Memories',
        description: 'Create folders to better organize your precious memories',
        action: 'Create Folder',
        engagement: 'medium'
      }
    ];
  }
}

// Analyze uploaded memory with AI
exports.analyzeMemory = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { memoryId, fileUrl } = data;

  try {
    // Use OpenAI Vision API to analyze the image/content
    const analysis = await analyzeMemoryContent(fileUrl);

    // Update memory document with AI analysis
    await db.collection('memories').doc(memoryId).update({
      aiAnalysis: {
        description: analysis.description,
        tags: analysis.tags,
        emotions: analysis.emotions,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    return { analysis };
  } catch (error) {
    console.error('Error analyzing memory:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze memory');
  }
});

async function analyzeMemoryContent(fileUrl) {
  // Placeholder for AI content analysis
  // In production, this would use OpenAI Vision API or Google Cloud Vision
  return {
    description: 'A beautiful family moment captured in time',
    tags: ['family', 'happiness', 'memories'],
    emotions: ['joy', 'love', 'nostalgia']
  };
}

// 💌 DIGITAL LETTER FUNCTIONS

// Send digital letter
exports.sendDigitalLetter = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { letterId, recipients } = data;
  const userId = context.auth.uid;

  try {
    // Get letter document
    const letterDoc = await db.collection('digitalLetters').doc(letterId).get();
    const letterData = letterDoc.data();

    if (!letterData || letterData.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Letter not found or unauthorized');
    }

    // Create delivery records
    const deliveries = [];
    for (const recipient of recipients) {
      const deliveryRef = db.collection('letterDeliveries').doc();
      deliveries.push({
        id: deliveryRef.id,
        letterId,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Batch write deliveries
    const batch = db.batch();
    deliveries.forEach(delivery => {
      batch.set(db.collection('letterDeliveries').doc(delivery.id), delivery);
    });
    await batch.commit();

    // Update letter status
    await db.collection('digitalLetters').doc(letterId).update({
      status: 'sent',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      deliveryCount: recipients.length
    });

    // Send notification emails (implement with your email service)
    // await sendLetterNotifications(recipients, letterData);

    return { success: true, deliveryIds: deliveries.map(d => d.id) };
  } catch (error) {
    console.error('Error sending digital letter:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send letter');
  }
});

// 📊 ANALYTICS AND MONITORING

// Track user events
exports.trackEvent = functions.firestore
  .document('analytics/{eventId}')
  .onCreate(async (snap, context) => {
    const eventData = snap.data();

    // Aggregate daily stats
    const today = new Date().toISOString().split('T')[0];
    const statsRef = db.collection('dailyStats').doc(today);

    await statsRef.set({
      [`events.${eventData.eventName}`]: admin.firestore.FieldValue.increment(1),
      totalEvents: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });

// Generate admin dashboard data
exports.getAdminDashboardData = functions.https.onCall(async (data, context) => {
  // Check if user is admin
  if (!context.auth || !isAdmin(context.auth.uid)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const { timeRange = '30d' } = data;

    // Get user metrics
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());

    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.subscription?.tier === 'premium').length;
    const familyUsers = users.filter(u => u.subscription?.tier === 'family').length;

    // Get memory metrics
    const memoriesSnapshot = await db.collection('memories').get();
    const totalMemories = memoriesSnapshot.size;

    // Get revenue data (from Stripe)
    // Implementation depends on your Stripe setup

    const dashboardData = {
      metrics: {
        totalUsers,
        premiumUsers,
        familyUsers,
        totalMemories,
        // Add more metrics as needed
      },
      userGrowth: [], // Implement based on time range
      revenueData: [] // Implement based on Stripe data
    };

    return dashboardData;
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate dashboard data');
  }
});

// Helper function to check admin status
function isAdmin(uid) {
  // Implement your admin check logic
  // This could check a custom claim, admin collection, etc.
  return false; // Placeholder
}

// 🔄 SCHEDULED FUNCTIONS

// Daily cleanup and maintenance
exports.dailyMaintenance = functions.pubsub
  .schedule('0 2 * * *') // Run at 2 AM daily
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Running daily maintenance...');

    try {
      // Clean up expired sessions
      await cleanupExpiredSessions();

      // Reset monthly usage counters if new month
      await resetMonthlyUsage();

      // Generate daily analytics
      await generateDailyAnalytics();

      console.log('Daily maintenance completed');
    } catch (error) {
      console.error('Error in daily maintenance:', error);
    }
  });

async function cleanupExpiredSessions() {
  // Implement cleanup logic
}

async function resetMonthlyUsage() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (now.getDate() === 1) {
    // Reset usage counters
    const batch = db.batch();
    const usersSnapshot = await db.collection('users').get();

    usersSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        'usage.aiSuggestionsUsed': 0,
        'usage.lastResetDate': admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    console.log('Monthly usage counters reset');
  }
}

async function generateDailyAnalytics() {
  // Generate and store daily analytics
  const today = new Date().toISOString().split('T')[0];

  const usersSnapshot = await db.collection('users').get();
  const memoriesSnapshot = await db.collection('memories')
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(new Date(today)))
    .get();

  await db.collection('dailyStats').doc(today).set({
    totalUsers: usersSnapshot.size,
    newMemories: memoriesSnapshot.size,
    generatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

// Export helper functions for testing
exports.testHelpers = {
  generateAISuggestions,
  analyzeMemoryContent
};

function getPlanFromPriceId(priceId) {
  try {
    const config = functions.config();
    const priceToPlan = {
      [config.stripe?.premium_price_id]: 'premium',
      [config.stripe?.family_price_id]: 'family'
    };

    const plan = priceToPlan[priceId];
    if (!plan) {
      console.warn(`Unknown price ID: ${priceId}, defaulting to free plan`);
      return 'free';
    }

    return plan;
  } catch (error) {
    console.error('Error mapping price ID to plan:', error);
    return 'free';
  }
}

// 🤖 ENHANCED AI FUNCTIONS FOR PHASE 6

// Generate personalized letter using OpenAI
exports.generatePersonalizedLetter = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { answers, userContext } = data;
  const userId = context.auth.uid;

  try {
    // Check usage limits
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const tier = userData?.subscription?.tier || 'free';

    const monthlyLimits = {
      free: 2,      // 2 letters per month
      premium: 10,  // 10 letters per month  
      family: -1    // unlimited
    };

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyUsage = userData?.usage?.letterGeneration?.[currentMonth] || 0;

    if (monthlyLimits[tier] > 0 && monthlyUsage >= monthlyLimits[tier]) {
      throw new functions.https.HttpsError('resource-exhausted', 'Monthly letter generation limit reached');
    }

    // Generate letter using OpenAI
    let letter;
    if (functions.config().openai?.api_key) {
      letter = await generateLetterWithOpenAI(answers, userContext);
    } else {
      letter = generateFallbackLetter(answers, userContext);
    }

    // Update usage counter
    await db.collection('users').doc(userId).update({
      [`usage.letterGeneration.${currentMonth}`]: admin.firestore.FieldValue.increment(1),
      'stats.lettersCreated': admin.firestore.FieldValue.increment(1)
    });

    // Save letter to user's collection
    const letterDoc = await db.collection('letters').add({
      userId,
      content: letter,
      answers,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        wordCount: letter.split(' ').length,
        mood: answers.mood,
        topics: answers.topics,
        recipient: answers.recipient
      }
    });

    return {
      letter,
      letterId: letterDoc.id,
      metadata: {
        wordCount: letter.split(' ').length,
        usageRemaining: monthlyLimits[tier] - monthlyUsage - 1
      }
    };
  } catch (error) {
    console.error('Error generating letter:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate letter');
  }
});

// Advanced memory content analysis
exports.analyzeMemoryContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { fileUrl, fileName, description, type } = data;
  const userId = context.auth.uid;

  try {
    let analysis;

    if (functions.config().openai?.api_key && (type === 'image' || type === 'photo')) {
      // Use OpenAI Vision API for image analysis
      analysis = await analyzeImageWithOpenAI(fileUrl, description);
    } else {
      // Use fallback analysis
      analysis = generateBasicAnalysis(fileName, description, type);
    }

    // Save analysis to memory document
    if (data.memoryId) {
      await db.collection('memories').doc(data.memoryId).update({
        aiAnalysis: {
          ...analysis,
          analyzedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      });
    }

    return { analysis };
  } catch (error) {
    console.error('Error analyzing memory:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze memory');
  }
});

// Enhanced AI memory suggestions
exports.getAIMemorySuggestions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { userId, context: userContext } = data;

  try {
    // Get user data and recent memories
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Check usage limits
    const tier = userData?.subscription?.tier || 'free';
    const limits = {
      free: 5,      // 5 suggestions per day
      premium: 20,  // 20 suggestions per day
      family: -1    // unlimited
    };

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dailyUsage = userData?.usage?.aiSuggestions?.[today] || 0;

    if (limits[tier] > 0 && dailyUsage >= limits[tier]) {
      throw new functions.https.HttpsError('resource-exhausted', 'Daily AI suggestions limit reached');
    }

    // Get recent memories for context
    const memoriesSnapshot = await db.collection('memories')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const memories = memoriesSnapshot.docs.map(doc => doc.data());

    // Generate AI suggestions
    let suggestions;
    if (functions.config().openai?.api_key) {
      suggestions = await generateAISuggestionsWithOpenAI(memories, userData, userContext);
    } else {
      suggestions = generateFallbackSuggestions(userContext);
    }

    // Update usage counter
    await db.collection('users').doc(userId).update({
      [`usage.aiSuggestions.${today}`]: admin.firestore.FieldValue.increment(1)
    });

    return { suggestions };
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate suggestions');
  }
});

// Generate comprehensive memory insights
exports.generateMemoryInsights = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { userId, memoryCount, memoryTypes, timeRange } = data;

  try {
    // Get user's complete memory data
    const memoriesSnapshot = await db.collection('memories')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const memories = memoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Generate insights
    const insights = {
      statistics: generateMemoryStatistics(memories),
      trends: analyzeMemoryTrends(memories),
      achievements: calculateAchievements(memories),
      recommendations: generateRecommendations(memories),
      timelineData: generateTimelineData(memories),
      categoryBreakdown: analyzeCategoryBreakdown(memories)
    };

    return { insights };
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate insights');
  }
});

// AI-powered smart search
exports.aiSmartSearch = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { query, totalMemories, filters, searchType } = data;
  const userId = context.auth.uid;

  try {
    // Get memories that match initial filters
    let memoriesQuery = db.collection('memories').where('userId', '==', userId);

    if (filters.dateRange) {
      memoriesQuery = memoriesQuery
        .where('createdAt', '>=', new Date(filters.dateRange.start))
        .where('createdAt', '<=', new Date(filters.dateRange.end));
    }

    if (filters.type) {
      memoriesQuery = memoriesQuery.where('type', '==', filters.type);
    }

    const memoriesSnapshot = await memoriesQuery.get();
    const memories = memoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Perform AI-enhanced search
    let results, suggestions;

    if (functions.config().openai?.api_key && searchType !== 'basic') {
      // Use AI for semantic search
      const searchResults = await performSemanticSearch(query, memories);
      results = searchResults.results;
      suggestions = searchResults.suggestions;
    } else {
      // Use basic text search
      results = performBasicTextSearch(query, memories);
      suggestions = generateBasicSearchSuggestions(query);
    }

    return { results, suggestions };
  } catch (error) {
    console.error('Error in smart search:', error);
    throw new functions.https.HttpsError('internal', 'Search failed');
  }
});

// ========================================
// ENHANCED MEMORY BOX FUNCTIONS (New)
// ========================================

// Advanced memory upload with AI processing
exports.processMemoryUpload = functions.storage.object().onFinalize(async (object) => {
  try {
    const filePath = object.name;
    const userId = filePath.split('/')[1]; // Assuming path: memories/{userId}/{file}
    
    if (!filePath.startsWith('memories/')) {
      return null;
    }

    // Download the uploaded file
    const bucket = storage.bucket(object.bucket);
    const file = bucket.file(filePath);
    const [metadata] = await file.getMetadata();
    
    // Generate thumbnail for images/videos
    if (object.contentType && object.contentType.startsWith('image/')) {
      await generateImageThumbnail(bucket, filePath);
    } else if (object.contentType && object.contentType.startsWith('video/')) {
      await generateVideoThumbnail(bucket, filePath);
    }

    // Extract metadata using AI (if enabled)
    if (object.contentType && object.contentType.startsWith('image/')) {
      const aiMetadata = await extractImageMetadata(file);
      
      // Update memory document with AI-generated metadata
      const memoryId = filePath.split('/').pop().split('.')[0];
      await db.collection('memories').doc(memoryId).update({
        aiMetadata: aiMetadata,
        processingComplete: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log('Memory processing completed:', filePath);
  } catch (error) {
    console.error('Memory processing error:', error);
  }
});

// Family invitation system
exports.sendFamilyInvite = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { familyId, email, message } = data;
    const inviterUid = context.auth.uid;

    // Verify user is family owner or admin
    const familyDoc = await db.collection('families').doc(familyId).get();
    const familyData = familyDoc.data();
    
    if (familyData.ownerId !== inviterUid && !familyData.admins?.includes(inviterUid)) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to invite to this family');
    }

    // Create invitation record
    const inviteDoc = await db.collection('familyInvites').add({
      familyId: familyId,
      familyName: familyData.name,
      inviterUid: inviterUid,
      inviterName: context.auth.token.name || 'Family Member',
      email: email,
      message: message || '',
      status: 'pending',
      inviteCode: generateInviteCode(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send invitation email
    const inviteLink = `https://memorybox.app/invite/${inviteDoc.id}`;
    await sendInvitationEmail(email, familyData.name, context.auth.token.name, inviteLink, message);

    return { success: true, inviteId: inviteDoc.id };
  } catch (error) {
    console.error('Send family invite error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Accept family invitation
exports.acceptFamilyInvite = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { inviteId } = data;
    const userId = context.auth.uid;

    // Get invitation
    const inviteDoc = await db.collection('familyInvites').doc(inviteId).get();
    if (!inviteDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Invitation not found');
    }

    const inviteData = inviteDoc.data();
    
    // Check if invitation is valid
    if (inviteData.status !== 'pending') {
      throw new functions.https.HttpsError('failed-precondition', 'Invitation already processed');
    }
    
    if (inviteData.expiresAt.toDate() < new Date()) {
      throw new functions.https.HttpsError('failed-precondition', 'Invitation has expired');
    }

    // Verify email matches
    if (inviteData.email !== context.auth.token.email) {
      throw new functions.https.HttpsError('permission-denied', 'Email does not match invitation');
    }

    // Add user to family
    const familyRef = db.collection('families').doc(inviteData.familyId);
    await familyRef.update({
      members: admin.firestore.FieldValue.arrayUnion(userId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update user's family list
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      familyIds: admin.firestore.FieldValue.arrayUnion(inviteData.familyId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Mark invitation as accepted
    await inviteDoc.ref.update({
      status: 'accepted',
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
      acceptedBy: userId
    });

    return { success: true, familyId: inviteData.familyId };
  } catch (error) {
    console.error('Accept family invite error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Advanced search with AI
exports.searchMemoriesAI = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { query, userId, filters } = data;
    
    // Basic text search first
    let memoriesQuery = db.collection('memories').where('userId', '==', userId);
    
    if (filters?.type) {
      memoriesQuery = memoriesQuery.where('type', '==', filters.type);
    }
    
    const memoriesSnapshot = await memoriesQuery.get();
    let memories = memoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Use AI for semantic search if OpenAI is configured
    if (query && openai) {
      try {
        // Generate embedding for search query
        const embedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: query,
        });

        // In a production app, you'd store embeddings in the database
        // and use vector similarity search. For now, use simple keyword matching.
        const queryLower = query.toLowerCase();
        memories = memories.filter(memory => {
          const titleMatch = memory.title?.toLowerCase().includes(queryLower);
          const descMatch = memory.description?.toLowerCase().includes(queryLower);
          const tagMatch = memory.tags?.some(tag => tag.toLowerCase().includes(queryLower));
          const aiMatch = memory.aiMetadata?.description?.toLowerCase().includes(queryLower);
          
          return titleMatch || descMatch || tagMatch || aiMatch;
        });

        // Sort by relevance (simple scoring)
        memories.sort((a, b) => {
          const scoreA = calculateRelevanceScore(a, queryLower);
          const scoreB = calculateRelevanceScore(b, queryLower);
          return scoreB - scoreA;
        });

      } catch (aiError) {
        console.warn('AI search failed, falling back to basic search:', aiError);
      }
    }

    return { memories: memories.slice(0, 50) }; // Limit results
  } catch (error) {
    console.error('Search memories AI error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Bulk operations for memories
exports.bulkMemoryOperations = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { operation, memoryIds, updates } = data;
    const userId = context.auth.uid;

    // Verify all memories belong to the user
    const memoryPromises = memoryIds.map(id => db.collection('memories').doc(id).get());
    const memoryDocs = await Promise.all(memoryPromises);
    
    for (const doc of memoryDocs) {
      if (!doc.exists || doc.data().userId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Unauthorized access to memory');
      }
    }

    const batch = db.batch();

    switch (operation) {
      case 'delete':
        memoryIds.forEach(id => {
          batch.delete(db.collection('memories').doc(id));
        });
        break;
        
      case 'update':
        memoryIds.forEach(id => {
          batch.update(db.collection('memories').doc(id), {
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });
        break;
        
      case 'move_to_folder':
        memoryIds.forEach(id => {
          batch.update(db.collection('memories').doc(id), {
            folderId: updates.folderId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });
        break;
        
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Invalid operation');
    }

    await batch.commit();
    return { success: true, processedCount: memoryIds.length };
  } catch (error) {
    console.error('Bulk memory operations error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Generate smart memory suggestions
exports.generateMemorySuggestions = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    
    // Get user's recent memories
    const recentMemories = await db.collection('memories')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const memories = recentMemories.docs.map(doc => doc.data());
    
    if (memories.length === 0) {
      return { suggestions: [] };
    }

    // Generate suggestions based on patterns
    const suggestions = [];
    
    // Time-based suggestions
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    suggestions.push({
      type: 'memory_lane',
      title: 'Memory Lane',
      description: `Memories from ${oneYearAgo.toLocaleDateString()}`,
      action: 'search',
      parameters: { dateRange: { start: oneYearAgo, end: oneYearAgo } }
    });

    // Folder suggestions
    const folderCounts = {};
    memories.forEach(memory => {
      if (memory.folderId) {
        folderCounts[memory.folderId] = (folderCounts[memory.folderId] || 0) + 1;
      }
    });

    if (Object.keys(folderCounts).length > 0) {
      const topFolder = Object.keys(folderCounts).reduce((a, b) => 
        folderCounts[a] > folderCounts[b] ? a : b
      );
      
      suggestions.push({
        type: 'folder_highlight',
        title: 'Most Active Folder',
        description: 'Continue adding to your most used folder',
        action: 'navigate_to_folder',
        parameters: { folderId: topFolder }
      });
    }

    // Type-based suggestions
    const typeCounts = {};
    memories.forEach(memory => {
      typeCounts[memory.type] = (typeCounts[memory.type] || 0) + 1;
    });

    const topType = Object.keys(typeCounts).reduce((a, b) => 
      typeCounts[a] > typeCounts[b] ? a : b
    );

    suggestions.push({
      type: 'content_suggestion',
      title: `More ${topType} memories?`,
      description: `You seem to love ${topType} memories. Add more!`,
      action: 'create_memory',
      parameters: { type: topType }
    });

    return { suggestions: suggestions.slice(0, 5) };
  } catch (error) {
    console.error('Generate memory suggestions error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ========================================
// HELPER FUNCTIONS
// ========================================

async function generateImageThumbnail(bucket, filePath) {
  // Implementation would use image processing library like Sharp
  // For now, just log the action
  console.log('Generating thumbnail for:', filePath);
}

async function generateVideoThumbnail(bucket, filePath) {
  // Implementation would use FFmpeg or similar
  console.log('Generating video thumbnail for:', filePath);
}

async function extractImageMetadata(file) {
  try {
    if (!openai) return null;

    // Download file temporarily (in production, you'd use streaming)
    const [buffer] = await file.download();
    const base64Image = buffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and provide a brief description, identify any people, objects, or locations. Return JSON with description, objects, people, and location fields."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Extract image metadata error:', error);
    return null;
  }
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function calculateRelevanceScore(memory, query) {
  let score = 0;
  
  if (memory.title?.toLowerCase().includes(query)) score += 10;
  if (memory.description?.toLowerCase().includes(query)) score += 5;
  if (memory.tags?.some(tag => tag.toLowerCase().includes(query))) score += 3;
  if (memory.aiMetadata?.description?.toLowerCase().includes(query)) score += 2;
  
  return score;
}

async function sendInvitationEmail(email, familyName, inviterName, inviteLink, message) {
  const emailContent = {
    to: email,
    from: 'noreply@memorybox.app',
    subject: `${inviterName} invited you to join ${familyName} on Memory Box`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're invited to join ${familyName}! 🎉</h2>
        <p>${inviterName} has invited you to join their family on Memory Box.</p>
        ${message ? `<p><em>"${message}"</em></p>` : ''}
        <p>Memory Box is where families preserve and share their most precious moments together.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Join Family
          </a>
        </div>
        <p>This invitation will expire in 7 days.</p>
        <p>Best regards,<br>The Memory Box Team</p>
      </div>
    `
  };

  await sgMail.send(emailContent);
}
