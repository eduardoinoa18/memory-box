#!/usr/bin/env node
/**
 * Production Readiness Verification Script
 * Checks for any remaining demo/placeholder code and security issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 PRODUCTION READINESS VERIFICATION\n');

// Files to check for demo/placeholder content
const criticalFiles = [
  'config/firebase.js',
  'firebase.config.js',
  '.env.production',
  'admin-dashboard/pages/login.js',
  'memory-box/mobile-app/services/firebaseService.js',
  'memory-box/mobile-app/services/paymentService.js'
];

// Patterns that should NOT exist in production
const forbiddenPatterns = [
  /demo-api-key/gi,
  /your_.*_here/gi,
  /admin123/gi,
  /pk_test_your_/gi,
  /sk_test_your_/gi,
  /123456789/gi,
  /memory-box-demo/gi
];

let issuesFound = 0;

console.log('📋 Checking critical files for production readiness...\n');

criticalFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath} - exists`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    forbiddenPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`❌ ${filePath} - contains demo/placeholder content: ${matches[0]}`);
        issuesFound++;
      }
    });
  } else {
    console.log(`⚠️  ${filePath} - not found (may be optional)`);
  }
});

console.log('\n📋 Checking environment configuration...\n');

// Check if .env.local exists
if (fs.existsSync('.env.local')) {
  console.log('✅ .env.local - exists');
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const requiredVars = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      console.log(`✅ ${varName} - configured`);
    } else {
      console.log(`❌ ${varName} - missing from .env.local`);
      issuesFound++;
    }
  });
} else {
  console.log('❌ .env.local - missing (required for production)');
  issuesFound++;
}

console.log('\n📋 Checking package security...\n');

// Check package.json for security
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Package name: ${packageJson.name}`);
  console.log(`✅ Package version: ${packageJson.version}`);
  
  // Check for any test dependencies in production
  const prodDeps = packageJson.dependencies || {};
  const testDepsInProd = Object.keys(prodDeps).filter(dep => 
    dep.includes('test') || dep.includes('mock') || dep.includes('fake')
  );
  
  if (testDepsInProd.length > 0) {
    console.log(`⚠️  Test dependencies in production: ${testDepsInProd.join(', ')}`);
  }
  
} catch (error) {
  console.log('❌ Failed to read package.json');
  issuesFound++;
}

// Final report
console.log('\n='.repeat(60));
console.log('🎯 PRODUCTION READINESS REPORT');
console.log('='.repeat(60));

if (issuesFound === 0) {
  console.log('🎉 ✅ PRODUCTION READY!');
  console.log('✅ No demo/placeholder code found');
  console.log('✅ Environment properly configured');
  console.log('✅ Security checks passed');
  console.log('\n🚀 Ready for deployment!');
} else {
  console.log(`❌ ${issuesFound} issues found`);
  console.log('⚠️  Please resolve the issues above before production deployment');
  console.log('\n📋 Next steps:');
  console.log('1. Create .env.local with production Firebase configuration');
  console.log('2. Remove any remaining demo/placeholder values');
  console.log('3. Run this script again to verify');
}

console.log('\n📞 Need help? Check PRODUCTION_CLEANUP_COMPLETE.md for guidance');

process.exit(issuesFound > 0 ? 1 : 0);
