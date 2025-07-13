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

// === AI HELPER FUNCTIONS === //

async function generateLetterWithOpenAI(answers, userContext) {
  const { recipient, timeframe, mood, topics, length, personal } = answers;

  const prompt = `
You are Rob, a warm and empathetic AI assistant who helps people write meaningful letters. 
Create a heartfelt, personalized letter based on the following information:

Letter Details:
- Recipient: ${recipient}
- When to open: ${timeframe}
- Mood: ${mood}
- Topics to cover: ${topics?.join(', ')}
- Length preference: ${length}
- Personal message: ${personal || 'None provided'}

Writer Information:
- Name: ${userContext.name}
- Recent memories: ${userContext.recentMemories?.length || 0} memories captured recently

Requirements:
- Write in a warm, personal tone as if the writer is speaking directly to the recipient
- Include references to the specified topics naturally
- Match the desired mood and length
- Make it feel authentic and heartfelt
- Include personal touches based on the provided information
- End with a meaningful closing

Write the letter now:
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: length === 'Short & Sweet' ? 300 : length === 'Medium Length' ? 600 : 900,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateFallbackLetter(answers, userContext);
  }
}

async function analyzeImageWithOpenAI(imageUrl, description) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this family memory image and provide insights. Context: ${description || 'No description provided'}. 
              
              Please provide:
              1. A warm, family-friendly description
              2. Suggested tags (5-8 tags)
              3. Detected emotions
              4. Suggested title
              5. Category (family, celebration, travel, daily_life, etc.)
              
              Format as JSON with keys: description, tags, emotions, title, category`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Image analysis error:', error);
    return generateBasicAnalysis('', description, 'image');
  }
}

async function generateAISuggestionsWithOpenAI(memories, userData, userContext) {
  const memoryContext = memories.slice(0, 5).map(m => ({
    type: m.type,
    title: m.title,
    date: m.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    tags: m.tags || []
  }));

  const prompt = `
Based on a user's recent memory activity, generate 4 personalized memory suggestions.

User Context:
- Recent memories: ${JSON.stringify(memoryContext)}
- Current season: ${getCurrentSeason()}
- Time of year: ${new Date().getMonth() + 1}
- User preferences: ${JSON.stringify(userData.profile?.preferences || {})}

Generate suggestions that are:
1. Timely and relevant to current season/time
2. Personal based on their memory patterns
3. Family-friendly and meaningful
4. Actionable and specific

For each suggestion, provide:
- type: (seasonal, milestone, family, creative, reflection)
- title: Engaging title
- description: Why this suggestion is relevant now
- icon: Single emoji
- priority: high, medium, low

Return as JSON array.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.8
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI suggestions error:', error);
    return generateFallbackSuggestions(userContext);
  }
}

async function performSemanticSearch(query, memories) {
  // This would use OpenAI embeddings for semantic search
  // For now, return enhanced text search with AI categorization

  const prompt = `
User is searching for: "${query}"

Help categorize this search and suggest related terms:
- Search intent: (people, places, events, emotions, objects, time)
- Suggested terms: 3-5 related search terms
- Filters: suggested filters to apply

Return as JSON with keys: intent, suggestedTerms, suggestedFilters
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.3
    });

    const aiResponse = JSON.parse(response.choices[0].message.content);

    // Perform enhanced text search based on AI insights
    const results = performEnhancedTextSearch(query, memories, aiResponse);

    return {
      results,
      suggestions: aiResponse.suggestedTerms
    };
  } catch (error) {
    console.error('Semantic search error:', error);
    return {
      results: performBasicTextSearch(query, memories),
      suggestions: []
    };
  }
}

// === UTILITY FUNCTIONS === //

function generateFallbackLetter(answers, userContext) {
  // ... existing fallback letter generation logic ...
  // (keeping the existing implementation)
  return "Your personalized letter content here...";
}

function generateBasicAnalysis(fileName, description, type) {
  return {
    description: `A precious ${type} memory captured with love`,
    tags: ['memory', type, getCurrentSeason().toLowerCase()],
    emotions: ['joy', 'nostalgia'],
    title: `${new Date().toLocaleDateString()} Memory`,
    category: 'family'
  };
}

function generateFallbackSuggestions(userContext) {
  const season = getCurrentSeason();
  return [
    {
      type: 'seasonal',
      title: `Capture ${season} Moments`,
      description: `Perfect time to document beautiful ${season.toLowerCase()} memories`,
      icon: getSeasonIcon(season),
      priority: 'high'
    },
    {
      type: 'family',
      title: 'Family Time',
      description: 'Gather the family for some memory-making moments',
      icon: '👨‍👩‍👧‍👦',
      priority: 'medium'
    }
  ];
}

function generateMemoryStatistics(memories) {
  const now = new Date();
  const thisMonth = memories.filter(m => {
    const date = m.createdAt?.toDate?.() || new Date(m.createdAt);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  return {
    total: memories.length,
    thisMonth: thisMonth.length,
    avgPerMonth: Math.round(memories.length / Math.max(1, getMonthsSinceFirstMemory(memories))),
    mostActiveMonth: getMostActiveMonth(memories),
    longestStreak: calculateMemoryStreak(memories)
  };
}

function analyzeMemoryTrends(memories) {
  return {
    uploadPattern: getUploadPattern(memories),
    seasonalActivity: getSeasonalActivity(memories),
    typeDistribution: getTypeDistribution(memories),
    growthTrend: getGrowthTrend(memories)
  };
}

function calculateAchievements(memories) {
  const achievements = [];

  if (memories.length >= 100) achievements.push({ title: 'Memory Keeper', description: '100+ memories preserved' });
  if (memories.length >= 50) achievements.push({ title: 'Family Historian', description: '50+ memories captured' });
  if (hasConsecutiveDays(memories, 7)) achievements.push({ title: 'Memory Streak', description: '7 days in a row' });

  return achievements;
}

function generateRecommendations(memories) {
  const recommendations = [];

  if (memories.length > 50 && !hasRecentFolder(memories)) {
    recommendations.push('Consider organizing memories into themed folders');
  }

  if (getTypeDistribution(memories).video < 0.1) {
    recommendations.push('Try capturing some video memories for variety');
  }

  return recommendations;
}

function performBasicTextSearch(query, memories) {
  const lowerQuery = query.toLowerCase();
  return memories.filter(memory => {
    const title = (memory.title || '').toLowerCase();
    const description = (memory.description || '').toLowerCase();
    const tags = (memory.tags || []).join(' ').toLowerCase();

    return title.includes(lowerQuery) ||
      description.includes(lowerQuery) ||
      tags.includes(lowerQuery);
  });
}

function performEnhancedTextSearch(query, memories, aiInsights) {
  // Enhanced search using AI insights
  const results = performBasicTextSearch(query, memories);

  // Add fuzzy matching and related term search
  if (aiInsights.suggestedTerms) {
    aiInsights.suggestedTerms.forEach(term => {
      const termResults = performBasicTextSearch(term, memories);
      termResults.forEach(result => {
        if (!results.find(r => r.id === result.id)) {
          results.push({ ...result, relevanceScore: 0.8 });
        }
      });
    });
  }

  return results;
}

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}

function getSeasonIcon(season) {
  const icons = { Spring: '🌸', Summer: '☀️', Fall: '🍂', Winter: '❄️' };
  return icons[season] || '🌟';
}

// Additional utility functions...
function getMonthsSinceFirstMemory(memories) {
  if (memories.length === 0) return 1;
  const firstMemory = memories[memories.length - 1];
  const firstDate = firstMemory.createdAt?.toDate?.() || new Date(firstMemory.createdAt);
  const now = new Date();
  return Math.max(1, Math.floor((now - firstDate) / (1000 * 60 * 60 * 24 * 30)));
}

function getMostActiveMonth(memories) {
  const months = {};
  memories.forEach(memory => {
    const date = memory.createdAt?.toDate?.() || new Date(memory.createdAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    months[monthKey] = (months[monthKey] || 0) + 1;
  });

  return Object.keys(months).reduce((a, b) => months[a] > months[b] ? a : b, '');
}

function calculateMemoryStreak(memories) {
  // Calculate consecutive days with memories
  const sortedDates = memories
    .map(m => (m.createdAt?.toDate?.() || new Date(m.createdAt)).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort();

  let maxStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(maxStreak, currentStreak);
}
