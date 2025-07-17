import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { 
    Brain,
    Cpu,
    Zap,
    Bot,
    Sparkles,
    FileText,
    MessageSquare,
    Image,
    Video,
    Mic,
    Eye,
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
    Play,
    Pause,
    Square,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Activity,
    Database,
    Server,
    Gauge,
    Users,
    Heart,
    Star,
    ThumbsUp,
    ThumbsDown,
    Layers,
    Network,
    Code,
    Globe,
    Search,
    Edit,
    Plus,
    Trash2,
    Upload,
    BookOpen,
    PenTool,
    Camera,
    Wand2,
    Lightbulb,
    Workflow
} from 'lucide-react';

const AIPage = () => {
    const { stats, loading: statsLoading } = useDashboardStats();
    const [selectedModel, setSelectedModel] = useState('all');
    const [selectedTimeframe, setSelectedTimeframe] = useState('week');
    const [aiData, setAiData] = useState({});
    const [activeJobs, setActiveJobs] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Mock comprehensive AI data
        const mockAiData = {
            overview: {
                totalRequests: 145820,
                successfulRequests: 142456,
                failedRequests: 3364,
                successRate: 97.7,
                avgResponseTime: 2.4,
                modelsActive: 8,
                tokensProcessed: 45678920,
                costToday: 234.56
            },
            models: [
                {
                    name: 'GPT-4 Letter Writer',
                    type: 'Text Generation',
                    status: 'active',
                    requests: 45230,
                    successRate: 98.5,
                    avgLatency: 1.8,
                    cost: 89.45,
                    accuracy: 94.2,
                    lastUsed: '2 min ago'
                },
                {
                    name: 'Memory Categorizer',
                    type: 'Classification',
                    status: 'active',
                    requests: 23890,
                    successRate: 96.8,
                    avgLatency: 0.6,
                    cost: 12.34,
                    accuracy: 91.7,
                    lastUsed: '5 min ago'
                },
                {
                    name: 'Image Analyzer',
                    type: 'Computer Vision',
                    status: 'active',
                    requests: 18745,
                    successRate: 95.2,
                    avgLatency: 3.2,
                    cost: 45.67,
                    accuracy: 89.3,
                    lastUsed: '1 min ago'
                },
                {
                    name: 'Sentiment Analyzer',
                    type: 'Text Analysis',
                    status: 'active',
                    requests: 34567,
                    successRate: 99.1,
                    avgLatency: 0.4,
                    cost: 8.92,
                    accuracy: 96.8,
                    lastUsed: '3 min ago'
                },
                {
                    name: 'Speech Transcriber',
                    type: 'Audio Processing',
                    status: 'maintenance',
                    requests: 8945,
                    successRate: 94.3,
                    avgLatency: 5.6,
                    cost: 23.45,
                    accuracy: 87.9,
                    lastUsed: '1 hour ago'
                },
                {
                    name: 'Timeline Generator',
                    type: 'Content Generation',
                    status: 'active',
                    requests: 12456,
                    successRate: 97.8,
                    avgLatency: 2.1,
                    cost: 34.21,
                    accuracy: 92.4,
                    lastUsed: '8 min ago'
                }
            ],
            features: [
                {
                    name: 'AI Letter Generation',
                    usage: 45230,
                    usersSatisfaction: 4.6,
                    engagement: 89.2,
                    conversionRate: 34.5,
                    topPrompts: ['Birthday letter', 'Anniversary message', 'Thank you note']
                },
                {
                    name: 'Smart Memory Tagging',
                    usage: 23890,
                    usersSatisfaction: 4.3,
                    engagement: 76.8,
                    conversionRate: 0,
                    topPrompts: ['Family photos', 'Vacation memories', 'Special moments']
                },
                {
                    name: 'Photo Enhancement',
                    usage: 18745,
                    usersSatisfaction: 4.7,
                    engagement: 82.4,
                    conversionRate: 28.9,
                    topPrompts: ['Color correction', 'Noise reduction', 'Upscaling']
                },
                {
                    name: 'Voice Memory Transcription',
                    usage: 8945,
                    usersSatisfaction: 4.2,
                    engagement: 71.3,
                    conversionRate: 19.6,
                    topPrompts: ['Voice notes', 'Audio diaries', 'Interview transcripts']
                }
            ],
            performance: {
                cpuUsage: 67.3,
                memoryUsage: 78.9,
                gpuUsage: 85.2,
                networkLatency: 45,
                throughput: 1245,
                queueLength: 23
            },
            costs: {
                daily: 234.56,
                weekly: 1456.78,
                monthly: 5678.90,
                breakdown: [
                    { service: 'OpenAI GPT-4', cost: 145.67, percentage: 62.1 },
                    { service: 'Google Vision API', cost: 45.67, percentage: 19.5 },
                    { service: 'AWS Comprehend', cost: 23.45, percentage: 10.0 },
                    { service: 'Azure Speech', cost: 19.77, percentage: 8.4 }
                ]
            },
            training: {
                modelsInTraining: 2,
                completedJobs: 45,
                failedJobs: 3,
                averageTime: 4.5,
                datasetSize: '2.3TB',
                annotations: 456789
            },
            insights: [
                {
                    type: 'performance',
                    title: 'Letter Generation Peak Hours',
                    description: 'AI letter requests peak between 7-9 PM with 85% higher usage',
                    impact: 'high',
                    recommendation: 'Scale GPU capacity during peak hours'
                },
                {
                    type: 'cost',
                    title: 'Model Optimization Opportunity',
                    description: 'Memory Categorizer model could be optimized to reduce costs by 30%',
                    impact: 'medium',
                    recommendation: 'Consider model quantization or fine-tuning'
                },
                {
                    type: 'accuracy',
                    title: 'Image Analysis Improvement',
                    description: 'Recent updates improved photo categorization accuracy by 12%',
                    impact: 'high',
                    recommendation: 'Deploy similar improvements to other vision models'
                }
            ]
        };

        setAiData(mockAiData);
        setActiveJobs([
            { id: 1, name: 'Fine-tuning Letter Writer v2', progress: 78, eta: '2 hours', type: 'training' },
            { id: 2, name: 'Processing Photo Batch #247', progress: 34, eta: '45 min', type: 'inference' }
        ]);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle className="text-green-500" size={16} />;
            case 'maintenance': return <AlertCircle className="text-yellow-500" size={16} />;
            case 'inactive': return <XCircle className="text-red-500" size={16} />;
            default: return <Clock className="text-gray-500" size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getModelIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'text generation': return FileText;
            case 'classification': return Target;
            case 'computer vision': return Eye;
            case 'text analysis': return MessageSquare;
            case 'audio processing': return Mic;
            case 'content generation': return PenTool;
            default: return Brain;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const aiKPIs = [
        {
            title: 'Total Requests',
            value: aiData.overview?.totalRequests?.toLocaleString() || '0',
            change: 23.5,
            icon: Zap,
            color: 'blue',
            description: 'AI requests processed'
        },
        {
            title: 'Success Rate',
            value: `${aiData.overview?.successRate || 0}%`,
            change: 2.1,
            icon: CheckCircle,
            color: 'green',
            description: 'Request success rate'
        },
        {
            title: 'Avg Response Time',
            value: `${aiData.overview?.avgResponseTime || 0}s`,
            change: -8.3,
            icon: Clock,
            color: 'purple',
            description: 'Average processing time'
        },
        {
            title: 'Active Models',
            value: aiData.overview?.modelsActive?.toLocaleString() || '0',
            change: 14.3,
            icon: Brain,
            color: 'indigo',
            description: 'Models in production'
        },
        {
            title: 'Daily Cost',
            value: formatCurrency(aiData.overview?.costToday || 0),
            change: 12.7,
            icon: BarChart3,
            color: 'orange',
            description: 'Today\'s AI costs'
        },
        {
            title: 'Tokens Processed',
            value: `${(aiData.overview?.tokensProcessed / 1000000).toFixed(1)}M`,
            change: 18.9,
            icon: Database,
            color: 'red',
            description: 'Tokens processed today'
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
            <AdminLayout title="AI & Machine Learning">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="AI & Machine Learning">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI & Machine Learning</h1>
                        <p className="text-gray-600">AI model performance, costs, and insights</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Models</option>
                            <option value="text">Text Models</option>
                            <option value="vision">Vision Models</option>
                            <option value="audio">Audio Models</option>
                        </select>
                        <select
                            value={selectedTimeframe}
                            onChange={(e) => setSelectedTimeframe(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="day">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                        </select>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                            <Brain size={16} />
                            <span>Train Model</span>
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <RefreshCw size={16} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* AI KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aiKPIs.map((kpi, index) => {
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

                {/* Active AI Jobs */}
                {activeJobs.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Cpu className="mr-2 text-purple-600" size={20} />
                            Active AI Jobs
                        </h2>
                        <div className="space-y-3">
                            {activeJobs.map((job) => (
                                <div key={job.id} className="bg-white rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-lg mr-3 ${
                                                job.type === 'training' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {job.type === 'training' ? <Brain size={16} /> : <Zap size={16} />}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900">{job.name}</span>
                                                <div className="text-xs text-gray-500 capitalize">{job.type}</div>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-600">ETA: {job.eta}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                job.type === 'training' ? 'bg-purple-500' : 'bg-blue-500'
                                            }`}
                                            style={{ width: `${job.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-600">{job.progress}% complete</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Models Performance */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">AI Models Performance</h2>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                            <Plus size={16} />
                            <span>Deploy Model</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {aiData.models?.map((model, index) => {
                            const Icon = getModelIcon(model.type);
                            return (
                                <div key={index} className="border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <Icon size={20} className="text-purple-600 mr-2" />
                                            <div>
                                                <h3 className="font-medium text-gray-900">{model.name}</h3>
                                                <p className="text-sm text-gray-500">{model.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(model.status)}
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                                                {model.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <div className="text-gray-600">Requests</div>
                                            <div className="font-medium">{model.requests.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Success Rate</div>
                                            <div className="font-medium">{model.successRate}%</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Avg Latency</div>
                                            <div className="font-medium">{model.avgLatency}s</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Accuracy</div>
                                            <div className="font-medium">{model.accuracy}%</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-sm text-gray-600">
                                            Cost: {formatCurrency(model.cost)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Last used: {model.lastUsed}
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                        <div 
                                            className="bg-purple-500 h-2 rounded-full"
                                            style={{ width: `${model.successRate}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm font-medium text-gray-900">
                                            {model.successRate}% Success Rate
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="text-purple-600 hover:text-purple-800">
                                                <Settings size={14} />
                                            </button>
                                            <button className="text-blue-600 hover:text-blue-800">
                                                <BarChart3 size={14} />
                                            </button>
                                            <button className="text-gray-600 hover:text-gray-800">
                                                <Edit size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* AI Features Usage & System Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Features Usage */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">AI Features Usage</h2>
                        <div className="space-y-4">
                            {aiData.features?.map((feature, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-medium text-gray-900">{feature.name}</h3>
                                        <div className="flex items-center">
                                            <Star size={14} className="text-yellow-500 mr-1" />
                                            <span className="text-sm font-medium">{feature.usersSatisfaction}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                                        <div>
                                            <div className="text-gray-600">Usage</div>
                                            <div className="font-medium">{feature.usage.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Engagement</div>
                                            <div className="font-medium">{feature.engagement}%</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Conversion</div>
                                            <div className="font-medium">{feature.conversionRate}%</div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-xs text-gray-600 mb-2">Top Prompts</div>
                                        <div className="flex flex-wrap gap-1">
                                            {feature.topPrompts?.map((prompt, promptIndex) => (
                                                <span key={promptIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                    {prompt}
                                                </span>
                                            ))}
                                        </div>
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
                                            style={{ width: `${aiData.performance?.cpuUsage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium w-12">{aiData.performance?.cpuUsage}%</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Database size={20} className="text-green-600 mr-3" />
                                    <span className="text-sm font-medium">Memory Usage</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${aiData.performance?.memoryUsage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium w-12">{aiData.performance?.memoryUsage}%</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Zap size={20} className="text-purple-600 mr-3" />
                                    <span className="text-sm font-medium">GPU Usage</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-purple-500 h-2 rounded-full"
                                            style={{ width: `${aiData.performance?.gpuUsage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium w-12">{aiData.performance?.gpuUsage}%</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Network size={20} className="text-orange-600 mr-3" />
                                    <span className="text-sm font-medium">Network Latency</span>
                                </div>
                                <span className="text-sm font-medium">{aiData.performance?.networkLatency}ms</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Gauge size={20} className="text-red-600 mr-3" />
                                    <span className="text-sm font-medium">Throughput</span>
                                </div>
                                <span className="text-sm font-medium">{aiData.performance?.throughput} req/min</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock size={20} className="text-indigo-600 mr-3" />
                                    <span className="text-sm font-medium">Queue Length</span>
                                </div>
                                <span className="text-sm font-medium">{aiData.performance?.queueLength} jobs</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Training Status</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-600">Models Training</div>
                                    <div className="font-medium">{aiData.training?.modelsInTraining}</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Avg Train Time</div>
                                    <div className="font-medium">{aiData.training?.averageTime}h</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Dataset Size</div>
                                    <div className="font-medium">{aiData.training?.datasetSize}</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Annotations</div>
                                    <div className="font-medium">{aiData.training?.annotations?.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cost Breakdown & AI Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cost Breakdown */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">AI Cost Breakdown</h2>
                        <div className="mb-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{formatCurrency(aiData.costs?.daily)}</div>
                                    <div className="text-xs text-gray-500">Daily</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{formatCurrency(aiData.costs?.weekly)}</div>
                                    <div className="text-xs text-gray-500">Weekly</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{formatCurrency(aiData.costs?.monthly)}</div>
                                    <div className="text-xs text-gray-500">Monthly</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {aiData.costs?.breakdown?.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                                        <span className="text-sm font-medium text-gray-900">{item.service}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">{formatCurrency(item.cost)}</div>
                                            <div className="text-xs text-gray-500">{item.percentage}%</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">AI Insights & Recommendations</h2>
                        <div className="space-y-4">
                            {aiData.insights?.map((insight, index) => {
                                const impactColors = {
                                    high: 'border-red-200 bg-red-50',
                                    medium: 'border-yellow-200 bg-yellow-50',
                                    low: 'border-blue-200 bg-blue-50'
                                };
                                const impactBadges = {
                                    high: 'bg-red-100 text-red-800',
                                    medium: 'bg-yellow-100 text-yellow-800',
                                    low: 'bg-blue-100 text-blue-800'
                                };
                                
                                return (
                                    <div key={index} className={`border rounded-lg p-4 ${impactColors[insight.impact]}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900">{insight.title}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${impactBadges[insight.impact]}`}>
                                                {insight.impact} impact
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                                        <div className="flex items-start">
                                            <Lightbulb size={14} className="text-gray-500 mr-2 mt-0.5" />
                                            <p className="text-xs text-gray-600">{insight.recommendation}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* AI Overview Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <Brain className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">AI Platform Overview</h3>
                            <p className="text-sm text-gray-600">Comprehensive AI performance and cost analysis</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-4">
                            <strong>Model Performance:</strong> {aiData.overview?.modelsActive} active models with {aiData.overview?.successRate}% average success rate and {aiData.overview?.avgResponseTime}s response time.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Usage Analytics:</strong> Processed {aiData.overview?.totalRequests?.toLocaleString()} requests today with {(aiData.overview?.tokensProcessed / 1000000).toFixed(1)}M tokens processed.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Cost Efficiency:</strong> Daily AI costs of {formatCurrency(aiData.overview?.costToday)} with optimized resource allocation across {aiData.models?.length} deployed models.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AIPage;
