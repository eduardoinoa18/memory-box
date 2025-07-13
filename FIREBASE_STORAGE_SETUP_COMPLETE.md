# 🔥 Firebase Storage Folder Structure Setup Guide

## Overview
Your Memory Box app uses a hierarchical folder structure in Firebase Storage to organize user uploads efficiently and securely.

## Folder Structure Pattern
```
users/{userId}/memories/{type}/{timestamp}.{extension}
```

### Examples:
- `users/abc123/memories/image/1701234567890.jpg`
- `users/abc123/memories/video/1701234567891.mp4`
- `users/def456/memories/audio/1701234567892.mp3`
- `users/def456/memories/document/1701234567893.pdf`

## File Types
- **image**: jpg, jpeg, png, gif, webp
- **video**: mp4, mov, avi, mkv
- **audio**: mp3, wav, aac, m4a
- **document**: pdf, doc, docx, txt
- **file**: any other file type

## Quick Setup Checklist

### 1. Firebase Configuration ✅
Your Firebase config is already set up in `config/firebase.js`:
- ✅ Storage service exported
- ✅ Firestore service exported
- ✅ Authentication service exported

### 2. Environment Variables 🔧
Update your `.env` file with your Firebase project values:
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Get these values from:**
Firebase Console → Project Settings → General → Your apps

### 3. Firebase Storage Rules ✅
Deploy your `storage.rules` file to Firebase:
```bash
firebase deploy --only storage
```

### 4. Upload Component ✅
Your `UploadMemory.jsx` component is ready with:
- ✅ Correct folder structure generation
- ✅ File type detection
- ✅ Progress tracking
- ✅ Metadata storage in Firestore

## How It Works

### 1. File Upload Process
```javascript
// Generate storage path
const storagePath = `users/${userId}/memories/${type}/${timestamp}.${extension}`;

// Upload to Firebase Storage
const storageRef = ref(storage, storagePath);
const uploadTask = uploadBytesResumable(storageRef, blob);

// Get download URL
const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
```

### 2. Metadata Storage
Each file gets metadata stored in two Firestore collections:
- **User collection**: `users/{userId}/memories/{memoryId}`
- **Global collection**: `memories/{memoryId}` (for admin dashboard)

### 3. Security Rules
- Users can only access their own folders
- Admins can read all files for moderation
- All other access is denied

## Testing Your Setup

### Run Validation Script
```bash
cd scripts
node validate-firebase-setup.js
```

### Run Storage Test
```bash
cd scripts
node test-firebase-storage.js
```

## Common Issues & Solutions

### 1. "Storage not configured" Error
**Solution:** Check your `.env` file has correct Firebase values

### 2. "Permission denied" Error
**Solution:** Deploy your `storage.rules` file to Firebase Console

### 3. "Authentication required" Error
**Solution:** Ensure user is signed in before upload

### 4. Upload progress not showing
**Solution:** Check `uploadBytesResumable` is used instead of `uploadBytes`

## Folder Structure Benefits

### 🔒 Security
- Each user's files are isolated
- Admin access for moderation
- Clear permission boundaries

### 📊 Organization
- Files organized by type
- Easy to browse and search
- Timestamps prevent name conflicts

### ⚡ Performance
- Efficient querying by user and type
- Parallel uploads supported
- Progress tracking built-in

### 🛠 Maintenance
- Easy backup and migration
- Clear audit trails
- Scalable structure

## Next Steps

1. **Update .env file** with your Firebase project values
2. **Deploy storage rules** to Firebase Console
3. **Test upload functionality** using the scripts provided
4. **Monitor uploads** in Firebase Console → Storage

## Files Modified/Created

- ✅ `config/firebase.js` - Firebase configuration
- ✅ `components/Upload/UploadMemory.jsx` - Upload component
- ✅ `storage.rules` - Firebase Storage security rules
- ✅ `.env` - Environment variables template
- 🆕 `scripts/validate-firebase-setup.js` - Setup validation
- 🆕 `scripts/test-firebase-storage.js` - Storage testing

Your Firebase Storage folder structure is production-ready! 🚀
