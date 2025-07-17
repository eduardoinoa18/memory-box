// Admin Dashboard Layout Component
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard, Users, BarChart3, FileText, Settings, LogOut,
  Menu, X, Bell, Search, User, Shield, Crown, Activity, Zap
} from 'lucide-react';
import { authUtils } from '../lib/auth';

const AdminLayout = ({ children, title = 'Dashboard' }) => {
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
    { icon: Zap, label: 'Integrations', href: '/integrations', active: router.pathname === '/integrations' },
    { icon: Activity, label: 'Webhooks', href: '/webhooks', active: router.pathname === '/webhooks' },
    { icon: Settings, label: 'Settings', href: '/settings', active: router.pathname === '/settings' },
  ];

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Memory Box</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${item.active
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}>
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              {adminUser.role === 'superadmin' ? (
                <Crown className="w-5 h-5 text-white" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{adminUser.username}</p>
              <p className="text-xs text-gray-500 capitalize">{adminUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Activity indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Activity className="w-4 h-4 text-green-500" />
                <span>Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
