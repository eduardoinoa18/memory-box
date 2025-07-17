// Memory Box Admin Dashboard - Enhanced Main Dashboard
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Users, FolderOpen, Upload, Share2, TrendingUp, Database, 
  Activity, Eye, BarChart3, Calendar, AlertCircle, ArrowUp, 
  ArrowDown, Crown, Star, Shield, DollarSign
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

  // Real-time dashboard data (simulated)
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
    upgradesThisMonth: 234,
    revenue: 89420
  };

  const quickActions = [
    { 
      icon: Users, 
      label: 'Manage Users', 
      href: '/users',
      description: 'View and manage user accounts',
      color: 'blue',
      count: dashboardStats.totalUsers
    },
    { 
      icon: BarChart3, 
      label: 'View Analytics', 
      href: '/analytics',
      description: 'App performance metrics',
      color: 'green',
      count: '+18.5%'
    },
    { 
      icon: FolderOpen, 
      label: 'Content Management', 
      href: '/content',
      description: 'Manage memories and folders',
      color: 'purple',
      count: dashboardStats.totalMemories
    },
  ];

  const recentActivity = [
    { 
      type: 'user_signup', 
      user: 'Sarah Johnson', 
      time: '2 minutes ago', 
      action: 'New user registration',
      icon: Users,
      color: 'blue'
    },
    { 
      type: 'upgrade', 
      user: 'Mike Davis', 
      time: '5 minutes ago', 
      action: 'Upgraded to Premium plan',
      icon: Crown,
      color: 'yellow'
    },
    { 
      type: 'share', 
      user: 'Emma Wilson', 
      time: '8 minutes ago', 
      action: 'Shared memory folder',
      icon: Share2,
      color: 'green'
    },
    { 
      type: 'upload', 
      user: 'John Smith', 
      time: '12 minutes ago', 
      action: 'Uploaded 15 photos',
      icon: Upload,
      color: 'purple'
    },
    { 
      type: 'folder', 
      user: 'Lisa Chen', 
      time: '18 minutes ago', 
      action: 'Created new folder "Family Trip"',
      icon: FolderOpen,
      color: 'indigo'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Welcome Message */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {adminUser?.username}! 👋
        </h2>
        <p className="text-gray-600">
          Here's what's happening with Memory Box today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{dashboardStats.newSignupsToday} today</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardStats.revenue.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{dashboardStats.upgradesThisMonth} upgrades</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Memories</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalMemories.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{dashboardStats.totalStorage} used</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">76% of total users</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Free Plan</h3>
            <Shield className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{dashboardStats.freeUsers.toLocaleString()}</p>
          <p className="text-sm text-gray-600">64% of users</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className="bg-gray-500 h-2 rounded-full" style={{ width: '64%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Premium Plan</h3>
            <Star className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">{dashboardStats.premiumUsers.toLocaleString()}</p>
          <p className="text-sm text-gray-600">31% of users</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '31%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Family Plan</h3>
            <Crown className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-2">{dashboardStats.familyUsers.toLocaleString()}</p>
          <p className="text-sm text-gray-600">5% of users</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '5%' }}></div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <a className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                  <div className={`p-3 rounded-lg mr-4 ${
                    action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    action.color === 'green' ? 'bg-green-100 text-green-600' :
                    action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                      {action.label}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">{action.count}</span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <span className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </span>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.color === 'blue' ? 'bg-blue-100' :
                  activity.color === 'green' ? 'bg-green-100' :
                  activity.color === 'yellow' ? 'bg-yellow-100' :
                  activity.color === 'purple' ? 'bg-purple-100' :
                  activity.color === 'indigo' ? 'bg-indigo-100' :
                  'bg-gray-100'
                }`}>
                  <activity.icon className={`w-4 h-4 ${
                    activity.color === 'blue' ? 'text-blue-600' :
                    activity.color === 'green' ? 'text-green-600' :
                    activity.color === 'yellow' ? 'text-yellow-600' :
                    activity.color === 'purple' ? 'text-purple-600' :
                    activity.color === 'indigo' ? 'text-indigo-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link href="/users">
              <a className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all activity →
              </a>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
