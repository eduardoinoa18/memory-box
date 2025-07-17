# 📦 Memory Box - Digital Legacy Platform

> *"Memory Box is a family-first, legacy-focused platform that preserves your most important life moments. It's more than cloud storage — it's a vault for human emotion."*

## 🌟 Vision Statement

We are building Memory Box as a platform that will impact millions of people by preserving their most precious memories in a beautiful, secure, and intelligent way. This project includes:

- 📱 **Beautifully animated mobile app** (React Native + Expo)
- 🧑‍💻 **Robust admin web dashboard** (React/Next.js)
- ⚡ **Full backend logic** (Firebase/Supabase)
- 📧 **Marketing integrations** (Email/SMS automation)
- 🔗 **Social sharing** (Multi-platform integration)
- 🧠 **Future-facing AI memory system** (TensorFlow.js + OpenAI)

## 🏗️ Project Structure

```
memory-box/
├── mobile-app/                 # React Native + Expo App
│   ├── App.js                 # Main app entry point
│   ├── assets/                # Images, fonts, animations
│   ├── components/            # Reusable UI components
│   ├── screens/               # App screens/pages
│   ├── services/              # API calls, storage, auth
│   └── utils/                 # Helper functions
│
├── admin-dashboard/            # React/Next.js Admin Portal
│   ├── src/
│   │   ├── components/        # Admin UI components
│   │   ├── pages/             # Admin pages
│   │   ├── services/          # Backend integration
│   │   └── App.jsx           # Admin app entry
│
├── backend/                   # Firebase Functions/Supabase
│   ├── functions/             # Cloud functions
│   └── database/              # Database schemas
│
└── README.md                  # This file
```

## 📱 Mobile App Features

### Core Screens
- 🎬 **SplashScreen.js** - Animation & inspiring quote
- 📖 **Onboarding.js** - 3-slide app introduction
- 🔐 **LoginRegisterScreen.js** - Google/Apple authentication
- 🏠 **HomeScreen.js** - AI reminders + folder overview
- 📁 **MyFoldersScreen.js** - Add/view/delete folders
- 👁️ **FolderViewScreen.js** - Content view + upload modal
- 📤 **UploadModal.js** - Camera/gallery/scan options
- 🔒 **VaultScreen.js** - Biometric-protected private memories
- 👤 **ProfileScreen.js** - Avatar, theme, bio customization
- 🔗 **ShareScreen.js** - QR code & email invitations

### Key Technologies
```javascript
// File upload with compression
expo-image-picker
react-native-image-resizer

// Biometric authentication
expo-local-authentication

// Smooth animations
lottie-react-native

// Local storage
@react-native-async-storage/async-storage

// AI reminders (Phase 1: Rule-based)
date-fns

// Push notifications
expo-notifications
```

## 🧑‍💻 Admin Dashboard Features

### Admin Pages
- 📊 **Dashboard.jsx** - KPIs: users, uploads, activity graphs
- 👥 **Users.jsx** - View, suspend, delete, search users
- 📁 **FoldersUploads.jsx** - Content moderation tools
- 🎧 **Support.jsx** - User tickets & communication
- 📢 **Notifications.jsx** - Push/email campaign manager
- 📈 **Analytics.jsx** - Growth metrics & user behavior
- 📧 **Marketing.jsx** - Email & SMS campaign builder

### Admin Technology Stack
```javascript
// Backend integration
firebase-admin
firebase

// Data visualization
recharts

// Communication
EmailJS || SendGrid  // Email campaigns
Twilio || Vonage     // SMS notifications
```

## 💬 User Communication Strategy

### Automated Messages
1. **Welcome Series** - New user onboarding tour
2. **Memory Reminders** - "Check your photo from 1 year ago"
3. **Sharing Notifications** - SMS when folder is shared
4. **Storage Alerts** - Upgrade nudge near limit
5. **Feature Updates** - Admin-triggered announcements

### Implementation
```javascript
// Firebase Cloud Functions trigger conditions:
- New user signup → Welcome email sequence
- File older than 1 year → Memory reminder
- Folder shared → SMS to recipient
- Storage >80% → Upgrade prompt
- Admin broadcast → Push notification
```

## 📣 Social Media Integration

### Share Features
- 📤 **Multi-platform sharing**: Facebook, Instagram, WhatsApp, X (Twitter)
- 🔗 **Referral code generator** with tracking
- 🎥 **Auto-create memory reels** (animated slideshows)
- 📲 **Web Share API** integration for mobile

## 🔐 Backend Architecture

| Area | Functions |
|------|-----------|
| **Auth** | Create account, manage sessions, assign roles |
| **Storage** | Upload & compress media, organize in user folders |
| **Folder DB** | CRUD operations with permission management |
| **Sharing** | Token-based links with role assignment |
| **Reminders** | AI-triggered memory notifications |
| **Admin** | Action logging, user management, content moderation |

## 🧠 AI & Memory Engine Roadmap

### Phase 1: Rule-Based Intelligence
```javascript
// Simple triggers
if (fileAge > 1_year) → sendReminder()
if (folderInactive > 30_days) → suggestRevisit()
if (uploadPattern === 'anniversary') → createMemoryMix()
```

### Phase 2: AI-Powered Features
```javascript
// Advanced capabilities
TensorFlow.js → autoTagging(['school', 'art', 'beach'])
OpenAI API → generateMemoryNarrative(folderContents)
Image Recognition → detectFaces(), detectEvents(), detectLocations()
```

## 💳 Monetization Strategy & Stripe Integration

### 🔓 Free Plan (Ad-Supported)
- **Storage**: 2GB
- **Folders**: Maximum 3 folders
- **Ads**: AdMob banner ads on Home and Upload screens
- **Rewarded Ads**: 
  - Watch to unlock +500MB storage
  - Temporary Vault access (24h)
- **Ad Removal**: $0.99 one-time payment
- **Features**: Core folder management & sharing

### 💎 Premium Plans

#### ⭐ Premium ($2.99/month)
- **Storage**: 50GB
- **Folders**: Unlimited
- **Features**: No ads, full Vault access, AI reminders, enhanced compression
- **Stripe Price ID**: `price_premium_monthly`

#### 👑 Family ($4.99/month)
- **Users**: 5 linked family members
- **Storage**: 200GB shared
- **Features**: Shared folders with roles, legacy planning, digital inheritance
- **Stripe Price ID**: `price_family_monthly`

#### 🌟 Lifetime ($99 one-time)
- **Features**: All premium features for life
- **Storage**: Unlimited upgrades during lifetime
- **Support**: Digital handoff support
- **Stripe Price ID**: `price_lifetime_payment`

### 🔐 Stripe Integration Architecture

```javascript
// Mobile App Flow
@stripe/stripe-react-native → Stripe Checkout Session
Firebase Functions → Create/Validate Subscriptions
Firestore → Store user billing data
Webhooks → Real-time subscription updates

// Admin Dashboard
Stripe API → View all subscriptions
Firebase Admin → Manage user plans
Analytics → Revenue tracking & insights
```

### 🧠 Rewarded Ads Logic
```javascript
// Using Expo-Ads-AdMob
import { AdMobRewarded } from 'expo-ads-admob';

// Reward types
watchAd('storage') → +500MB temporary storage
watchAd('vault') → 24h Vault access
watchAd('premium_trial') → 7-day Premium trial
```

### 💾 User State Tracking
```javascript
// Firestore: users/{uid}/billing
{
  plan: 'free' | 'premium' | 'family' | 'lifetime',
  status: 'active' | 'trialing' | 'past_due' | 'canceled',
  stripeCustomerId: 'cus_...',
  subscriptionId: 'sub_...',
  currentPeriodEnd: timestamp,
  adsRemoved: boolean,
  rewardedStorageEarned: number, // MB
  vaultUnlockedUntil: timestamp,
  features: {
    storageLimit: number, // GB
    folderLimit: number,
    aiFeatures: boolean,
    vaultAccess: boolean,
    familySharing: boolean
  }
}
```

## 📈 Analytics & Growth Tracking

### Key Metrics
- 📊 **Total uploads** (Firestore count)
- 💾 **Storage usage** (Firebase Storage per user)
- 🔗 **Sharing activity** (Token/share logs)
- 👁️ **Engagement** (Folder view frequency)
- 📈 **Growth** (Monthly signups + DAU/MAU)

## 🚀 Getting Started

### 1. Mobile App Setup
```bash
cd mobile-app
npm install
expo start
```

### 2. Admin Dashboard Setup
```bash
cd admin-dashboard
npm install
npm run dev
```

### 3. Backend Setup
```bash
cd backend
firebase init
firebase deploy --only functions
```

## 🎯 Development Phases

### Phase 1: Foundation (4 weeks)
- ✅ Project structure setup
- ✅ Basic mobile app with navigation
- ✅ Admin dashboard framework
- ✅ Firebase integration

### Phase 2: Core Features (6 weeks)
- 📱 Complete mobile UI/UX
- 🔐 Authentication system
- 📁 Folder CRUD operations
- 📤 File upload & compression

### Phase 3: Advanced Features (8 weeks)
- 🧠 AI memory reminders
- 🔒 Biometric vault access
- 📧 Email/SMS automation
- 📊 Analytics dashboard

### Phase 4: Launch Preparation (4 weeks)
- 🧪 Testing & optimization
- 📱 App store preparation
- 🚀 Marketing campaigns
- 📈 Growth tracking setup

## 🤝 Contributing

This project is built with scalable, maintainable code that's designed for expansion. When contributing:

1. Follow the existing code structure
2. Write comprehensive tests
3. Document new features
4. Consider the impact on millions of users
5. Maintain the family-first, emotional focus

## 📞 Contact & Support

For questions about Memory Box development:
- 📧 Email: support@memorybox.app
- 🐙 GitHub: [memory-box repository]
- 📱 Mobile: [Contact information]

---

*"We're not just building an app – we're creating a digital legacy platform that will preserve human emotion for generations to come."*

**Built with ❤️ for families everywhere**

## 🧠 GitHub Copilot Instructions - Stripe Integration

### Mobile App Implementation (React Native + Expo)

```bash
# Install Stripe dependencies
npx expo install expo-dev-client
npm install @stripe/stripe-react-native
npm install expo-ads-admob
```

**Copilot Prompt for Mobile App:**
```markdown
Build Stripe subscription integration in Memory Box mobile app:

1. **UpgradeScreen.js**: 
   - Show pricing cards for Free, Premium, Family, Lifetime
   - Emotional messaging: "Your memories deserve a safe space — forever"
   - Call Firebase Function to create Stripe checkout session
   - Handle payment success/failure

2. **PaymentService.js**:
   - Initialize Stripe with publishable key
   - Create checkout session via Firebase Function
   - Handle subscription status updates
   - Manage user plan state in AsyncStorage + Firestore

3. **AdService.js**:
   - Integrate AdMob banner ads (Home/Upload screens)
   - Rewarded video ads for storage/vault unlock
   - Track rewarded benefits in user state

4. **SubscriptionContext.js**:
   - Global state for user plan, features, limits
   - Methods: checkPlanLimits(), upgradePrompt(), trackUsage()

5. **BillingScreen.js**:
   - Show current plan, usage, next billing date
   - Manage subscription (cancel, upgrade, payment method)
   - Link to customer portal

Components to create:
- <PricingCard plan={plan} onSelect={handleSelect} />
- <AdBanner visible={showAds} />
- <RewardedAdButton reward="storage" />
- <UpgradePrompt feature="vault" />
- <UsageIndicator current={usage} limit={limit} />
```

### Backend Implementation (Firebase Functions)

**Copilot Prompt for Backend:**
```markdown
Create Firebase Functions for Stripe integration:

1. **createCheckoutSession**: 
   - Validate user authentication
   - Create/retrieve Stripe customer
   - Generate checkout session with correct price_id
   - Return session URL for mobile app

2. **stripeWebhook**:
   - Handle subscription events (created, updated, canceled)
   - Update Firestore user billing data
   - Send confirmation emails via SendGrid
   - Trigger push notifications

3. **manageSubscription**:
   - Cancel/upgrade subscriptions
   - Create customer portal sessions
   - Handle billing issues

4. **validateEntitlements**:
   - Check user plan vs feature access
   - Return allowed features and limits
   - Handle grace periods for failed payments

Webhook events to handle:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

### Admin Dashboard Implementation

**Copilot Prompt for Admin Dashboard:**
```markdown
Build Stripe subscription management in admin dashboard:

1. **SubscriptionManager.jsx**:
   - Table view of all subscribers
   - Search/filter by plan, status, email
   - Show billing details, next payment, LTV
   - Quick actions: cancel, refund, upgrade

2. **RevenueAnalytics.jsx**:
   - MRR (Monthly Recurring Revenue) charts
   - Churn rate and retention metrics  
   - Plan distribution pie chart
   - Revenue forecasting

3. **BillingSupport.jsx**:
   - Handle billing disputes
   - Process refunds
   - View payment history
   - Customer communication tools

4. **StripeService.js**:
   - Stripe API integration
   - Subscription CRUD operations
   - Webhook validation
   - Customer portal generation

Features to include:
- Real-time subscription status updates
- Automated churn prevention emails
- Revenue dashboard with key metrics
- Customer lifecycle management
```

### Database Schema (Firestore)

```javascript
// users/{uid}
{
  // ... existing user data
  billing: {
    plan: 'free' | 'premium' | 'family' | 'lifetime',
    status: 'active' | 'trialing' | 'past_due' | 'canceled',
    stripeCustomerId: 'cus_...',
    subscriptionId: 'sub_...',
    priceId: 'price_...',
    currentPeriodStart: timestamp,
    currentPeriodEnd: timestamp,
    cancelAtPeriodEnd: boolean,
    lastPaymentStatus: 'succeeded' | 'failed',
    paymentMethod: {
      brand: 'visa',
      last4: '4242'
    },
    features: {
      storageLimit: 50, // GB
      folderLimit: -1, // unlimited
      aiFeatures: true,
      vaultAccess: true,
      familySharing: false,
      adsRemoved: true
    },
    usage: {
      storage: 12.5, // GB used
      folders: 23,
      uploads: 1247
    },
    rewards: {
      storageEarned: 2000, // MB from ads
      vaultUnlockedUntil: timestamp,
      premiumTrialUsed: false
    }
  }
}

// subscriptions/{subscriptionId} - for admin analytics
{
  userId: 'uid',
  customerId: 'cus_...',
  status: 'active',
  plan: 'premium',
  amount: 299, // cents
  currency: 'usd',
  interval: 'month',
  createdAt: timestamp,
  currentPeriodStart: timestamp,
  currentPeriodEnd: timestamp,
  canceledAt: null,
  trialStart: null,
  trialEnd: null
}
```

### Stripe Dashboard Setup

```javascript
// Products to create in Stripe Dashboard
{
  name: "Memory Box Premium",
  prices: [
    { amount: 299, currency: 'usd', interval: 'month', nickname: 'premium' }
  ]
},
{
  name: "Memory Box Family",
  prices: [
    { amount: 499, currency: 'usd', interval: 'month', nickname: 'family' }
  ]
},
{
  name: "Memory Box Lifetime",
  prices: [
    { amount: 9900, currency: 'usd', nickname: 'lifetime' }
  ]
}
```

### Key Integration Points

**Mobile App Upgrade Flow:**
1. User hits storage/folder limit → Show upgrade prompt
2. User selects plan → Create Stripe checkout session
3. Complete payment → Update Firestore billing data
4. Refresh app state → Unlock premium features

**Admin Revenue Management:**
1. Real-time subscription dashboard
2. Churn analysis and prevention
3. Customer support billing tools
4. Revenue forecasting and reporting

**Marketing Automation:**
1. Trial expiration reminders
2. Payment failure recovery emails
3. Upgrade suggestions based on usage
4. Referral program integration
