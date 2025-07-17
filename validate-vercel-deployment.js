#!/usr/bin/env node

/**
 * Vercel Deployment Validation Script
 * Ensures all required files and configurations are ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Memory Box - Vercel Deployment Validation\n');

// Check if we're in the right directory
const currentDir = process.cwd();
console.log(`📁 Current Directory: ${currentDir}`);

// Required files for Vercel deployment
const requiredFiles = [
    'admin-dashboard/package.json',
    'admin-dashboard/next.config.js',
    'admin-dashboard/.env.vercel.example',
    'landing-page/index.html',
    'landing-page/.env.vercel.example',
    'vercel-admin.json',
    'vercel-landing.json',
    'README.md'
];

console.log('\n🔎 Checking Required Files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(currentDir, file));
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
    if (!exists) allFilesExist = false;
});

// Check admin dashboard structure
console.log('\n🖥️ Admin Dashboard Structure:');
const adminDir = path.join(currentDir, 'admin-dashboard');
if (fs.existsSync(adminDir)) {
    const adminFiles = fs.readdirSync(adminDir);
    console.log(`✅ Admin dashboard found with ${adminFiles.length} items`);
    
    // Check for key admin files
    const keyAdminFiles = ['pages', 'components', 'package.json', 'next.config.js'];
    keyAdminFiles.forEach(file => {
        const exists = fs.existsSync(path.join(adminDir, file));
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    });
} else {
    console.log('❌ Admin dashboard directory not found');
    allFilesExist = false;
}

// Check landing page structure
console.log('\n🌐 Landing Page Structure:');
const landingDir = path.join(currentDir, 'landing-page');
if (fs.existsSync(landingDir)) {
    const landingFiles = fs.readdirSync(landingDir);
    console.log(`✅ Landing page found with ${landingFiles.length} items`);
    
    // Check for key landing files
    const keyLandingFiles = ['index.html', 'style.css'];
    keyLandingFiles.forEach(file => {
        const exists = fs.existsSync(path.join(landingDir, file));
        console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    });
} else {
    console.log('❌ Landing page directory not found');
    allFilesExist = false;
}

// Check package.json in admin dashboard
console.log('\n📦 Dependencies Check:');
const adminPackageJson = path.join(adminDir, 'package.json');
if (fs.existsSync(adminPackageJson)) {
    try {
        const packageData = JSON.parse(fs.readFileSync(adminPackageJson, 'utf8'));
        console.log(`✅ Admin package.json valid`);
        console.log(`   📦 Dependencies: ${Object.keys(packageData.dependencies || {}).length}`);
        console.log(`   🔧 Dev Dependencies: ${Object.keys(packageData.devDependencies || {}).length}`);
        
        // Check for essential Next.js dependencies
        const essentialDeps = ['next', 'react', 'react-dom'];
        essentialDeps.forEach(dep => {
            const exists = packageData.dependencies && packageData.dependencies[dep];
            console.log(`   ${exists ? '✅' : '❌'} ${dep}`);
        });
    } catch (error) {
        console.log('❌ Admin package.json is invalid JSON');
        allFilesExist = false;
    }
} else {
    console.log('❌ Admin package.json not found');
    allFilesExist = false;
}

// Check Vercel configuration files
console.log('\n⚙️ Vercel Configuration:');
const vercelConfigs = ['vercel-admin.json', 'vercel-landing.json'];
vercelConfigs.forEach(config => {
    const configPath = path.join(currentDir, config);
    if (fs.existsSync(configPath)) {
        try {
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log(`✅ ${config} - Valid JSON`);
            console.log(`   📝 Version: ${configData.version || 'Not specified'}`);
            console.log(`   🏷️ Name: ${configData.name || 'Not specified'}`);
        } catch (error) {
            console.log(`❌ ${config} - Invalid JSON`);
            allFilesExist = false;
        }
    } else {
        console.log(`❌ ${config} - Not found`);
        allFilesExist = false;
    }
});

// Final validation result
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
    console.log('🎉 VALIDATION PASSED!');
    console.log('✅ Your Memory Box platform is ready for Vercel deployment!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Go to https://vercel.com');
    console.log('2. Import your GitHub repository: eduardoinoa18/memory-box');
    console.log('3. Deploy admin dashboard (root: admin-dashboard)');
    console.log('4. Deploy landing page (root: landing-page)');
    console.log('5. Configure environment variables from .env.vercel.example files');
} else {
    console.log('❌ VALIDATION FAILED!');
    console.log('⚠️ Some required files are missing. Please check the issues above.');
    console.log('\n🔧 To fix issues:');
    console.log('1. Ensure all files are committed to Git');
    console.log('2. Push changes to GitHub');
    console.log('3. Run this validation script again');
}
console.log('='.repeat(50) + '\n');

// Return appropriate exit code
process.exit(allFilesExist ? 0 : 1);
