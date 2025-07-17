import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { 
    Plug,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Settings,
    Plus,
    Edit,
    Trash2,
    Eye,
    RefreshCw,
    Search,
    Filter,
    Key,
    Link,
    Unlink,
    Globe,
    Database,
    Cloud,
    Mail,
    MessageSquare,
    Bell,
    CreditCard,
    Camera,
    Bot,
    BarChart3,
    Shield,
    Lock,
    Unlock,
    Server,
    Smartphone,
    Monitor,
    Users,
    FileText,
    Image,
    Video,
    Music,
    Download,
    Upload,
    Archive,
    Code,
    Zap,
    Activity,
    TrendingUp,
    TrendingDown,
    ArrowUp,
    ArrowDown,
    Target,
    Timer,
    Gauge,
    Cpu,
    HardDrive,
    Network,
    Wifi,
    WifiOff,
    Power,
    PowerOff,
    Play,
    Pause,
    Square,
    RotateCcw,
    Calendar,
    MapPin,
    Phone,
    Headphones,
    Mic,
    Speaker,
    Volume2,
    VolumeX,
    Bookmark,
    Tag,
    Flag,
    Star,
    Heart,
    ThumbsUp,
    ThumbsDown,
    Share,
    Copy,
    Move,
    Folder,
    FolderOpen,
    File,
    FileCheck,
    FilePlus,
    FileX,
    Layers,
    Package,
    Box,
    Gift,
    ShoppingCart,
    DollarSign,
    PieChart,
    LineChart,
    AreaChart
} from 'lucide-react';

const IntegrationsPage = () => {
    const { stats, loading: statsLoading } = useDashboardStats();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [integrationsData, setIntegrationsData] = useState({});
    const [activeConnections, setActiveConnections] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Mock comprehensive integrations data
        const mockIntegrationsData = {
            overview: {
                totalIntegrations: 42,
                activeIntegrations: 35,
                pendingIntegrations: 4,
                failedIntegrations: 3,
                apiCallsToday: 15847,
                successRate: 96.7,
                avgResponseTime: 1.8,
                dataTransferred: 2.4
            },
            integrations: [
                {
                    id: 1,
                    name: 'SendGrid',
                    description: 'Email delivery and marketing automation platform',
                    category: 'email',
                    status: 'connected',
                    type: 'api',
                    version: '3.2.1',
                    apiCalls: 3245,
                    successRate: 99.2,
                    lastSync: '2 min ago',
                    uptime: 99.8,
                    dataTransferred: 145.6,
                    cost: 89.50,
                    configuredBy: 'Sarah Wilson',
                    configuredDate: '2024-01-15',
                    endpoints: ['send-email', 'templates', 'analytics'],
                    features: ['Email Sending', 'Templates', 'Analytics', 'Webhooks'],
                    documentation: 'https://docs.sendgrid.com',
                    supportLevel: 'premium'
                },
                {
                    id: 2,
                    name: 'OpenAI',
                    description: 'AI and machine learning API for content generation',
                    category: 'ai',
                    status: 'connected',
                    type: 'api',
                    version: '4.0',
                    apiCalls: 1876,
                    successRate: 94.5,
                    lastSync: '5 min ago',
                    uptime: 97.3,
                    dataTransferred: 89.3,
                    cost: 234.75,
                    configuredBy: 'Mike Johnson',
                    configuredDate: '2024-02-01',
                    endpoints: ['completions', 'embeddings', 'moderation'],
                    features: ['Text Generation', 'Embeddings', 'Moderation', 'Fine-tuning'],
                    documentation: 'https://platform.openai.com/docs',
                    supportLevel: 'enterprise'
                },
                {
                    id: 3,
                    name: 'AWS S3',
                    description: 'Cloud storage service for files and media',
                    category: 'storage',
                    status: 'connected',
                    type: 'cloud',
                    version: '2.1.4',
                    apiCalls: 5623,
                    successRate: 99.9,
                    lastSync: '1 min ago',
                    uptime: 99.9,
                    dataTransferred: 1.2,
                    cost: 45.20,
                    configuredBy: 'Alex Chen',
                    configuredDate: '2023-12-10',
                    endpoints: ['upload', 'download', 'delete', 'list'],
                    features: ['File Storage', 'CDN', 'Versioning', 'Encryption'],
                    documentation: 'https://docs.aws.amazon.com/s3',
                    supportLevel: 'standard'
                },
                {
                    id: 4,
                    name: 'Stripe',
                    description: 'Payment processing and subscription management',
                    category: 'payment',
                    status: 'connected',
                    type: 'api',
                    version: '2023-10-16',
                    apiCalls: 892,
                    successRate: 98.7,
                    lastSync: '8 min ago',
                    uptime: 99.5,
                    dataTransferred: 23.4,
                    cost: 156.80,
                    configuredBy: 'Emma Davis',
                    configuredDate: '2024-01-20',
                    endpoints: ['payments', 'subscriptions', 'customers', 'webhooks'],
                    features: ['Payments', 'Subscriptions', 'Invoicing', 'Analytics'],
                    documentation: 'https://stripe.com/docs',
                    supportLevel: 'premium'
                },
                {
                    id: 5,
                    name: 'Twilio',
                    description: 'SMS and voice communication services',
                    category: 'communication',
                    status: 'disconnected',
                    type: 'api',
                    version: '2.4.1',
                    apiCalls: 0,
                    successRate: 0,
                    lastSync: '2 days ago',
                    uptime: 0,
                    dataTransferred: 0,
                    cost: 0,
                    configuredBy: 'David Kim',
                    configuredDate: '2024-01-05',
                    endpoints: ['sms', 'voice', 'verify'],
                    features: ['SMS', 'Voice Calls', 'Verification', 'Conferences'],
                    documentation: 'https://www.twilio.com/docs',
                    supportLevel: 'standard'
                },
                {
                    id: 6,
                    name: 'Slack',
                    description: 'Team communication and notification platform',
                    category: 'communication',
                    status: 'connected',
                    type: 'webhook',
                    version: '1.8.0',
                    apiCalls: 245,
                    successRate: 96.3,
                    lastSync: '15 min ago',
                    uptime: 98.2,
                    dataTransferred: 12.8,
                    cost: 0,
                    configuredBy: 'Lisa Brown',
                    configuredDate: '2024-02-15',
                    endpoints: ['messages', 'channels', 'users'],
                    features: ['Messaging', 'Channels', 'Notifications', 'Bots'],
                    documentation: 'https://api.slack.com',
                    supportLevel: 'community'
                },
                {
                    id: 7,
                    name: 'Google Analytics',
                    description: 'Web analytics and user behavior tracking',
                    category: 'analytics',
                    status: 'pending',
                    type: 'oauth',
                    version: '4.0',
                    apiCalls: 0,
                    successRate: 0,
                    lastSync: 'Never',
                    uptime: 0,
                    dataTransferred: 0,
                    cost: 0,
                    configuredBy: 'Tom Wilson',
                    configuredDate: '2024-07-10',
                    endpoints: ['reports', 'realtime', 'events'],
                    features: ['Reports', 'Real-time', 'Events', 'Audiences'],
                    documentation: 'https://developers.google.com/analytics',
                    supportLevel: 'standard'
                },
                {
                    id: 8,
                    name: 'Firebase',
                    description: 'Backend services and real-time database',
                    category: 'database',
                    status: 'connected',
                    type: 'sdk',
                    version: '9.23.0',
                    apiCalls: 4567,
                    successRate: 97.8,
                    lastSync: '3 min ago',
                    uptime: 99.1,
                    dataTransferred: 234.5,
                    cost: 67.30,
                    configuredBy: 'System',
                    configuredDate: '2023-11-15',
                    endpoints: ['firestore', 'auth', 'storage', 'functions'],
                    features: ['Database', 'Authentication', 'Storage', 'Functions'],
                    documentation: 'https://firebase.google.com/docs',
                    supportLevel: 'enterprise'
                },
                {
                    id: 9,
                    name: 'Zapier',
                    description: 'Workflow automation and app integrations',
                    category: 'automation',
                    status: 'failed',
                    type: 'webhook',
                    version: '2.1.0',
                    apiCalls: 0,
                    successRate: 0,
                    lastSync: '1 day ago',
                    uptime: 0,
                    dataTransferred: 0,
                    cost: 29.99,
                    configuredBy: 'Sarah Wilson',
                    configuredDate: '2024-03-01',
                    endpoints: ['triggers', 'actions', 'webhooks'],
                    features: ['Automation', 'Triggers', 'Actions', 'Workflows'],
                    documentation: 'https://zapier.com/developer',
                    supportLevel: 'premium'
                },
                {
                    id: 10,
                    name: 'Cloudinary',
                    description: 'Image and video management in the cloud',
                    category: 'media',
                    status: 'connected',
                    type: 'api',
                    version: '1.36.0',
                    apiCalls: 1234,
                    successRate: 98.1,
                    lastSync: '7 min ago',
                    uptime: 99.6,
                    dataTransferred: 456.7,
                    cost: 78.90,
                    configuredBy: 'Alex Chen',
                    configuredDate: '2024-01-25',
                    endpoints: ['upload', 'transform', 'deliver'],
                    features: ['Upload', 'Transformation', 'Optimization', 'CDN'],
                    documentation: 'https://cloudinary.com/documentation',
                    supportLevel: 'premium'
                }
            ],
            categories: [
                { name: 'email', label: 'Email', count: 1, icon: Mail },
                { name: 'ai', label: 'AI & ML', count: 1, icon: Bot },
                { name: 'storage', label: 'Storage', count: 1, icon: Database },
                { name: 'payment', label: 'Payment', count: 1, icon: CreditCard },
                { name: 'communication', label: 'Communication', count: 2, icon: MessageSquare },
                { name: 'analytics', label: 'Analytics', count: 1, icon: BarChart3 },
                { name: 'database', label: 'Database', count: 1, icon: Server },
                { name: 'automation', label: 'Automation', count: 1, icon: Zap },
                { name: 'media', label: 'Media', count: 1, icon: Image }
            ],
            usage: {
                totalApiCalls: 15847,
                totalDataTransferred: 2.4,
                totalCost: 789.44,
                topIntegration: 'AWS S3',
                peakHour: '14:00',
                averageLatency: 1.8
            },
            healthMetrics: {
                avgUptime: 96.8,
                avgSuccessRate: 94.2,
                avgResponseTime: 1.8,
                errorRate: 3.3,
                timeouts: 0.5,
                rateLimits: 0.2
            },
            recentActivity: [
                {
                    id: 1,
                    integration: 'AWS S3',
                    action: 'File Upload',
                    status: 'success',
                    timestamp: '2 min ago',
                    user: 'john.doe@email.com',
                    details: 'Uploaded profile image (2.3MB)'
                },
                {
                    id: 2,
                    integration: 'SendGrid',
                    action: 'Email Sent',
                    status: 'success',
                    timestamp: '3 min ago',
                    user: 'system',
                    details: 'Welcome email to new user'
                },
                {
                    id: 3,
                    integration: 'OpenAI',
                    action: 'Text Generation',
                    status: 'success',
                    timestamp: '5 min ago',
                    user: 'jane.smith@email.com',
                    details: 'Generated personalized letter'
                },
                {
                    id: 4,
                    integration: 'Stripe',
                    action: 'Payment Processed',
                    status: 'success',
                    timestamp: '8 min ago',
                    user: 'mike.wilson@email.com',
                    details: 'Premium subscription payment'
                },
                {
                    id: 5,
                    integration: 'Zapier',
                    action: 'Webhook Failed',
                    status: 'failed',
                    timestamp: '12 min ago',
                    user: 'system',
                    details: 'Connection timeout error'
                }
            ]
        };

        setIntegrationsData(mockIntegrationsData);
        setActiveConnections([
            { id: 1, name: 'AWS S3', requests: 45, latency: 120 },
            { id: 2, name: 'SendGrid', requests: 23, latency: 180 },
            { id: 3, name: 'OpenAI', requests: 12, latency: 2400 }
        ]);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'connected': return <CheckCircle className="text-green-500" size={16} />;
            case 'disconnected': return <XCircle className="text-red-500" size={16} />;
            case 'pending': return <Clock className="text-yellow-500" size={16} />;
            case 'failed': return <AlertCircle className="text-red-500" size={16} />;
            case 'success': return <CheckCircle className="text-green-500" size={16} />;
            default: return <Clock className="text-gray-500" size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'connected': return 'bg-green-100 text-green-800';
            case 'disconnected': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'success': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category) => {
        const categoryData = integrationsData.categories?.find(c => c.name === category);
        return categoryData?.icon || Plug;
    };

    const getCategoryColor = (category) => {
        const colors = {
            email: 'bg-blue-100 text-blue-800',
            ai: 'bg-purple-100 text-purple-800',
            storage: 'bg-green-100 text-green-800',
            payment: 'bg-orange-100 text-orange-800',
            communication: 'bg-indigo-100 text-indigo-800',
            analytics: 'bg-pink-100 text-pink-800',
            database: 'bg-gray-100 text-gray-800',
            automation: 'bg-yellow-100 text-yellow-800',
            media: 'bg-red-100 text-red-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'api': return <Globe size={16} />;
            case 'webhook': return <Zap size={16} />;
            case 'oauth': return <Shield size={16} />;
            case 'sdk': return <Code size={16} />;
            case 'cloud': return <Cloud size={16} />;
            default: return <Plug size={16} />;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDataSize = (gb) => {
        if (gb >= 1) return `${gb.toFixed(1)} GB`;
        return `${(gb * 1024).toFixed(0)} MB`;
    };

    const filteredIntegrations = integrationsData.integrations?.filter(integration => {
        const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || integration.status === selectedStatus;
        const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             integration.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesStatus && matchesSearch;
    }) || [];

    const integrationKPIs = [
        {
            title: 'Total Integrations',
            value: integrationsData.overview?.totalIntegrations?.toLocaleString() || '0',
            change: 15.8,
            icon: Plug,
            color: 'blue',
            description: 'Connected services'
        },
        {
            title: 'Active Connections',
            value: integrationsData.overview?.activeIntegrations?.toLocaleString() || '0',
            change: 8.3,
            icon: CheckCircle,
            color: 'green',
            description: 'Working integrations'
        },
        {
            title: 'API Calls Today',
            value: integrationsData.overview?.apiCallsToday?.toLocaleString() || '0',
            change: 23.7,
            icon: Activity,
            color: 'purple',
            description: 'Total API requests'
        },
        {
            title: 'Success Rate',
            value: `${integrationsData.overview?.successRate || 0}%`,
            change: 2.1,
            icon: Target,
            color: 'indigo',
            description: 'API call success rate'
        },
        {
            title: 'Avg Response Time',
            value: `${integrationsData.overview?.avgResponseTime || 0}s`,
            change: -12.4,
            icon: Timer,
            color: 'orange',
            description: 'Average API latency'
        },
        {
            title: 'Data Transferred',
            value: formatDataSize(integrationsData.overview?.dataTransferred || 0),
            change: 45.2,
            icon: Network,
            color: 'red',
            description: 'Total data usage'
        }
    ];

    const getChangeIcon = (change) => {
        if (change > 0) return <ArrowUp size={16} className="text-green-600" />;
        if (change < 0) return <ArrowDown size={16} className="text-red-600" />;
        return null;
    };

    const getChangeColor = (change) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    if (statsLoading) {
        return (
            <AdminLayout title="Integrations">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Integrations">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
                        <p className="text-gray-600">Manage third-party services and API connections</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search integrations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Categories</option>
                            {integrationsData.categories?.map((category) => (
                                <option key={category.name} value={category.name}>
                                    {category.label} ({category.count})
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="connected">Connected</option>
                            <option value="disconnected">Disconnected</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <Plus size={16} />
                            <span>Add Integration</span>
                        </button>
                        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
                            <RefreshCw size={16} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Integration KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrationKPIs.map((kpi, index) => {
                        const Icon = kpi.icon;
                        const colorClasses = {
                            blue: 'bg-blue-100 text-blue-600',
                            green: 'bg-green-100 text-green-600',
                            purple: 'bg-purple-100 text-purple-600',
                            indigo: 'bg-indigo-100 text-indigo-600',
                            orange: 'bg-orange-100 text-orange-600',
                            red: 'bg-red-100 text-red-600'
                        };
                        
                        return (
                            <div key={index} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${colorClasses[kpi.color]}`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    {getChangeIcon(kpi.change)}
                                    <span className={`ml-1 text-sm font-medium ${getChangeColor(kpi.change)}`}>
                                        {Math.abs(kpi.change)}% vs last period
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Active Connections */}
                {activeConnections.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Wifi className="mr-2 text-blue-600" size={20} />
                            Real-time Activity
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {activeConnections.map((connection) => (
                                <div key={connection.id} className="bg-white rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">{connection.name}</span>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                            <span className="text-xs text-green-600">Live</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div>Requests: {connection.requests}/min</div>
                                        <div>Latency: {connection.latency}ms</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Categories Overview */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Integration Categories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {integrationsData.categories?.map((category) => {
                            const Icon = category.icon;
                            return (
                                <div 
                                    key={category.name} 
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                        selectedCategory === category.name 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setSelectedCategory(category.name)}
                                >
                                    <div className="text-center">
                                        <Icon size={32} className={`mx-auto mb-2 ${
                                            selectedCategory === category.name ? 'text-blue-600' : 'text-gray-600'
                                        }`} />
                                        <div className="font-medium text-gray-900">{category.label}</div>
                                        <div className="text-sm text-gray-500">{category.count} integration{category.count !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Integrations List */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            All Integrations ({filteredIntegrations.length})
                        </h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                                Showing {filteredIntegrations.length} of {integrationsData.integrations?.length || 0}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {filteredIntegrations.map((integration) => {
                            const CategoryIcon = getCategoryIcon(integration.category);
                            return (
                                <div key={integration.id} className="border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <CategoryIcon size={24} className="text-blue-600 mr-3" />
                                            <div>
                                                <h3 className="font-medium text-gray-900 flex items-center">
                                                    {integration.name}
                                                    <span className="ml-2 text-xs text-gray-500">v{integration.version}</span>
                                                </h3>
                                                <p className="text-sm text-gray-500">{integration.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(integration.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                                                {integration.status}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(integration.category)}`}>
                                                {integration.category}
                                            </span>
                                            <div className="flex items-center text-gray-500">
                                                {getTypeIcon(integration.type)}
                                                <span className="ml-1 text-xs">{integration.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">API Calls</div>
                                            <div className="font-medium">{integration.apiCalls.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Success Rate</div>
                                            <div className="font-medium">{integration.successRate}%</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Uptime</div>
                                            <div className="font-medium">{integration.uptime}%</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Data Transfer</div>
                                            <div className="font-medium">{formatDataSize(integration.dataTransferred / 1000)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Monthly Cost</div>
                                            <div className="font-medium">{formatCurrency(integration.cost)}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Last Sync</div>
                                            <div className="font-medium">{integration.lastSync}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-4 text-sm">
                                            <div className="text-gray-600">
                                                Configured by: <span className="font-medium">{integration.configuredBy}</span>
                                            </div>
                                            <div className="text-gray-600">
                                                Date: <span className="font-medium">{integration.configuredDate}</span>
                                            </div>
                                            <div className="text-gray-600">
                                                Support: <span className="font-medium capitalize">{integration.supportLevel}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1">
                                            {integration.features?.slice(0, 3).map((feature, featureIndex) => (
                                                <span key={featureIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                    {feature}
                                                </span>
                                            ))}
                                            {integration.features?.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                    +{integration.features.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="text-blue-600 hover:text-blue-800" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button className="text-green-600 hover:text-green-800" title="Test Connection">
                                                <Zap size={16} />
                                            </button>
                                            <button className="text-purple-600 hover:text-purple-800" title="Configure">
                                                <Settings size={16} />
                                            </button>
                                            <button className="text-orange-600 hover:text-orange-800" title="Documentation">
                                                <FileText size={16} />
                                            </button>
                                            {integration.status === 'connected' ? (
                                                <button className="text-red-600 hover:text-red-800" title="Disconnect">
                                                    <Unlink size={16} />
                                                </button>
                                            ) : (
                                                <button className="text-green-600 hover:text-green-800" title="Connect">
                                                    <Link size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity & Health Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                        <div className="space-y-3">
                            {integrationsData.recentActivity?.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                    <div className="flex items-center">
                                        {getStatusIcon(activity.status)}
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {activity.integration} • {activity.action}
                                            </div>
                                            <div className="text-xs text-gray-500">{activity.details}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-900">{activity.user}</div>
                                        <div className="text-xs text-gray-500">{activity.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Health Metrics */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Health Metrics</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Activity size={20} className="text-green-600 mr-3" />
                                    <span className="text-sm font-medium">Average Uptime</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${integrationsData.healthMetrics?.avgUptime}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium w-12">{integrationsData.healthMetrics?.avgUptime}%</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Target size={20} className="text-blue-600 mr-3" />
                                    <span className="text-sm font-medium">Success Rate</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${integrationsData.healthMetrics?.avgSuccessRate}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium w-12">{integrationsData.healthMetrics?.avgSuccessRate}%</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Timer size={20} className="text-purple-600 mr-3" />
                                    <span className="text-sm font-medium">Response Time</span>
                                </div>
                                <span className="text-sm font-medium">{integrationsData.healthMetrics?.avgResponseTime}s</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <AlertCircle size={20} className="text-red-600 mr-3" />
                                    <span className="text-sm font-medium">Error Rate</span>
                                </div>
                                <span className="text-sm font-medium">{integrationsData.healthMetrics?.errorRate}%</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock size={20} className="text-orange-600 mr-3" />
                                    <span className="text-sm font-medium">Timeouts</span>
                                </div>
                                <span className="text-sm font-medium">{integrationsData.healthMetrics?.timeouts}%</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Shield size={20} className="text-yellow-600 mr-3" />
                                    <span className="text-sm font-medium">Rate Limits</span>
                                </div>
                                <span className="text-sm font-medium">{integrationsData.healthMetrics?.rateLimits}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integration Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Plug className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Integrations Overview</h3>
                            <p className="text-sm text-gray-600">Comprehensive integration platform status</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-4">
                            <strong>Platform Health:</strong> {integrationsData.overview?.activeIntegrations} active integrations with {integrationsData.overview?.successRate}% overall success rate and {integrationsData.overview?.avgResponseTime}s average response time.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Daily Usage:</strong> {integrationsData.overview?.apiCallsToday?.toLocaleString()} API calls processed today with {formatDataSize(integrationsData.overview?.dataTransferred || 0)} of data transferred.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Service Status:</strong> {integrationsData.overview?.totalIntegrations} total integrations across {integrationsData.categories?.length} categories with {integrationsData.overview?.failedIntegrations} requiring attention.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default IntegrationsPage;
