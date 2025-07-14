import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../lib/auth';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';

export default function Webhooks() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [webhookLogs, setWebhookLogs] = useState([]);
    const [webhookConfig, setWebhookConfig] = useState(null);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Load webhook logs and config
    useEffect(() => {
        if (!user) return;

        // Load webhook configuration
        const loadWebhookConfig = async () => {
            try {
                const configDoc = await getDoc(doc(db, 'admin/integrations'));
                if (configDoc.exists()) {
                    const data = configDoc.data();
                    setWebhookConfig(data.stripe);
                }
            } catch (error) {
                console.error('Error loading webhook config:', error);
            }
        };

        loadWebhookConfig();

        // Subscribe to webhook logs
        const q = query(
            collection(db, 'admin/webhook-logs'),
            orderBy('timestamp', 'desc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const logs = [];
            querySnapshot.forEach((doc) => {
                logs.push({ id: doc.id, ...doc.data() });
            });
            setWebhookLogs(logs);
            setLoadingLogs(false);
        });

        return () => unsubscribe();
    }, [user]);

    const getEventTypeColor = (eventType) => {
        if (eventType.includes('payment')) return 'text-green-600 bg-green-50';
        if (eventType.includes('subscription')) return 'text-blue-600 bg-blue-50';
        if (eventType.includes('customer')) return 'text-purple-600 bg-purple-50';
        if (eventType.includes('invoice')) return 'text-orange-600 bg-orange-50';
        return 'text-gray-600 bg-gray-50';
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const copyWebhookUrl = () => {
        const webhookUrl = `${window.location.origin}/api/webhooks/stripe`;
        navigator.clipboard.writeText(webhookUrl);
        alert('Webhook URL copied to clipboard!');
    };

    if (loading || loadingLogs) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3">Loading webhook data...</span>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Webhook Monitor</h1>
                        <p className="text-gray-600">Monitor and manage webhook events</p>
                    </div>
                </div>

                {/* Webhook Configuration */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Webhook URL
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/stripe`}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                                />
                                <button
                                    onClick={copyWebhookUrl}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-r-md hover:bg-blue-700 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Use this URL in your Stripe Dashboard webhook settings
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${webhookConfig?.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className={`text-sm font-medium ${webhookConfig?.enabled ? 'text-green-700' : 'text-red-700'}`}>
                                    {webhookConfig?.enabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                            {webhookConfig?.lastUpdated && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Last updated: {formatTimestamp(webhookConfig.lastUpdated)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Required Events */}
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Required Webhook Events</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {[
                                'payment_intent.succeeded',
                                'customer.subscription.created',
                                'customer.subscription.updated',
                                'customer.subscription.deleted',
                                'invoice.payment_succeeded',
                                'invoice.payment_failed',
                                'customer.created',
                                'payment_method.attached'
                            ].map(event => (
                                <div key={event} className="px-3 py-2 bg-gray-50 rounded-md text-xs font-mono">
                                    {event}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Webhook Logs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Webhook Events</h2>
                            <span className="text-sm text-gray-500">
                                {webhookLogs.length} events
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Event Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Event ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {webhookLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No webhook events recorded yet.
                                            <br />
                                            <span className="text-sm">Events will appear here when Stripe sends webhooks to your endpoint.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    webhookLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(log.eventType)}`}>
                                                    {log.eventType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                                {log.eventId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatTimestamp(log.timestamp)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${log.processed ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                                                    }`}>
                                                    {log.processed ? 'Processed' : 'Failed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedEvent(log)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Event Details Modal */}
                {selectedEvent && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Webhook Event Details
                                </h3>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Event Type</label>
                                    <p className="text-sm text-gray-900">{selectedEvent.eventType}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Event ID</label>
                                    <p className="text-sm text-gray-900 font-mono">{selectedEvent.eventId}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                                    <p className="text-sm text-gray-900">{formatTimestamp(selectedEvent.timestamp)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Processing Status</label>
                                    <p className={`text-sm font-medium ${selectedEvent.processed ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedEvent.processed ? 'Successfully Processed' : 'Processing Failed'}
                                    </p>
                                </div>

                                {selectedEvent.data && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Event Data</label>
                                        <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-x-auto">
                                            {JSON.stringify(selectedEvent.data, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
