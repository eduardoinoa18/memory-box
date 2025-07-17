import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { 
    Activity, 
    Users, 
    Clock,
    Eye,
    MousePointer,
    Smartphone,
    Monitor,
    Tablet,
    Globe,
    TrendingUp,
    TrendingDown,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Download,
    Filter,
    Calendar,
    BarChart3,
    PieChart,
    Target,
    Navigation,
    Heart,
    Share,
    MessageSquare,
    Star,
    Camera,
    PlayCircle,
    FileText,
    Settings,
    Search,
    Bell,
    User,
    Home,
    Image,
    Video,
    Music,
    BookOpen,
    MapPin,
    Zap,
    Coffee,
    Sunrise,
    Sun,
    Moon,
    CloudRain
} from 'lucide-react';

const BehaviorPage = () => {
    const { stats, loading: statsLoading } = useDashboardStats();
    const [selectedPeriod, setSelectedPeriod] = useState('weekly');
    const [selectedBehavior, setSelectedBehavior] = useState('engagement');
    const [behaviorData, setBehaviorData] = useState({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Mock comprehensive behavior data
        const mockBehaviorData = {
            overview: {
                activeUsers: 18945,
                avgSessionDuration: 8.5,
                bounceRate: 12.3,
                pageViews: 89420,
                engagementRate: 76.8,
                returnVisitors: 64.2
            },
            userJourney: [
                { step: 'Landing', users: 18945, dropoff: 0, conversionRate: 100 },
                { step: 'Registration', users: 15234, dropoff: 19.6, conversionRate: 80.4 },
                { step: 'First Memory', users: 12890, dropoff: 15.4, conversionRate: 68.0 },
                { step: 'Timeline View', users: 11567, dropoff: 10.3, conversionRate: 61.0 },
                { step: 'Premium Upgrade', users: 2890, dropoff: 75.0, conversionRate: 15.3 },
                { step: 'Active User', users: 8934, dropoff: 22.8, conversionRate: 47.1 }
            ],
            deviceUsage: [
                { device: 'Mobile', users: 12340, percentage: 65.1, avgSession: 6.2, engagement: 72.4 },
                { device: 'Desktop', users: 4890, percentage: 25.8, avgSession: 12.8, engagement: 84.2 },
                { device: 'Tablet', users: 1715, percentage: 9.1, avgSession: 9.4, engagement: 78.6 }
            ],
            topFeatures: [
                { feature: 'Timeline View', usage: 89.2, satisfaction: 4.6, icon: Clock },
                { feature: 'Photo Upload', usage: 76.8, satisfaction: 4.4, icon: Camera },
                { feature: 'AI Letters', usage: 45.3, satisfaction: 4.8, icon: FileText },
                { feature: 'Memory Search', usage: 38.7, satisfaction: 4.2, icon: Search },
                { feature: 'Sharing', usage: 34.9, satisfaction: 4.0, icon: Share },
                { feature: 'Video Memories', usage: 28.4, satisfaction: 4.7, icon: Video },
                { feature: 'Memory Categories', usage: 24.1, satisfaction: 4.1, icon: BookOpen },
                { feature: 'Location Tagging', usage: 19.6, satisfaction: 3.9, icon: MapPin }
            ],
            userSegments: [
                { 
                    segment: 'Power Users', 
                    percentage: 15.2, 
                    users: 2890, 
                    behavior: 'Daily active, high engagement, premium features',
                    avgSession: 18.4,
                    retention: 94.5,
                    revenue: 145.20
                },
                { 
                    segment: 'Regular Users', 
                    percentage: 38.7, 
                    users: 7340, 
                    behavior: 'Weekly active, moderate engagement, core features',
                    avgSession: 8.6,
                    retention: 76.3,
                    revenue: 24.50
                },
                { 
                    segment: 'Casual Users', 
                    percentage: 31.4, 
                    users: 5950, 
                    behavior: 'Monthly active, basic features, occasional visits',
                    avgSession: 4.2,
                    retention: 45.8,
                    revenue: 0
                },
                { 
                    segment: 'New Users', 
                    percentage: 14.7, 
                    users: 2765, 
                    behavior: 'Recent signup, exploring features, onboarding',
                    avgSession: 6.8,
                    retention: 32.1,
                    revenue: 0
                }
            ],
            timePatterns: {
                hourly: Array.from({ length: 24 }, (_, i) => ({
                    hour: i,
                    activity: Math.sin((i - 6) * Math.PI / 12) * 30 + 50 + Math.random() * 10,
                    label: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
                })),
                daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
                    day,
                    activity: Math.random() * 30 + 70,
                    engagement: Math.random() * 20 + 70
                }))
            },
            contentInteraction: [
                { type: 'Photos', interactions: 45230, avgTime: 3.2, engagement: 85.4 },
                { type: 'Videos', interactions: 12890, avgTime: 8.7, engagement: 92.1 },
                { type: 'Text Memories', interactions: 38470, avgTime: 2.1, engagement: 71.3 },
                { type: 'Audio Recordings', interactions: 5670, avgTime: 4.5, engagement: 88.9 },
                { type: 'Timeline Events', interactions: 67890, avgTime: 1.8, engagement: 79.6 }
            ],
            behaviorFlows: [
                { from: 'Homepage', to: 'Timeline', users: 8934, percentage: 47.1 },
                { from: 'Timeline', to: 'Add Memory', users: 6780, percentage: 35.8 },
                { from: 'Add Memory', to: 'Photo Upload', users: 5234, percentage: 27.6 },
                { from: 'Photo Upload', to: 'Share', users: 2890, percentage: 15.3 },
                { from: 'Timeline', to: 'Memory Details', users: 7650, percentage: 40.4 },
                { from: 'Memory Details', to: 'Comments', users: 3456, percentage: 18.2 }
            ]
        };

        setBehaviorData(mockBehaviorData);
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

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes.toFixed(1)}m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    const getDeviceIcon = (device) => {
        switch (device.toLowerCase()) {
            case 'mobile': return Smartphone;
            case 'desktop': return Monitor;
            case 'tablet': return Tablet;
            default: return Monitor;
        }
    };

    const getTimeIcon = (hour) => {
        if (hour >= 6 && hour < 12) return Sunrise;
        if (hour >= 12 && hour < 18) return Sun;
        if (hour >= 18 && hour < 22) return CloudRain;
        return Moon;
    };

    const behaviorKPIs = [
        {
            title: 'Active Users',
            value: behaviorData.overview?.activeUsers?.toLocaleString() || '0',
            change: 12.5,
            icon: Users,
            color: 'blue',
            description: 'Daily active users'
        },
        {
            title: 'Avg Session',
            value: formatDuration(behaviorData.overview?.avgSessionDuration || 0),
            change: 8.3,
            icon: Clock,
            color: 'green',
            description: 'Average session duration'
        },
        {
            title: 'Engagement Rate',
            value: `${behaviorData.overview?.engagementRate || 0}%`,
            change: 5.7,
            icon: Heart,
            color: 'purple',
            description: 'User engagement rate'
        },
        {
            title: 'Bounce Rate',
            value: `${behaviorData.overview?.bounceRate || 0}%`,
            change: -2.1,
            icon: Target,
            color: 'red',
            description: 'Session bounce rate'
        },
        {
            title: 'Page Views',
            value: behaviorData.overview?.pageViews?.toLocaleString() || '0',
            change: 15.8,
            icon: Eye,
            color: 'indigo',
            description: 'Total page views'
        },
        {
            title: 'Return Rate',
            value: `${behaviorData.overview?.returnVisitors || 0}%`,
            change: 7.2,
            icon: RefreshCw,
            color: 'orange',
            description: 'Returning visitors'
        }
    ];

    if (statsLoading) {
        return (
            <AdminLayout title="User Behavior">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="User Behavior">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Behavior Analytics</h1>
                        <p className="text-gray-600">Understanding how users interact with Memory Box</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                        </select>
                        <select
                            value={selectedBehavior}
                            onChange={(e) => setSelectedBehavior(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="engagement">Engagement</option>
                            <option value="navigation">Navigation</option>
                            <option value="conversion">Conversion</option>
                            <option value="retention">Retention</option>
                        </select>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <RefreshCw size={16} />
                            <span>Refresh</span>
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                            <Download size={16} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* Behavior KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {behaviorKPIs.map((kpi, index) => {
                        const Icon = kpi.icon;
                        const colorClasses = {
                            blue: 'bg-blue-100 text-blue-600',
                            green: 'bg-green-100 text-green-600',
                            purple: 'bg-purple-100 text-purple-600',
                            red: 'bg-red-100 text-red-600',
                            indigo: 'bg-indigo-100 text-indigo-600',
                            orange: 'bg-orange-100 text-orange-600'
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

                {/* User Journey Funnel */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">User Journey Funnel</h2>
                    <div className="space-y-4">
                        {behaviorData.userJourney?.map((step, index) => {
                            const width = (step.users / behaviorData.userJourney[0].users) * 100;
                            return (
                                <div key={index} className="flex items-center">
                                    <div className="w-32 text-sm font-medium text-gray-900">
                                        {step.step}
                                    </div>
                                    <div className="flex-1 mx-4">
                                        <div className="bg-gray-200 rounded-full h-8 relative">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                                style={{ width: `${width}%` }}
                                            >
                                                {step.users.toLocaleString()}
                                            </div>
                                            {index > 0 && (
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-red-600 font-medium">
                                                    -{step.dropoff}%
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-20 text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                            {step.conversionRate}%
                                        </div>
                                        <div className="text-xs text-gray-500">conversion</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Device Usage and User Segments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Device Usage */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Device Usage</h2>
                        <div className="space-y-4">
                            {behaviorData.deviceUsage?.map((device, index) => {
                                const Icon = getDeviceIcon(device.device);
                                return (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <Icon size={20} className="text-gray-600 mr-3" />
                                                <span className="font-medium text-gray-900">{device.device}</span>
                                            </div>
                                            <span className="text-sm font-medium text-blue-600">
                                                {device.percentage}%
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-600">Users</div>
                                                <div className="font-medium">{device.users.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-600">Avg Session</div>
                                                <div className="font-medium">{formatDuration(device.avgSession)}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-600">Engagement</div>
                                                <div className="font-medium">{device.engagement}%</div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${device.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* User Segments */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">User Segments</h2>
                        <div className="space-y-4">
                            {behaviorData.userSegments?.map((segment, index) => {
                                const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-purple-100 text-purple-800'];
                                return (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900">{segment.segment}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[index]}`}>
                                                {segment.percentage}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3">{segment.behavior}</p>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <div className="text-gray-500">Users</div>
                                                <div className="font-medium">{segment.users.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Avg Session</div>
                                                <div className="font-medium">{formatDuration(segment.avgSession)}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Retention</div>
                                                <div className="font-medium">{segment.retention}%</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Revenue</div>
                                                <div className="font-medium">${segment.revenue}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Top Features Usage */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Feature Usage & Satisfaction</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {behaviorData.topFeatures?.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <Icon size={20} className="text-blue-600 mr-2" />
                                        <span className="font-medium text-gray-900 text-sm">{feature.feature}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-600">Usage</span>
                                                <span className="font-medium">{feature.usage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div 
                                                    className="bg-blue-500 h-1.5 rounded-full"
                                                    style={{ width: `${feature.usage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">Satisfaction</span>
                                            <div className="flex items-center">
                                                <Star size={12} className="text-yellow-500 mr-1" />
                                                <span className="text-xs font-medium">{feature.satisfaction}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Activity Patterns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Hourly Activity */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Hourly Activity Pattern</h2>
                        <div className="space-y-2">
                            {behaviorData.timePatterns?.hourly?.map((hour, index) => {
                                const TimeIcon = getTimeIcon(hour.hour);
                                return (
                                    <div key={index} className="flex items-center">
                                        <div className="w-16 flex items-center">
                                            <TimeIcon size={14} className="text-gray-500 mr-1" />
                                            <span className="text-xs text-gray-600">{hour.label}</span>
                                        </div>
                                        <div className="flex-1 mx-3">
                                            <div className="bg-gray-200 rounded-full h-3">
                                                <div 
                                                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                                                    style={{ width: `${hour.activity}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="w-12 text-xs text-gray-600 text-right">
                                            {Math.round(hour.activity)}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Interaction */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Content Interaction</h2>
                        <div className="space-y-4">
                            {behaviorData.contentInteraction?.map((content, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                        <span className="text-sm font-medium text-gray-900">{content.type}</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm">
                                        <div className="text-center">
                                            <div className="font-medium text-gray-900">{content.interactions.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">interactions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-medium text-gray-900">{formatDuration(content.avgTime)}</div>
                                            <div className="text-xs text-gray-500">avg time</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-medium text-gray-900">{content.engagement}%</div>
                                            <div className="text-xs text-gray-500">engagement</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Behavior Insights Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Behavior Insights</h3>
                            <p className="text-sm text-gray-600">Key findings from user behavior analysis</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-4">
                            <strong>Peak Usage:</strong> Users are most active during {behaviorData.timePatterns?.hourly?.reduce((peak, hour) => hour.activity > peak.activity ? hour : peak, {activity: 0, label: 'N/A'}).label} with {Math.round(behaviorData.overview?.engagementRate || 0)}% engagement rate.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Device Preference:</strong> {((behaviorData.deviceUsage?.[0]?.percentage || 0) > 50) ? 'Mobile-first' : 'Multi-device'} users with {formatDuration(behaviorData.overview?.avgSessionDuration || 0)} average sessions.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Feature Adoption:</strong> Timeline and photo features show highest usage at {behaviorData.topFeatures?.[0]?.usage || 0}% with {behaviorData.topFeatures?.[0]?.satisfaction || 0}/5 satisfaction.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default BehaviorPage;
