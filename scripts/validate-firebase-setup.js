#!/usr/bin/env node

/**
 * Firebase Setup Validation Script
 * This script validates your Firebase configuration and folder structure setup
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup Validation\n');

// Check if .env file exists and has required variables
function validateEnvFile() {
    console.log('1. Checking .env configuration...');

    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found');
        return false;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
        'EXPO_PUBLIC_FIREBASE_API_KEY',
        'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
        'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'EXPO_PUBLIC_FIREBASE_APP_ID'
    ];

    const missingVars = requiredVars.filter(varName =>
        !envContent.includes(varName) || envContent.includes(`${varName}=your_`)
    );

    if (missingVars.length > 0) {
        console.log('❌ Missing or placeholder Firebase environment variables:');
        missingVars.forEach(varName => console.log(`   - ${varName}`));
        console.log('\n📝 Please update your .env file with actual Firebase values from:');
        console.log('   Firebase Console > Project Settings > General > Your apps\n');
        return false;
    }

    console.log('✅ .env file configured correctly\n');
    return true;
}

// Check Firebase configuration file
function validateFirebaseConfig() {
    console.log('2. Checking Firebase configuration...');

    const configPath = path.join(process.cwd(), 'config', 'firebase.js');
    if (!fs.existsSync(configPath)) {
        console.log('❌ Firebase config file not found at config/firebase.js');
        return false;
    }

    const configContent = fs.readFileSync(configPath, 'utf8');
    const requiredExports = ['auth', 'db', 'storage', 'functions'];

    const missingExports = requiredExports.filter(exportName =>
        !configContent.includes(`export const ${exportName}`)
    );

    if (missingExports.length > 0) {
        console.log('❌ Missing Firebase service exports:');
        missingExports.forEach(exportName => console.log(`   - ${exportName}`));
        return false;
    }

    console.log('✅ Firebase configuration file is correct\n');
    return true;
}

// Check Firebase Storage rules
function validateStorageRules() {
    console.log('3. Checking Firebase Storage rules...');

    const rulesPath = path.join(process.cwd(), 'storage.rules');
    if (!fs.existsSync(rulesPath)) {
        console.log('❌ storage.rules file not found');
        return false;
    }

    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    if (!rulesContent.includes('users/{userId}/memories/')) {
        console.log('❌ Storage rules missing user folder structure');
        return false;
    }

    console.log('✅ Firebase Storage rules configured correctly\n');
    return true;
}

// Check Upload component
function validateUploadComponent() {
    console.log('4. Checking Upload component...');

    const uploadPath = path.join(process.cwd(), 'components', 'Upload', 'UploadMemory.jsx');
    if (!fs.existsSync(uploadPath)) {
        console.log('❌ UploadMemory component not found');
        return false;
    }

    const uploadContent = fs.readFileSync(uploadPath, 'utf8');

    const requiredImports = [
        'firebase/storage',
        'firebase/firestore',
        '../config/firebase'
    ];

    const missingImports = requiredImports.filter(importPath =>
        !uploadContent.includes(importPath)
    );

    if (missingImports.length > 0) {
        console.log('❌ Missing imports in UploadMemory component:');
        missingImports.forEach(importPath => console.log(`   - ${importPath}`));
        return false;
    }

    // Check folder structure generation
    if (!uploadContent.includes('users/${userId}/memories/${type}/')) {
        console.log('❌ Upload component missing correct folder structure');
        return false;
    }

    console.log('✅ Upload component configured correctly\n');
    return true;
}

// Check package.json dependencies
function validateDependencies() {
    console.log('5. Checking Firebase dependencies...');

    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
        console.log('❌ package.json not found');
        return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (!dependencies.firebase) {
        console.log('❌ Firebase not installed');
        console.log('   Run: npm install firebase');
        return false;
    }

    console.log(`✅ Firebase ${dependencies.firebase} installed\n`);
    return true;
}

// Main validation function
async function runValidation() {
    const checks = [
        validateDependencies(),
        validateEnvFile(),
        validateFirebaseConfig(),
        validateStorageRules(),
        validateUploadComponent()
    ];

    const allPassed = checks.every(check => check === true);

    console.log('='.repeat(50));
    if (allPassed) {
        console.log('🎉 All Firebase setup checks passed!');
        console.log('\n📁 Your folder structure will be:');
        console.log('   users/{userId}/memories/{type}/{timestamp}.{extension}');
        console.log('\n📱 Supported file types:');
        console.log('   - images/ (jpg, png, gif, etc.)');
        console.log('   - videos/ (mp4, mov, etc.)');
        console.log('   - audio/ (mp3, wav, etc.)');
        console.log('   - documents/ (pdf, doc, etc.)');
        console.log('\n🚀 Next steps:');
        console.log('   1. Update .env with your Firebase project values');
        console.log('   2. Deploy storage.rules to Firebase Console');
        console.log('   3. Test upload functionality');
    } else {
        console.log('❌ Some setup checks failed. Please fix the issues above.');
    }
    console.log('='.repeat(50));
}

// Run the validation
runValidation().catch(console.error);
