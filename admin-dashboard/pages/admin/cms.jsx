import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    Save,
    Eye,
    RefreshCw,
    Download,
    ExternalLink,
    Users,
    BarChart3,
    FileText,
    Globe,
    Settings
} from 'lucide-react';

const CmsPage = () => {
    const [activeTab, setActiveTab] = useState('landing');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Landing page localStorage data
    const [landingPageData, setLandingPageData] = useState({
        users: [],
        cms: {},
        downloads: [],
        analytics: { pageViews: 0, signUps: 0, downloads: 0 }
    });

    // Landing page form state
    const [landingForm, setLandingForm] = useState({
        heroTitle: 'Cherish Family Memories Forever',
        heroDescription: 'The easiest way to store, organize, and share your family\'s most treasured moments.',
        ctaTitle: 'Ready to preserve your family memories?',
        ctaDescription: 'Join thousands of families already using Memory Box',
        appStoreLink: '',
        googlePlayLink: '',
        features: [
            {
                title: 'Effortless Uploads',
                description: 'Easily add photos, videos, voice notes, and more to your family memory collection.',
                icon: '📷'
            },
            {
                title: 'Organize & Share',
                description: 'Organize memories into folders and share them with family and friends.',
                icon: '🔗'
            },
            {
                title: 'Secure & Accessible',
                description: 'Your memories are securely stored and accessible on all your devices.',
                icon: '🔒'
            }
        ]
    });

    useEffect(() => {
        loadLandingPageData();
    }, []);

    // Load data from localStorage (for landing page integration)
    const loadLandingPageData = () => {
        try {
            const users = JSON.parse(localStorage.getItem('memorybox_users') || '[]');
            const cms = JSON.parse(localStorage.getItem('memorybox_cms') || '{}');
            const downloads = JSON.parse(localStorage.getItem('memorybox_downloads') || '[]');
            const pageViews = parseInt(localStorage.getItem('memorybox_pageviews') || '0');
            
            const data = {
                users: users,
                cms: cms,
                downloads: downloads,
                analytics: {
                    pageViews: pageViews,
                    signUps: users.length,
                    downloads: downloads.length
                }
            };
            
            setLandingPageData(data);
            
            // Load existing CMS data into form
            if (cms.heroTitle || cms.heroDescription || cms.appStoreLink || cms.googlePlayLink) {
                setLandingForm(prev => ({
                    ...prev,
                    heroTitle: cms.heroTitle || prev.heroTitle,
                    heroDescription: cms.heroDescription || prev.heroDescription,
                    ctaTitle: cms.ctaTitle || prev.ctaTitle,
                    ctaDescription: cms.ctaDescription || prev.ctaDescription,
                    appStoreLink: cms.appStoreLink || prev.appStoreLink,
                    googlePlayLink: cms.googlePlayLink || prev.googlePlayLink
                }));
            }
        } catch (error) {
            console.error('Error loading landing page data:', error);
        }
    };

    // Save landing page content to localStorage
    const saveLandingPageContent = () => {
        try {
            setSaving(true);
            const cmsData = {
                heroTitle: landingForm.heroTitle,
                heroDescription: landingForm.heroDescription,
                ctaTitle: landingForm.ctaTitle,
                ctaDescription: landingForm.ctaDescription,
                appStoreLink: landingForm.appStoreLink,
                googlePlayLink: landingForm.googlePlayLink,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('memorybox_cms', JSON.stringify(cmsData));
            
            // Refresh the data
            loadLandingPageData();
            
            alert('Landing page content updated successfully! Changes will appear on the landing page immediately.');
        } catch (error) {
            console.error('Error saving landing page content:', error);
            alert('Error saving content. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Export landing page data
    const exportLandingPageData = () => {
        const dataStr = JSON.stringify(landingPageData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `memory-box-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    // Open landing page in new tab
    const openLandingPage = () => {
        // Try to open the landing page - adjust URL as needed
        window.open('/../../landing-page/index.html', '_blank');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <AdminLayout title="Content Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                        <p className="text-gray-600">Manage landing page content and user data</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={loadLandingPageData}
                            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </button>
                        <button
                            onClick={exportLandingPageData}
                            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                        </button>
                        <button
                            onClick={openLandingPage}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Landing Page
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'landing', name: 'Landing Page Editor', icon: Globe },
                            { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                            { id: 'users', name: 'User Management', icon: Users }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
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

                {/* Content */}
                {activeTab === 'landing' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Landing Page Content</h2>
                                <button
                                    onClick={saveLandingPageContent}
                                    disabled={saving}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Hero Section */}
                                <div>
                                    <h3 className="text-md font-semibold text-gray-900 mb-4">Hero Section</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Hero Title
                                            </label>
                                            <input
                                                type="text"
                                                value={landingForm.heroTitle}
                                                onChange={(e) => setLandingForm(prev => ({ ...prev, heroTitle: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter hero title"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Hero Description
                                            </label>
                                            <textarea
                                                value={landingForm.heroDescription}
                                                onChange={(e) => setLandingForm(prev => ({ ...prev, heroDescription: e.target.value }))}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter hero description"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Section */}
                                <div>
                                    <h3 className="text-md font-semibold text-gray-900 mb-4">Call to Action Section</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CTA Title
                                            </label>
                                            <input
                                                type="text"
                                                value={landingForm.ctaTitle}
                                                onChange={(e) => setLandingForm(prev => ({ ...prev, ctaTitle: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter CTA title"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CTA Description
                                            </label>
                                            <textarea
                                                value={landingForm.ctaDescription}
                                                onChange={(e) => setLandingForm(prev => ({ ...prev, ctaDescription: e.target.value }))}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter CTA description"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Download Links Section */}
                                <div>
                                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                                        <Download className="w-4 h-4 inline mr-2" />
                                        App Download Links
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                🍎 App Store URL
                                            </label>
                                            <input
                                                type="url"
                                                value={landingForm.appStoreLink}
                                                onChange={(e) => setLandingForm(prev => ({ ...prev, appStoreLink: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="https://apps.apple.com/app/memory-box/id123456789"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Enter the App Store URL where users can download your iOS app
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                🤖 Google Play URL
                                            </label>
                                            <input
                                                type="url"
                                                value={landingForm.googlePlayLink}
                                                onChange={(e) => setLandingForm(prev => ({ ...prev, googlePlayLink: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="https://play.google.com/store/apps/details?id=com.memorybox.app"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Enter the Google Play URL where users can download your Android app
                                            </p>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-medium text-blue-900 mb-2">📱 Download Link Status</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center">
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${landingForm.appStoreLink ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                    App Store: {landingForm.appStoreLink ? 'Configured' : 'Not set'}
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${landingForm.googlePlayLink ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                    Google Play: {landingForm.googlePlayLink ? 'Configured' : 'Not set'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="border-t pt-6">
                                    <h3 className="text-md font-semibold text-gray-900 mb-4">Preview</h3>
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <div className="text-center mb-8">
                                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{landingForm.heroTitle}</h1>
                                            <p className="text-lg text-gray-600">{landingForm.heroDescription}</p>
                                        </div>
                                        <div className="bg-blue-600 text-white p-6 rounded-lg text-center mb-6">
                                            <h2 className="text-2xl font-bold mb-2">{landingForm.ctaTitle}</h2>
                                            <p className="text-blue-100">{landingForm.ctaDescription}</p>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Our App</h3>
                                            <div className="flex justify-center space-x-4">
                                                <div className={`px-4 py-2 rounded-lg border-2 ${landingForm.appStoreLink ? 'bg-black text-white border-black' : 'bg-gray-200 text-gray-500 border-gray-300'}`}>
                                                    🍎 App Store
                                                </div>
                                                <div className={`px-4 py-2 rounded-lg border-2 ${landingForm.googlePlayLink ? 'bg-green-600 text-white border-green-600' : 'bg-gray-200 text-gray-500 border-gray-300'}`}>
                                                    🤖 Google Play
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Eye className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Page Views</p>
                                        <p className="text-2xl font-bold text-gray-900">{landingPageData.analytics.pageViews}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Users className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Sign Ups</p>
                                        <p className="text-2xl font-bold text-gray-900">{landingPageData.analytics.signUps}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Download className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">App Downloads</p>
                                        <p className="text-2xl font-bold text-gray-900">{landingPageData.analytics.downloads}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {landingPageData.analytics.pageViews > 0 
                                                ? ((landingPageData.analytics.signUps / landingPageData.analytics.pageViews) * 100).toFixed(1)
                                                : 0
                                            }%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Download Analytics Breakdown */}
                        {landingPageData.downloads.length > 0 && (
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Analytics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600 mb-2">Platform Breakdown</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">🍎 App Store</span>
                                                <span className="text-sm font-semibold">
                                                    {landingPageData.downloads.filter(d => d.platform === 'app-store').length}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">🤖 Google Play</span>
                                                <span className="text-sm font-semibold">
                                                    {landingPageData.downloads.filter(d => d.platform === 'google-play').length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-600 mb-2">Recent Downloads</h4>
                                        <div className="space-y-1">
                                            {landingPageData.downloads.slice(-3).reverse().map((download, index) => (
                                                <div key={index} className="text-xs text-gray-500">
                                                    {download.platform === 'app-store' ? '🍎' : '🤖'} {formatDate(download.timestamp)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {landingPageData.cms.lastUpdated && (
                            <div className="bg-white p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Last Content Update</h3>
                                <p className="text-gray-600">{formatDate(landingPageData.cms.lastUpdated)}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">User Sign-ups</h3>
                                <p className="text-sm text-gray-600">Users who signed up through the landing page</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {landingPageData.users.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    No users have signed up yet
                                                </td>
                                            </tr>
                                        ) : (
                                            landingPageData.users.map((user, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {user.fullName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.source}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(user.timestamp)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CmsPage;
