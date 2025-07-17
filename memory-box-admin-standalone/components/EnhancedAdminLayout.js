// Enhanced Admin Layout with Memory Box Branding
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, BarChart3, FileText, Settings, LogOut,
  Menu, X, Bell, Search, User, Shield, Crown, Activity, Heart
} from 'lucide-react';
import { authUtils } from '../lib/auth';

const EnhancedAdminLayout = ({ children, title = 'Dashboard' }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const user = authUtils.getCurrentUser();
    if (user) {
      setAdminUser(user);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    authUtils.logout();
    router.push('/login');
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: router.pathname === '/dashboard' },
    { icon: Users, label: 'Users', href: '/users', active: router.pathname === '/users' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', active: router.pathname === '/analytics' },
    { icon: FileText, label: 'Content', href: '/content', active: router.pathname === '/content' },
    { icon: Settings, label: 'Settings', href: '/settings', active: router.pathname === '/settings' },
  ];

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Memory Box Logo SVG Component
  const MemoryBoxAdminLogo = () => (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {/* Main box */}
        <div className="w-10 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg border-2 border-orange-600 relative">
          {/* Box lid */}
          <div className="absolute -top-1 left-0 right-0 h-2 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-t-lg border-t-2 border-l-2 border-r-2 border-orange-600"></div>
          {/* Heart floating */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Heart className="w-3 h-3 text-blue-500 fill-current" />
          </div>
          {/* Sparkles */}
          <div className="absolute -top-2 -left-1 w-1 h-1 bg-blue-400 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-yellow-400 rounded-full"></div>
        </div>
      </div>
      <div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Memory Box
        </span>
        <div className="text-xs text-gray-500 font-medium">Admin Dashboard</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out border-r border-gray-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        {/* Logo Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <MemoryBoxAdminLogo />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${item.active 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                  }
                `}>
                  <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
                    item.active ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                  }`} />
                  {item.label}
                  {item.active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </a>
              </Link>
            ))}
          </div>
        </nav>

        {/* Quick Stats in Sidebar */}
        <div className="mx-4 mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Active Users</span>
              <span className="text-sm font-semibold text-blue-600">21,834</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Total Revenue</span>
              <span className="text-sm font-semibold text-green-600">$89.4K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">New Signups</span>
              <span className="text-sm font-semibold text-purple-600">+89</span>
            </div>
          </div>
        </div>

        {/* User Profile at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                {adminUser.role === 'superadmin' ? (
                  <Crown className="w-6 h-6 text-white" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{adminUser.username}</p>
              <p className="text-xs text-gray-500 capitalize flex items-center">
                {adminUser.role === 'superadmin' && <Crown className="w-3 h-3 mr-1 text-yellow-500" />}
                {adminUser.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Enhanced Top Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-sm text-gray-500">Memory Box Administration</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Enhanced Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, content..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse">
                  <span className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                </span>
              </button>

              {/* Live Status */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">System Live</span>
              </div>

              {/* Time */}
              <div className="hidden lg:block text-sm text-gray-500">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>© 2025 Memory Box Admin Dashboard</span>
              <span>•</span>
              <span>v2.0.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Last updated: {new Date().toLocaleDateString()}</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EnhancedAdminLayout;
