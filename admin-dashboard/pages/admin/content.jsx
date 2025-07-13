import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    Search,
    Filter,
    Download,
    Eye,
    MoreVertical,
    Edit,
    Trash2,
    Flag,
    CheckCircle,
    XCircle,
    Clock,
    Image,
    Video,
    FileText,
    Folder,
    User,
    Calendar,
    AlertTriangle,
    Shield,
    Star,
    Heart,
    MessageSquare,
    Share2
} from 'lucide-react';

const ContentPage = () => {
    const [content, setContent] = useState([]);
    const [filteredContent, setFilteredContent] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedContent, setSelectedContent] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    // Mock content data
    useEffect(() => {
        const mockContent = [
            {
                id: '1',
                type: 'image',
                title: 'Family Vacation 2024',
                description: 'Beautiful sunset at the beach with the whole family',
                user: 'Sarah Johnson',
                userId: 'user1',
                uploadDate: '2024-07-01',
                status: 'approved',
                size: '2.4 MB',
                views: 156,
                likes: 23,
                comments: 8,
                reports: 0,
                folder: 'Vacations',
                thumbnail: '/api/placeholder/100/100',
                tags: ['family', 'beach', 'vacation', 'sunset']
            },
            {
                id: '2',
                type: 'video',
                title: 'Baby\'s First Steps',
                description: 'Amazing milestone captured forever',
                user: 'Mike Chen',
                userId: 'user2',
                uploadDate: '2024-07-02',
                status: 'pending',
                size: '15.7 MB',
                views: 89,
                likes: 45,
                comments: 12,
                reports: 0,
                folder: 'Milestones',
                thumbnail: '/api/placeholder/100/100',
                tags: ['baby', 'milestone', 'family', 'precious']
            },
            {
                id: '3',
                type: 'letter',
                title: 'Letter to Future Self',
                description: 'Thoughts and hopes for the next decade',
                user: 'Emma Wilson',
                userId: 'user3',
                uploadDate: '2024-07-03',
                status: 'approved',
                size: '1.2 MB',
                views: 234,
                likes: 67,
                comments: 23,
                reports: 0,
                folder: 'Personal',
                thumbnail: '/api/placeholder/100/100',
                tags: ['letter', 'future', 'personal', 'reflection']
            },
            {
                id: '4',
                type: 'image',
                title: 'Wedding Anniversary',
                description: 'Celebrating 25 years together',
                user: 'Alex Rodriguez',
                userId: 'user4',
                uploadDate: '2024-07-04',
                status: 'flagged',
                size: '3.1 MB',
                views: 45,
                likes: 12,
                comments: 3,
                reports: 2,
                folder: 'Celebrations',
                thumbnail: '/api/placeholder/100/100',
                tags: ['wedding', 'anniversary', 'love', 'celebration']
            },
            {
                id: '5',
                type: 'image',
                title: 'Graduation Day',
                description: 'PhD finally completed after 6 years',
                user: 'Lisa Park',
                userId: 'user5',
                uploadDate: '2024-07-05',
                status: 'approved',
                size: '2.8 MB',
                views: 178,
                likes: 89,
                comments: 34,
                reports: 0,
                folder: 'Achievements',
                thumbnail: '/api/placeholder/100/100',
                tags: ['graduation', 'achievement', 'education', 'pride']
            }
        ];
        setContent(mockContent);
        setFilteredContent(mockContent);
    }, []);

    // Filter and search logic
    useEffect(() => {
        let filtered = content;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (selectedFilter !== 'all') {
            filtered = filtered.filter(item => {
                switch (selectedFilter) {
                    case 'images': return item.type === 'image';
                    case 'videos': return item.type === 'video';
                    case 'letters': return item.type === 'letter';
                    case 'pending': return item.status === 'pending';
                    case 'flagged': return item.status === 'flagged';
                    case 'approved': return item.status === 'approved';
                    default: return true;
                }
            });
        }

        setFilteredContent(filtered);
    }, [content, searchTerm, selectedFilter]);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'image': return <Image className="w-4 h-4 text-blue-500" />;
            case 'video': return <Video className="w-4 h-4 text-purple-500" />;
            case 'letter': return <FileText className="w-4 h-4 text-green-500" />;
            default: return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                </span>;
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                </span>;
            case 'flagged':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Flag className="w-3 h-3 mr-1" />
                    Flagged
                </span>;
            case 'rejected':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                </span>;
            default:
                return null;
        }
    };

    const handleApprove = (contentId) => {
        setContent(prev => prev.map(item =>
            item.id === contentId ? { ...item, status: 'approved' } : item
        ));
    };

    const handleReject = (contentId) => {
        setContent(prev => prev.map(item =>
            item.id === contentId ? { ...item, status: 'rejected' } : item
        ));
    };

    const handleFlag = (contentId) => {
        setContent(prev => prev.map(item =>
            item.id === contentId ? { ...item, status: 'flagged' } : item
        ));
    };

    const ContentCard = ({ item }) => (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
                <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 left-2">
                    {getTypeIcon(item.type)}
                </div>
                <div className="absolute top-2 right-2">
                    {getStatusBadge(item.status)}
                </div>
                {item.reports > 0 && (
                    <div className="absolute bottom-2 left-2">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.reports} reports
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 truncate">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {item.user}
                    </span>
                    <span>{item.size}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex space-x-3">
                        <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {item.views}
                        </span>
                        <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {item.likes}
                        </span>
                        <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {item.comments}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                        {new Date(item.uploadDate).toLocaleDateString()}
                    </span>

                    {item.status === 'pending' && (
                        <div className="flex space-x-1">
                            <button
                                onClick={() => handleApprove(item.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleReject(item.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Content Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
                        <p className="text-gray-600">Moderate and manage all user-generated content</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                        </button>
                        <div className="flex rounded-md shadow-sm">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-2 text-sm font-medium rounded-l-md border ${viewMode === 'list'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${viewMode === 'grid'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Grid
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{content.length}</div>
                        <div className="text-sm text-gray-500">Total Content</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-yellow-600">
                            {content.filter(c => c.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-500">Pending Review</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-red-600">
                            {content.filter(c => c.status === 'flagged').length}
                        </div>
                        <div className="text-sm text-gray-500">Flagged</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">
                            {content.filter(c => c.status === 'approved').length}
                        </div>
                        <div className="text-sm text-gray-500">Approved</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">
                            {content.reduce((sum, c) => sum + c.reports, 0)}
                        </div>
                        <div className="text-sm text-gray-500">Total Reports</div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search content by title, description, user, or tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Content</option>
                                <option value="images">Images</option>
                                <option value="videos">Videos</option>
                                <option value="letters">Letters</option>
                                <option value="pending">Pending Review</option>
                                <option value="flagged">Flagged</option>
                                <option value="approved">Approved</option>
                            </select>
                            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Content Display */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredContent.map((item) => (
                            <ContentCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Content
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Engagement
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredContent.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img className="h-12 w-12 rounded-lg object-cover" src={item.thumbnail} alt="" />
                                                    <div className="ml-4">
                                                        <div className="flex items-center">
                                                            {getTypeIcon(item.type)}
                                                            <div className="text-sm font-medium text-gray-900 ml-2">{item.title}</div>
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                                                        <div className="flex items-center mt-1">
                                                            <Folder className="w-3 h-3 text-gray-400 mr-1" />
                                                            <span className="text-xs text-gray-500">{item.folder}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.user}</div>
                                                <div className="text-sm text-gray-500">{item.size}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                                {item.reports > 0 && (
                                                    <div className="mt-1">
                                                        <span className="text-xs text-red-600">{item.reports} reports</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="space-y-1">
                                                    <div className="flex items-center">
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        {item.views} views
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Heart className="w-3 h-3 mr-1" />
                                                        {item.likes} likes
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MessageSquare className="w-3 h-3 mr-1" />
                                                        {item.comments} comments
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(item.uploadDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {item.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(item.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(item.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button className="text-gray-600 hover:text-gray-900">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ContentPage;
