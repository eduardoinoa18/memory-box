# Firebase Functions for Memory Box Stripe Integration

This directory will contain Firebase Cloud Functions for handling:

- Stripe checkout session creation
- Subscription management
- Webhook processing
- User plan updates

## Setup Instructions

1. **Initialize Firebase Functions:**
   ```bash
   firebase init functions
   # Choose JavaScript or TypeScript
   # Install dependencies: Yes
   ```

2. **Install required packages:**
   ```bash
   cd functions
   npm install stripe
   npm install cors
   ```

3. **Configure Stripe keys:**
   ```bash
   firebase functions:config:set stripe.secret="sk_test_your_secret_key"
   firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
   firebase functions:config:set stripe.premium_price_id="price_premium_id"
   firebase functions:config:set stripe.family_price_id="price_family_id"
   ```

4. **Deploy functions:**
   ```bash
   firebase deploy --only functions
   ```

## Required Functions

- `createCheckoutSession` - Creates Stripe checkout sessions
- `cancelSubscription` - Cancels user subscriptions
- `reactivateSubscription` - Reactivates cancelled subscriptions
- `updateSubscription` - Updates subscription plans
- `createBillingPortalSession` - Creates billing portal sessions
- `stripeWebhook` - Handles Stripe webhook events

See `STEP_2_STRIPE_INTEGRATION.md` for complete implementation details.
