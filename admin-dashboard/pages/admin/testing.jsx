import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { 
    TestTube2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Play,
    Pause,
    RotateCcw,
    Zap,
    Bug,
    Shield,
    Code,
    Smartphone,
    Monitor,
    Globe,
    Users,
    Activity,
    Target,
    TrendingUp,
    TrendingDown,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Download,
    Filter,
    Calendar,
    BarChart3,
    Settings,
    FileText,
    Eye,
    Cpu,
    HardDrive,
    Wifi,
    Battery,
    Gauge,
    Timer,
    Layers,
    Network,
    Database,
    Server,
    CloudRain,
    Warning,
    Info,
    Plus,
    Edit,
    Trash2,
    Search
} from 'lucide-react';

const TestingPage = () => {
    const { stats, loading: statsLoading } = useDashboardStats();
    const [selectedTestType, setSelectedTestType] = useState('all');
    const [selectedEnvironment, setSelectedEnvironment] = useState('production');
    const [testingData, setTestingData] = useState({});
    const [activeTests, setActiveTests] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Mock comprehensive testing data
        const mockTestingData = {
            overview: {
                totalTests: 2847,
                passedTests: 2634,
                failedTests: 158,
                skippedTests: 55,
                passRate: 92.5,
                coverage: 87.3,
                avgExecutionTime: 245,
                testsToday: 342
            },
            testSuites: [
                {
                    name: 'User Authentication',
                    tests: 45,
                    passed: 43,
                    failed: 2,
                    coverage: 94.2,
                    lastRun: '2 hours ago',
                    status: 'passed',
                    duration: 32,
                    priority: 'high'
                },
                {
                    name: 'Memory Management',
                    tests: 67,
                    passed: 65,
                    failed: 1,
                    coverage: 91.8,
                    lastRun: '1 hour ago',
                    status: 'passed',
                    duration: 78,
                    priority: 'high'
                },
                {
                    name: 'File Upload/Storage',
                    tests: 38,
                    passed: 35,
                    failed: 3,
                    coverage: 88.7,
                    lastRun: '30 min ago',
                    status: 'failed',
                    duration: 156,
                    priority: 'critical'
                },
                {
                    name: 'Timeline Features',
                    tests: 89,
                    passed: 84,
                    failed: 4,
                    coverage: 93.1,
                    lastRun: '45 min ago',
                    status: 'passed',
                    duration: 67,
                    priority: 'medium'
                },
                {
                    name: 'AI Letter Generation',
                    tests: 23,
                    passed: 20,
                    failed: 2,
                    coverage: 85.4,
                    lastRun: '1.5 hours ago',
                    status: 'warning',
                    duration: 245,
                    priority: 'medium'
                },
                {
                    name: 'Payment Processing',
                    tests: 34,
                    passed: 32,
                    failed: 2,
                    coverage: 96.7,
                    lastRun: '3 hours ago',
                    status: 'passed',
                    duration: 89,
                    priority: 'critical'
                }
            ],
            performance: {
                apiResponseTime: 156,
                pageLoadTime: 2.4,
                databaseQueryTime: 45,
                memoryUsage: 68.3,
                cpuUsage: 34.7,
                errorRate: 0.12
            },
            browsers: [
                { name: 'Chrome', tests: 892, passed: 856, failed: 36, coverage: 95.9 },
                { name: 'Firefox', tests: 892, passed: 834, failed: 58, coverage: 93.5 },
                { name: 'Safari', tests: 892, passed: 845, failed: 47, coverage: 94.7 },
                { name: 'Edge', tests: 892, passed: 867, failed: 25, coverage: 97.2 }
            ],
            devices: [
                { name: 'Desktop', tests: 1456, passed: 1398, failed: 58, coverage: 96.0 },
                { name: 'Mobile', tests: 1234, passed: 1156, failed: 78, coverage: 93.7 },
                { name: 'Tablet', tests: 157, passed: 147, failed: 10, coverage: 93.6 }
            ],
            recentTests: [
                {
                    id: 1,
                    name: 'User Login Flow',
                    status: 'passed',
                    duration: 12,
                    timestamp: '2 min ago',
                    environment: 'staging',
                    suite: 'Authentication'
                },
                {
                    id: 2,
                    name: 'Photo Upload Validation',
                    status: 'failed',
                    duration: 34,
                    timestamp: '5 min ago',
                    environment: 'production',
                    suite: 'File Upload'
                },
                {
                    id: 3,
                    name: 'Timeline Rendering',
                    status: 'passed',
                    duration: 8,
                    timestamp: '7 min ago',
                    environment: 'staging',
                    suite: 'Timeline'
                },
                {
                    id: 4,
                    name: 'Payment Gateway',
                    status: 'passed',
                    duration: 45,
                    timestamp: '12 min ago',
                    environment: 'production',
                    suite: 'Payments'
                },
                {
                    id: 5,
                    name: 'AI Letter API',
                    status: 'warning',
                    duration: 156,
                    timestamp: '18 min ago',
                    environment: 'staging',
                    suite: 'AI Features'
                }
            ],
            bugs: [
                {
                    id: 'BUG-001',
                    title: 'Image Upload Memory Leak',
                    severity: 'high',
                    status: 'open',
                    assignee: 'John Doe',
                    created: '2 days ago',
                    environment: 'production'
                },
                {
                    id: 'BUG-002',
                    title: 'Timeline Loading Performance',
                    severity: 'medium',
                    status: 'in-progress',
                    assignee: 'Jane Smith',
                    created: '1 day ago',
                    environment: 'staging'
                },
                {
                    id: 'BUG-003',
                    title: 'AI Letter Timeout',
                    severity: 'low',
                    status: 'resolved',
                    assignee: 'Mike Johnson',
                    created: '3 days ago',
                    environment: 'development'
                }
            ],
            security: {
                vulnerabilities: 3,
                resolved: 45,
                critical: 0,
                high: 1,
                medium: 2,
                low: 0,
                lastScan: '6 hours ago'
            }
        };

        setTestingData(mockTestingData);
        setActiveTests([
            { id: 1, name: 'Full Regression Suite', progress: 67, eta: '15 min' },
            { id: 2, name: 'API Integration Tests', progress: 23, eta: '8 min' }
        ]);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'passed': return <CheckCircle className="text-green-500" size={16} />;
            case 'failed': return <XCircle className="text-red-500" size={16} />;
            case 'warning': return <AlertCircle className="text-yellow-500" size={16} />;
            case 'running': return <Clock className="text-blue-500" size={16} />;
            default: return <Clock className="text-gray-500" size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'passed': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'running': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDuration = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const testingKPIs = [
        {
            title: 'Test Pass Rate',
            value: `${testingData.overview?.passRate || 0}%`,
            change: 2.3,
            icon: CheckCircle,
            color: 'green',
            description: 'Overall test success rate'
        },
        {
            title: 'Code Coverage',
            value: `${testingData.overview?.coverage || 0}%`,
            change: 1.8,
            icon: Shield,
            color: 'blue',
            description: 'Code coverage percentage'
        },
        {
            title: 'Tests Today',
            value: testingData.overview?.testsToday?.toLocaleString() || '0',
            change: 15.2,
            icon: Activity,
            color: 'purple',
            description: 'Tests executed today'
        },
        {
            title: 'Avg Execution',
            value: formatDuration(testingData.overview?.avgExecutionTime || 0),
            change: -8.5,
            icon: Timer,
            color: 'indigo',
            description: 'Average test duration'
        },
        {
            title: 'Failed Tests',
            value: testingData.overview?.failedTests?.toLocaleString() || '0',
            change: -12.7,
            icon: XCircle,
            color: 'red',
            description: 'Currently failing tests'
        },
        {
            title: 'Security Issues',
            value: testingData.security?.vulnerabilities?.toLocaleString() || '0',
            change: -25.0,
            icon: Bug,
            color: 'orange',
            description: 'Open security vulnerabilities'
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
            <AdminLayout title="Testing & QA">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Testing & QA">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Testing & Quality Assurance</h1>
                        <p className="text-gray-600">Comprehensive testing dashboard and quality metrics</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={selectedTestType}
                            onChange={(e) => setSelectedTestType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Tests</option>
                            <option value="unit">Unit Tests</option>
                            <option value="integration">Integration</option>
                            <option value="e2e">End-to-End</option>
                            <option value="performance">Performance</option>
                            <option value="security">Security</option>
                        </select>
                        <select
                            value={selectedEnvironment}
                            onChange={(e) => setSelectedEnvironment(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="production">Production</option>
                            <option value="staging">Staging</option>
                            <option value="development">Development</option>
                        </select>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                            <Play size={16} />
                            <span>Run Tests</span>
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <RefreshCw size={16} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Testing KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testingKPIs.map((kpi, index) => {
                        const Icon = kpi.icon;
                        const colorClasses = {
                            green: 'bg-green-100 text-green-600',
                            blue: 'bg-blue-100 text-blue-600',
                            purple: 'bg-purple-100 text-purple-600',
                            indigo: 'bg-indigo-100 text-indigo-600',
                            red: 'bg-red-100 text-red-600',
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

                {/* Active Test Runs */}
                {activeTests.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Activity className="mr-2 text-blue-600" size={20} />
                            Active Test Runs
                        </h2>
                        <div className="space-y-3">
                            {activeTests.map((test) => (
                                <div key={test.id} className="bg-white rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">{test.name}</span>
                                        <span className="text-sm text-gray-600">ETA: {test.eta}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${test.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-600">{test.progress}% complete</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Test Suites */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Test Suites</h2>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                            <Plus size={16} />
                            <span>Add Suite</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {testingData.testSuites?.map((suite, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <TestTube2 size={20} className="text-blue-600 mr-2" />
                                        <h3 className="font-medium text-gray-900">{suite.name}</h3>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(suite.status)}`}>
                                            {suite.status}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suite.priority)}`}>
                                            {suite.priority}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">Total Tests</div>
                                        <div className="font-medium">{suite.tests}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Coverage</div>
                                        <div className="font-medium">{suite.coverage}%</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Duration</div>
                                        <div className="font-medium">{formatDuration(suite.duration)}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-4 text-sm">
                                        <div className="flex items-center">
                                            <CheckCircle size={14} className="text-green-500 mr-1" />
                                            <span>{suite.passed} passed</span>
                                        </div>
                                        <div className="flex items-center">
                                            <XCircle size={14} className="text-red-500 mr-1" />
                                            <span>{suite.failed} failed</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Last run: {suite.lastRun}
                                    </div>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${(suite.passed / suite.tests) * 100}%` }}
                                    ></div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <div className="text-sm font-medium text-gray-900">
                                        {((suite.passed / suite.tests) * 100).toFixed(1)}% Pass Rate
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Play size={14} />
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-800">
                                            <Eye size={14} />
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-800">
                                            <Edit size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Metrics & Browser/Device Testing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Metrics */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Gauge size={20} className="text-blue-600 mr-3" />
                                    <span className="text-sm font-medium">API Response Time</span>
                                </div>
                                <span className="text-sm font-medium">{testingData.performance?.apiResponseTime}ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock size={20} className="text-green-600 mr-3" />
                                    <span className="text-sm font-medium">Page Load Time</span>
                                </div>
                                <span className="text-sm font-medium">{testingData.performance?.pageLoadTime}s</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Database size={20} className="text-purple-600 mr-3" />
                                    <span className="text-sm font-medium">DB Query Time</span>
                                </div>
                                <span className="text-sm font-medium">{testingData.performance?.databaseQueryTime}ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <HardDrive size={20} className="text-orange-600 mr-3" />
                                    <span className="text-sm font-medium">Memory Usage</span>
                                </div>
                                <span className="text-sm font-medium">{testingData.performance?.memoryUsage}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Cpu size={20} className="text-red-600 mr-3" />
                                    <span className="text-sm font-medium">CPU Usage</span>
                                </div>
                                <span className="text-sm font-medium">{testingData.performance?.cpuUsage}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <AlertCircle size={20} className="text-yellow-600 mr-3" />
                                    <span className="text-sm font-medium">Error Rate</span>
                                </div>
                                <span className="text-sm font-medium">{testingData.performance?.errorRate}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Browser & Device Testing */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Cross-Platform Testing</h2>
                        
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Browser Testing</h3>
                            <div className="space-y-2">
                                {testingData.browsers?.map((browser, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Globe size={16} className="text-gray-500 mr-2" />
                                            <span className="text-sm">{browser.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                <div 
                                                    className="bg-blue-500 h-1.5 rounded-full"
                                                    style={{ width: `${browser.coverage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-600 w-12">{browser.coverage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Device Testing</h3>
                            <div className="space-y-2">
                                {testingData.devices?.map((device, index) => {
                                    const DeviceIcon = device.name === 'Desktop' ? Monitor : 
                                                     device.name === 'Mobile' ? Smartphone : Monitor;
                                    return (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <DeviceIcon size={16} className="text-gray-500 mr-2" />
                                                <span className="text-sm">{device.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                    <div 
                                                        className="bg-green-500 h-1.5 rounded-full"
                                                        style={{ width: `${device.coverage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-600 w-12">{device.coverage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Tests & Bug Tracking */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Test Results */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Test Results</h2>
                        <div className="space-y-3">
                            {testingData.recentTests?.map((test) => (
                                <div key={test.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                    <div className="flex items-center">
                                        {getStatusIcon(test.status)}
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{test.name}</div>
                                            <div className="text-xs text-gray-500">{test.suite} • {test.environment}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-900">{formatDuration(test.duration)}</div>
                                        <div className="text-xs text-gray-500">{test.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bug Tracking */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Bug Tracking</h2>
                            <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 flex items-center space-x-1">
                                <Bug size={14} />
                                <span className="text-sm">Report Bug</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {testingData.bugs?.map((bug) => (
                                <div key={bug.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-900 text-sm">{bug.id}</span>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(bug.severity)}`}>
                                                {bug.severity}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                                            {bug.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-900 mb-2">{bug.title}</div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Assigned to: {bug.assignee}</span>
                                        <span>{bug.created} • {bug.environment}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Security & Quality Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Quality & Security Overview</h3>
                            <p className="text-sm text-gray-600">Overall platform health and security status</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-4">
                            <strong>Test Coverage:</strong> {testingData.overview?.coverage}% code coverage with {testingData.overview?.passRate}% pass rate across {testingData.overview?.totalTests} total tests.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Security Status:</strong> {testingData.security?.vulnerabilities} open vulnerabilities ({testingData.security?.high} high, {testingData.security?.medium} medium). Last scan: {testingData.security?.lastScan}.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Performance:</strong> Average API response time of {testingData.performance?.apiResponseTime}ms with {testingData.performance?.errorRate}% error rate across all environments.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default TestingPage;
