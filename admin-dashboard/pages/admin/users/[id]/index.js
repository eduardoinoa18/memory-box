import { useRouter } from 'next/router';
import { useState } from 'react';
import AdminLayout from '../../../../layouts/AdminLayout';
import { useUserData } from '../../../../hooks/useUserData';
import RobAIPanel from '../../../../components/RobAIPanel';
import {
    ArrowLeft,
    User,
    Calendar,
    Mail,
    Crown,
    Folder,
    Image,
    FileText,
    Video,
    Music,
    Download,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    HardDrive,
    Activity,
    Brain,
    Eye,
    Ban,
    Trash2
} from 'lucide-react';

export default function UserDetails() {
    const router = useRouter();
    const { id } = router.query;
    const { user, folders, memories, stats, loading, error, refreshData } = useUserData(id);
    const [activeTab, setActiveTab] = useState('overview');

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileTypeIcon = (type) => {
        switch (type) {
            case 'image': return <Image className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            case 'audio': return <Music className="w-4 h-4" />;
            case 'document': return <FileText className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getPlanBadgeColor = (plan) => {
        switch (plan) {
            case 'premium': return 'bg-purple-100 text-purple-800';
            case 'family': return 'bg-blue-100 text-blue-800';
            case 'free': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleExportData = async (format = 'json') => {
        try {
            const response = await fetch(`/api/admin/users/${user.id}/export?format=${format}`);
            
            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `user-${user.id}-data.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading user data...</span>
                </div>
            </AdminLayout>
        );
    }

    if (error || !user) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h3>
                    <p className="text-gray-500 mb-4">{error || 'The requested user could not be found.'}</p>
                    <button
                        onClick={() => router.push('/admin/users')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Back to Users
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/admin/users')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user.name || user.displayName || 'User'}'s Dashboard
                            </h1>
                            <p className="text-gray-500">Detailed view of user data and activity</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={refreshData}
                            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </button>
                        <div className="relative">
                            <button 
                                onClick={() => handleExportData('json')}
                                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {user.name || user.displayName || 'Anonymous User'}
                                </h2>
                                <div className="flex items-center space-x-4 mt-1">
                                    <span className="flex items-center text-sm text-gray-500">
                                        <Mail className="w-4 h-4 mr-1" />
                                        {user.email}
                                    </span>
                                    <span className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Joined {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor(stats.planType)}`}>
                                <Crown className="w-3 h-3 mr-1" />
                                {stats.planType.charAt(0).toUpperCase() + stats.planType.slice(1)} Plan
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Image className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Memories</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalMemories}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Folder className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Folders Created</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalFolders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <HardDrive className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Storage Used</p>
                                <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.storageUsed)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Activity className="w-8 h-8 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Last Active</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {stats.lastActive?.toLocaleDateString() || 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', name: 'Overview', icon: User },
                            { id: 'folders', name: 'Folders', icon: Folder },
                            { id: 'memories', name: 'Recent Memories', icon: Image },
                            { id: 'ai-insights', name: 'Rob AI Insights', icon: Brain }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
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

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Account Information */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">User ID</dt>
                                        <dd className="text-sm text-gray-900 font-mono">{user.id}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="text-sm text-gray-900">{user.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Plan Type</dt>
                                        <dd className="text-sm text-gray-900">{stats.planType.charAt(0).toUpperCase() + stats.planType.slice(1)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                                        <dd className="text-sm text-gray-900">
                                            {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                                        <dd className="text-sm text-gray-900">
                                            {user.lastLoginAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                        <span className="flex items-center">
                                            <Eye className="w-4 h-4 mr-2 text-blue-600" />
                                            View All User Data
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => handleExportData('json')}
                                        className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <span className="flex items-center">
                                            <Download className="w-4 h-4 mr-2 text-green-600" />
                                            Export User Data (JSON)
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => handleExportData('csv')}
                                        className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <span className="flex items-center">
                                            <Download className="w-4 h-4 mr-2 text-green-600" />
                                            Export User Data (CSV)
                                        </span>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                        <span className="flex items-center">
                                            <Ban className="w-4 h-4 mr-2 text-yellow-600" />
                                            Suspend Account
                                        </span>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 border border-red-200 rounded-lg hover:bg-red-50">
                                        <span className="flex items-center text-red-600">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'folders' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Folder Summary</h3>
                                <p className="text-sm text-gray-500">User's organizational structure and content distribution</p>
                            </div>
                            <div className="p-6">
                                {folders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Folders Created</h3>
                                        <p className="text-gray-500">This user hasn't created any folders yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {folders.map((folder) => {
                                            const folderMemories = memories.filter(m => m.folderId === folder.id);
                                            return (
                                                <div key={folder.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div 
                                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                            style={{ backgroundColor: folder.color || '#3B82F6' }}
                                                        >
                                                            <Folder className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{folder.name}</h4>
                                                            <p className="text-sm text-gray-500">
                                                                Created {folder.createdAt.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-900">{folderMemories.length} memories</p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatFileSize(folderMemories.reduce((acc, m) => acc + (m.fileSize || 0), 0))}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'memories' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Recent Memories</h3>
                                <p className="text-sm text-gray-500">Latest uploads and content preview</p>
                            </div>
                            <div className="p-6">
                                {memories.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Memories Found</h3>
                                        <p className="text-gray-500">This user hasn't uploaded any memories yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {memories.slice(0, 9).map((memory) => (
                                            <div key={memory.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                {memory.type === 'image' && memory.fileUrl ? (
                                                    <div className="aspect-video bg-gray-100 relative">
                                                        <img 
                                                            src={memory.fileUrl} 
                                                            alt={memory.fileName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute top-2 left-2">
                                                            {getFileTypeIcon(memory.type)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                                        {getFileTypeIcon(memory.type)}
                                                    </div>
                                                )}
                                                <div className="p-3">
                                                    <h4 className="font-medium text-gray-900 text-sm truncate">
                                                        {memory.fileName}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {memory.createdAt.toLocaleDateString()} • {formatFileSize(memory.fileSize || 0)}
                                                    </p>
                                                    {memory.description && (
                                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                            {memory.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai-insights' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                                    Rob AI Insights & Recommendations
                                </h3>
                                <p className="text-sm text-gray-500">AI-generated insights and activity logs</p>
                            </div>
                            <div className="p-6">
                                <RobAIPanel userId={user.id} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
