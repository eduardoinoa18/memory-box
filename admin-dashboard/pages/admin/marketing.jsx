import { useState, useEffect } from 'react';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    doc, 
    deleteDoc,
    query,
    orderBy,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import AdminLayout from '../../layouts/AdminLayout';
import {
    Mail,
    MessageSquare,
    Calendar,
    Users,
    Send,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    Edit,
    Trash2,
    Eye,
    BarChart3,
    Target,
    Zap,
    AlertCircle
} from 'lucide-react';

const MarketingPage = () => {
    const [activeTab, setActiveTab] = useState('campaigns');
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCampaignForm, setShowCampaignForm] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);

    // Campaign form state
    const [campaignForm, setCampaignForm] = useState({
        name: '',
        type: 'welcome',
        trigger: 'manual',
        method: 'email',
        subject: '',
        message: '',
        scheduledAt: '',
        targetAudience: 'all',
        status: 'draft'
    });

    const campaignTypes = [
        { id: 'welcome', name: 'Welcome Series', description: 'New user onboarding' },
        { id: 'upgrade', name: 'Upgrade Nudge', description: 'Encourage plan upgrades' },
        { id: 'engagement', name: 'Re-engagement', description: 'Win back inactive users' },
        { id: 'promo', name: 'Promotional', description: 'Special offers and announcements' },
        { id: 'reminder', name: 'Reminder', description: 'Birthday/anniversary alerts' },
        { id: 'newsletter', name: 'Newsletter', description: 'Regular content updates' }
    ];

    const triggerTypes = [
        { id: 'manual', name: 'Manual Send', description: 'Send immediately or schedule' },
        { id: 'signup', name: 'User Signup', description: 'Triggered on account creation' },
        { id: 'storage_limit', name: 'Storage Limit', description: 'When user hits storage limit' },
        { id: 'inactive', name: 'Inactivity', description: 'After 30 days of inactivity' },
        { id: 'birthday', name: 'Birthday', description: 'On user birthday' }
    ];

    const audienceOptions = [
        { id: 'all', name: 'All Users', count: '1,247' },
        { id: 'free', name: 'Free Users', count: '892' },
        { id: 'premium', name: 'Premium Users', count: '245' },
        { id: 'family', name: 'Family Users', count: '110' },
        { id: 'inactive', name: 'Inactive Users', count: '156' }
    ];

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const campaignsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCampaigns(campaignsData);
        } catch (error) {
            console.error('Error loading campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveCampaign = async () => {
        try {
            const campaignData = {
                ...campaignForm,
                updatedAt: serverTimestamp(),
                ...(editingCampaign ? {} : { 
                    createdAt: serverTimestamp(),
                    stats: { sent: 0, opened: 0, clicked: 0 }
                })
            };

            if (editingCampaign) {
                await updateDoc(doc(db, 'campaigns', editingCampaign.id), campaignData);
            } else {
                await addDoc(collection(db, 'campaigns'), campaignData);
            }

            setShowCampaignForm(false);
            setEditingCampaign(null);
            resetForm();
            await loadCampaigns();
        } catch (error) {
            console.error('Error saving campaign:', error);
        }
    };

    const deleteCampaign = async (campaignId) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            try {
                await deleteDoc(doc(db, 'campaigns', campaignId));
                await loadCampaigns();
            } catch (error) {
                console.error('Error deleting campaign:', error);
            }
        }
    };

    const sendCampaign = async (campaign) => {
        if (window.confirm(`Send "${campaign.name}" to ${getAudienceCount(campaign.targetAudience)} users?`)) {
            try {
                await updateDoc(doc(db, 'campaigns', campaign.id), {
                    status: 'sending',
                    sentAt: serverTimestamp()
                });
                
                // Simulate sending process
                setTimeout(async () => {
                    await updateDoc(doc(db, 'campaigns', campaign.id), {
                        status: 'sent',
                        stats: {
                            sent: getAudienceCount(campaign.targetAudience),
                            opened: Math.floor(getAudienceCount(campaign.targetAudience) * 0.25),
                            clicked: Math.floor(getAudienceCount(campaign.targetAudience) * 0.05)
                        }
                    });
                    await loadCampaigns();
                }, 2000);
                
                await loadCampaigns();
            } catch (error) {
                console.error('Error sending campaign:', error);
            }
        }
    };

    const getAudienceCount = (audienceId) => {
        const audience = audienceOptions.find(a => a.id === audienceId);
        return parseInt(audience?.count.replace(',', '') || '0');
    };

    const resetForm = () => {
        setCampaignForm({
            name: '',
            type: 'welcome',
            trigger: 'manual',
            method: 'email',
            subject: '',
            message: '',
            scheduledAt: '',
            targetAudience: 'all',
            status: 'draft'
        });
    };

    const startEditingCampaign = (campaign) => {
        setEditingCampaign(campaign);
        setCampaignForm({
            name: campaign.name || '',
            type: campaign.type || 'welcome',
            trigger: campaign.trigger || 'manual',
            method: campaign.method || 'email',
            subject: campaign.subject || '',
            message: campaign.message || '',
            scheduledAt: campaign.scheduledAt || '',
            targetAudience: campaign.targetAudience || 'all',
            status: campaign.status || 'draft'
        });
        setShowCampaignForm(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'sent': return 'bg-green-100 text-green-800';
            case 'sending': return 'bg-blue-100 text-blue-800';
            case 'scheduled': return 'bg-yellow-100 text-yellow-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent': return <CheckCircle className="w-4 h-4" />;
            case 'sending': return <Clock className="w-4 h-4 animate-spin" />;
            case 'scheduled': return <Calendar className="w-4 h-4" />;
            case 'draft': return <Edit className="w-4 h-4" />;
            case 'failed': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Marketing Automation">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Marketing Automation">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Marketing Automation</h1>
                        <p className="text-gray-600">Manage email campaigns and automated communications</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCampaign(null);
                            resetForm();
                            setShowCampaignForm(true);
                        }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Campaign
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'campaigns', name: 'Campaigns', icon: Mail },
                            { id: 'automation', name: 'Automation Rules', icon: Zap },
                            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Campaign Form Modal */}
                {showCampaignForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingCampaign ? 'Edit Campaign' : 'New Campaign'}
                                </h2>
                                <button
                                    onClick={() => setShowCampaignForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Campaign Name
                                        </label>
                                        <input
                                            type="text"
                                            value={campaignForm.name}
                                            onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter campaign name..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Campaign Type
                                        </label>
                                        <select
                                            value={campaignForm.type}
                                            onChange={(e) => setCampaignForm(prev => ({ ...prev, type: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {campaignTypes.map(type => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Trigger
                                        </label>
                                        <select
                                            value={campaignForm.trigger}
                                            onChange={(e) => setCampaignForm(prev => ({ ...prev, trigger: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {triggerTypes.map(trigger => (
                                                <option key={trigger.id} value={trigger.id}>{trigger.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Method
                                        </label>
                                        <select
                                            value={campaignForm.method}
                                            onChange={(e) => setCampaignForm(prev => ({ ...prev, method: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="email">Email</option>
                                            <option value="sms">SMS</option>
                                            <option value="push">Push Notification</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Target Audience
                                        </label>
                                        <select
                                            value={campaignForm.targetAudience}
                                            onChange={(e) => setCampaignForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {audienceOptions.map(audience => (
                                                <option key={audience.id} value={audience.id}>
                                                    {audience.name} ({audience.count})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {campaignForm.trigger === 'manual' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Schedule (Optional)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={campaignForm.scheduledAt}
                                                onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                {campaignForm.method === 'email' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={campaignForm.subject}
                                            onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter email subject..."
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message Content
                                    </label>
                                    <textarea
                                        value={campaignForm.message}
                                        onChange={(e) => setCampaignForm(prev => ({ ...prev, message: e.target.value }))}
                                        rows={8}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your message content... Use {{name}} for personalization"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Use merge tags: {'{name}'}, {'{email}'}, {'{plan}'}
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowCampaignForm(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveCampaign}
                                        disabled={!campaignForm.name || !campaignForm.message}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Campaigns', value: campaigns.length, icon: Mail, color: 'text-blue-600' },
                                { label: 'Active', value: campaigns.filter(c => c.status === 'sent').length, icon: CheckCircle, color: 'text-green-600' },
                                { label: 'Scheduled', value: campaigns.filter(c => c.status === 'scheduled').length, icon: Clock, color: 'text-yellow-600' },
                                { label: 'Draft', value: campaigns.filter(c => c.status === 'draft').length, icon: Edit, color: 'text-gray-600' }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                        </div>
                                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Campaigns List */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">All Campaigns</h3>
                                <p className="text-sm text-gray-600">Manage your email and SMS campaigns</p>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {campaigns.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                                        <p className="text-gray-600">Create your first campaign to get started</p>
                                    </div>
                                ) : (
                                    campaigns.map((campaign) => (
                                        <div key={campaign.id} className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {campaign.name}
                                                        </h3>
                                                        <span className={`flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                                                            {getStatusIcon(campaign.status)}
                                                            <span className="ml-1">{campaign.status}</span>
                                                        </span>
                                                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                                            {campaignTypes.find(t => t.id === campaign.type)?.name}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mt-1">
                                                        {campaign.method === 'email' ? campaign.subject : campaign.message?.substring(0, 100)}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center">
                                                            <Target className="w-4 h-4 mr-1" />
                                                            {audienceOptions.find(a => a.id === campaign.targetAudience)?.name}
                                                        </span>
                                                        {campaign.stats && (
                                                            <span>
                                                                Sent: {campaign.stats.sent} | Opened: {campaign.stats.opened} | Clicked: {campaign.stats.clicked}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {campaign.status === 'draft' && (
                                                        <button
                                                            onClick={() => sendCampaign(campaign)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => startEditingCampaign(campaign)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCampaign(campaign.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Automation Tab */}
                {activeTab === 'automation' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Automation Rules</h3>
                            <div className="space-y-4">
                                {triggerTypes.filter(t => t.id !== 'manual').map((trigger) => (
                                    <div key={trigger.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{trigger.name}</h4>
                                            <p className="text-sm text-gray-600">{trigger.description}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                                                {campaigns.filter(c => c.trigger === trigger.id).length} campaigns
                                            </span>
                                            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                                Configure
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Performance</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Open Rate</span>
                                        <span className="font-medium">25.3%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Click Rate</span>
                                        <span className="font-medium">5.2%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Unsubscribe Rate</span>
                                        <span className="font-medium">0.8%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Campaigns</h3>
                                <div className="space-y-2">
                                    {campaigns.filter(c => c.stats).slice(0, 3).map((campaign, index) => (
                                        <div key={campaign.id} className="flex justify-between">
                                            <span className="text-gray-600 text-sm">{campaign.name}</span>
                                            <span className="font-medium text-sm">
                                                {campaign.stats ? Math.round((campaign.stats.opened / campaign.stats.sent) * 100) : 0}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Audience Growth</h3>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">+12.5%</div>
                                    <div className="text-sm text-gray-600">This month</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default MarketingPage;
