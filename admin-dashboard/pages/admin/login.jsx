import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Lock, User, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check if already authenticated
    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            router.push('/admin');
        }
    }, [router]);

    const handleInputChange = (field, value) => {
        setCredentials(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Simple authentication for demo purposes
            const validCredentials = [
                { username: 'admin', password: 'admin123' },
                { username: 'demo@admin.com', password: 'admin123' },
                { username: 'admin@memorybox.com', password: 'memorybox2025' },
                { username: 'super', password: 'super123' }
            ];

            const isValid = validCredentials.some(
                cred => cred.username === credentials.username && cred.password === credentials.password
            );

            if (isValid) {
                // Set authentication token
                localStorage.setItem('adminToken', 'demo-admin-token-123');
                localStorage.setItem('adminUser', JSON.stringify({
                    username: credentials.username,
                    role: 'admin',
                    loginTime: new Date().toISOString()
                }));

                // Redirect to admin dashboard
                router.push('/admin');
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            setError('Invalid username or password. Try: admin/admin123');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (username, password) => {
        setCredentials({ username, password });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Memory Box Admin</h1>
                    <p className="text-gray-600">Business Management Portal</p>
                </div>

                {/* Main Login Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                <span className="text-red-700 text-sm">{error}</span>
                            </div>
                        )}

                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username or Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={credentials.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={credentials.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In to Admin Dashboard'}
                        </button>
                    </form>

                    {/* Quick Login Options */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Login (Demo)</h3>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => quickLogin('admin', 'admin123')}
                                className="w-full text-left text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded"
                            >
                                📧 admin / admin123
                            </button>
                            <button
                                type="button"
                                onClick={() => quickLogin('demo@admin.com', 'admin123')}
                                className="w-full text-left text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded"
                            >
                                👤 demo@admin.com / admin123
                            </button>
                            <button
                                type="button"
                                onClick={() => quickLogin('admin@memorybox.com', 'memorybox2025')}
                                className="w-full text-left text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded"
                            >
                                🔑 admin@memorybox.com / memorybox2025
                            </button>
                        </div>
                    </div>

                    {/* Features Info */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Admin Dashboard Features</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                User Management
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                Analytics
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                Content Control
                            </div>
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                AI Insights
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        Memory Box Admin Dashboard © 2025
                    </p>
                </div>
            </div>
        </div>
    );
}
