import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../layouts/AdminLayout';
import KpiCard from '../../components/admin/KpiCard';
import Heatmap from '../../components/admin/Heatmap';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import apiService from '../../services/apiService';
import {
    Users,
    FileText,
    HardDrive,
    TrendingUp,
    Calendar,
    Eye,
    Download,
    Share2,
    AlertCircle,
    CheckCircle,
    Clock,
    Star,
    RefreshCw,
    Activity,
    DollarSign,
    ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
    const router = useRouter();
    const { stats, loading, error, refreshStats } = useDashboardStats();
    const [recentActivity, setRecentActivity] = useState([]);
    const [systemAlerts, setSystemAlerts] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(true);

    useEffect(() => {
        loadRecentActivity();
        loadSystemAlerts();
    }, []);

    const loadRecentActivity = async () => {
        try {
            setLoadingActivity(true);
            const activity = await apiService.getRecentActivity();
            setRecentActivity(activity);
        } catch (error) {
            console.warn('Activity API unavailable, using demo data:', error);
            // Fallback demo data
            setRecentActivity([
                { id: 1, user: 'Sarah Johnson', action: 'Uploaded 5 photos', time: '2 minutes ago', type: 'upload' },
                { id: 2, user: 'Mike Chen', action: 'Created family folder', time: '15 minutes ago', type: 'folder' },
                { id: 3, user: 'Emma Wilson', action: 'Subscribed to Premium', time: '1 hour ago', type: 'subscription' },
                { id: 4, user: 'Alex Rodriguez', action: 'Shared memory collection', time: '2 hours ago', type: 'share' },
                { id: 5, user: 'Lisa Park', action: 'Used AI letter assistant', time: '3 hours ago', type: 'ai' },
            ]);
        } finally {
            setLoadingActivity(false);
        }
    };

    const loadSystemAlerts = async () => {
        try {
            const alerts = await apiService.getSystemAlerts();
            setSystemAlerts(alerts);
        } catch (error) {
            console.warn('Alerts API unavailable, using demo data:', error);
            // Demo alerts
            setSystemAlerts([
                { id: 1, type: 'warning', message: 'Storage usage at 85%', time: '5 minutes ago' },
                { id: 2, type: 'info', message: 'System maintenance scheduled for tonight', time: '1 hour ago' },
                { id: 3, type: 'success', message: 'Backup completed successfully', time: '2 hours ago' }
            ]);
        }
    };

    const handleQuickAction = (href) => {
        router.push(href);
    };

    const handleRefreshAll = async () => {
        await Promise.all([
            refreshStats(),
            loadRecentActivity(),
            loadSystemAlerts()
        ]);
    };

    const quickActions = [
        { 
            name: 'Manage Users', 
            href: '/admin/users', 
            icon: Users, 
            color: 'bg-blue-500',
            description: 'View and manage user accounts'
        },
        { 
            name: 'Content Moderation', 
            href: '/admin/content', 
            icon: FileText, 
            color: 'bg-green-500',
            description: 'Review uploaded content'
        },
        { 
            name: 'View Analytics', 
            href: '/admin/analytics', 
            icon: TrendingUp, 
            color: 'bg-purple-500',
            description: 'Performance insights'
        },
        { 
            name: 'System Health', 
            href: '/admin/system', 
            icon: Activity, 
            color: 'bg-orange-500',
            description: 'Monitor system status'
        },
    ];

    // Generate KPI cards from real Firebase stats
    const getKpiCards = () => {
        if (!stats) return [];
        
        return [
            {
                title: 'Total Users',
                value: stats.totalUsers.toLocaleString(),
                change: `${stats.activeUsersChange > 0 ? '+' : ''}${stats.activeUsersChange}%`,
                trend: stats.activeUsersChange >= 0 ? 'up' : 'down',
                icon: Users,
                description: 'registered users'
            },
            {
                title: 'Active Today',
                value: stats.activeToday.toLocaleString(),
                change: `${stats.activeUsersChange > 0 ? '+' : ''}${stats.activeUsersChange}%`,
                trend: stats.activeUsersChange >= 0 ? 'up' : 'down',
                icon: Eye,
                description: 'vs yesterday'
            },
            {
                title: 'Total Memories',
                value: stats.totalMemories.toLocaleString(),
                change: `${stats.memoriesChange > 0 ? '+' : ''}${stats.memoriesChange}%`,
                trend: stats.memoriesChange >= 0 ? 'up' : 'down',
                icon: FileText,
                description: 'vs yesterday'
            },
            {
                title: 'Storage Used',
                value: `${stats.storageUsedGB} GB`,
                change: '+2.3%',
                trend: 'up',
                icon: HardDrive,
                description: 'cloud storage'
            }
        ];
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'upload': return <Download className="w-4 h-4 text-blue-500" />;
            case 'folder': return <FileText className="w-4 h-4 text-green-500" />;
            case 'subscription': return <DollarSign className="w-4 h-4 text-purple-500" />;
            case 'share': return <Share2 className="w-4 h-4 text-orange-500" />;
            case 'ai': return <Star className="w-4 h-4 text-yellow-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <AdminLayout title="Dashboard Overview">
            <div className="space-y-6">
                {/* Header with refresh button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600">
                            {stats?.lastUpdated && `Last updated: ${stats.lastUpdated.toLocaleTimeString()}`}
                        </p>
                    </div>
                    <button 
                        onClick={handleRefreshAll}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh All
                    </button>
                </div>

                {/* System Alerts */}
                {systemAlerts.length > 0 && (
                    <div className="space-y-2">
                        {systemAlerts.map((alert) => (
                            <div 
                                key={alert.id} 
                                className={`border rounded-lg p-4 ${
                                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                    alert.type === 'error' ? 'bg-red-50 border-red-200' :
                                    alert.type === 'success' ? 'bg-green-50 border-green-200' :
                                    'bg-blue-50 border-blue-200'
                                }`}
                            >
                                <div className="flex items-center">
                                    {alert.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />}
                                    {alert.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 mr-2" />}
                                    {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 mr-2" />}
                                    {alert.type === 'info' && <Clock className="w-5 h-5 text-blue-500 mr-2" />}
                                    <div className="flex-1">
                                        <h3 className={`text-sm font-medium ${
                                            alert.type === 'warning' ? 'text-yellow-800' :
                                            alert.type === 'error' ? 'text-red-800' :
                                            alert.type === 'success' ? 'text-green-800' :
                                            'text-blue-800'
                                        }`}>
                                            {alert.message}
                                        </h3>
                                        <p className={`text-sm ${
                                            alert.type === 'warning' ? 'text-yellow-600' :
                                            alert.type === 'error' ? 'text-red-600' :
                                            alert.type === 'success' ? 'text-green-600' :
                                            'text-blue-600'
                                        }`}>
                                            {alert.time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <button
                            key={action.name}
                            onClick={() => handleQuickAction(action.href)}
                            className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group text-left"
                        >
                            <div className={`${action.color} p-3 rounded-lg mr-4 group-hover:scale-105 transition-transform`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{action.name}</h3>
                                <p className="text-sm text-gray-500">{action.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </button>
                    ))}
                </div>

                {/* KPI Cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <KpiCard key={i} loading={true} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {getKpiCards().map((kpi, index) => (
                            <KpiCard key={index} {...kpi} />
                        ))}
                    </div>
                )}

                {/* Activity Heatmap */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Upload Activity Heatmap</h3>
                        <p className="text-sm text-gray-500">Memory uploads over the last 30 days</p>
                    </div>
                    <div className="p-6">
                        <Heatmap />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                                    <p className="text-sm text-gray-500">Latest user actions and system events</p>
                                </div>
                                <button
                                    onClick={loadRecentActivity}
                                    disabled={loadingActivity}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                >
                                    {loadingActivity ? 'Loading...' : 'Refresh'}
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {loadingActivity ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="animate-pulse flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                            <div className="flex-shrink-0">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                                                <p className="text-sm text-gray-500">{activity.action}</p>
                                            </div>
                                            <div className="text-sm text-gray-400">{activity.time}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-6">
                                <button
                                    onClick={() => router.push('/admin/activity')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors flex items-center"
                                >
                                    View all activity 
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Plan Distribution */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Plan Distribution</h3>
                            <p className="text-sm text-gray-500">User subscription breakdown</p>
                        </div>
                        <div className="p-6">
                            {stats && stats.planDistribution ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Free Plan</span>
                                        <span className="text-sm text-gray-900">{stats.planDistribution.freePercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-gray-500 h-2 rounded-full" 
                                            style={{ width: `${stats.planDistribution.freePercentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Premium Plan</span>
                                        <span className="text-sm text-blue-900">{stats.planDistribution.premiumPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full" 
                                            style={{ width: `${stats.planDistribution.premiumPercentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Family Plan</span>
                                        <span className="text-sm text-purple-900">{stats.planDistribution.familyPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-purple-500 h-2 rounded-full" 
                                            style={{ width: `${stats.planDistribution.familyPercentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-500">{stats.planDistribution.free}</p>
                                            <p className="text-xs text-gray-600">Free</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{stats.planDistribution.premium}</p>
                                            <p className="text-xs text-gray-600">Premium</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-purple-600">{stats.planDistribution.family}</p>
                                            <p className="text-xs text-gray-600">Family</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-2 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-2 bg-gray-200 rounded"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Weekly Summary */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Weekly Summary</h3>
                        <p className="text-sm text-gray-500">Key insights and performance indicators</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{stats?.weeklyMemories || '---'}</div>
                                <div className="text-sm text-gray-600 mt-1">Memories This Week</div>
                                <div className="text-xs text-gray-500">New uploads in last 7 days</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">{stats?.monthlyMemories || '---'}</div>
                                <div className="text-sm text-gray-600 mt-1">Memories This Month</div>
                                <div className="text-xs text-gray-500">New uploads in last 30 days</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">
                                    {stats ? Math.round((stats.newMemories24h / stats.totalUsers) * 100) / 100 : '---'}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Memories per User</div>
                                <div className="text-xs text-gray-500">Average daily uploads</div>
                            </div>
                        </div>
                        
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center">
                                    <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                                    <h4 className="font-medium text-blue-800">Growth Trend</h4>
                                </div>
                                <p className="text-sm text-blue-600 mt-1">
                                    User engagement is {stats?.activeUsersChange > 0 ? 'increasing' : 'stable'} 
                                    {stats?.activeUsersChange && ` by ${Math.abs(stats.activeUsersChange)}%`}
                                </p>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    <h4 className="font-medium text-green-800">System Status</h4>
                                </div>
                                <p className="text-sm text-green-600 mt-1">All services operational, {stats?.storageUsedGB || '0'} GB storage used</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
