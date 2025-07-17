import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
    TrendingUp, 
    Search, 
    Eye, 
    Users, 
    Globe, 
    Target, 
    BarChart3, 
    PieChart,
    ArrowUp,
    ArrowDown,
    ExternalLink,
    RefreshCw,
    Calendar,
    MousePointer,
    Clock,
    Smartphone,
    Monitor,
    Tablet,
    MapPin,
    Link,
    FileText,
    Settings,
    AlertCircle,
    CheckCircle,
    XCircle,
    Star,
    Zap
} from 'lucide-react';

const SEOAnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState('30d');
    const [seoData, setSeoData] = useState({});
    const [analyticsData, setAnalyticsData] = useState({});

    useEffect(() => {
        // Mock data for demonstration
        const mockSEOData = {
            overview: {
                organicTraffic: { value: 45620, change: 12.5 },
                keywordRankings: { value: 1247, change: -2.3 },
                backlinks: { value: 8934, change: 18.7 },
                pageSpeed: { value: 87, change: 5.2 },
                seoScore: { value: 94, change: 3.1 }
            },
            keywords: [
                { keyword: 'memory box app', position: 3, volume: 8900, difficulty: 45, traffic: 2340 },
                { keyword: 'digital memory storage', position: 7, volume: 5600, difficulty: 62, traffic: 890 },
                { keyword: 'family photo sharing', position: 12, volume: 12000, difficulty: 58, traffic: 1200 },
                { keyword: 'AI letter writing', position: 5, volume: 3400, difficulty: 38, traffic: 560 },
                { keyword: 'memory timeline creator', position: 15, volume: 2100, difficulty: 42, traffic: 230 }
            ],
            pages: [
                { url: '/features', views: 15420, bounceRate: 32, avgTime: '2:45', conversions: 234 },
                { url: '/pricing', views: 12890, bounceRate: 28, avgTime: '3:12', conversions: 456 },
                { url: '/blog/memory-tips', views: 8940, bounceRate: 25, avgTime: '4:23', conversions: 89 },
                { url: '/about', views: 6720, bounceRate: 45, avgTime: '1:56', conversions: 23 },
                { url: '/contact', views: 4350, bounceRate: 52, avgTime: '1:23', conversions: 67 }
            ],
            technical: {
                coreWebVitals: {
                    lcp: { value: 1.8, status: 'good' },
                    fid: { value: 45, status: 'good' },
                    cls: { value: 0.09, status: 'needs-improvement' }
                },
                indexedPages: 247,
                crawlErrors: 3,
                mobileUsability: 98,
                httpsStatus: 100
            }
        };

        const mockAnalyticsData = {
            traffic: {
                sessions: { value: 89420, change: 15.7 },
                users: { value: 67890, change: 18.3 },
                pageviews: { value: 234560, change: 12.1 },
                bounceRate: { value: 34.2, change: -5.8 },
                avgSessionDuration: { value: '3:42', change: 8.9 }
            },
            sources: [
                { source: 'Organic Search', sessions: 38920, percentage: 43.5 },
                { source: 'Direct', sessions: 23450, percentage: 26.2 },
                { source: 'Social Media', sessions: 12340, percentage: 13.8 },
                { source: 'Referral', sessions: 8900, percentage: 10.0 },
                { source: 'Email', sessions: 5810, percentage: 6.5 }
            ],
            devices: [
                { device: 'Mobile', sessions: 49820, percentage: 55.7 },
                { device: 'Desktop', sessions: 28900, percentage: 32.3 },
                { device: 'Tablet', sessions: 10700, percentage: 12.0 }
            ],
            locations: [
                { country: 'United States', sessions: 34560, percentage: 38.7 },
                { country: 'Canada', sessions: 12890, percentage: 14.4 },
                { country: 'United Kingdom', sessions: 9870, percentage: 11.0 },
                { country: 'Australia', sessions: 7650, percentage: 8.6 },
                { country: 'Germany', sessions: 6540, percentage: 7.3 }
            ]
        };

        setSeoData(mockSEOData);
        setAnalyticsData(mockAnalyticsData);
        setLoading(false);
    }, []);

    const getChangeColor = (change) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getChangeIcon = (change) => {
        if (change > 0) return <ArrowUp size={16} className="text-green-600" />;
        if (change < 0) return <ArrowDown size={16} className="text-red-600" />;
        return null;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return 'text-green-600 bg-green-100';
            case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
            case 'poor': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: BarChart3 },
        { id: 'keywords', name: 'Keywords', icon: Search },
        { id: 'pages', name: 'Pages', icon: FileText },
        { id: 'technical', name: 'Technical SEO', icon: Settings },
        { id: 'analytics', name: 'Analytics', icon: TrendingUp }
    ];

    if (loading) {
        return (
            <AdminLayout title="SEO & Analytics">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="SEO & Analytics">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">SEO & Analytics</h1>
                        <p className="text-gray-600">Monitor your website performance and search visibility</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <RefreshCw size={16} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon size={16} className="mr-2" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* SEO Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Organic Traffic</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {seoData.overview?.organicTraffic?.value.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center">
                                    {getChangeIcon(seoData.overview?.organicTraffic?.change)}
                                    <span className={`ml-1 text-sm ${getChangeColor(seoData.overview?.organicTraffic?.change)}`}>
                                        {Math.abs(seoData.overview?.organicTraffic?.change)}%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Keywords</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {seoData.overview?.keywordRankings?.value.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Search className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center">
                                    {getChangeIcon(seoData.overview?.keywordRankings?.change)}
                                    <span className={`ml-1 text-sm ${getChangeColor(seoData.overview?.keywordRankings?.change)}`}>
                                        {Math.abs(seoData.overview?.keywordRankings?.change)}%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Backlinks</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {seoData.overview?.backlinks?.value.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <Link className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center">
                                    {getChangeIcon(seoData.overview?.backlinks?.change)}
                                    <span className={`ml-1 text-sm ${getChangeColor(seoData.overview?.backlinks?.change)}`}>
                                        {Math.abs(seoData.overview?.backlinks?.change)}%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Page Speed</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {seoData.overview?.pageSpeed?.value}
                                        </p>
                                    </div>
                                    <div className="bg-orange-100 p-3 rounded-lg">
                                        <Zap className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center">
                                    {getChangeIcon(seoData.overview?.pageSpeed?.change)}
                                    <span className={`ml-1 text-sm ${getChangeColor(seoData.overview?.pageSpeed?.change)}`}>
                                        {Math.abs(seoData.overview?.pageSpeed?.change)}%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">SEO Score</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {seoData.overview?.seoScore?.value}/100
                                        </p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <Star className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center">
                                    {getChangeIcon(seoData.overview?.seoScore?.change)}
                                    <span className={`ml-1 text-sm ${getChangeColor(seoData.overview?.seoScore?.change)}`}>
                                        {Math.abs(seoData.overview?.seoScore?.change)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Keywords Tab */}
                {activeTab === 'keywords' && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Keyword Rankings</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Keyword
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Position
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Search Volume
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Difficulty
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Traffic
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {seoData.keywords?.map((keyword, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {keyword.keyword}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    keyword.position <= 3 ? 'bg-green-100 text-green-800' :
                                                    keyword.position <= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    #{keyword.position}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {keyword.volume.toLocaleString()}/mo
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${
                                                                keyword.difficulty <= 30 ? 'bg-green-600' :
                                                                keyword.difficulty <= 60 ? 'bg-yellow-600' :
                                                                'bg-red-600'
                                                            }`}
                                                            style={{ width: `${keyword.difficulty}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{keyword.difficulty}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {keyword.traffic.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pages Tab */}
                {activeTab === 'pages' && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Top Performing Pages</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Page URL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Page Views
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Bounce Rate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg. Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Conversions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {seoData.pages?.map((page, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <ExternalLink className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">{page.url}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {page.views.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm ${page.bounceRate > 50 ? 'text-red-600' : page.bounceRate > 35 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {page.bounceRate}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {page.avgTime}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {page.conversions}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Technical SEO Tab */}
                {activeTab === 'technical' && (
                    <div className="space-y-6">
                        {/* Core Web Vitals */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Core Web Vitals</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(seoData.technical?.coreWebVitals?.lcp?.status)}`}>
                                        {seoData.technical?.coreWebVitals?.lcp?.status === 'good' && <CheckCircle size={16} className="mr-1" />}
                                        {seoData.technical?.coreWebVitals?.lcp?.status === 'needs-improvement' && <AlertCircle size={16} className="mr-1" />}
                                        {seoData.technical?.coreWebVitals?.lcp?.status === 'poor' && <XCircle size={16} className="mr-1" />}
                                        LCP: {seoData.technical?.coreWebVitals?.lcp?.value}s
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Largest Contentful Paint</p>
                                </div>
                                <div className="text-center">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(seoData.technical?.coreWebVitals?.fid?.status)}`}>
                                        {seoData.technical?.coreWebVitals?.fid?.status === 'good' && <CheckCircle size={16} className="mr-1" />}
                                        FID: {seoData.technical?.coreWebVitals?.fid?.value}ms
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">First Input Delay</p>
                                </div>
                                <div className="text-center">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(seoData.technical?.coreWebVitals?.cls?.status)}`}>
                                        {seoData.technical?.coreWebVitals?.cls?.status === 'needs-improvement' && <AlertCircle size={16} className="mr-1" />}
                                        CLS: {seoData.technical?.coreWebVitals?.cls?.value}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Cumulative Layout Shift</p>
                                </div>
                            </div>
                        </div>

                        {/* Technical Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Globe className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Indexed Pages</p>
                                        <p className="text-2xl font-bold text-gray-900">{seoData.technical?.indexedPages}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="bg-red-100 p-3 rounded-lg">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Crawl Errors</p>
                                        <p className="text-2xl font-bold text-gray-900">{seoData.technical?.crawlErrors}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <Smartphone className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Mobile Usability</p>
                                        <p className="text-2xl font-bold text-gray-900">{seoData.technical?.mobileUsability}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">HTTPS Status</p>
                                        <p className="text-2xl font-bold text-gray-900">{seoData.technical?.httpsStatus}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {/* Traffic Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Sessions</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {analyticsData.traffic?.sessions?.value.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center">
                                    {getChangeIcon(analyticsData.traffic?.sessions?.change)}
                                    <span className={`ml-1 text-sm ${getChangeColor(analyticsData.traffic?.sessions?.change)}`}>
                                        {Math.abs(analyticsData.traffic?.sessions?.change)}%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Users</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {analyticsData.traffic?.users?.value.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <Eye className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center">
                                    {getChangeIcon(analyticsData.traffic?.users?.change)}
                                    <span className={`ml-1 text-sm ${getChangeColor(analyticsData.traffic?.users?.change)}`}>
                                        {Math.abs(analyticsData.traffic?.users?.change)}%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Page Views</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {analyticsData.traffic?.pageviews?.value.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <MousePointer className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center">
                                    {getChangeIcon(analyticsData.traffic?.pageviews?.change)}
                                    <span className={`ml-1 text-sm ${getChangeColor(analyticsData.traffic?.pageviews?.change)}`}>
                                        {Math.abs(analyticsData.traffic?.pageviews?.change)}%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {analyticsData.traffic?.bounceRate?.value}%
                                        </p>
                                    </div>
                                    <div className="bg-orange-100 p-3 rounded-lg">
                                        <Target className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center">
                                    {getChangeIcon(analyticsData.traffic?.bounceRate?.change)}
                                    <span className={`ml-1 text-sm ${getChangeColor(analyticsData.traffic?.bounceRate?.change)}`}>
                                        {Math.abs(analyticsData.traffic?.bounceRate?.change)}%
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {analyticsData.traffic?.avgSessionDuration?.value}
                                        </p>
                                    </div>
                                    <div className="bg-indigo-100 p-3 rounded-lg">
                                        <Clock className="w-6 h-6 text-indigo-600" />
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center">
                                    {getChangeIcon(analyticsData.traffic?.avgSessionDuration?.change)}
                                    <span className={`ml-1 text-sm ${getChangeColor(analyticsData.traffic?.avgSessionDuration?.change)}`}>
                                        {Math.abs(analyticsData.traffic?.avgSessionDuration?.change)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sources, Devices, and Locations */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Traffic Sources */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Sources</h3>
                                <div className="space-y-3">
                                    {analyticsData.sources?.map((source, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                                                <span className="text-sm text-gray-700">{source.source}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {source.sessions.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {source.percentage}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Device Breakdown */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Device Breakdown</h3>
                                <div className="space-y-3">
                                    {analyticsData.devices?.map((device, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                {device.device === 'Mobile' && <Smartphone className="w-4 h-4 text-gray-500 mr-3" />}
                                                {device.device === 'Desktop' && <Monitor className="w-4 h-4 text-gray-500 mr-3" />}
                                                {device.device === 'Tablet' && <Tablet className="w-4 h-4 text-gray-500 mr-3" />}
                                                <span className="text-sm text-gray-700">{device.device}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {device.sessions.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {device.percentage}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Locations */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Locations</h3>
                                <div className="space-y-3">
                                    {analyticsData.locations?.map((location, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 text-gray-500 mr-3" />
                                                <span className="text-sm text-gray-700">{location.country}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {location.sessions.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {location.percentage}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default SEOAnalyticsPage;
