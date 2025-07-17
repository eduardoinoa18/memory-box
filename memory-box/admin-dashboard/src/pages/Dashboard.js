import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, FolderOpen, Upload, Activity, TrendingUp, AlertCircle } from 'lucide-react';

// Sample data - replace with real API calls
const dashboardData = {
  stats: {
    totalUsers: 12547,
    activeUsers: 8934,
    totalFolders: 45892,
    totalUploads: 234567,
    storageUsed: 1247.5, // GB
    monthlyGrowth: 15.3
  },
  userGrowthData: [
    { month: 'Jan', users: 1200, active: 800 },
    { month: 'Feb', users: 1890, active: 1200 },
    { month: 'Mar', users: 2390, active: 1580 },
    { month: 'Apr', users: 3490, active: 2340 },
    { month: 'May', users: 4560, active: 3200 },
    { month: 'Jun', users: 5890, active: 4100 },
    { month: 'Jul', users: 7234, active: 5200 },
    { month: 'Aug', users: 8456, active: 6100 },
    { month: 'Sep', users: 9678, active: 7000 },
    { month: 'Oct', users: 10890, active: 7800 },
    { month: 'Nov', users: 11567, active: 8400 },
    { month: 'Dec', users: 12547, active: 8934 }
  ],
  uploadData: [
    { day: 'Mon', uploads: 1234 },
    { day: 'Tue', uploads: 2341 },
    { day: 'Wed', uploads: 1876 },
    { day: 'Thu', uploads: 2987 },
    { day: 'Fri', uploads: 3456 },
    { day: 'Sat', uploads: 2876 },
    { day: 'Sun', uploads: 2134 }
  ],
  folderTypes: [
    { name: 'Family', value: 45, color: '#FF6B6B' },
    { name: 'Travel', value: 25, color: '#4ECDC4' },
    { name: 'Work', value: 15, color: '#45B7D1' },
    { name: 'Personal', value: 10, color: '#96CEB4' },
    { name: 'Other', value: 5, color: '#FFEAA7' }
  ],
  recentActivities: [
    { id: 1, user: 'John Doe', action: 'Created folder "Summer Vacation"', time: '2 hours ago', type: 'create' },
    { id: 2, user: 'Maria Garcia', action: 'Uploaded 15 photos', time: '3 hours ago', type: 'upload' },
    { id: 3, user: 'David Chen', action: 'Shared folder with family', time: '5 hours ago', type: 'share' },
    { id: 4, user: 'Sarah Wilson', action: 'Upgraded to Premium', time: '1 day ago', type: 'upgrade' },
    { id: 5, user: 'Mike Johnson', action: 'Created private vault', time: '1 day ago', type: 'vault' }
  ],
  alerts: [
    { id: 1, type: 'warning', message: 'High storage usage detected for user ID 12847', time: '1 hour ago' },
    { id: 2, type: 'info', message: '50 new user registrations today', time: '2 hours ago' },
    { id: 3, type: 'success', message: 'Monthly backup completed successfully', time: '3 hours ago' }
  ]
};

function Dashboard() {
  const [stats, setStats] = useState(dashboardData.stats);
  const [timeframe, setTimeframe] = useState('month');

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% vs last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with Memory Box.</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          change={stats.monthlyGrowth}
          icon={Users}
          color="bg-primary-500"
        />
        <StatCard
          title="Active Users"
          value={formatNumber(stats.activeUsers)}
          change={12.8}
          icon={Activity}
          color="bg-green-500"
        />
        <StatCard
          title="Total Folders"
          value={formatNumber(stats.totalFolders)}
          change={8.4}
          icon={FolderOpen}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Uploads"
          value={formatNumber(stats.totalUploads)}
          change={22.1}
          icon={Upload}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <p className="text-sm text-gray-600">Total and active users over time</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#6C5CE7" strokeWidth={2} />
              <Line type="monotone" dataKey="active" stroke="#00B894" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Uploads */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Uploads</h3>
            <p className="text-sm text-gray-600">Daily upload activity</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.uploadData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="uploads" fill="#FD79A8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folder Types Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Folder Types</h3>
            <p className="text-sm text-gray-600">Distribution by category</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dashboardData.folderTypes}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dashboardData.folderTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">Latest user actions</p>
          </div>
          <div className="space-y-4">
            {dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'create' ? 'bg-blue-500' :
                  activity.type === 'upload' ? 'bg-green-500' :
                  activity.type === 'share' ? 'bg-yellow-500' :
                  activity.type === 'upgrade' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.user}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            <p className="text-sm text-gray-600">Important notifications</p>
          </div>
          <div className="space-y-4">
            {dashboardData.alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg ${
                alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                alert.type === 'info' ? 'bg-blue-50 border border-blue-200' :
                'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-start">
                  <AlertCircle className={`w-5 h-5 mt-0.5 mr-2 ${
                    alert.type === 'warning' ? 'text-yellow-600' :
                    alert.type === 'info' ? 'text-blue-600' :
                    'text-green-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
