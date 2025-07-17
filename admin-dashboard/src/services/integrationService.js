// Integration Management Service
// Handles secure storage and management of API keys and configurations

import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'memory-box-default-key';

class IntegrationService {
  constructor() {
    this.cache = new Map();
  }

  // Encrypt sensitive data
  encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  }

  // Decrypt sensitive data
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Save integration configuration
  async saveIntegration(integrationKey, config) {
    try {
      // Separate public and private data
      const publicData = {};
      const privateData = {};

      const sensitiveFields = ['apiKey', 'secretKey', 'authToken', 'secret', 'dsn', 'webhookSecret'];

      Object.entries(config).forEach(([key, value]) => {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          privateData[key] = value;
        } else {
          publicData[key] = value;
        }
      });

      // Encrypt private data
      const encryptedPrivateData = this.encrypt(privateData);

      // Save to Firestore
      const integrationDoc = {
        ...publicData,
        encryptedConfig: encryptedPrivateData,
        status: 'connected',
        lastUpdated: new Date(),
        updatedBy: 'admin' // TODO: Get actual admin user
      };

      await setDoc(doc(db, 'integrations', integrationKey), integrationDoc);

      // Update cache
      this.cache.set(integrationKey, { ...publicData, ...privateData });

      return { success: true };
    } catch (error) {
      console.error('Failed to save integration:', error);
      throw new Error('Failed to save integration configuration');
    }
  }

  // Load integration configuration
  async getIntegration(integrationKey) {
    try {
      // Check cache first
      if (this.cache.has(integrationKey)) {
        return this.cache.get(integrationKey);
      }

      const docRef = doc(db, 'integrations', integrationKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const decryptedPrivateData = this.decrypt(data.encryptedConfig) || {};
        
        const fullConfig = {
          ...data,
          ...decryptedPrivateData
        };

        // Remove encrypted field from response
        delete fullConfig.encryptedConfig;

        // Update cache
        this.cache.set(integrationKey, fullConfig);

        return fullConfig;
      }

      return null;
    } catch (error) {
      console.error('Failed to load integration:', error);
      throw new Error('Failed to load integration configuration');
    }
  }

  // Load all integrations
  async getAllIntegrations() {
    try {
      const integrationsRef = collection(db, 'integrations');
      const snapshot = await getDocs(integrationsRef);
      
      const integrations = {};
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const decryptedPrivateData = this.decrypt(data.encryptedConfig) || {};
        
        integrations[doc.id] = {
          ...data,
          ...decryptedPrivateData
        };

        // Remove encrypted field
        delete integrations[doc.id].encryptedConfig;
      }

      return integrations;
    } catch (error) {
      console.error('Failed to load integrations:', error);
      throw new Error('Failed to load integrations');
    }
  }

  // Test integration connection
  async testIntegration(integrationKey) {
    try {
      const config = await this.getIntegration(integrationKey);
      if (!config) {
        return { success: false, error: 'Integration not configured' };
      }

      switch (integrationKey) {
        case 'firebase':
          return await this.testFirebase(config);
        case 'stripe':
          return await this.testStripe(config);
        case 'openai':
          return await this.testOpenAI(config);
        case 'sendgrid':
          return await this.testSendGrid(config);
        case 'twilio':
          return await this.testTwilio(config);
        case 'prizeout':
          return await this.testPrizeOut(config);
        case 'analytics':
          return await this.testAnalytics(config);
        case 'sentry':
          return await this.testSentry(config);
        default:
          return { success: false, error: 'Unknown integration' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Individual service test methods
  async testFirebase(config) {
    try {
      // Test Firebase connection by trying to read from a test collection
      const testDoc = doc(db, 'test', 'connection');
      await getDoc(testDoc);
      return { success: true, message: 'Firebase connection successful' };
    } catch (error) {
      return { success: false, error: 'Firebase connection failed: ' + error.message };
    }
  }

  async testStripe(config) {
    try {
      const stripe = require('stripe')(config.secretKey);
      await stripe.accounts.retrieve();
      return { success: true, message: 'Stripe connection successful' };
    } catch (error) {
      return { success: false, error: 'Stripe connection failed: ' + error.message };
    }
  }

  async testOpenAI(config) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return { success: true, message: 'OpenAI connection successful' };
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      return { success: false, error: 'OpenAI connection failed: ' + error.message };
    }
  }

  async testSendGrid(config) {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(config.apiKey);
      
      // Test by getting account details
      const response = await fetch('https://api.sendgrid.com/v3/user/account', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      if (response.ok) {
        return { success: true, message: 'SendGrid connection successful' };
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      return { success: false, error: 'SendGrid connection failed: ' + error.message };
    }
  }

  async testTwilio(config) {
    try {
      const client = require('twilio')(config.accountSid, config.authToken);
      await client.accounts(config.accountSid).fetch();
      return { success: true, message: 'Twilio connection successful' };
    } catch (error) {
      return { success: false, error: 'Twilio connection failed: ' + error.message };
    }
  }

  async testPrizeOut(config) {
    try {
      const baseUrl = config.environment === 'sandbox' 
        ? 'https://api.sandbox.prizeout.com'
        : 'https://api.prizeout.com';

      const response = await fetch(`${baseUrl}/api/v1/partner/account`, {
        headers: {
          'X-API-Key': config.apiKey,
          'X-Partner-ID': config.partnerId
        }
      });

      if (response.ok) {
        return { success: true, message: 'PrizeOut connection successful' };
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      return { success: false, error: 'PrizeOut connection failed: ' + error.message };
    }
  }

  async testAnalytics(config) {
    try {
      // Test Google Analytics by validating measurement ID format
      if (config.measurementId && config.measurementId.startsWith('G-')) {
        return { success: true, message: 'Google Analytics configuration valid' };
      } else {
        throw new Error('Invalid measurement ID format');
      }
    } catch (error) {
      return { success: false, error: 'Google Analytics test failed: ' + error.message };
    }
  }

  async testSentry(config) {
    try {
      // Test Sentry DSN format
      if (config.dsn && config.dsn.includes('@sentry.io')) {
        return { success: true, message: 'Sentry configuration valid' };
      } else {
        throw new Error('Invalid Sentry DSN format');
      }
    } catch (error) {
      return { success: false, error: 'Sentry test failed: ' + error.message };
    }
  }

  // Get runtime configuration for use in the app
  async getRuntimeConfig() {
    try {
      const integrations = await this.getAllIntegrations();
      
      // Return only non-sensitive configuration needed by the frontend
      return {
        firebase: {
          apiKey: integrations.firebase?.apiKey,
          authDomain: integrations.firebase?.authDomain,
          projectId: integrations.firebase?.projectId,
          storageBucket: integrations.firebase?.storageBucket,
          messagingSenderId: integrations.firebase?.messagingSenderId,
          appId: integrations.firebase?.appId
        },
        stripe: {
          publishableKey: integrations.stripe?.publishableKey,
          testMode: integrations.stripe?.testMode
        },
        analytics: {
          measurementId: integrations.analytics?.measurementId
        },
        sentry: {
          dsn: integrations.sentry?.dsn,
          environment: integrations.sentry?.environment
        }
      };
    } catch (error) {
      console.error('Failed to get runtime config:', error);
      return {};
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();
export default integrationService;
