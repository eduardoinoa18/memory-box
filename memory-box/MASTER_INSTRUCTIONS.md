# 🎁 Memory Box - Complete Platform

> **MASTER INSTRUCTION FOR COPILOT**  
> ✅ Build the Memory Box App and Admin Dashboard to look and behave like a family-friendly platform with baby blue + yellow theme, soft modern cards, and personalized experiences for legacy builders.

## 📁 Project Structure

```
memory-box/
├── mobile-app/          # React Native (Expo)
│   ├── App.js
│   ├── assets/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   └── styles/
├── admin-dashboard/     # React + Tailwind CSS (Web)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   └── App.jsx
├── backend/             # Firebase Functions or Node.js API
│   └── functions/
```

## 🎨 Design System

### Color Palette
- **Primary Yellow**: `#FFF9C4` - Light yellow for happiness and warmth
- **Baby Blue**: `#B3E5FC` - Trust and serenity  
- **Dark Navy**: `#1A237E` - Professional text and reliability
- **Soft White**: `#FEFEFE` - Clean backgrounds
- **Golden Yellow**: `#F9A825` - Energy and joy accents

### Typography
- **Font**: Poppins or Roboto, rounded, medium weight
- **Hierarchy**: Clear headings with navy text, secondary in blue-gray

### UI Principles
- Soft, modern cards with rounded corners (`rounded-2xl`)
- Drop shadows (`shadow-md`)
- Light hover transitions
- Emotional, polished, personal feel
- Family-friendly vibe throughout

## 📱 MOBILE APP — React Native + Expo

### Core Features
🧩 Create a family-friendly mobile app using React Native + Expo with:

- **Navigation**: Bottom Tab Navigation with 4 tabs (Home, My Folders, Sharing, Profile)
- **Personalization**: "Welcome back, [UserName]" greetings
- **AI Memory Reminders**: "Remember this?" prompts based on past uploads
- **Multi-format Support**: Photos, videos, documents, voice memos

### Screens to Build
1. **SplashScreen.js** — Lottie animation + logo
2. **HomeScreen.js** — Personalized welcome + AI Memory Reminder section + folders preview
3. **MyFoldersScreen.js** — Card UI with emoji + title + preview photo
4. **FolderViewScreen.js** — Display images/files inside folder
5. **SharingScreen.js** — Share folders, invite via link
6. **ProfileScreen.js** — View plan, upgrade options, theme toggle

### Key Components
- **`<FolderCard />`** — Large rounded cards, pastel backgrounds, emoji/icon + title + photo
- **`<MemoryPrompt />`** — Horizontal card with image + text ("Remember this?")
- **`<BottomTabNavigator />`** — Icons: home, folder, share, profile
- **`<WelcomeHeader />`** — Personalized greeting with user name
- **`<AIMemorySection />`** — Smart memory suggestions

### Required Libraries
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install expo-image-picker expo-font
npm install react-native-paper react-native-elements
npm install lottie-react-native
npm install @expo-google-fonts/poppins
```

## 🖥️ ADMIN DASHBOARD — React + Tailwind

### Layout Structure
- **Left Vertical Nav**: Dark navy background, white icons, Memory Box logo
- **Main Content Panel**: White/light gray background, rounded cards
- **Responsive Design**: Mobile-friendly sidebar collapse

### Pages to Build
1. **Dashboard.jsx** — Metrics, activity graph, latest folders, support tickets
2. **Users.jsx** — Full user list, plan type, last login, search functionality
3. **FoldersUploads.jsx** — Table of folders, file sizes, user associations
4. **Support.jsx** — Support tickets inbox with status management
5. **Notifications.jsx** — Create and send push/email alerts
6. **Analytics.jsx** — Graphs of app activity, folder usage, user engagement

### Key Components
- **`<MetricCard />`** — Display numbers: Users, Folders, Uploads with icons
- **`<LineChart />`** — Activity tracking over time
- **`<FolderTable />`** — Recent folders with user info and actions
- **`<SupportTickets />`** — Support logs with status badges
- **`<SidebarNav />`** — Icon-based navigation with hover effects
- **`<UserSearch />`** — Filter and search users by plan, activity

### Required Libraries
```bash
npm install react react-dom
npm install @tailwindcss/forms @tailwindcss/typography
npm install react-router-dom
npm install @heroicons/react lucide-react
npm install chart.js react-chartjs-2 recharts
npm install firebase
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'yellow-soft': '#FFF9C4',
        'blue-baby': '#B3E5FC',
        'navy-dark': '#1A237E',
        'yellow-gold': '#F9A825',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
}
```

## 🔐 Backend & Firebase Structure

### Authentication & Database
Use Firebase for both app and admin with this structure:

```javascript
// Firestore Collections
users/{uid} {
  name: "Emma Johnson",
  email: "emma@email.com", 
  plan: "premium", // free, premium, family
  folders: 6,
  uploadsLast30: 28,
  lastLogin: timestamp,
  memoryAI: true,
  profileImage: "url"
}

folders/{folderId} {
  name: "Summer Vacation 2025",
  userId: uid,
  type: "photo", // photo, video, document, mixed
  coverImage: "url",
  itemCount: 45,
  createdAt: timestamp,
  sharedWith: [uid1, uid2],
  isPrivate: false
}

uploads/{uploadId} {
  folderId: folderId,
  userId: uid,
  fileName: "beach-sunset.jpg",
  fileSize: 2048576,
  fileType: "image/jpeg",
  uploadedAt: timestamp,
  storageUrl: "gs://bucket/path"
}

support_tickets/{ticketId} {
  userId: uid,
  subject: "Sign in issue",
  description: "Cannot log in with Google",
  status: "open", // open, in-progress, resolved
  priority: "medium", // low, medium, high
  createdAt: timestamp,
  updatedAt: timestamp
}

memory_prompts/{promptId} {
  userId: uid,
  folderId: folderId,
  promptText: "Remember this family dinner?",
  imageUrl: "url",
  createdAt: timestamp,
  dismissed: false
}
```

## 📈 Stripe Integration

### Subscription Plans
```javascript
// Pricing Structure
const plans = {
  free: {
    name: "Free",
    price: 0,
    storage: "1GB",
    folders: 5,
    features: ["Basic sharing", "Mobile app"]
  },
  premium: {
    name: "Premium", 
    price: 4.99,
    storage: "50GB",
    folders: "Unlimited",
    features: ["AI memory prompts", "Advanced sharing", "Priority support"]
  },
  family: {
    name: "Family",
    price: 9.99,
    storage: "200GB", 
    folders: "Unlimited",
    features: ["Multiple accounts", "Family sharing", "Collaboration tools"]
  }
}
```

### Firebase Functions for Stripe
```javascript
// backend/functions/index.js
const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret);

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Create Stripe checkout session
  // Handle plan upgrades/downgrades
  // Update user billing in Firestore
});

exports.handleWebhook = functions.https.onRequest(async (req, res) => {
  // Handle Stripe webhooks
  // Update subscription status
  // Send confirmation emails
});
```

## 🚀 Development Setup

### Mobile App Setup
```bash
cd mobile-app
npx create-expo-app . --template blank
npm install
# Install dependencies listed above
expo start
```

### Admin Dashboard Setup  
```bash
cd admin-dashboard
npx create-react-app . --template typescript
npm install tailwindcss
# Install dependencies listed above
npm start
```

### Firebase Setup
```bash
cd backend
npm install firebase-functions firebase-admin
firebase init functions
firebase deploy --only functions
```

## 🎯 Key User Experiences

### Mobile App Flow
1. **Splash** → Beautiful logo animation with Lottie
2. **Home** → "Welcome back, Emma!" + AI memory prompts + folder preview
3. **Upload** → Camera/gallery → Choose folder → Add to memories
4. **Browse** → Grid view of folders with cover images and emoji
5. **Share** → Generate links, invite family members
6. **Profile** → Plan management, settings, theme toggle

### Admin Dashboard Flow
1. **Login** → Firebase Auth with admin privileges
2. **Dashboard** → Metrics overview with charts and recent activity
3. **Users** → Search, filter, view plans, support history
4. **Content** → Browse all folders, moderate uploads
5. **Support** → Ticket management, user communication
6. **Analytics** → Usage patterns, popular features, growth metrics

## 🎁 Emotional Design Elements

### Family-Friendly Features
- **Personalized greetings**: "Welcome back, [Name]!"
- **Memory prompts**: "Remember this special moment?"
- **Celebration moments**: Confetti for milestones
- **Warm language**: "Cherish", "Treasure", "Precious memories"
- **Family icons**: 👨‍👩‍👧‍👦, 💝, 🏠, ✨

### Trust Building
- **Security badges**: "Encrypted", "Private", "Secure"
- **Professional design**: Clean, polished interfaces
- **Reliable performance**: Fast loading, smooth animations
- **Clear privacy**: Transparent data handling

## ✅ Ready to Build!

This master instruction provides everything needed to create:

1. **📱 Mobile App**: React Native + Expo with yellow/blue theme
2. **🖥️ Admin Dashboard**: React + Tailwind with professional metrics
3. **🔐 Backend**: Firebase + Stripe integration
4. **🎨 Design System**: Complete color palette and components
5. **📊 Database Structure**: User management and content organization

**Next Steps:**
1. Generate starter files for each platform
2. Implement core authentication flow
3. Build key screens and components
4. Integrate Stripe billing
5. Deploy and test

Let's build Memory Box - where every moment becomes a treasured memory! 💝✨
