// Memory Box Admin Dashboard - Main Dashboard
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Users, FolderOpen, Upload, Share2, TrendingUp, Database, 
  Activity, Eye, BarChart3, Calendar, AlertCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { authUtils } from '../lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on load
  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    const user = authUtils.getCurrentUser();
    setAdminUser(user);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Sample data from connected app
  const dashboardStats = {
    totalUsers: 28542,
    activeUsers: 21834,
    freeUsers: 18245,
    premiumUsers: 8934,
    familyUsers: 1363,
    totalStorage: '2.4TB',
    totalMemories: 156789,
    totalFolders: 45234,
    sharesThisMonth: 12456,
    newSignupsToday: 89,
    upgradesThisMonth: 234
  };

  const recentActivity = [
    { id: 1, user: 'Emma Wilson', action: 'Uploaded 5 photos', time: '2 minutes ago', type: 'upload' },
    { id: 2, user: 'John Smith', action: 'Created new folder "Vacation 2025"', time: '5 minutes ago', type: 'folder' },
    { id: 3, user: 'Sarah Johnson', action: 'Shared memory link', time: '8 minutes ago', type: 'share' },
    { id: 4, user: 'Mike Chen', action: 'Upgraded to Premium plan', time: '15 minutes ago', type: 'upgrade' },
    { id: 5, user: 'Lisa Garcia', action: 'Reached storage limit (Free plan)', time: '23 minutes ago', type: 'limit' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Memory Box Admin
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {adminUser?.username?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{adminUser?.username}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {adminUser?.username}!
          </h2>
          <p className="text-gray-600">
            Here's what's happening with Memory Box today.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">↗ +89 today</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Free Plan Users</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.freeUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">64% of total</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Storage</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalStorage}</p>
                <p className="text-sm text-blue-600 mt-1">+234 upgrades</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Memories Shared</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.sharesThisMonth.toLocaleString()}</p>
                <p className="text-sm text-orange-600 mt-1">This month</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Share2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/users" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-500">View and manage user accounts</p>
                  </div>
                </Link>

                <Link href="/analytics" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Analytics</p>
                    <p className="text-sm text-gray-500">View usage statistics</p>
                  </div>
                </Link>

                <Link href="/content" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <FolderOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Content Management</p>
                    <p className="text-sm text-gray-500">Manage memories and folders</p>
                  </div>
                </Link>

                <Link href="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <Settings className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">System Settings</p>
                    <p className="text-sm text-gray-500">Configure app settings</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Link href="/activity" className="text-sm text-blue-600 hover:text-blue-700">
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'upload' ? 'bg-blue-100' :
                      activity.type === 'folder' ? 'bg-green-100' :
                      activity.type === 'share' ? 'bg-purple-100' :
                      activity.type === 'upgrade' ? 'bg-orange-100' :
                      'bg-red-100'
                    }`}>
                      {activity.type === 'upload' && <Upload className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'folder' && <FolderOpen className="w-4 h-4 text-green-600" />}
                      {activity.type === 'share' && <Share2 className="w-4 h-4 text-purple-600" />}
                      {activity.type === 'upgrade' && <TrendingUp className="w-4 h-4 text-orange-600" />}
                      {activity.type === 'limit' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Distribution Chart */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">64%</span>
              </div>
              <p className="font-semibold text-gray-900">Free Plan</p>
              <p className="text-sm text-gray-600">{dashboardStats.freeUsers.toLocaleString()} users</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">31%</span>
              </div>
              <p className="font-semibold text-gray-900">Premium Plan</p>
              <p className="text-sm text-gray-600">{dashboardStats.premiumUsers.toLocaleString()} users</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">5%</span>
              </div>
              <p className="font-semibold text-gray-900">Family Plan</p>
              <p className="text-sm text-gray-600">{dashboardStats.familyUsers.toLocaleString()} users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
