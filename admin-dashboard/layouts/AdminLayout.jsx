import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    Users,
    FolderOpen,
    MessageSquare,
    BarChart3,
    Settings,
    Globe,
    CreditCard,
    Bell,
    Search,
    Menu,
    X,
    LogOut,
    Shield,
    Zap,
    BookOpen,
    Mail,
    Target,
    DollarSign,
    TrendingUp,
    FileText,
    Image,
    Calendar,
    Star,
    Brain
} from 'lucide-react';

const AdminLayout = ({ children, title = 'Admin Dashboard' }) => {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [notifications, setNotifications] = useState(3);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check authentication and load user data
    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');

        if (adminToken && adminUser) {
            try {
                const userData = JSON.parse(adminUser);
                setCurrentUser({
                    name: userData.username,
                    email: userData.username.includes('@') ? userData.username : 'admin@memorybox.com',
                    role: userData.role || 'admin',
                    avatar: '/api/placeholder/32/32'
                });
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                router.push('/admin/login');
            }
        } else {
            router.push('/admin/login');
        }
        setLoading(false);
    }, [router]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    const menuItems = [
        // Core Management
        {
            category: 'Core Management',
            items: [
                { name: 'Dashboard', href: '/admin', icon: BarChart3, current: router.pathname === '/admin' },
                { name: 'Users', href: '/admin/users', icon: Users, current: router.pathname === '/admin/users' },
                { name: 'Content', href: '/admin/content', icon: FolderOpen, current: router.pathname === '/admin/content' },
                { name: 'Letters', href: '/admin/letters', icon: MessageSquare, current: router.pathname === '/admin/letters' },
            ]
        },
        // Content & Marketing
        {
            category: 'Content & Marketing',
            items: [
                { name: 'CMS', href: '/admin/cms', icon: Globe, current: router.pathname === '/admin/cms' },
                { name: 'Marketing Automation', href: '/admin/marketing', icon: Mail, current: router.pathname === '/admin/marketing' },
                { name: 'AI Insights', href: '/admin/insights', icon: Brain, current: router.pathname === '/admin/insights' },
                { name: 'SEO & Analytics', href: '/admin/seo', icon: Target, current: router.pathname === '/admin/seo' },
            ]
        },
        // Business Intelligence
        {
            category: 'Business Intelligence',
            items: [
                { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp, current: router.pathname === '/admin/analytics' },
                { name: 'Revenue', href: '/admin/revenue', icon: DollarSign, current: router.pathname === '/admin/revenue' },
                { name: 'User Behavior', href: '/admin/behavior', icon: Zap, current: router.pathname === '/admin/behavior' },
                { name: 'A/B Testing', href: '/admin/testing', icon: Target, current: router.pathname === '/admin/testing' },
            ]
        },
        // Advanced Features
        {
            category: 'Advanced Features',
            items: [
                { name: 'AI Assistant', href: '/admin/ai', icon: Star, current: router.pathname === '/admin/ai' },
                { name: 'Automation', href: '/admin/automation', icon: Zap, current: router.pathname === '/admin/automation' },
                { name: 'Integrations', href: '/admin/integrations', icon: Shield, current: router.pathname === '/admin/integrations' },
                { name: 'Product Updates', href: '/admin/product', icon: FileText, current: router.pathname === '/admin/product' },
            ]
        },
        // System
        {
            category: 'System',
            items: [
                { name: 'Settings', href: '/admin/settings', icon: Settings, current: router.pathname === '/admin/settings' },
            ]
        }
    ];

    const handleLogout = () => {
        // Clear authentication tokens
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        // Redirect to login
        router.push('/admin/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">B</span>
                        </div>
                        {sidebarOpen && (
                            <div>
                                <h1 className="font-bold text-gray-900">Belapp Admin</h1>
                                <p className="text-xs text-gray-500">Memory Box Platform</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1 rounded-lg hover:bg-gray-100"
                    >
                        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                    {menuItems.map((section) => (
                        <div key={section.category}>
                            {sidebarOpen && (
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                    {section.category}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item.current
                                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon className={`flex-shrink-0 ${sidebarOpen ? 'mr-3' : 'mx-auto'} h-5 w-5`} />
                                        {sidebarOpen && item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="border-t p-4">
                    {sidebarOpen ? (
                        <div className="flex items-center space-x-3">
                            <img
                                className="w-8 h-8 rounded-full"
                                src={currentUser?.avatar}
                                alt={currentUser?.name}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {currentUser?.name}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {currentUser?.role}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <p className="text-sm text-gray-500">
                                Manage your Memory Box platform
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                />
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                                <Bell size={20} />
                                {notifications > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                                        {notifications}
                                    </span>
                                )}
                            </button>

                            {/* User Avatar */}
                            <img
                                className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500"
                                src={currentUser?.avatar}
                                alt={currentUser?.name}
                            />
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
