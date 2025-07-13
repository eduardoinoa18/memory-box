# Webhook Setup Guide

## Overview
This guide will help you set up Stripe webhooks to handle payment events and keep your app's subscription data synchronized with Stripe.

## What Are Webhooks?
Webhooks are HTTP callbacks that Stripe sends to your server when certain events occur in your Stripe account. This ensures your app stays in sync with payment events like:

- ✅ Payment succeeded
- 🔔 Subscription started/updated/cancelled
- 💳 Card expired or payment failed
- 👤 Customer created or updated

## Step 1: Configure Your Webhook Endpoint

### 1.1 Admin Dashboard Webhook URL
Your webhook endpoint is already created at:
```
https://yourdomain.com/api/webhooks/stripe
```

### 1.2 Firebase Functions Webhook URL (Alternative)
If using Firebase Functions for webhooks:
```
https://us-central1-your-project-id.cloudfunctions.net/stripeWebhook
```

## Step 2: Stripe Dashboard Setup

### 2.1 Create Webhook Endpoint
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Enter your webhook URL
5. Select the events you want to listen for (see Step 2.2)

### 2.2 Required Events
Select these events for complete functionality:

**Payment Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

**Subscription Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Invoice Events:**
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `invoice.finalized`

**Customer Events:**
- `customer.created`
- `customer.updated`

**Payment Method Events:**
- `payment_method.attached`

### 2.3 Get Webhook Secret
1. After creating the webhook, click on it
2. In the **Signing secret** section, click **"Reveal"**
3. Copy the webhook secret (starts with `whsec_`)

## Step 3: Configure Webhook Secret

### 3.1 Using Integrations Hub (Recommended)
1. Go to your Admin Dashboard
2. Navigate to **Integrations** → **Stripe**
3. Paste the webhook secret in the **Webhook Secret** field
4. Click **Save Integration**

### 3.2 Using Environment Variables
Add to your `.env.local` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 4: Test Your Webhook

### 4.1 Using Admin Dashboard
1. Go to **Admin Dashboard** → **Webhooks**
2. Click **"Test Webhook"** to send a test event
3. Check the webhook logs for successful processing

### 4.2 Using Stripe CLI (Development)
Install and use Stripe CLI for local testing:
```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Step 5: Monitor Webhook Events

### 5.1 Webhook Logs
Monitor webhook events in real-time:
- **Admin Dashboard** → **Webhooks**
- View event types, timestamps, and processing status
- Debug failed events

### 5.2 Stripe Dashboard
- Go to **Developers** → **Webhooks** → Your webhook
- Check **"Recent deliveries"** for delivery status
- View request/response details for debugging

## Step 6: Handle Webhook Events

The webhook handler automatically processes these events:

### Payment Events
```javascript
// payment_intent.succeeded
- Updates user payment status
- Confirms subscription activation
- Sends confirmation emails
```

### Subscription Events
```javascript
// customer.subscription.created/updated
- Updates user subscription in Firestore
- Syncs plan changes
- Updates subscription status

// customer.subscription.deleted
- Downgrades user to free plan
- Updates access permissions
- Sends cancellation confirmation
```

### Invoice Events
```javascript
// invoice.payment_succeeded
- Confirms recurring payment
- Updates subscription period
- Sends receipt

// invoice.payment_failed
- Handles failed payments
- Sends payment retry notifications
- Manages dunning process
```

## Security Best Practices

### 1. Webhook Signature Verification
The webhook handler automatically verifies Stripe signatures:
```javascript
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

### 2. Idempotency
Handle duplicate events gracefully:
```javascript
// Events may be sent multiple times
// Use event.id to prevent duplicate processing
```

### 3. Error Handling
Return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid signature)
- `500` - Server error (retry)

## Troubleshooting

### Common Issues

#### 1. Webhook Secret Mismatch
**Error:** `Webhook signature verification failed`
**Solution:** 
- Verify webhook secret in Integrations Hub
- Check environment variables
- Ensure webhook URL matches Stripe configuration

#### 2. Events Not Processing
**Error:** Events received but not processed
**Solution:**
- Check webhook logs in Admin Dashboard
- Verify Firestore permissions
- Check Firebase Functions logs

#### 3. Timeout Issues
**Error:** Webhook timeouts
**Solution:**
- Optimize webhook handler performance
- Return 200 status quickly
- Process complex logic asynchronously

### Debug Steps
1. Check Admin Dashboard → Webhooks for event logs
2. Verify Stripe Dashboard → Webhooks → Recent deliveries
3. Test with Stripe CLI for local debugging
4. Check browser console for integration errors

## Next Steps

After webhook setup:

1. **Test Complete Flow:**
   - Create test subscription
   - Cancel subscription
   - Update payment method
   - Verify all events are processed

2. **Monitor Production:**
   - Set up webhook monitoring alerts
   - Review failed events regularly
   - Monitor subscription sync accuracy

3. **Advanced Features:**
   - Implement dunning management
   - Add usage-based billing
   - Set up customer portal

## Support

For webhook issues:
1. Check this guide first
2. Review Stripe webhook documentation
3. Test in development environment
4. Contact development team with specific error messages

---

**⚠️ Important:** Always test webhooks in development before deploying to production. Use Stripe test mode and test webhook endpoints for initial setup.
