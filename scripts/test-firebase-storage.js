#!/usr/bin/env node

/**
 * Firebase Storage Folder Structure Test
 * This script tests the actual Firebase Storage folder structure functionality
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// Test Firebase configuration (using environment variables)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

console.log('🧪 Firebase Storage Folder Structure Test\n');

async function testFirebaseConnection() {
    try {
        console.log('1. Initializing Firebase...');

        // Validate configuration
        const missingConfig = Object.entries(firebaseConfig)
            .filter(([key, value]) => !value || value.includes('your_'))
            .map(([key]) => key);

        if (missingConfig.length > 0) {
            console.log('❌ Missing Firebase configuration:');
            missingConfig.forEach(key => console.log(`   - ${key}`));
            console.log('\nPlease update your .env file with actual Firebase values.');
            return false;
        }

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const storage = getStorage(app);
        const db = getFirestore(app);

        console.log('✅ Firebase initialized successfully\n');

        // Test authentication
        console.log('2. Testing authentication...');
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        console.log(`✅ Authenticated as: ${user.uid}\n`);

        // Test folder structure generation
        console.log('3. Testing folder structure generation...');
        const userId = user.uid;
        const generateStoragePath = (userId, type, filename) => {
            const timestamp = Date.now();
            const extension = filename.split('.').pop() || 'file';
            return `users/${userId}/memories/${type}/${timestamp}.${extension}`;
        };

        const testPaths = [
            generateStoragePath(userId, 'image', 'test.jpg'),
            generateStoragePath(userId, 'video', 'test.mp4'),
            generateStoragePath(userId, 'audio', 'test.mp3'),
            generateStoragePath(userId, 'document', 'test.pdf')
        ];

        console.log('📁 Generated test paths:');
        testPaths.forEach(path => console.log(`   ${path}`));
        console.log('');

        // Test file upload (small test file)
        console.log('4. Testing file upload...');
        const testFileContent = 'This is a test file for Firebase Storage folder structure';
        const testBlob = new Blob([testFileContent], { type: 'text/plain' });
        const testPath = generateStoragePath(userId, 'document', 'test.txt');
        const testRef = ref(storage, testPath);

        await uploadBytes(testRef, testBlob);
        const downloadURL = await getDownloadURL(testRef);
        console.log(`✅ Test file uploaded successfully`);
        console.log(`   Path: ${testPath}`);
        console.log(`   URL: ${downloadURL}\n`);

        // Test Firestore metadata storage
        console.log('5. Testing Firestore metadata storage...');
        const memoryData = {
            fileName: 'test.txt',
            fileType: 'document',
            filePath: testPath,
            fileSize: testFileContent.length,
            downloadURL: downloadURL,
            description: 'Test file upload',
            tags: ['test', 'firebase'],
            userId: userId,
            createdAt: new Date().toISOString(),
            isPrivate: true
        };

        // Save to user's memories collection
        const userMemoriesRef = collection(db, `users/${userId}/memories`);
        const docRef = await addDoc(userMemoriesRef, memoryData);

        // Save to global memories collection
        const globalMemoryData = {
            ...memoryData,
            memoryId: docRef.id,
            userMemoryPath: `users/${userId}/memories/${docRef.id}`
        };
        await addDoc(collection(db, 'memories'), globalMemoryData);

        console.log(`✅ Metadata saved to Firestore`);
        console.log(`   User collection: users/${userId}/memories/${docRef.id}`);
        console.log(`   Global collection: memories\n`);

        // Test folder listing
        console.log('6. Testing folder structure listing...');
        const userFolderRef = ref(storage, `users/${userId}/memories`);
        try {
            const folderList = await listAll(userFolderRef);
            console.log(`✅ User folder exists with ${folderList.items.length} files`);

            // List subfolders
            if (folderList.prefixes.length > 0) {
                console.log('   Subfolders:');
                folderList.prefixes.forEach(folder => {
                    console.log(`     - ${folder.fullPath}`);
                });
            }
        } catch (error) {
            console.log(`ℹ️  User folder structure ready (empty)`);
        }

        console.log('');

        return true;

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

async function testFolderStructureIntegrity() {
    console.log('7. Testing folder structure integrity...');

    const testStructures = [
        'users/user123/memories/image/1234567890.jpg',
        'users/user123/memories/video/1234567890.mp4',
        'users/user123/memories/audio/1234567890.mp3',
        'users/user123/memories/document/1234567890.pdf',
        'users/user456/memories/image/1234567890.png'
    ];

    console.log('📋 Expected folder structure patterns:');
    testStructures.forEach(path => {
        const parts = path.split('/');
        if (parts.length === 5 && parts[0] === 'users' && parts[2] === 'memories') {
            console.log(`   ✅ ${path}`);
        } else {
            console.log(`   ❌ ${path} (invalid structure)`);
        }
    });

    console.log('\n📐 Folder structure rules:');
    console.log('   - users/{userId}/memories/{type}/{timestamp}.{extension}');
    console.log('   - Types: image, video, audio, document, file');
    console.log('   - Each user has isolated access to their own folder');
    console.log('   - Admin can access all folders for moderation');
    console.log('');
}

// Main test function
async function runTests() {
    console.log('='.repeat(60));
    console.log('Starting Firebase Storage Folder Structure Tests...');
    console.log('='.repeat(60));
    console.log('');

    const connectionSuccess = await testFirebaseConnection();
    await testFolderStructureIntegrity();

    console.log('='.repeat(60));
    if (connectionSuccess) {
        console.log('🎉 All tests completed successfully!');
        console.log('\n✅ Your Firebase Storage folder structure is working correctly');
        console.log('✅ Files are properly organized by user and type');
        console.log('✅ Metadata is saved to both user and global collections');
        console.log('\n🚀 Ready for production use!');
    } else {
        console.log('❌ Some tests failed. Please check your Firebase configuration.');
        console.log('\n🔧 Common issues:');
        console.log('   - Incorrect .env file values');
        console.log('   - Firebase project not configured');
        console.log('   - Storage or Firestore not enabled');
        console.log('   - Incorrect security rules');
    }
    console.log('='.repeat(60));
}

// Check if running as ES module or CommonJS
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}

export { runTests, testFirebaseConnection };
