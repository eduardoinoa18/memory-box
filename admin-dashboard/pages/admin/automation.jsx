import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { 
    Workflow,
    Play,
    Pause,
    Square,
    RotateCcw,
    Zap,
    Bot,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    Mail,
    MessageSquare,
    Bell,
    Users,
    FileText,
    Image,
    Upload,
    Download,
    Database,
    Server,
    Code,
    Settings,
    Edit,
    Trash2,
    Plus,
    Search,
    Filter,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    ArrowUp,
    ArrowDown,
    Activity,
    Target,
    BarChart3,
    PieChart,
    Timer,
    Gauge,
    Cpu,
    HardDrive,
    Network,
    Eye,
    Share,
    Star,
    Heart,
    Gift,
    Camera,
    Video,
    Mic,
    Globe,
    Shield,
    Lock,
    Unlock,
    Link,
    Unlink,
    Copy,
    Move,
    Archive,
    Folder,
    Tag,
    Bookmark,
    Flag,
    Coffee,
    Moon,
    Sun,
    CloudRain,
    Smartphone,
    Monitor
} from 'lucide-react';

const AutomationPage = () => {
    const { stats, loading: statsLoading } = useDashboardStats();
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [automationData, setAutomationData] = useState({});
    const [activeWorkflows, setActiveWorkflows] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Mock comprehensive automation data
        const mockAutomationData = {
            overview: {
                totalWorkflows: 45,
                activeWorkflows: 32,
                pausedWorkflows: 8,
                failedWorkflows: 5,
                executionsToday: 2847,
                successRate: 94.3,
                avgExecutionTime: 3.2,
                timeSaved: 127.5
            },
            workflows: [
                {
                    id: 1,
                    name: 'Welcome Email Sequence',
                    description: 'Automated welcome emails for new users',
                    type: 'email',
                    status: 'active',
                    trigger: 'User Registration',
                    executions: 234,
                    successRate: 98.7,
                    lastRun: '5 min ago',
                    avgDuration: 0.8,
                    timeSaved: 15.6,
                    createdBy: 'Sarah Wilson',
                    tags: ['onboarding', 'email', 'engagement']
                },
                {
                    id: 2,
                    name: 'AI Letter Generation',
                    description: 'Auto-generate personalized letters for special occasions',
                    type: 'ai',
                    status: 'active',
                    trigger: 'Date Milestone',
                    executions: 456,
                    successRate: 92.4,
                    lastRun: '12 min ago',
                    avgDuration: 4.5,
                    timeSaved: 34.2,
                    createdBy: 'Mike Johnson',
                    tags: ['ai', 'personalization', 'content']
                },
                {
                    id: 3,
                    name: 'Photo Enhancement Pipeline',
                    description: 'Automatically enhance uploaded photos',
                    type: 'media',
                    status: 'active',
                    trigger: 'Photo Upload',
                    executions: 1823,
                    successRate: 89.6,
                    lastRun: '2 min ago',
                    avgDuration: 8.3,
                    timeSaved: 91.2,
                    createdBy: 'Alex Chen',
                    tags: ['media', 'enhancement', 'ai']
                },
                {
                    id: 4,
                    name: 'Premium Upgrade Notifications',
                    description: 'Notify users about premium features based on usage',
                    type: 'notification',
                    status: 'paused',
                    trigger: 'Usage Threshold',
                    executions: 187,
                    successRate: 76.2,
                    lastRun: '2 hours ago',
                    avgDuration: 1.2,
                    timeSaved: 4.7,
                    createdBy: 'Emma Davis',
                    tags: ['notification', 'conversion', 'premium']
                },
                {
                    id: 5,
                    name: 'Backup Memory Archives',
                    description: 'Daily backup of user memories to cloud storage',
                    type: 'backup',
                    status: 'active',
                    trigger: 'Daily Schedule',
                    executions: 89,
                    successRate: 100.0,
                    lastRun: '1 hour ago',
                    avgDuration: 25.6,
                    timeSaved: 44.5,
                    createdBy: 'System',
                    tags: ['backup', 'storage', 'security']
                },
                {
                    id: 6,
                    name: 'Sentiment Analysis Reports',
                    description: 'Analyze user memory sentiment and generate insights',
                    type: 'analytics',
                    status: 'failed',
                    trigger: 'Weekly Schedule',
                    executions: 12,
                    successRate: 58.3,
                    lastRun: '3 days ago',
                    avgDuration: 12.4,
                    timeSaved: 6.2,
                    createdBy: 'Data Team',
                    tags: ['analytics', 'sentiment', 'insights']
                }
            ],
            triggers: [
                { name: 'User Registration', count: 234, type: 'event' },
                { name: 'Photo Upload', count: 1823, type: 'event' },
                { name: 'Date Milestone', count: 456, type: 'time' },
                { name: 'Usage Threshold', count: 187, type: 'condition' },
                { name: 'Daily Schedule', count: 89, type: 'schedule' },
                { name: 'Weekly Schedule', count: 12, type: 'schedule' }
            ],
            actions: [
                { name: 'Send Email', count: 567, category: 'communication' },
                { name: 'Generate AI Content', count: 456, category: 'ai' },
                { name: 'Process Media', count: 1823, category: 'media' },
                { name: 'Send Notification', count: 298, category: 'communication' },
                { name: 'Create Backup', count: 89, category: 'system' },
                { name: 'Generate Report', count: 145, category: 'analytics' }
            ],
            performance: {
                cpuUsage: 42.8,
                memoryUsage: 56.3,
                networkUsage: 34.7,
                executionQueue: 23,
                avgResponseTime: 1.8,
                throughput: 450
            },
            integrations: [
                { name: 'SendGrid', type: 'email', status: 'connected', lastSync: '5 min ago' },
                { name: 'OpenAI', type: 'ai', status: 'connected', lastSync: '2 min ago' },
                { name: 'AWS S3', type: 'storage', status: 'connected', lastSync: '1 hour ago' },
                { name: 'Stripe', type: 'payment', status: 'connected', lastSync: '30 min ago' },
                { name: 'Twilio', type: 'sms', status: 'disconnected', lastSync: '2 days ago' },
                { name: 'Slack', type: 'notification', status: 'connected', lastSync: '15 min ago' }
            ],
            recentExecutions: [
                {
                    id: 1001,
                    workflow: 'Photo Enhancement Pipeline',
                    status: 'success',
                    duration: 6.2,
                    timestamp: '2 min ago',
                    trigger: 'Photo Upload',
                    user: 'john.doe@email.com'
                },
                {
                    id: 1002,
                    workflow: 'Welcome Email Sequence',
                    status: 'success',
                    duration: 0.9,
                    timestamp: '5 min ago',
                    trigger: 'User Registration',
                    user: 'jane.smith@email.com'
                },
                {
                    id: 1003,
                    workflow: 'AI Letter Generation',
                    status: 'success',
                    duration: 4.8,
                    timestamp: '8 min ago',
                    trigger: 'Date Milestone',
                    user: 'mike.wilson@email.com'
                },
                {
                    id: 1004,
                    workflow: 'Premium Upgrade Notifications',
                    status: 'failed',
                    duration: 0.3,
                    timestamp: '12 min ago',
                    trigger: 'Usage Threshold',
                    user: 'sarah.jones@email.com'
                },
                {
                    id: 1005,
                    workflow: 'Backup Memory Archives',
                    status: 'success',
                    duration: 28.4,
                    timestamp: '1 hour ago',
                    trigger: 'Daily Schedule',
                    user: 'System'
                }
            ],
            templates: [
                { name: 'Email Marketing Campaign', category: 'marketing', uses: 23 },
                { name: 'User Onboarding Flow', category: 'onboarding', uses: 45 },
                { name: 'Content Moderation', category: 'moderation', uses: 12 },
                { name: 'Payment Processing', category: 'payment', uses: 67 },
                { name: 'Data Processing Pipeline', category: 'data', uses: 34 }
            ]
        };

        setAutomationData(mockAutomationData);
        setActiveWorkflows([
            { id: 1, name: 'Photo Enhancement Pipeline', progress: 78, eta: '2 min' },
            { id: 2, name: 'Welcome Email Sequence', progress: 34, eta: '30 sec' }
        ]);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="text-green-500" size={16} />;
            case 'paused': return <Pause className="text-yellow-500" size={16} />;
            case 'failed': return <XCircle className="text-red-500" size={16} />;
            case 'success': return <CheckCircle className="text-green-500" size={16} />;
            default: return <Clock className="text-gray-500" size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'success': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'email': return Mail;
            case 'ai': return Bot;
            case 'media': return Image;
            case 'notification': return Bell;
            case 'backup': return Archive;
            case 'analytics': return BarChart3;
            default: return Workflow;
        }
    };

    const getTypeColor = (type) => {
        switch (type.toLowerCase()) {
            case 'email': return 'bg-blue-100 text-blue-800';
            case 'ai': return 'bg-purple-100 text-purple-800';
            case 'media': return 'bg-green-100 text-green-800';
            case 'notification': return 'bg-orange-100 text-orange-800';
            case 'backup': return 'bg-gray-100 text-gray-800';
            case 'analytics': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDuration = (seconds) => {
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    };

    const automationKPIs = [
        {
            title: 'Total Workflows',
            value: automationData.overview?.totalWorkflows?.toLocaleString() || '0',
            change: 12.5,
            icon: Workflow,
            color: 'blue',
            description: 'Total automation workflows'
        },
        {
            title: 'Active Workflows',
            value: automationData.overview?.activeWorkflows?.toLocaleString() || '0',
            change: 8.3,
            icon: Play,
            color: 'green',
            description: 'Currently running workflows'
        },
        {
            title: 'Executions Today',
            value: automationData.overview?.executionsToday?.toLocaleString() || '0',
            change: 23.7,
            icon: Zap,
            color: 'purple',
            description: 'Workflow executions today'
        },
        {
            title: 'Success Rate',
            value: `${automationData.overview?.successRate || 0}%`,
            change: 2.1,
            icon: Target,
            color: 'indigo',
            description: 'Execution success rate'
        },
        {
            title: 'Avg Execution Time',
            value: formatDuration(automationData.overview?.avgExecutionTime || 0),
            change: -15.4,
            icon: Timer,
            color: 'orange',
            description: 'Average execution duration'
        },
        {
            title: 'Time Saved',
            value: `${automationData.overview?.timeSaved || 0}h`,
            change: 34.8,
            icon: Clock,
            color: 'red',
            description: 'Hours saved through automation'
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
            <AdminLayout title="Automation">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Automation">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Automation & Workflows</h1>
                        <p className="text-gray-600">Manage and monitor automated workflows and processes</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="email">Email</option>
                            <option value="ai">AI</option>
                            <option value="media">Media</option>
                            <option value="notification">Notification</option>
                            <option value="backup">Backup</option>
                            <option value="analytics">Analytics</option>
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="failed">Failed</option>
                        </select>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                            <Plus size={16} />
                            <span>New Workflow</span>
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <RefreshCw size={16} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Automation KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {automationKPIs.map((kpi, index) => {
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

                {/* Active Workflows */}
                {activeWorkflows.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Activity className="mr-2 text-purple-600" size={20} />
                            Running Workflows
                        </h2>
                        <div className="space-y-3">
                            {activeWorkflows.map((workflow) => (
                                <div key={workflow.id} className="bg-white rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">{workflow.name}</span>
                                        <span className="text-sm text-gray-600">ETA: {workflow.eta}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${workflow.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-600">{workflow.progress}% complete</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Workflows List */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Automation Workflows</h2>
                        <div className="flex items-center space-x-2">
                            <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-1">
                                <Search size={14} />
                                <span className="text-sm">Search</span>
                            </button>
                            <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-1">
                                <Filter size={14} />
                                <span className="text-sm">Filter</span>
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {automationData.workflows?.map((workflow) => {
                            const TypeIcon = getTypeIcon(workflow.type);
                            return (
                                <div key={workflow.id} className="border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <TypeIcon size={20} className="text-purple-600 mr-3" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                                                <p className="text-sm text-gray-500">{workflow.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(workflow.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                                                {workflow.status}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(workflow.type)}`}>
                                                {workflow.type}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">Trigger</div>
                                            <div className="font-medium">{workflow.trigger}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Executions</div>
                                            <div className="font-medium">{workflow.executions.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Success Rate</div>
                                            <div className="font-medium">{workflow.successRate}%</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Avg Duration</div>
                                            <div className="font-medium">{formatDuration(workflow.avgDuration)}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-4 text-sm">
                                            <div className="text-gray-600">
                                                Time Saved: <span className="font-medium">{workflow.timeSaved}h</span>
                                            </div>
                                            <div className="text-gray-600">
                                                Created by: <span className="font-medium">{workflow.createdBy}</span>
                                            </div>
                                            <div className="text-gray-600">
                                                Last run: <span className="font-medium">{workflow.lastRun}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1">
                                            {workflow.tags?.map((tag, tagIndex) => (
                                                <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="text-green-600 hover:text-green-800">
                                                <Play size={16} />
                                            </button>
                                            <button className="text-yellow-600 hover:text-yellow-800">
                                                <Pause size={16} />
                                            </button>
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <Edit size={16} />
                                            </button>
                                            <button className="text-gray-600 hover:text-gray-800">
                                                <Eye size={16} />
                                            </button>
                                            <button className="text-red-600 hover:text-red-800">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Triggers & Actions Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Triggers */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Popular Triggers</h2>
                        <div className="space-y-3">
                            {automationData.triggers?.map((trigger, index) => {
                                const maxCount = Math.max(...automationData.triggers.map(t => t.count));
                                const percentage = (trigger.count / maxCount) * 100;
                                
                                return (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-3 ${
                                                trigger.type === 'event' ? 'bg-blue-500' :
                                                trigger.type === 'time' ? 'bg-green-500' :
                                                trigger.type === 'condition' ? 'bg-purple-500' :
                                                'bg-orange-500'
                                            }`}></div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{trigger.name}</div>
                                                <div className="text-xs text-gray-500 capitalize">{trigger.type}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 w-12 text-right">
                                                {trigger.count}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Popular Actions</h2>
                        <div className="space-y-3">
                            {automationData.actions?.map((action, index) => {
                                const maxCount = Math.max(...automationData.actions.map(a => a.count));
                                const percentage = (action.count / maxCount) * 100;
                                
                                return (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-3 ${
                                                action.category === 'communication' ? 'bg-blue-500' :
                                                action.category === 'ai' ? 'bg-purple-500' :
                                                action.category === 'media' ? 'bg-green-500' :
                                                action.category === 'system' ? 'bg-gray-500' :
                                                'bg-indigo-500'
                                            }`}></div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{action.name}</div>
                                                <div className="text-xs text-gray-500 capitalize">{action.category}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-purple-500 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 w-12 text-right">
                                                {action.count}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Executions & Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Executions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Executions</h2>
                        <div className="space-y-3">
                            {automationData.recentExecutions?.map((execution) => (
                                <div key={execution.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                    <div className="flex items-center">
                                        {getStatusIcon(execution.status)}
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{execution.workflow}</div>
                                            <div className="text-xs text-gray-500">{execution.trigger} • {execution.user}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-900">{formatDuration(execution.duration)}</div>
                                        <div className="text-xs text-gray-500">{execution.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Performance */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">System Performance</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Cpu size={20} className="text-blue-600 mr-3" />
                                    <span className="text-sm font-medium">CPU Usage</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${automationData.performance?.cpuUsage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium w-12">{automationData.performance?.cpuUsage}%</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <HardDrive size={20} className="text-green-600 mr-3" />
                                    <span className="text-sm font-medium">Memory Usage</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${automationData.performance?.memoryUsage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium w-12">{automationData.performance?.memoryUsage}%</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Network size={20} className="text-purple-600 mr-3" />
                                    <span className="text-sm font-medium">Network Usage</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-purple-500 h-2 rounded-full"
                                            style={{ width: `${automationData.performance?.networkUsage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium w-12">{automationData.performance?.networkUsage}%</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock size={20} className="text-orange-600 mr-3" />
                                    <span className="text-sm font-medium">Execution Queue</span>
                                </div>
                                <span className="text-sm font-medium">{automationData.performance?.executionQueue} jobs</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Gauge size={20} className="text-red-600 mr-3" />
                                    <span className="text-sm font-medium">Avg Response Time</span>
                                </div>
                                <span className="text-sm font-medium">{automationData.performance?.avgResponseTime}s</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Activity size={20} className="text-indigo-600 mr-3" />
                                    <span className="text-sm font-medium">Throughput</span>
                                </div>
                                <span className="text-sm font-medium">{automationData.performance?.throughput} exec/hour</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integrations */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Integrations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {automationData.integrations?.map((integration, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-2 ${
                                            integration.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                        <span className="font-medium text-gray-900">{integration.name}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        integration.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {integration.status}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mb-2 capitalize">{integration.type}</div>
                                <div className="text-xs text-gray-600">Last sync: {integration.lastSync}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Automation Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <Workflow className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Automation Overview</h3>
                            <p className="text-sm text-gray-600">Comprehensive automation platform performance</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-4">
                            <strong>Workflow Performance:</strong> {automationData.overview?.activeWorkflows} active workflows with {automationData.overview?.successRate}% success rate and {formatDuration(automationData.overview?.avgExecutionTime)} average execution time.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Daily Activity:</strong> {automationData.overview?.executionsToday?.toLocaleString()} executions processed today across {automationData.overview?.totalWorkflows} total workflows.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Efficiency Gains:</strong> Automation has saved {automationData.overview?.timeSaved} hours this month with {automationData.integrations?.filter(i => i.status === 'connected').length} active integrations.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AutomationPage;
