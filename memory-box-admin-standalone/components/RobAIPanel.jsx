import { useState, useEffect } from 'react';
// TODO: Re-enable Firebase when ready
/*
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    limit,
    addDoc,
    serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
*/
import { Brain, Activity, Tag, Clock, TrendingUp } from 'lucide-react';

export default function RobAIPanel({ userId }) {
    const [aiLogs, setAiLogs] = useState([]);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        fetchAIData();
    }, [userId]);

    const fetchAIData = async () => {
        try {
            setLoading(true);
            
            // Fetch AI activity logs (if they exist)
            const logsQuery = query(
                collection(db, 'ai-logs'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            
            const logsSnapshot = await getDocs(logsQuery);
            const logs = logsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            
            setAiLogs(logs);
            
            // Generate mock insights for now
            generateMockInsights();
            
        } catch (error) {
            console.error('Error fetching AI data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateMockInsights = () => {
        // This will be replaced with real AI analysis later
        const mockInsights = {
            memoryCategories: [
                { category: 'Family', count: 45, percentage: 35 },
                { category: 'Travel', count: 28, percentage: 22 },
                { category: 'Work', count: 22, percentage: 17 },
                { category: 'Events', count: 18, percentage: 14 },
                { category: 'Other', count: 15, percentage: 12 }
            ],
            suggestedTags: [
                'vacation', 'birthday', 'wedding', 'work meeting', 'family dinner'
            ],
            activityPattern: {
                mostActiveDay: 'Sunday',
                mostActiveTime: '7:00 PM',
                uploadFrequency: 'Weekly'
            },
            recommendations: [
                'User frequently uploads family photos - suggest creating a "Family Moments" folder',
                'Travel photos could benefit from location-based organization',
                'Consider suggesting backup reminders for important documents'
            ]
        };
        
        setInsights(mockInsights);
    };

    const logAIActivity = async (activityType, description, metadata = {}) => {
        try {
            await addDoc(collection(db, 'ai-logs'), {
                userId,
                activityType,
                description,
                metadata,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error logging AI activity:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading AI insights...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* AI Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <Brain className="w-8 h-8 text-purple-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-purple-900">AI Interactions</p>
                            <p className="text-2xl font-bold text-purple-900">{aiLogs.length}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <Tag className="w-8 h-8 text-blue-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-blue-900">Auto Tags</p>
                            <p className="text-2xl font-bold text-blue-900">
                                {insights?.suggestedTags?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-900">Categories</p>
                            <p className="text-2xl font-bold text-green-900">
                                {insights?.memoryCategories?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Memory Categories Analysis */}
            {insights?.memoryCategories && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Memory Categories</h3>
                    <div className="space-y-3">
                        {insights.memoryCategories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-gray-900">{category.category}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-500">{category.count} memories</span>
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-purple-600 h-2 rounded-full" 
                                            style={{ width: `${category.percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-gray-500 w-10">{category.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Activity Pattern */}
            {insights?.activityPattern && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Patterns</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Most Active Day</p>
                            <p className="text-lg font-semibold text-gray-900">{insights.activityPattern.mostActiveDay}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Peak Time</p>
                            <p className="text-lg font-semibold text-gray-900">{insights.activityPattern.mostActiveTime}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Upload Frequency</p>
                            <p className="text-lg font-semibold text-gray-900">{insights.activityPattern.uploadFrequency}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Recommendations */}
            {insights?.recommendations && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h3>
                    <div className="space-y-3">
                        {insights.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <Brain className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <p className="text-sm text-yellow-800">{recommendation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent AI Activity Log */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent AI Activity</h3>
                {aiLogs.length === 0 ? (
                    <div className="text-center py-8">
                        <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">No AI activity recorded yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Activity will appear here when Rob AI starts analyzing user content
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {aiLogs.map((log) => (
                            <div key={log.id} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg">
                                <Clock className="w-4 h-4 text-gray-400 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{log.description}</p>
                                    <p className="text-xs text-gray-500">
                                        {log.createdAt.toLocaleDateString()} at {log.createdAt.toLocaleTimeString()}
                                    </p>
                                </div>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {log.activityType}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Future Features Preview */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🚀 Coming Soon</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium text-purple-900">Advanced Analytics</h4>
                        <ul className="text-sm text-purple-700 space-y-1">
                            <li>• Smart content categorization</li>
                            <li>• Duplicate detection and cleanup</li>
                            <li>• Auto-generated memory timelines</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-blue-900">Smart Features</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Personalized organization tips</li>
                            <li>• Content moderation alerts</li>
                            <li>• Usage optimization suggestions</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
