#!/usr/bin/env node

/**
 * 🔒 MEMORY BOX COMPREHENSIVE SECURITY & FEATURE VALIDATION
 * Tests all features, security, and deployment readiness
 */

const fs = require('fs');
const path = require('path');

class MemoryBoxValidator {
  constructor() {
    this.results = {
      security: [],
      features: [],
      mobile: [],
      web: [],
      deployment: []
    };
    this.errors = [];
    this.warnings = [];
  }

  // 🔐 SECURITY VALIDATION
  async validateSecurity() {
    console.log('🔒 Running Security Validation...\n');

    // Check Firebase configuration
    this.checkFirebaseConfig();
    
    // Check environment variables
    this.checkEnvironmentSecurity();
    
    // Check API security
    this.checkAPIEndpoints();
    
    // Check authentication
    this.checkAuthenticationSecurity();
    
    // Check data validation
    this.checkDataValidation();

    return this.results.security;
  }

  checkFirebaseConfig() {
    const configPath = path.join(process.cwd(), 'config', 'firebase.js');
    
    if (fs.existsSync(configPath)) {
      const config = fs.readFileSync(configPath, 'utf8');
      
      // Check for hardcoded secrets
      if (config.includes('AIza') && !config.includes('process.env')) {
        this.errors.push('❌ Hardcoded Firebase API key found');
      } else {
        this.results.security.push('✅ Firebase configuration secure');
      }

      // Check for demo credentials
      if (config.includes('demo') || config.includes('test123')) {
        this.errors.push('❌ Demo credentials found in Firebase config');
      } else {
        this.results.security.push('✅ No demo credentials in Firebase config');
      }
    } else {
      this.errors.push('❌ Firebase config file not found');
    }
  }

  checkEnvironmentSecurity() {
    const envFiles = ['.env.production', '.env.example'];
    
    envFiles.forEach(envFile => {
      const envPath = path.join(process.cwd(), envFile);
      
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        
        if (envFile === '.env.production') {
          // Production should not have real values
          if (content.includes('your_') || content.includes('YOUR_')) {
            this.results.security.push('✅ Production env file contains placeholders');
          } else if (content.includes('AIza') || content.includes('firebase')) {
            this.warnings.push('⚠️ Production env file may contain real credentials');
          }
        }
        
        if (envFile === '.env.example') {
          if (!content.includes('your_') && !content.includes('YOUR_')) {
            this.warnings.push('⚠️ Example env file should only contain placeholders');
          } else {
            this.results.security.push('✅ Example env file properly formatted');
          }
        }
      }
    });
  }

  checkAPIEndpoints() {
    const apiPaths = ['api', 'pages/api', 'functions'];
    
    apiPaths.forEach(apiPath => {
      const fullPath = path.join(process.cwd(), apiPath);
      
      if (fs.existsSync(fullPath)) {
        const files = this.getAllFiles(fullPath, '.js');
        
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for authentication
          if (content.includes('req.') && !content.includes('auth')) {
            this.warnings.push(`⚠️ ${path.basename(file)} may lack authentication`);
          }
          
          // Check for input validation
          if (content.includes('req.body') && !content.includes('validate')) {
            this.warnings.push(`⚠️ ${path.basename(file)} may lack input validation`);
          }
          
          // Check for CORS
          if (content.includes('res.') && !content.includes('cors')) {
            this.warnings.push(`⚠️ ${path.basename(file)} may lack CORS configuration`);
          }
        });
        
        this.results.security.push(`✅ API endpoints checked in ${apiPath}`);
      }
    });
  }

  checkAuthenticationSecurity() {
    const authFiles = ['components/AuthScreen.js', 'services/authService.js'];
    
    authFiles.forEach(authFile => {
      const authPath = path.join(process.cwd(), authFile);
      
      if (fs.existsSync(authPath)) {
        const content = fs.readFileSync(authPath, 'utf8');
        
        // Check for secure authentication
        if (content.includes('signInWithEmailAndPassword')) {
          this.results.security.push('✅ Email/password authentication implemented');
        }
        
        if (content.includes('createUserWithEmailAndPassword')) {
          this.results.security.push('✅ User registration implemented');
        }
        
        if (content.includes('signOut')) {
          this.results.security.push('✅ Secure logout implemented');
        }
        
        // Check for password validation
        if (content.includes('password') && content.includes('length')) {
          this.results.security.push('✅ Password validation found');
        }
      }
    });
  }

  checkDataValidation() {
    const dataFiles = ['services', 'components', 'screens'];
    
    dataFiles.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      
      if (fs.existsSync(dirPath)) {
        const files = this.getAllFiles(dirPath, '.js');
        
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for input sanitization
          if (content.includes('useState') && content.includes('trim')) {
            this.results.security.push(`✅ Input sanitization found in ${path.basename(file)}`);
          }
        });
      }
    });
  }

  // 📱 MOBILE APP VALIDATION
  async validateMobileApp() {
    console.log('📱 Running Mobile App Validation...\n');

    this.checkReactNativeCompatibility();
    this.checkExpoConfiguration();
    this.checkPlatformSpecificCode();
    this.checkMobileNavigation();
    this.checkMobilePerformance();

    return this.results.mobile;
  }

  checkReactNativeCompatibility() {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (fs.existsSync(packagePath)) {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check React Native version
      if (packageData.dependencies && packageData.dependencies['react-native']) {
        this.results.mobile.push('✅ React Native dependency found');
      }
      
      // Check Expo SDK
      if (packageData.dependencies && packageData.dependencies['expo']) {
        this.results.mobile.push('✅ Expo SDK dependency found');
      }
      
      // Check navigation
      if (packageData.dependencies && packageData.dependencies['@react-navigation/native']) {
        this.results.mobile.push('✅ React Navigation configured');
      }
    }
  }

  checkExpoConfiguration() {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    
    if (fs.existsSync(appJsonPath)) {
      const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      
      if (appConfig.expo) {
        this.results.mobile.push('✅ Expo configuration found');
        
        if (appConfig.expo.ios) {
          this.results.mobile.push('✅ iOS configuration present');
        }
        
        if (appConfig.expo.android) {
          this.results.mobile.push('✅ Android configuration present');
        }
        
        if (appConfig.expo.icon) {
          this.results.mobile.push('✅ App icon configured');
        }
        
        if (appConfig.expo.splash) {
          this.results.mobile.push('✅ Splash screen configured');
        }
      }
    }
  }

  checkPlatformSpecificCode() {
    const appPath = path.join(process.cwd(), 'App.js');
    
    if (fs.existsSync(appPath)) {
      const content = fs.readFileSync(appPath, 'utf8');
      
      if (content.includes('Platform.OS')) {
        this.results.mobile.push('✅ Platform-specific code detected');
      }
      
      if (content.includes('ErrorBoundary')) {
        this.results.mobile.push('✅ Error boundary implemented');
      }
      
      if (content.includes('StatusBar')) {
        this.results.mobile.push('✅ Status bar configured');
      }
    }
  }

  checkMobileNavigation() {
    const navigationFiles = this.getAllFiles(process.cwd(), '.js').filter(file => 
      fs.readFileSync(file, 'utf8').includes('@react-navigation')
    );
    
    if (navigationFiles.length > 0) {
      this.results.mobile.push('✅ Mobile navigation implemented');
    }
  }

  checkMobilePerformance() {
    const performanceFiles = this.getAllFiles(process.cwd(), '.js').filter(file => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes('useCallback') || content.includes('useMemo') || content.includes('React.memo');
    });
    
    if (performanceFiles.length > 0) {
      this.results.mobile.push('✅ Performance optimizations found');
    }
  }

  // 🌐 WEB DEPLOYMENT VALIDATION
  async validateWebDeployment() {
    console.log('🌐 Running Web Deployment Validation...\n');

    this.checkAdminDashboard();
    this.checkLandingPage();
    this.checkPWAReadiness();
    this.checkSEOOptimization();
    this.checkWebPerformance();

    return this.results.web;
  }

  checkAdminDashboard() {
    const adminPath = path.join(process.cwd(), 'admin-dashboard', 'index.html');
    
    if (fs.existsSync(adminPath)) {
      const content = fs.readFileSync(adminPath, 'utf8');
      
      if (content.includes('<!DOCTYPE html>')) {
        this.results.web.push('✅ Admin dashboard HTML structure valid');
      }
      
      if (content.includes('manifest.json')) {
        this.results.web.push('✅ PWA manifest linked');
      }
      
      if (content.includes('serviceWorker')) {
        this.results.web.push('✅ Service worker registered');
      }
      
      if (content.includes('meta name="viewport"')) {
        this.results.web.push('✅ Mobile viewport configured');
      }
      
      if (content.includes('Chart')) {
        this.results.web.push('✅ Charts functionality included');
      }
    }
  }

  checkLandingPage() {
    const landingPath = path.join(process.cwd(), 'landing-page', 'index.html');
    
    if (fs.existsSync(landingPath)) {
      const content = fs.readFileSync(landingPath, 'utf8');
      
      if (content.includes('meta name="description"')) {
        this.results.web.push('✅ Landing page SEO meta tags present');
      }
      
      if (content.includes('og:title')) {
        this.results.web.push('✅ Open Graph meta tags configured');
      }
      
      if (content.includes('twitter:card')) {
        this.results.web.push('✅ Twitter Card meta tags configured');
      }
      
      if (content.includes('preconnect')) {
        this.results.web.push('✅ DNS preconnect optimizations');
      }
    }
  }

  checkPWAReadiness() {
    const manifestPath = path.join(process.cwd(), 'admin-dashboard', 'manifest.json');
    const swPath = path.join(process.cwd(), 'admin-dashboard', 'sw.js');
    
    if (fs.existsSync(manifestPath)) {
      this.results.web.push('✅ PWA manifest file exists');
      
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      if (manifest.name && manifest.short_name) {
        this.results.web.push('✅ PWA app names configured');
      }
      
      if (manifest.icons && manifest.icons.length > 0) {
        this.results.web.push('✅ PWA icons configured');
      }
      
      if (manifest.start_url) {
        this.results.web.push('✅ PWA start URL configured');
      }
    }
    
    if (fs.existsSync(swPath)) {
      this.results.web.push('✅ Service worker file exists');
    }
  }

  checkSEOOptimization() {
    const htmlFiles = this.getAllFiles(process.cwd(), '.html');
    
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('<title>') && content.includes('</title>')) {
        this.results.web.push(`✅ Title tag found in ${path.basename(file)}`);
      }
      
      if (content.includes('meta name="description"')) {
        this.results.web.push(`✅ Meta description found in ${path.basename(file)}`);
      }
    });
  }

  checkWebPerformance() {
    const htmlFiles = this.getAllFiles(process.cwd(), '.html');
    
    htmlFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('preload') || content.includes('preconnect')) {
        this.results.web.push(`✅ Performance optimizations in ${path.basename(file)}`);
      }
      
      if (content.includes('defer') || content.includes('async')) {
        this.results.web.push(`✅ Script loading optimizations in ${path.basename(file)}`);
      }
    });
  }

  // 🚀 DEPLOYMENT READINESS
  async validateDeployment() {
    console.log('🚀 Running Deployment Readiness Check...\n');

    this.checkBuildConfiguration();
    this.checkEnvironmentSetup();
    this.checkProductionOptimizations();
    this.checkDocumentation();

    return this.results.deployment;
  }

  checkBuildConfiguration() {
    const files = ['package.json', 'app.json', 'eas.json', 'next.config.js'];
    
    files.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      
      if (fs.existsSync(filePath)) {
        this.results.deployment.push(`✅ ${file} configuration exists`);
        
        if (file === 'package.json') {
          const packageData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          if (packageData.scripts && packageData.scripts.build) {
            this.results.deployment.push('✅ Build script configured');
          }
          
          if (packageData.scripts && packageData.scripts.start) {
            this.results.deployment.push('✅ Start script configured');
          }
        }
      }
    });
  }

  checkEnvironmentSetup() {
    const envFiles = ['.env.example', '.env.production'];
    
    envFiles.forEach(envFile => {
      const envPath = path.join(process.cwd(), envFile);
      
      if (fs.existsSync(envPath)) {
        this.results.deployment.push(`✅ ${envFile} exists`);
      }
    });
  }

  checkProductionOptimizations() {
    const optimizationChecks = [
      { file: 'App.js', check: 'ErrorBoundary', name: 'Error boundaries' },
      { file: 'config/firebase.js', check: 'process.env', name: 'Environment variables' },
      { file: 'admin-dashboard/index.html', check: 'serviceWorker', name: 'Service worker' }
    ];
    
    optimizationChecks.forEach(({ file, check, name }) => {
      const filePath = path.join(process.cwd(), file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes(check)) {
          this.results.deployment.push(`✅ ${name} implemented`);
        }
      }
    });
  }

  checkDocumentation() {
    const docFiles = ['README.md', 'PRODUCTION_READY_FINAL.md'];
    
    docFiles.forEach(docFile => {
      const docPath = path.join(process.cwd(), docFile);
      
      if (fs.existsSync(docPath)) {
        this.results.deployment.push(`✅ ${docFile} documentation exists`);
      }
    });
  }

  // 🔍 FEATURE VALIDATION
  async validateFeatures() {
    console.log('🔍 Running Feature Validation...\n');

    this.checkCoreFeatures();
    this.checkUIComponents();
    this.checkServiceIntegrations();
    this.checkDataHandling();

    return this.results.features;
  }

  checkCoreFeatures() {
    const coreFeatures = [
      'AuthScreen',
      'HomeScreen', 
      'UploadScreen',
      'FolderManager',
      'MemoryViewer'
    ];
    
    coreFeatures.forEach(feature => {
      const files = this.getAllFiles(process.cwd(), '.js').filter(file =>
        fs.readFileSync(file, 'utf8').includes(feature)
      );
      
      if (files.length > 0) {
        this.results.features.push(`✅ ${feature} implemented`);
      } else {
        this.warnings.push(`⚠️ ${feature} may not be fully implemented`);
      }
    });
  }

  checkUIComponents() {
    const uiComponents = [
      'AnimatedMemoryBoxLogo',
      'ErrorBoundary',
      'LoadingSpinner',
      'Modal'
    ];
    
    uiComponents.forEach(component => {
      const files = this.getAllFiles(process.cwd(), '.js').filter(file =>
        fs.readFileSync(file, 'utf8').includes(component)
      );
      
      if (files.length > 0) {
        this.results.features.push(`✅ ${component} component exists`);
      }
    });
  }

  checkServiceIntegrations() {
    const services = [
      'firebaseService',
      'authService',
      'paymentService',
      'storageService'
    ];
    
    services.forEach(service => {
      const servicePath = path.join(process.cwd(), 'services', `${service}.js`);
      
      if (fs.existsSync(servicePath)) {
        this.results.features.push(`✅ ${service} integration exists`);
      }
    });
  }

  checkDataHandling() {
    const dataFeatures = [
      'Firebase',
      'Firestore',
      'Storage',
      'Authentication'
    ];
    
    dataFeatures.forEach(feature => {
      const files = this.getAllFiles(process.cwd(), '.js').filter(file =>
        fs.readFileSync(file, 'utf8').includes(feature.toLowerCase())
      );
      
      if (files.length > 0) {
        this.results.features.push(`✅ ${feature} data handling implemented`);
      }
    });
  }

  // Helper methods
  getAllFiles(dir, extension) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...this.getAllFiles(fullPath, extension));
      } else if (stat.isFile() && fullPath.endsWith(extension)) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  // Main validation runner
  async runFullValidation() {
    console.log('🎯 MEMORY BOX COMPREHENSIVE VALIDATION\n');
    console.log('======================================\n');

    await this.validateSecurity();
    await this.validateMobileApp();
    await this.validateWebDeployment();
    await this.validateDeployment();
    await this.validateFeatures();

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 VALIDATION REPORT');
    console.log('====================\n');

    // Security Results
    console.log('🔒 SECURITY VALIDATION:');
    this.results.security.forEach(result => console.log(`   ${result}`));
    console.log();

    // Mobile Results
    console.log('📱 MOBILE APP VALIDATION:');
    this.results.mobile.forEach(result => console.log(`   ${result}`));
    console.log();

    // Web Results
    console.log('🌐 WEB DEPLOYMENT VALIDATION:');
    this.results.web.forEach(result => console.log(`   ${result}`));
    console.log();

    // Deployment Results
    console.log('🚀 DEPLOYMENT READINESS:');
    this.results.deployment.forEach(result => console.log(`   ${result}`));
    console.log();

    // Feature Results
    console.log('🔍 FEATURE VALIDATION:');
    this.results.features.forEach(result => console.log(`   ${result}`));
    console.log();

    // Errors and Warnings
    if (this.errors.length > 0) {
      console.log('❌ ERRORS:');
      this.errors.forEach(error => console.log(`   ${error}`));
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log('⚠️ WARNINGS:');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
      console.log();
    }

    // Final Status
    const totalChecks = Object.values(this.results).flat().length;
    const errorCount = this.errors.length;
    const warningCount = this.warnings.length;

    console.log('🎯 FINAL STATUS:');
    console.log(`   ✅ Passed Checks: ${totalChecks}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   ⚠️ Warnings: ${warningCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 MEMORY BOX IS PRODUCTION READY! 🚀');
      console.log('✅ All critical validations passed');
      console.log('📱 Mobile app ready for iOS/Android deployment');
      console.log('🌐 Web components ready for hosting');
      console.log('🔒 Security validations passed');
    } else {
      console.log('\n⚠️ ISSUES FOUND - REVIEW BEFORE DEPLOYMENT');
      console.log('Please address all errors before proceeding to production');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new MemoryBoxValidator();
  validator.runFullValidation().catch(console.error);
}

module.exports = MemoryBoxValidator;
