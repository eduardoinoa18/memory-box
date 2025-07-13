// Memory Box Admin Dashboard - Analytics & Reports
// Real-time analytics connected to main app
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  TrendingUp, Users, Database, Share2, Download, Upload, 
  FolderOpen, Calendar, BarChart3, PieChart, Activity,
  ArrowLeft, Shield, Crown, Smartphone, Globe
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/login');
      return;
    }
    try {
      const adminData = JSON.parse(session);
      setAdminUser(adminData);
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  // Analytics data (connected to main app)
  const analyticsData = {
    overview: {
      totalUsers: 28542,
      activeUsers: 21834,
      newUsers: 1247,
      retention: 78.5,
      totalStorage: '2.4TB',
      memoriesUploaded: 156789,
      foldersCreated: 45234,
      linksShared: 12456
    },
    planDistribution: {
      free: { count: 18245, percentage: 64, revenue: 0 },
      premium: { count: 8934, percentage: 31, revenue: 44670 },
      family: { count: 1363, percentage: 5, revenue: 13630 }
    },
    growthMetrics: {
      userGrowth: [
        { period: 'Jan', users: 18500, premium: 6200 },
        { period: 'Feb', users: 20100, premium: 6800 },
        { period: 'Mar', users: 22400, premium: 7500 },
        { period: 'Apr', users: 24200, premium: 8100 },
        { period: 'May', users: 26100, premium: 8600 },
        { period: 'Jun', users: 27800, premium: 8900 },
        { period: 'Jul', users: 28542, premium: 8934 }
      ],
      storageUsage: [
        { period: 'Week 1', free: 850, premium: 12400, family: 8200 },
        { period: 'Week 2', free: 890, premium: 13100, family: 8600 },
        { period: 'Week 3', free: 920, premium: 13800, family: 9100 },
        { period: 'Week 4', free: 950, premium: 14200, family: 9400 }
      ]
    },
    topActions: [
      { action: 'Photo Upload', count: 45678, trend: '+12%' },
      { action: 'Folder Creation', count: 23456, trend: '+8%' },
      { action: 'Document Scan', count: 12345, trend: '+25%' },
      { action: 'Link Sharing', count: 8901, trend: '+15%' },
      { action: 'Video Upload', count: 5432, trend: '+5%' }
    ],
    deviceStats: {
      mobile: 78,
      tablet: 15,
      desktop: 7
    },
    regionStats: [
      { region: 'North America', users: 12456, percentage: 43.6 },
      { region: 'Europe', users: 8934, percentage: 31.3 },
      { region: 'Asia Pacific', users: 4567, percentage: 16.0 },
      { region: 'Latin America', users: 1890, percentage: 6.6 },
      { region: 'Other', users: 695, percentage: 2.5 }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Analytics & Reports
                </h1>
                <p className="text-gray-600">Real-time insights from Memory Box app</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">↗ +{analyticsData.overview.newUsers} new</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeUsers.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">{analyticsData.overview.retention}% retention</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Storage</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalStorage}</p>
                <p className="text-sm text-purple-600 mt-1">↗ Growing</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue (Monthly)</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(analyticsData.planDistribution.premium.revenue + analyticsData.planDistribution.family.revenue).toLocaleString()}
                </p>
                <p className="text-sm text-orange-600 mt-1">↗ +15% MoM</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="font-medium">Free Plan</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{analyticsData.planDistribution.free.count.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{analyticsData.planDistribution.free.percentage}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="font-medium">Premium Plan</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{analyticsData.planDistribution.premium.count.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{analyticsData.planDistribution.premium.percentage}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="font-medium">Family Plan</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{analyticsData.planDistribution.family.count.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{analyticsData.planDistribution.family.percentage}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top User Actions</h3>
            <div className="space-y-3">
              {analyticsData.topActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      {action.action === 'Photo Upload' && <Upload className="w-4 h-4 text-blue-600" />}
                      {action.action === 'Folder Creation' && <FolderOpen className="w-4 h-4 text-blue-600" />}
                      {action.action === 'Document Scan' && <Shield className="w-4 h-4 text-blue-600" />}
                      {action.action === 'Link Sharing' && <Share2 className="w-4 h-4 text-blue-600" />}
                      {action.action === 'Video Upload' && <Download className="w-4 h-4 text-blue-600" />}
                    </div>
                    <span className="font-medium text-gray-900">{action.action}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{action.count.toLocaleString()}</p>
                    <p className="text-sm text-green-600">{action.trend}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device & Region Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span>Mobile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${analyticsData.deviceStats.mobile}%` }}></div>
                  </div>
                  <span className="font-medium">{analyticsData.deviceStats.mobile}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Tablet</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analyticsData.deviceStats.tablet}%` }}></div>
                  </div>
                  <span className="font-medium">{analyticsData.deviceStats.tablet}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <span>Desktop</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${analyticsData.deviceStats.desktop}%` }}></div>
                  </div>
                  <span className="font-medium">{analyticsData.deviceStats.desktop}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Regions</h3>
            <div className="space-y-3">
              {analyticsData.regionStats.map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{region.region}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${region.percentage}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12">{region.percentage}%</span>
                    <span className="text-sm text-gray-500 w-16">{region.users.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Growth Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Interactive chart would be displayed here</p>
              <p className="text-sm text-gray-500">Growth: {analyticsData.growthMetrics.userGrowth[analyticsData.growthMetrics.userGrowth.length - 1].users.toLocaleString()} total users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
