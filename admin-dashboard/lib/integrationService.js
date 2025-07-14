// Integration management service for admin dashboard
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

class IntegrationService {
    constructor() {
        this.integrationsPath = 'admin/integrations';
        this.secretsPath = 'admin/secrets'; // For encrypted storage
    }

    /**
     * Get all integration configurations (without sensitive data)
     * @returns {Promise<object>} Integration configurations
     */
    async getIntegrations() {
        try {
            const docRef = doc(db, this.integrationsPath);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                // Remove sensitive data from response
                return this.sanitizeIntegrations(data);
            } else {
                // Return default configuration if none exists
                const defaults = this.getDefaultIntegrations();
                await this.initializeIntegrations(defaults);
                return defaults;
            }
        } catch (error) {
            console.error('Error fetching integrations:', error);
            throw error;
        }
    }

    /**
     * Save integration configuration
     * @param {string} service - Service name (stripe, firebase, etc.)
     * @param {object} config - Configuration object
     * @returns {Promise<boolean>} Success status
     */
    async saveIntegration(service, config) {
        try {
            const docRef = doc(db, this.integrationsPath);

            // Get current integrations
            const currentIntegrations = await this.getIntegrations();

            // Separate sensitive and non-sensitive data
            const { sensitiveData, publicData } = this.separateConfigData(service, config);

            // Update public configuration
            const updatedIntegrations = {
                ...currentIntegrations,
                [service]: {
                    ...publicData,
                    lastUpdated: new Date().toISOString(),
                    hasSecrets: Object.keys(sensitiveData).length > 0
                }
            };

            // Save to Firestore
            await setDoc(docRef, updatedIntegrations, { merge: true });

            // If it's Stripe, also update environment variables for Firebase Functions
            if (service === 'stripe') {
                await this.updateFirebaseFunctionsConfig(config);
            }

            return true;
        } catch (error) {
            console.error('Error saving integration:', error);
            throw error;
        }
    }

    /**
     * Update Firebase Functions configuration with Stripe keys
     * @param {object} stripeConfig - Stripe configuration
     */
    async updateFirebaseFunctionsConfig(stripeConfig) {
        try {
            // This would typically call Firebase Admin SDK or Cloud Functions
            // For now, we'll log the configuration that should be set
            console.log('Stripe configuration to set in Firebase Functions:', {
                'stripe.secret_key': stripeConfig.secretKey,
                'stripe.premium_price_id': stripeConfig.premiumPriceId,
                'stripe.family_price_id': stripeConfig.familyPriceId,
                'stripe.webhook_secret': stripeConfig.webhookSecret
            });

            // In a real implementation, you would call:
            // firebase functions:config:set stripe.secret_key="${stripeConfig.secretKey}"
            // firebase functions:config:set stripe.premium_price_id="${stripeConfig.premiumPriceId}"
            // etc.

            // Save to a Firebase Functions config document for later deployment
            const configDoc = doc(db, 'admin/functions-config');
            await setDoc(configDoc, {
                stripe: {
                    secret_key: stripeConfig.secretKey,
                    premium_price_id: stripeConfig.premiumPriceId,
                    family_price_id: stripeConfig.familyPriceId,
                    webhook_secret: stripeConfig.webhookSecret,
                    test_mode: stripeConfig.testMode
                },
                lastUpdated: new Date().toISOString()
            }, { merge: true });

        } catch (error) {
            console.error('Error updating Firebase Functions config:', error);
        }
    }

    /**
     * Separate sensitive and non-sensitive configuration data
     * @param {string} service - Service name
     * @param {object} config - Full configuration object
     * @returns {object} Object with sensitiveData and publicData
     */
    separateConfigData(service, config) {
        const sensitiveFields = {
            stripe: ['secretKey', 'webhookSecret'],
            openai: ['apiKey'],
            sendgrid: ['apiKey'],
            firebase: [] // Firebase config is public
        };

        const sensitive = sensitiveFields[service] || [];
        const sensitiveData = {};
        const publicData = {};

        Object.keys(config).forEach(key => {
            if (sensitive.includes(key)) {
                sensitiveData[key] = config[key];
            } else {
                publicData[key] = config[key];
            }
        });

        return { sensitiveData, publicData };
    }

    /**
     * Remove sensitive data from integrations object
     * @param {object} integrations - Raw integrations data
     * @returns {object} Sanitized integrations data
     */
    sanitizeIntegrations(integrations) {
        const sanitized = { ...integrations };

        // Remove sensitive fields
        Object.keys(sanitized).forEach(service => {
            if (sanitized[service]) {
                // Replace sensitive values with masked versions
                if (sanitized[service].secretKey) {
                    sanitized[service].secretKey = this.maskApiKey(sanitized[service].secretKey);
                }
                if (sanitized[service].webhookSecret) {
                    sanitized[service].webhookSecret = this.maskApiKey(sanitized[service].webhookSecret);
                }
                if (sanitized[service].apiKey) {
                    sanitized[service].apiKey = this.maskApiKey(sanitized[service].apiKey);
                }
            }
        });

        return sanitized;
    }

    /**
     * Mask API key for display purposes
     * @param {string} key - API key to mask
     * @returns {string} Masked API key
     */
    maskApiKey(key) {
        if (!key || key.length < 8) return '';
        return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
    }

    /**
     * Initialize integrations with default values
     * @param {object} defaults - Default integration configurations
     */
    async initializeIntegrations(defaults) {
        try {
            const docRef = doc(db, this.integrationsPath);
            await setDoc(docRef, {
                ...defaults,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error initializing integrations:', error);
            throw error;
        }
    }

    /**
     * Test webhook connectivity
     * @param {string} webhookUrl - Webhook URL to test
     * @returns {Promise<boolean>} Test result
     */
    async testWebhook(webhookUrl) {
        try {
            // Simulate webhook test
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Memory-Box-Webhook-Test'
                },
                body: JSON.stringify({
                    test: true,
                    timestamp: Date.now()
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Webhook test failed:', error);
            return false;
        }
    }

    /**
     * Get default integration configuration
     * @returns {object} Default integrations
     */
    getDefaultIntegrations() {
        return {
            stripe: {
                enabled: false,
                testMode: true,
                publishableKey: '',
                secretKey: '',
                premiumPriceId: '',
                familyPriceId: '',
                webhookSecret: '',
                lastUpdated: null
            },
            firebase: {
                enabled: true,
                projectId: 'memory-box-app',
                authEnabled: true,
                firestoreEnabled: true,
                storageEnabled: true,
                functionsEnabled: true,
                lastUpdated: new Date().toISOString()
            },
            openai: {
                enabled: false,
                apiKey: '',
                model: 'gpt-4',
                features: {
                    contentGeneration: false,
                    imageAnalysis: false,
                    textSummarization: false
                },
                lastUpdated: null
            },
            sendgrid: {
                enabled: false,
                apiKey: '',
                fromEmail: '',
                templates: {
                    welcome: '',
                    passwordReset: '',
                    subscription: ''
                },
                lastUpdated: null
            },
            analytics: {
                enabled: false,
                googleAnalyticsId: '',
                mixpanelToken: '',
                lastUpdated: null
            }
        };
    }

    /**
     * Validate API key format
     * @param {string} service - Service name
     * @param {string} keyType - Type of key (publishable, secret, etc.)
     * @param {string} key - API key to validate
     * @returns {boolean} Validation result
     */
    validateApiKey(service, keyType, key) {
        const validationPatterns = {
            stripe: {
                publishable: /^pk_(test_|live_)[a-zA-Z0-9]{99}$/,
                secret: /^sk_(test_|live_)[a-zA-Z0-9]{99}$/,
                webhook: /^whsec_[a-zA-Z0-9]{32}$/,
                price: /^price_[a-zA-Z0-9]{24}$/
            },
            openai: {
                secret: /^sk-[a-zA-Z0-9]{48}$/
            },
            sendgrid: {
                secret: /^SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}$/
            }
        };

        const pattern = validationPatterns[service]?.[keyType];
        return pattern ? pattern.test(key) : true; // Return true if no pattern defined
    }

    /**
     * Get integration status for dashboard
     * @returns {Promise<object>} Integration status summary
     */
    async getIntegrationStatus() {
        try {
            const integrations = await this.getIntegrations();

            const status = {};
            Object.keys(integrations).forEach(service => {
                const config = integrations[service];
                status[service] = {
                    enabled: config.enabled,
                    configured: this.isServiceConfigured(service, config),
                    lastUpdated: config.lastUpdated,
                    health: this.getServiceHealth(service, config)
                };
            });

            return status;
        } catch (error) {
            console.error('Error getting integration status:', error);
            throw error;
        }
    }

    /**
     * Check if service is properly configured
     * @param {string} service - Service name
     * @param {object} config - Service configuration
     * @returns {boolean} Configuration status
     */
    isServiceConfigured(service, config) {
        if (!config.enabled) return false;

        const requiredFields = {
            stripe: ['publishableKey', 'secretKey', 'premiumPriceId', 'familyPriceId'],
            openai: ['apiKey'],
            sendgrid: ['apiKey', 'fromEmail'],
            firebase: [] // Firebase is always configured if enabled
        };

        const required = requiredFields[service] || [];
        return required.every(field => config[field] && config[field].trim() !== '');
    }

    /**
     * Get service health status
     * @param {string} service - Service name
     * @param {object} config - Service configuration
     * @returns {string} Health status (healthy, warning, error)
     */
    getServiceHealth(service, config) {
        if (!config.enabled) return 'disabled';
        if (!this.isServiceConfigured(service, config)) return 'error';

        // Additional health checks can be added here
        return 'healthy';
    }

    /**
     * Export configuration for backup
     * @returns {Promise<object>} Configuration backup
     */
    async exportConfiguration() {
        try {
            const integrations = await this.getIntegrations();

            // Remove sensitive data for export
            const exportData = {};
            Object.keys(integrations).forEach(service => {
                exportData[service] = {
                    enabled: integrations[service].enabled,
                    lastUpdated: integrations[service].lastUpdated,
                    // Don't export sensitive keys
                };
            });

            return {
                exportDate: new Date().toISOString(),
                integrations: exportData
            };
        } catch (error) {
            console.error('Error exporting configuration:', error);
            throw error;
        }
    }
}

export default new IntegrationService();
