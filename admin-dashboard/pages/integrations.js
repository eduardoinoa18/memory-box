import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../lib/auth';
import integrationService from '../lib/integrationService';

export default function Integrations() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [integrations, setIntegrations] = useState({});
    const [originalIntegrations, setOriginalIntegrations] = useState({});
    const [activeTab, setActiveTab] = useState('stripe');
    const [saving, setSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [testingWebhook, setTestingWebhook] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Load integrations from backend
    useEffect(() => {
        const loadIntegrations = async () => {
            try {
                setLoadingData(true);
                const data = await integrationService.getIntegrations();
                setIntegrations(data);
                setOriginalIntegrations(JSON.parse(JSON.stringify(data))); // Deep clone
            } catch (error) {
                console.error('Error loading integrations:', error);
                alert('Failed to load integrations. Please refresh the page.');
            } finally {
                setLoadingData(false);
            }
        };

        if (user) {
            loadIntegrations();
        }
    }, [user]);

    // Check for changes
    useEffect(() => {
        const changed = JSON.stringify(integrations) !== JSON.stringify(originalIntegrations);
        setHasChanges(changed);
    }, [integrations, originalIntegrations]);

    const handleSaveIntegration = async (service) => {
        setSaving(true);
        setValidationErrors({});

        try {
            const config = integrations[service];

            // Validate configuration
            const errors = validateIntegrationConfig(service, config);
            if (Object.keys(errors).length > 0) {
                setValidationErrors({ [service]: errors });
                setSaving(false);
                return;
            }

            // Save to backend
            await integrationService.saveIntegration(service, config);

            // Update original state to reflect saved changes
            setOriginalIntegrations(prev => ({
                ...prev,
                [service]: { ...config, lastUpdated: new Date().toISOString() }
            }));

            alert(`${service.charAt(0).toUpperCase() + service.slice(1)} integration saved successfully!`);
        } catch (error) {
            console.error('Error saving integration:', error);
            alert('Failed to save integration. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleTestWebhook = async () => {
        setTestingWebhook(true);
        try {
            const webhookUrl = `${window.location.origin}/api/webhooks/stripe`;
            const success = await integrationService.testWebhook(webhookUrl);

            if (success) {
                alert('Webhook test successful! ✅');
            } else {
                alert('Webhook test failed. Please check your configuration.');
            }
        } catch (error) {
            alert('Webhook test failed. Please check your configuration.');
        } finally {
            setTestingWebhook(false);
        }
    };

    const updateIntegrationField = (service, field, value) => {
        setIntegrations(prev => ({
            ...prev,
            [service]: {
                ...prev[service],
                [field]: value
            }
        }));

        // Clear validation errors for this field
        if (validationErrors[service]?.[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [service]: {
                    ...prev[service],
                    [field]: undefined
                }
            }));
        }
    };

    const validateIntegrationConfig = (service, config) => {
        const errors = {};

        if (service === 'stripe' && config.enabled) {
            if (!config.publishableKey) {
                errors.publishableKey = 'Publishable key is required';
            } else if (!integrationService.validateApiKey('stripe', 'publishable', config.publishableKey)) {
                errors.publishableKey = 'Invalid publishable key format';
            }

            if (!config.secretKey) {
                errors.secretKey = 'Secret key is required';
            } else if (!integrationService.validateApiKey('stripe', 'secret', config.secretKey)) {
                errors.secretKey = 'Invalid secret key format';
            }

            if (!config.premiumPriceId) {
                errors.premiumPriceId = 'Premium price ID is required';
            } else if (!integrationService.validateApiKey('stripe', 'price', config.premiumPriceId)) {
                errors.premiumPriceId = 'Invalid price ID format';
            }

            if (!config.familyPriceId) {
                errors.familyPriceId = 'Family price ID is required';
            } else if (!integrationService.validateApiKey('stripe', 'price', config.familyPriceId)) {
                errors.familyPriceId = 'Invalid price ID format';
            }

            if (config.webhookSecret && !integrationService.validateApiKey('stripe', 'webhook', config.webhookSecret)) {
                errors.webhookSecret = 'Invalid webhook secret format';
            }
        }

        if (service === 'openai' && config.enabled) {
            if (!config.apiKey) {
                errors.apiKey = 'API key is required';
            } else if (!integrationService.validateApiKey('openai', 'secret', config.apiKey)) {
                errors.apiKey = 'Invalid API key format';
            }
        }

        if (service === 'sendgrid' && config.enabled) {
            if (!config.apiKey) {
                errors.apiKey = 'API key is required';
            } else if (!integrationService.validateApiKey('sendgrid', 'secret', config.apiKey)) {
                errors.apiKey = 'Invalid API key format';
            }

            if (!config.fromEmail) {
                errors.fromEmail = 'From email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.fromEmail)) {
                errors.fromEmail = 'Invalid email format';
            }
        } return errors;
    };

    if (loading || loadingData) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3">Loading integrations...</span>
                </div>
            </AdminLayout>
        );
    }
            </div >
        </AdminLayout >
    );
}

if (!user) {
    return null;
}

return (
    <AdminLayout>
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">🔌 Integrations Hub</h1>
                <p className="text-gray-600">
                    Manage all your third-party integrations and API configurations in one place.
                </p>
            </div>

            {/* Integration Tabs */}
            <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                        {[
                            { id: 'stripe', name: '💳 Stripe', status: integrations.stripe.enabled },
                            { id: 'firebase', name: '🔥 Firebase', status: integrations.firebase.enabled },
                            { id: 'openai', name: '🤖 OpenAI', status: integrations.openai.enabled },
                            { id: 'sendgrid', name: '📧 SendGrid', status: integrations.sendgrid.enabled }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span>{tab.name}</span>
                                {tab.status && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Stripe Integration */}
                    {activeTab === 'stripe' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Stripe Payment Processing</h3>
                                    <p className="text-sm text-gray-500">Configure Stripe for subscription billing and payments</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={integrations.stripe.enabled}
                                        onChange={(e) => updateIntegrationField('stripe', 'enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {integrations.stripe.enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Test Mode Toggle */}
                                    <div className="col-span-full">
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={integrations.stripe.testMode}
                                                onChange={(e) => updateIntegrationField('stripe', 'testMode', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Test Mode</span>
                                            <span className="text-xs text-gray-500">
                                                (Use test API keys for development)
                                            </span>
                                        </label>
                                    </div>

                                    {/* API Keys */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Publishable Key
                                        </label>
                                        <input
                                            type="text"
                                            value={integrations.stripe.publishableKey}
                                            onChange={(e) => updateIntegrationField('stripe', 'publishableKey', e.target.value)}
                                            placeholder={integrations.stripe.testMode ? "pk_test_..." : "pk_live_..."}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Secret Key
                                        </label>
                                        <input
                                            type="password"
                                            value={integrations.stripe.secretKey}
                                            onChange={(e) => updateIntegrationField('stripe', 'secretKey', e.target.value)}
                                            placeholder={integrations.stripe.testMode ? "sk_test_..." : "sk_live_..."}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Price IDs */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Premium Plan Price ID ($4.99/month)
                                        </label>
                                        <input
                                            type="text"
                                            value={integrations.stripe.premiumPriceId}
                                            onChange={(e) => updateIntegrationField('stripe', 'premiumPriceId', e.target.value)}
                                            placeholder="price_1ABC..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Family Plan Price ID ($9.99/month)
                                        </label>
                                        <input
                                            type="text"
                                            value={integrations.stripe.familyPriceId}
                                            onChange={(e) => updateIntegrationField('stripe', 'familyPriceId', e.target.value)}
                                            placeholder="price_1XYZ..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Webhook Secret */}
                                    <div className="col-span-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Webhook Endpoint Secret
                                        </label>
                                        <div className="flex space-x-3">
                                            <input
                                                type="password"
                                                value={integrations.stripe.webhookSecret}
                                                onChange={(e) => updateIntegrationField('stripe', 'webhookSecret', e.target.value)}
                                                placeholder="whsec_..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={handleTestWebhook}
                                                disabled={testingWebhook || !integrations.stripe.webhookSecret}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {testingWebhook ? 'Testing...' : 'Test Webhook'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Webhook URL: https://your-region-memory-box-app.cloudfunctions.net/stripeWebhook
                                        </p>
                                    </div>

                                    {/* Webhook Events Info */}
                                    <div className="col-span-full bg-blue-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">Required Webhook Events:</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-800">
                                            <span>• checkout.session.completed</span>
                                            <span>• customer.subscription.created</span>
                                            <span>• customer.subscription.updated</span>
                                            <span>• customer.subscription.deleted</span>
                                            <span>• invoice.payment_succeeded</span>
                                            <span>• invoice.payment_failed</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => handleSaveIntegration('stripe')}
                                    disabled={saving || !integrations.stripe.enabled}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save Stripe Configuration'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Firebase Integration */}
                    {activeTab === 'firebase' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Firebase Backend</h3>
                                    <p className="text-sm text-gray-500">Authentication, database, and cloud functions</p>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    ✅ Connected
                                </span>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-green-900">Project ID:</span>
                                        <span className="ml-2 text-green-800">memory-box-app</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-green-900">Authentication:</span>
                                        <span className="ml-2 text-green-800">✅ Enabled</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-green-900">Firestore:</span>
                                        <span className="ml-2 text-green-800">✅ Enabled</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-green-900">Storage:</span>
                                        <span className="ml-2 text-green-800">✅ Enabled</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OpenAI Integration */}
                    {activeTab === 'openai' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">OpenAI API</h3>
                                    <p className="text-sm text-gray-500">AI-powered features and content generation</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={integrations.openai.enabled}
                                        onChange={(e) => updateIntegrationField('openai', 'enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {integrations.openai.enabled && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            API Key
                                        </label>
                                        <input
                                            type="password"
                                            value={integrations.openai.apiKey}
                                            onChange={(e) => updateIntegrationField('openai', 'apiKey', e.target.value)}
                                            placeholder="sk-..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Model
                                        </label>
                                        <select
                                            value={integrations.openai.model}
                                            onChange={(e) => updateIntegrationField('openai', 'model', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="gpt-4">GPT-4</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleSaveIntegration('openai')}
                                    disabled={saving || !integrations.openai.enabled}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save OpenAI Configuration'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SendGrid Integration */}
                    {activeTab === 'sendgrid' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">SendGrid Email</h3>
                                    <p className="text-sm text-gray-500">Transactional emails and notifications</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={integrations.sendgrid.enabled}
                                        onChange={(e) => updateIntegrationField('sendgrid', 'enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {integrations.sendgrid.enabled && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            API Key
                                        </label>
                                        <input
                                            type="password"
                                            value={integrations.sendgrid.apiKey}
                                            onChange={(e) => updateIntegrationField('sendgrid', 'apiKey', e.target.value)}
                                            placeholder="SG..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            From Email
                                        </label>
                                        <input
                                            type="email"
                                            value={integrations.sendgrid.fromEmail}
                                            onChange={(e) => updateIntegrationField('sendgrid', 'fromEmail', e.target.value)}
                                            placeholder="noreply@memorybox.app"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleSaveIntegration('sendgrid')}
                                    disabled={saving || !integrations.sendgrid.enabled}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save SendGrid Configuration'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Integration Status Summary */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(integrations).map(([key, integration]) => (
                        <div key={key} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 capitalize">{key}</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${integration.enabled
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {integration.enabled ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            {integration.lastUpdated && (
                                <p className="text-xs text-gray-500">
                                    Updated: {new Date(integration.lastUpdated).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </AdminLayout>
);
}
