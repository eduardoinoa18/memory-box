// Mobile App Configuration (app.config.js)
// Production-ready Expo configuration for Memory Box
const IS_DEV = process.env.NODE_ENV === 'development';
const IS_PREVIEW = process.env.EAS_BUILD_PROFILE === 'preview';

export default {
  expo: {
    name: "Memory Box",
    slug: "memory-box",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#667eea"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.memorybox.app",
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription: "Memory Box needs camera access to capture photos and videos for your memories.",
        NSPhotoLibraryUsageDescription: "Memory Box needs photo library access to select and save your memories.",
        NSMicrophoneUsageDescription: "Memory Box needs microphone access to record audio memories.",
        NSLocationWhenInUseUsageDescription: "Memory Box uses location to add context to your memories.",
        CFBundleDisplayName: "Memory Box"
      },
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#667eea"
      },
      package: "com.memorybox.app",
      versionCode: 1,
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-camera",
      "expo-media-library",
      "expo-location",
      "expo-notifications",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Memory Box to access your photos to add them to your memories.",
          cameraPermission: "Allow Memory Box to access your camera to capture photos for your memories.",
          microphonePermission: "Allow Memory Box to access your microphone to record audio memories."
        }
      ],
      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: IS_PREVIEW ? "Development" : "Production"
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
            proguardMinifyEnabled: !IS_DEV
          },
          ios: {
            deploymentTarget: "13.0"
          }
        }
      ]
    ],
    extra: {
      // Firebase Configuration
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      
      // Stripe Configuration
      stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      
      // Prizeout Configuration
      prizeoutApiKey: process.env.EXPO_PUBLIC_PRIZEOUT_API_KEY,
      prizeoutBaseUrl: process.env.EXPO_PUBLIC_PRIZEOUT_BASE_URL || "https://api.prizeout.com",
      
      // App Configuration
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.memorybox.app",
      environment: IS_DEV ? "development" : IS_PREVIEW ? "preview" : "production",
      enableAnalytics: !IS_DEV,
      enableCrashReporting: !IS_DEV,
      
      // Feature Flags
      enablePrizeout: process.env.EXPO_PUBLIC_ENABLE_PRIZEOUT === "true",
      enableSharing: process.env.EXPO_PUBLIC_ENABLE_SHARING === "true",
      enablePushNotifications: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === "true",
      
      // Admin Configuration
      adminPanelUrl: process.env.EXPO_PUBLIC_ADMIN_PANEL_URL || "https://admin.memorybox.app",
      supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || "support@memorybox.app",
      
      // Storage Limits (in MB)
      maxImageSize: 10,
      maxVideoSize: 100,
      maxAudioSize: 50,
      maxDocumentSize: 5,
      
      // App Store URLs
      appStoreUrl: "https://apps.apple.com/app/memory-box/id123456789",
      playStoreUrl: "https://play.google.com/store/apps/details?id=com.memorybox.app",
      
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID
      }
    },
    owner: "memory-box-team",
    updates: {
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/[project-id]"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    scheme: "memorybox",
    experiments: {
      tsconfigPaths: true,
      typedRoutes: false
    }
  }
};
