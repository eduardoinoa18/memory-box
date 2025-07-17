// Memory Box Admin Dashboard - MVP Version 1 (Essential Features Only)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Users, Database, Activity, Eye, LogOut, Shield } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db, checkAdminRole } from '../../firebase-config';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMemories: 0,
    recentUsers: []
  });

  // Check authentication and admin role
  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.currentUser) {
        router.push('/login');
        return;
      }

      const isAdmin = await checkAdminRole(auth.currentUser);
      if (!isAdmin) {
        router.push('/login');
        return;
      }

      setAdminUser(auth.currentUser);
      await loadDashboardData();
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Get total users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Get total memories count  
      const memoriesSnapshot = await getDocs(collection(db, 'memories'));
      const totalMemories = memoriesSnapshot.size;

      // Get recent users (last 5)
      const recentUsersQuery = query(
        collection(db, 'users'), 
        orderBy('createdAt', 'desc'), 
        limit(5)
      );
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      const recentUsers = recentUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStats({ totalUsers, totalMemories, recentUsers });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Memory Box Admin</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">MVP v1</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {adminUser?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Memories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMemories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user) => (
                <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Joined: {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => loadDashboardData()}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <Activity className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Refresh Data</p>
              <p className="text-sm text-gray-500">Update dashboard statistics</p>
            </button>

            <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left">
              <Users className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">User Management</p>
              <p className="text-sm text-gray-500">Coming in next version</p>
            </button>

            <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left">
              <Eye className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">Content Review</p>
              <p className="text-sm text-gray-500">Coming in next version</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
