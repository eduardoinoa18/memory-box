import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
    Mail, 
    Search, 
    Filter, 
    Plus, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    Eye, 
    Send, 
    Clock, 
    CheckCircle, 
    XCircle,
    Heart,
    Star,
    User,
    Calendar,
    Download,
    Archive,
    MessageSquare,
    Sparkles
} from 'lucide-react';

const LettersPage = () => {
    const [letters, setLetters] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        drafts: 0,
        sent: 0,
        scheduled: 0
    });

    // Mock data for demonstration
    useEffect(() => {
        const mockLetters = [
            {
                id: 1,
                title: "Welcome to Memory Box",
                content: "Dear Sarah, welcome to our Memory Box family! We're excited to help you preserve...",
                recipient: "Sarah Johnson",
                recipientEmail: "sarah@example.com",
                status: "sent",
                type: "welcome",
                createdAt: "2025-07-10T14:30:00Z",
                sentAt: "2025-07-10T15:00:00Z",
                scheduledFor: null,
                aiGenerated: true,
                emotions: ["joy", "welcome"],
                engagement: { opened: true, clicked: 2, responded: false }
            },
            {
                id: 2,
                title: "Your Memory Timeline is Ready",
                content: "Hi Mike, your AI-generated memory timeline for June is now available...",
                recipient: "Mike Chen",
                recipientEmail: "mike@example.com",
                status: "sent",
                type: "timeline",
                createdAt: "2025-07-09T10:15:00Z",
                sentAt: "2025-07-09T11:00:00Z",
                scheduledFor: null,
                aiGenerated: true,
                emotions: ["nostalgia", "happiness"],
                engagement: { opened: true, clicked: 5, responded: true }
            },
            {
                id: 3,
                title: "Happy Birthday Memory Letter",
                content: "Dear Emma, on this special day, we've compiled your most cherished memories...",
                recipient: "Emma Wilson",
                recipientEmail: "emma@example.com",
                status: "scheduled",
                type: "birthday",
                createdAt: "2025-07-08T16:45:00Z",
                sentAt: null,
                scheduledFor: "2025-07-15T09:00:00Z",
                aiGenerated: true,
                emotions: ["celebration", "love"],
                engagement: { opened: false, clicked: 0, responded: false }
            },
            {
                id: 4,
                title: "Family Reunion Memory Collection",
                content: "Hi Alex, we've created a beautiful collection of memories from your recent...",
                recipient: "Alex Rodriguez",
                recipientEmail: "alex@example.com",
                status: "draft",
                type: "family",
                createdAt: "2025-07-11T12:20:00Z",
                sentAt: null,
                scheduledFor: null,
                aiGenerated: false,
                emotions: ["togetherness", "joy"],
                engagement: { opened: false, clicked: 0, responded: false }
            },
            {
                id: 5,
                title: "Anniversary Memory Story",
                content: "Dear Lisa and John, celebrating 10 years of beautiful memories together...",
                recipient: "Lisa & John Park",
                recipientEmail: "lisa@example.com",
                status: "sent",
                type: "anniversary",
                createdAt: "2025-07-07T09:30:00Z",
                sentAt: "2025-07-07T18:00:00Z",
                scheduledFor: null,
                aiGenerated: true,
                emotions: ["love", "celebration"],
                engagement: { opened: true, clicked: 8, responded: true }
            }
        ];

        setLetters(mockLetters);
        setStats({
            total: mockLetters.length,
            drafts: mockLetters.filter(l => l.status === 'draft').length,
            sent: mockLetters.filter(l => l.status === 'sent').length,
            scheduled: mockLetters.filter(l => l.status === 'scheduled').length
        });
        setLoading(false);
    }, []);

    const filteredLetters = letters.filter(letter => {
        const matchesSearch = letter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            letter.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            letter.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || letter.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'sent': return 'bg-green-100 text-green-800';
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent': return <CheckCircle size={16} />;
            case 'scheduled': return <Clock size={16} />;
            case 'draft': return <Edit2 size={16} />;
            default: return <Mail size={16} />;
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            welcome: 'bg-purple-100 text-purple-800',
            timeline: 'bg-indigo-100 text-indigo-800',
            birthday: 'bg-pink-100 text-pink-800',
            family: 'bg-orange-100 text-orange-800',
            anniversary: 'bg-red-100 text-red-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const handleCreateLetter = () => {
        setSelectedLetter(null);
        setShowModal(true);
    };

    const handleEditLetter = (letter) => {
        setSelectedLetter(letter);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedLetter(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <AdminLayout title="Letters">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="AI Letters Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Letters</h1>
                        <p className="text-gray-600">Manage personalized memory letters and communications</p>
                    </div>
                    <button
                        onClick={handleCreateLetter}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Create Letter</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Letters</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Sent</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <Edit2 className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Drafts</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.drafts}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search letters..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="sent">Sent</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Letters Table */}
                <div className="bg-white rounded-lg shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Letter
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Recipient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Engagement
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLetters.map((letter) => (
                                    <tr key={letter.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        {letter.aiGenerated ? (
                                                            <Sparkles className="h-5 w-5 text-blue-600" />
                                                        ) : (
                                                            <Mail className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {letter.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {letter.content.substring(0, 60)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {letter.recipient}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {letter.recipientEmail}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(letter.type)}`}>
                                                {letter.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(letter.status)}`}>
                                                {getStatusIcon(letter.status)}
                                                <span className="ml-1">{letter.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(letter.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {letter.status === 'sent' && (
                                                <div className="text-sm">
                                                    <div className="flex items-center text-green-600">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        {letter.engagement.opened ? 'Opened' : 'Not opened'}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {letter.engagement.clicked} clicks
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditLetter(letter)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="text-green-600 hover:text-green-900">
                                                    <Eye size={16} />
                                                </button>
                                                <button className="text-gray-600 hover:text-gray-900">
                                                    <Download size={16} />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit Letter Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {selectedLetter ? 'Edit Letter' : 'Create New Letter'}
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Letter Title
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={selectedLetter?.title || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter letter title"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Recipient Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={selectedLetter?.recipient || ''}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter recipient name"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Recipient Email
                                        </label>
                                        <input
                                            type="email"
                                            defaultValue={selectedLetter?.recipientEmail || ''}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Letter Type
                                        </label>
                                        <select
                                            defaultValue={selectedLetter?.type || 'welcome'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="welcome">Welcome</option>
                                            <option value="timeline">Timeline</option>
                                            <option value="birthday">Birthday</option>
                                            <option value="family">Family</option>
                                            <option value="anniversary">Anniversary</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            defaultValue={selectedLetter?.status || 'draft'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="scheduled">Scheduled</option>
                                            <option value="sent">Send Now</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Letter Content
                                    </label>
                                    <textarea
                                        rows={8}
                                        defaultValue={selectedLetter?.content || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Write your letter content here..."
                                    ></textarea>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        defaultChecked={selectedLetter?.aiGenerated || true}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                        Use AI enhancement for emotional tone and personalization
                                    </label>
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        {selectedLetter ? 'Update Letter' : 'Create Letter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default LettersPage;
