import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import {
    Brain,
    TrendingUp,
    AlertTriangle,
    Users,
    DollarSign,
    Target,
    RefreshCw,
    Lightbulb,
    BarChart3,
    MessageSquare,
    Zap
} from 'lucide-react';

const InsightsPage = () => {
    const { stats, loading: statsLoading } = useDashboardStats();
    const [aiSummary, setAiSummary] = useState('');
    const [generatedTime, setGeneratedTime] = useState('');
    const [mounted, setMounted] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [insights, setInsights] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    // Calculate storage usage percentage (assuming 5TB total capacity)
    const storageUsage = stats ? Math.round((stats.storageUsedGB / 5120) * 100) : 0;

    useEffect(() => {
        setMounted(true);
        setGeneratedTime(new Date().toLocaleString());
        
        if (stats && !statsLoading) {
            generateInsights();
        }
    }, [stats, statsLoading]);

    const generateInsights = () => {
        if (!stats) return;

        const newInsights = [];
        const newRecommendations = [];

        // Analyze growth trends
        if (stats.activeUsersChange > 10) {
            newInsights.push({
                type: 'positive',
                icon: TrendingUp,
                title: 'Strong User Growth',
                description: `Active users increased by ${stats.activeUsersChange}% - excellent momentum!`,
                metric: `+${stats.activeUsersChange}%`
            });
        } else if (stats.activeUsersChange < -5) {
            newInsights.push({
                type: 'warning',
                icon: AlertTriangle,
                title: 'User Activity Decline',
                description: `Active users decreased by ${Math.abs(stats.activeUsersChange)}% - needs attention`,
                metric: `${stats.activeUsersChange}%`
            });
            newRecommendations.push({
                priority: 'high',
                title: 'Re-engagement Campaign',
                description: 'Launch email campaign to inactive users with special offers',
                action: 'Create Campaign'
            });
        }

        // Analyze storage usage
        const storagePercentage = (stats.storageUsedGB / 100) * 100; // Assuming 100GB limit
        if (storagePercentage > 80) {
            newInsights.push({
                type: 'warning',
                icon: AlertTriangle,
                title: 'High Storage Usage',
                description: `${stats.storageUsedGB} GB used - approaching capacity`,
                metric: `${Math.round(storagePercentage)}%`
            });
            newRecommendations.push({
                priority: 'medium',
                title: 'Storage Optimization',
                description: 'Consider implementing storage cleanup or expanding capacity',
                action: 'Review Storage'
            });
        }

        // Analyze plan distribution
        if (stats.planDistribution.freePercentage > 85) {
            newInsights.push({
                type: 'opportunity',
                icon: DollarSign,
                title: 'Conversion Opportunity',
                description: `${stats.planDistribution.freePercentage}% users on free plan - high conversion potential`,
                metric: `${stats.planDistribution.freePercentage}%`
            });
            newRecommendations.push({
                priority: 'high',
                title: 'Premium Upgrade Campaign',
                description: 'Target free users approaching storage limits with upgrade prompts',
                action: 'Setup Targeting'
            });
        }

        // Memory upload trends
        if (stats.memoriesChange > 15) {
            newInsights.push({
                type: 'positive',
                icon: TrendingUp,
                title: 'High Engagement',
                description: `Memory uploads increased ${stats.memoriesChange}% - users are highly active`,
                metric: `+${stats.memoriesChange}%`
            });
        }

        // Weekly activity analysis
        const avgMemoriesPerUser = stats.weeklyMemories / stats.totalUsers;
        if (avgMemoriesPerUser > 5) {
            newInsights.push({
                type: 'positive',
                icon: Users,
                title: 'Strong User Engagement',
                description: `${avgMemoriesPerUser.toFixed(1)} memories per user this week - excellent engagement`,
                metric: `${avgMemoriesPerUser.toFixed(1)}/user`
            });
        } else if (avgMemoriesPerUser < 1) {
            newRecommendations.push({
                priority: 'medium',
                title: 'Boost User Engagement',
                description: 'Send reminder notifications and engagement prompts to inactive users',
                action: 'Create Reminders'
            });
        }

        setInsights(newInsights);
        setRecommendations(newRecommendations);
    };

    const generateAISummary = async () => {
        if (!stats) return;

        setGeneratingAI(true);
        
        // Simulate AI analysis (replace with actual OpenAI call later)
        setTimeout(() => {
            const mockSummary = `
🤖 **Rob's Weekly AI Analysis**

**📊 Performance Overview:**
- Total users: ${stats.totalUsers.toLocaleString()} (${stats.activeUsersChange > 0 ? '+' : ''}${stats.activeUsersChange}% change)
- Active today: ${stats.activeToday} users
- New memories: ${stats.newMemories24h} in last 24h
- Storage usage: ${stats.storageUsedGB} GB

**🎯 Key Insights:**
${insights.length > 0 ? insights.map(insight => `- ${insight.title}: ${insight.description}`).join('\n') : '- Overall platform performance is stable'}

**💡 Recommended Actions:**
${recommendations.length > 0 ? recommendations.map(rec => `- ${rec.title}: ${rec.description}`).join('\n') : '- Continue monitoring current trends'}

**🔮 Predictions:**
- User growth trajectory suggests ${stats.activeUsersChange > 5 ? 'continued expansion' : 'stabilization'}
- ${stats.planDistribution.freePercentage > 80 ? 'High conversion potential with targeted campaigns' : 'Healthy premium user base'}
- Storage scaling will be needed ${storageUsage > 70 ? 'within 30 days' : 'in next quarter'}

**⚡ Priority Focus:**
${recommendations.length > 0 ? recommendations[0].title : 'Maintain current performance levels'}
            `;
            setAiSummary(mockSummary);
            setGeneratingAI(false);
        }, 2000);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-red-200 bg-red-50 text-red-800';
            case 'medium': return 'border-orange-200 bg-orange-50 text-orange-800';
            case 'low': return 'border-blue-200 bg-blue-50 text-blue-800';
            default: return 'border-gray-200 bg-gray-50 text-gray-800';
        }
    };

    const getInsightTypeColor = (type) => {
        switch (type) {
            case 'positive': return 'border-green-200 bg-green-50';
            case 'warning': return 'border-orange-200 bg-orange-50';
            case 'opportunity': return 'border-blue-200 bg-blue-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    return (
        <AdminLayout title="AI Insights">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Insights & Analytics</h1>
                        <p className="text-gray-600">Rob's intelligent analysis of your platform performance</p>
                    </div>
                    <button
                        onClick={generateAISummary}
                        disabled={generatingAI || statsLoading}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        <Brain className={`w-4 h-4 mr-2 ${generatingAI ? 'animate-pulse' : ''}`} />
                        {generatingAI ? 'Generating...' : 'Generate AI Summary'}
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'AI Insights', value: insights.length, icon: Lightbulb, color: 'text-yellow-600' },
                        { label: 'Recommendations', value: recommendations.length, icon: Target, color: 'text-blue-600' },
                        { label: 'Growth Rate', value: `${stats?.activeUsersChange || 0}%`, icon: TrendingUp, color: 'text-green-600' },
                        { label: 'Conversion Op.', value: `${stats?.planDistribution?.freePercentage || 0}%`, icon: DollarSign, color: 'text-purple-600' }
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

                {/* AI Summary */}
                {aiSummary && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                        <div className="flex items-center mb-4">
                            <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                <Brain className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Rob's AI Analysis</h3>
                                <p className="text-sm text-gray-600">Generated {mounted ? generatedTime : 'Loading...'}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-purple-100">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                                {aiSummary}
                            </pre>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Insights */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center">
                                <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900">Smart Insights</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">AI-detected patterns and trends</p>
                        </div>
                        <div className="p-6">
                            {insights.length === 0 ? (
                                <div className="text-center py-8">
                                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No specific insights detected</p>
                                    <p className="text-sm text-gray-500">Generate AI summary for detailed analysis</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {insights.map((insight, index) => (
                                        <div key={index} className={`p-4 rounded-lg border ${getInsightTypeColor(insight.type)}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-3">
                                                    <insight.icon className="w-5 h-5 mt-0.5 text-gray-600" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                                                    </div>
                                                </div>
                                                <span className="text-lg font-bold text-gray-900">
                                                    {insight.metric}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center">
                                <Target className="w-5 h-5 text-blue-500 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900">Action Recommendations</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">AI-suggested optimizations</p>
                        </div>
                        <div className="p-6">
                            {recommendations.length === 0 ? (
                                <div className="text-center py-8">
                                    <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No immediate actions needed</p>
                                    <p className="text-sm text-gray-500">Your platform is performing well</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recommendations.map((rec, index) => (
                                        <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(rec.priority)}`}>
                                                            {rec.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{rec.description}</p>
                                                </div>
                                                <button className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                                    {rec.action}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Chat Interface (Future Enhancement) */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center">
                            <MessageSquare className="w-5 h-5 text-green-500 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">Chat with Rob</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Ask questions about your platform metrics</p>
                    </div>
                    <div className="p-6">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">AI Chat Interface</p>
                            <p className="text-sm text-gray-500 mt-1">Coming in next update - will integrate with OpenAI</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default InsightsPage;
