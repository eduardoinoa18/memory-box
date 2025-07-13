# 🚀 STRIPE INTEGRATION - QUICK REFERENCE

**Status:** Implementation Phase  
**Documentation:** See `STEP_2_IMPLEMENTATION_PLAN.md` for detailed steps  
**Checklist:** See `STEP_2_IMPLEMENTATION_CHECKLIST.md` for progress tracking  

---

## 📋 ESSENTIAL INFORMATION

### 🔑 Required Stripe Information
```ini
# From Stripe Dashboard > Products
PREMIUM_PRICE_ID=price_1XXXpremium    # $4.99/month
FAMILY_PRICE_ID=price_1XXXfamily      # $9.99/month

# From Stripe Dashboard > API Keys  
PUBLISHABLE_KEY=pk_test_51XXX         # Frontend use
SECRET_KEY=sk_test_51XXX              # Backend only

# From Stripe Dashboard > Webhooks
WEBHOOK_SECRET=whsec_1XXX             # Webhook verification
```

### 🛠️ Key Commands
```bash
# Install dependencies
npm install @stripe/stripe-js
cd functions && npm install stripe cors

# Configure Firebase
firebase functions:config:set stripe.secret_key="sk_test_..."
firebase functions:config:set stripe.premium_price_id="price_..."
firebase functions:config:set stripe.family_price_id="price_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."

# Deploy
firebase deploy --only functions

# Test
npm run web
```

### 📁 Files to Create/Update
- [ ] `utils/checkout.js` - Stripe utilities
- [ ] `services/subscriptionService.js` - Subscription management
- [ ] `components/SubscriptionModal.js` - Plan selection UI
- [ ] `functions/index.js` - Backend Stripe functions
- [ ] `screens/ProfileScreen.js` - Integrate subscription UI
- [ ] `.env.local` - Environment variables

---

## 🔄 QUICK TEST FLOW

1. **Start App:** `npm run web`
2. **Login:** Use existing auth
3. **Profile:** Navigate to profile screen
4. **Upgrade:** Click "Upgrade Plan"
5. **Select:** Choose Premium or Family
6. **Pay:** Use test card `4242 4242 4242 4242`
7. **Verify:** Check plan updates in app

---

## 🧪 TEST CARDS

| Purpose | Card Number | Result |
|---------|-------------|---------|
| Success | `4242 4242 4242 4242` | Payment succeeds |
| Decline | `4000 0000 0000 0002` | Payment declined |
| Error | `4000 0000 0000 0119` | Processing error |

**Test Details:** Any future date, any 3-digit CVC

---

## 🔍 WEBHOOK EVENTS

Required webhook events in Stripe Dashboard:
- `checkout.session.completed`
- `customer.subscription.created` 
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Webhook URL:** `https://[region]-[project].cloudfunctions.net/stripeWebhook`

---

## 🚨 TROUBLESHOOTING

### Issue: Checkout session creation fails
**Check:**
- [ ] Stripe secret key correct in Firebase config
- [ ] Price IDs match Stripe Dashboard
- [ ] User is authenticated
- [ ] Functions deployed successfully

### Issue: Webhook not receiving events
**Check:**
- [ ] Webhook URL accessible
- [ ] Webhook secret correct in Firebase config
- [ ] Required events selected in Stripe
- [ ] Firebase functions logs for errors

### Issue: Plan not updating after payment
**Check:**
- [ ] Webhook events configured correctly
- [ ] Firebase user document structure
- [ ] Webhook handler success in logs
- [ ] Real-time listener in app

### Issue: Customer portal not working
**Check:**
- [ ] Customer ID saved in user document
- [ ] Customer portal function deployed
- [ ] Stripe customer exists

---

## 📊 PLAN CONFIGURATION

### Free Plan (Default)
- **Storage:** 1GB
- **Folders:** 5
- **Memories:** 100 photos/videos

### Premium Plan ($4.99/month)
- **Storage:** 50GB  
- **Folders:** 50
- **Memories:** 1,000 photos/videos
- **Features:** Priority support, HD quality

### Family+ Plan ($9.99/month)
- **Storage:** 200GB
- **Folders:** 100
- **Memories:** 5,000 photos/videos  
- **Features:** Family sharing, 24/7 support, 4K quality

---

## 🔧 DEBUG COMMANDS

```bash
# Check Firebase functions logs
firebase functions:log

# Test webhook locally (requires Stripe CLI)
stripe listen --forward-to localhost:5001/project/us-central1/stripeWebhook

# Check Firebase configuration
firebase functions:config:get

# Verify Stripe products
stripe products list

# Verify Stripe prices  
stripe prices list
```

---

## 📱 IMPLEMENTATION PHASES

1. **Setup** (30 min) - Stripe account, products, environment
2. **Dependencies** (5 min) - Install npm packages
3. **Client Code** (60 min) - Utils, services, components
4. **Functions** (30 min) - Backend Stripe integration
5. **Webhooks** (15 min) - Configure Stripe webhooks
6. **Integration** (30 min) - Update ProfileScreen, remove mock code
7. **Testing** (30 min) - End-to-end flow verification

**Total Time:** ~3.5-4 hours

---

## ✅ SUCCESS CRITERIA

- [ ] User can select and purchase subscription plans
- [ ] Payment processing works with test cards
- [ ] Webhooks update user plan in real-time
- [ ] Customer portal allows subscription management
- [ ] All mock/demo billing code removed
- [ ] Admin dashboard shows subscription data
- [ ] Error handling prevents crashes
- [ ] Production build works correctly

---

## 🎯 NEXT STEPS AFTER COMPLETION

1. **Switch to Live Mode** - Update to live Stripe keys
2. **Component Integration** - Full Firebase integration for all features  
3. **Advanced Features** - Usage tracking, plan enforcement
4. **App Store Prep** - Final testing and submission

---

**📞 Support:** Check `STEP_2_IMPLEMENTATION_PLAN.md` for detailed troubleshooting and complete implementation guide.
