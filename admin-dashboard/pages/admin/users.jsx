import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../layouts/AdminLayout';
import apiService from '../../services/apiService';
import {
    Search,
    Filter,
    Download,
    Mail,
    MoreVertical,
    Edit,
    Trash2,
    Crown,
    Shield,
    User,
    Calendar,
    DollarSign,
    FileText,
    Eye,
    Ban,
    CheckCircle,
    AlertTriangle,
    Plus,
    RefreshCw
} from 'lucide-react';

const UsersPage = () => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [bulkAction, setBulkAction] = useState('');

    useEffect(() => {
        loadUsers();
    }, [currentPage, selectedFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 20,
                filter: selectedFilter !== 'all' ? selectedFilter : undefined,
                search: searchTerm || undefined
            };
            
            const response = await apiService.getUsers(params);
            setUsers(response.users);
            setFilteredUsers(response.users);
            setTotalUsers(response.total);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.warn('API unavailable, using demo data:', error);
            // Fallback to demo data
            const mockUsers = generateMockUsers();
            setUsers(mockUsers);
            setFilteredUsers(mockUsers);
            setTotalUsers(mockUsers.length);
            setTotalPages(Math.ceil(mockUsers.length / 20));
        } finally {
            setLoading(false);
        }
    };

    const generateMockUsers = () => [
        {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            role: 'user',
            plan: 'premium',
            status: 'active',
            joinDate: '2024-01-15',
            lastActive: '2024-07-05',
            memoriesCount: 157,
            storageUsed: '2.3 GB',
            revenue: 59.88,
            avatar: '/api/placeholder/40/40'
        },
        {
            id: '2',
            name: 'Mike Chen',
            email: 'mike@example.com',
            role: 'user',
            plan: 'family',
            status: 'active',
            joinDate: '2024-02-20',
            lastActive: '2024-07-06',
            memoriesCount: 342,
            storageUsed: '5.7 GB',
            revenue: 119.76,
            avatar: '/api/placeholder/40/40'
        },
        {
            id: '3',
            name: 'Emma Wilson',
            email: 'emma@example.com',
            role: 'user',
            plan: 'free',
            status: 'active',
            joinDate: '2024-03-10',
            lastActive: '2024-07-04',
            memoriesCount: 23,
            storageUsed: '0.4 GB',
            revenue: 0,
            avatar: '/api/placeholder/40/40'
        },
        {
            id: '4',
            name: 'Alex Rodriguez',
            email: 'alex@example.com',
            role: 'user',
            plan: 'premium',
            status: 'suspended',
            joinDate: '2024-01-05',
            lastActive: '2024-06-30',
            memoriesCount: 89,
            storageUsed: '1.8 GB',
            revenue: 29.94,
            avatar: '/api/placeholder/40/40'
        },
        {
            id: '5',
            name: 'Lisa Park',
            email: 'lisa@example.com',
            role: 'moderator',
            plan: 'family',
            status: 'active',
            joinDate: '2024-01-01',
            lastActive: '2024-07-06',
            memoriesCount: 201,
            storageUsed: '3.2 GB',
            revenue: 59.94,
            avatar: '/api/placeholder/40/40'
        }
    ];

    const handleSearch = async (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
        if (term.length > 2 || term.length === 0) {
            await loadUsers();
        }
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        setCurrentPage(1);
    };

    const handleViewUser = (userId) => {
        router.push(`/admin/users/${userId}`);
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setShowUserModal(true);
    };

    const handleEditUser = async (user) => {
        try {
            const fullUserData = await apiService.getUser(user.id);
            setSelectedUser(fullUserData);
            setShowUserModal(true);
        } catch (error) {
            console.error('Failed to load user details:', error);
            setSelectedUser(user);
            setShowUserModal(true);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await apiService.deleteUser(userId);
                await loadUsers();
                alert('User deleted successfully');
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Failed to delete user. Please try again.');
            }
        }
    };

    const handleSuspendUser = async (userId) => {
        try {
            await apiService.suspendUser(userId);
            await loadUsers();
            alert('User suspended successfully');
        } catch (error) {
            console.error('Failed to suspend user:', error);
            alert('Failed to suspend user. Please try again.');
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await apiService.activateUser(userId);
            await loadUsers();
            alert('User activated successfully');
        } catch (error) {
            console.error('Failed to activate user:', error);
            alert('Failed to activate user. Please try again.');
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedUsers.length === 0) return;

        if (confirm(`Are you sure you want to ${bulkAction} ${selectedUsers.length} user(s)?`)) {
            try {
                switch (bulkAction) {
                    case 'delete':
                        await apiService.bulkDeleteUsers(selectedUsers);
                        break;
                    case 'suspend':
                        await apiService.bulkSuspendUsers(selectedUsers);
                        break;
                    case 'activate':
                        await apiService.bulkActivateUsers(selectedUsers);
                        break;
                    case 'export':
                        await handleExportUsers(selectedUsers);
                        return;
                }
                await loadUsers();
                setSelectedUsers([]);
                setBulkAction('');
                alert(`Successfully ${bulkAction}d ${selectedUsers.length} user(s)`);
            } catch (error) {
                console.error(`Failed to ${bulkAction} users:`, error);
                alert(`Failed to ${bulkAction} users. Please try again.`);
            }
        }
    };

    const handleExportUsers = async (userIds = null) => {
        try {
            const exportData = await apiService.exportUsers(userIds);
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export feature temporarily unavailable. Please try again later.');
        }
    };

    const handleCloseModal = () => {
        setShowUserModal(false);
        setSelectedUser(null);
    };
    // Filter and search logic
    useEffect(() => {
        let filtered = users;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(user => {
                switch (selectedFilter) {
                    case 'active': return user.status === 'active';
                    case 'suspended': return user.status === 'suspended';
                    case 'premium': return user.plan === 'premium';
                    case 'family': return user.plan === 'family';
                    case 'free': return user.plan === 'free';
                    case 'moderators': return user.role === 'moderator';
                    default: return true;
                }
            });
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, selectedFilter]);

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(user => user.id));
        }
    };

    const getPlanBadge = (plan) => {
        switch (plan) {
            case 'premium':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                </span>;
            case 'family':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Family+
                </span>;
            case 'free':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <User className="w-3 h-3 mr-1" />
                    Free
                </span>;
            default:
                return null;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                </span>;
            case 'suspended':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Ban className="w-3 h-3 mr-1" />
                    Suspended
                </span>;
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Pending
                </span>;
            default:
                return null;
        }
    };

    const bulkActions = [
        { name: 'Send Email', icon: Mail, action: () => console.log('Send email') },
        { name: 'Export Users', icon: Download, action: () => handleExportUsers(selectedUsers) },
        { name: 'Suspend', icon: Ban, action: () => { setBulkAction('suspend'); handleBulkAction(); } },
        { name: 'Activate', icon: CheckCircle, action: () => { setBulkAction('activate'); handleBulkAction(); } },
        { name: 'Delete', icon: Trash2, action: () => { setBulkAction('delete'); handleBulkAction(); } },
    ];

    if (loading) {
        return (
            <AdminLayout title="User Management">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="User Management">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
                        <p className="text-gray-600">Manage all platform users and their permissions ({totalUsers.toLocaleString()} total)</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                        <button 
                            onClick={() => handleExportUsers()}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export All
                        </button>
                        <button 
                            onClick={loadUsers}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </button>
                        <button 
                            onClick={handleAddUser}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add User
                        </button>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedUsers.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-blue-800 font-medium">
                                {selectedUsers.length} user(s) selected
                            </span>
                            <div className="flex items-center space-x-2">
                                <select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    className="border border-blue-300 rounded px-3 py-1 text-sm bg-white"
                                >
                                    <option value="">Select action...</option>
                                    <option value="export">Export Selected</option>
                                    <option value="suspend">Suspend</option>
                                    <option value="activate">Activate</option>
                                    <option value="delete">Delete</option>
                                </select>
                                <button
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                    className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={() => setSelectedUsers([])}
                                    className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={selectedFilter}
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Users</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="premium">Premium</option>
                                <option value="family">Family+</option>
                                <option value="free">Free</option>
                                <option value="moderators">Moderators</option>
                            </select>
                            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Plan & Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Storage
                                    </th>
                                    <th className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                    {user.role === 'moderator' && (
                                                        <div className="text-xs text-blue-600 font-medium">Moderator</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                {getPlanBadge(user.plan)}
                                                {getStatusBadge(user.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>
                                                <div className="flex items-center">
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    {user.memoriesCount} memories
                                                </div>
                                                <div className="flex items-center mt-1">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    Last active: {new Date(user.lastActive).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                                                ${user.revenue.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.storageUsed}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => handleViewUser(user.id)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="View User Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleEditUser(user)}
                                                    className="text-green-600 hover:text-green-900 transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <div className="relative group">
                                                    <button className="text-gray-600 hover:text-gray-900 transition-colors">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    <div className="absolute right-0 top-6 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                                        {user.status === 'active' ? (
                                                            <button
                                                                onClick={() => handleSuspendUser(user.id)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                <Ban className="w-4 h-4 mr-2" />
                                                                Suspend User
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleActivateUser(user.id)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                Activate User
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => router.push(`mailto:${user.email}`)}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Mail className="w-4 h-4 mr-2" />
                                                            Send Email
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete User
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Total Users</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-500">Active Users</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-purple-600">
                            {users.filter(u => u.plan === 'premium').length + users.filter(u => u.plan === 'family').length}
                        </div>
                        <div className="text-sm text-gray-500">Paid Users</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">
                            ${users.reduce((sum, u) => sum + u.revenue, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">{(currentPage - 1) * 20 + 1}</span>
                                    {' '}to{' '}
                                    <span className="font-medium">
                                        {Math.min(currentPage * 20, totalUsers)}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-medium">{totalUsers}</span>
                                    {' '}results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    {/* Page numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                        if (pageNum > totalPages) return null;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    pageNum === currentPage
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {selectedUser ? 'Edit User' : 'Add New User'}
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
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    defaultValue={selectedUser?.name || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter full name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    defaultValue={selectedUser?.email || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter email address"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Plan
                                </label>
                                <select
                                    defaultValue={selectedUser?.plan || 'free'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="free">Free Plan</option>
                                    <option value="premium">Premium Plan</option>
                                    <option value="family">Family Plan</option>
                                    <option value="enterprise">Enterprise Plan</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    defaultValue={selectedUser?.role || 'user'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="user">User</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="admin">Admin</option>
                                </select>
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
                                    {selectedUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default UsersPage;
