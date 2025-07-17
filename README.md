# Memory Box MVP Version 1

🎉 **Production-Ready Memory Storage Platform** - Essential Features Only

## Overview

This is Version 1 of the Memory Box MVP with three interconnected components:

- **Admin Panel** - Essential user and content management
- **Landing Page** - Marketing and user onboarding
- **Main App** - Core memory storage functionality (Web + Mobile Beta)

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment
```bash
cp .env.template .env
# Edit .env with your Firebase configuration
```

### 3. Development
```bash
# Start all services
npm run dev:admin    # Admin panel on http://localhost:3001
npm run dev:landing  # Landing page on http://localhost:3000  
npm run dev:app      # Main app on http://localhost:19006
```

### 4. Production Deployment
```bash
npm run deploy:all
```

## Architecture

### Shared Configuration (`/shared`)
- Firebase configuration
- Shared utilities and types
- Common authentication helpers

### Admin Panel (`/admin`)
- **Tech**: Next.js + Firebase + Tailwind CSS
- **Features**: User management, basic analytics, Firebase auth
- **Deploy**: Vercel (admin-memory-box.vercel.app)

### Landing Page (`/landing`)
- **Tech**: Next.js + Firebase Auth + Tailwind CSS
- **Features**: Marketing content, signup/login flow, newsletter subscription
- **Deploy**: Vercel (memory-box-landing.vercel.app)
- **Integrations**: Firebase Auth (signup), Firestore (newsletter)

### Main App (`/app`)
- **Tech**: Expo + React Native + Firebase
- **Features**: Photo upload, memory viewing, user profiles
- **Deploy**: Web via Vercel, Mobile via EAS Build

## Firebase Setup

1. Create Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Storage
5. Set up security rules:

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && request.auth.token.admin == true;
    }
    match /memories/{memoryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}

// Storage Rules  
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /memories/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## MVP Features

### ✅ Version 1 Includes
- Firebase Authentication
- Photo upload and storage
- Basic memory viewing
- Admin user management
- Responsive landing page
- Cross-platform app (Web + Mobile)

### 🚧 Future Versions
- Advanced search and filtering
- Memory sharing and collaboration
- Premium subscriptions
- Advanced analytics
- Push notifications

## Deployment

Each component deploys independently to Vercel:

```bash
# Deploy admin panel
cd admin && vercel --prod

# Deploy landing page  
cd landing && vercel --prod

# Deploy main app (web)
cd app && npm run deploy:web
```

## Environment Variables

Required for all components:
- `EXPO_PUBLIC_FIREBASE_*` - Firebase config for React Native
- `NEXT_PUBLIC_FIREBASE_*` - Firebase config for Next.js

See `.env.template` for complete list.

## Security

- Firebase Authentication handles user sessions
- Firestore security rules protect user data
- Admin access controlled via Firestore user roles
- All Firebase API keys are public-safe (client-side)

## Support

For issues or questions:
- Check existing Firebase configuration in `/Belapp-1`
- Review component documentation in respective folders
- Firebase Console for backend management

---

**Memory Box MVP v1.0.0** - Built with existing components, optimized for production
