import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { 
    DollarSign, 
    TrendingUp, 
    TrendingDown,
    CreditCard, 
    Users, 
    Calendar,
    BarChart3,
    PieChart,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Download,
    Filter,
    Target,
    Clock,
    Star,
    Gift,
    Repeat,
    AlertCircle,
    CheckCircle,
    XCircle,
    Activity,
    Globe,
    Smartphone,
    Crown,
    Zap,
    Heart,
    Package,
    Receipt,
    FileText,
    Plus,
    Edit,
    Trash2,
    Eye,
    Search,
    Settings
} from 'lucide-react';

const RevenuePage = () => {
    const { stats, loading: statsLoading } = useDashboardStats();
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [revenueData, setRevenueData] = useState({});
    const [subscriptionMetrics, setSubscriptionMetrics] = useState({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        // Mock comprehensive revenue data
        const mockRevenueData = {
            overview: {
                totalRevenue: 456780,
                monthlyRevenue: 89420,
                dailyRevenue: 2980,
                revenueGrowth: 18.5,
                arpu: 24.50,
                ltv: 180.75,
                totalCustomers: 2847,
                activeSubscriptions: 2156,
                churnRate: 3.2,
                averageRevenuePer: 44.52,
                lifetimeValue: 892.45,
                conversionRate: 12.8
            },
            revenueBreakdown: {
                subscriptions: 89234.50,
                oneTime: 28456.78,
                addOns: 5678.90,
                upgrades: 2308.72
            },
            subscriptions: {
                total: 18945,
                free: 15420,
                premium: 2890,
                family: 545,
                enterprise: 90,
                conversionRate: 4.2,
                churnRate: 2.1,
                mrr: 89420,
                arr: 1073040
            },
            billing: {
                successfulPayments: 2734,
                failedPayments: 23,
                refunds: 12,
                disputes: 3,
                successRate: 99.2,
                avgTransactionValue: 29.99
            },
            subscriptionPlans: [
                {
                    id: 1,
                    name: 'Memory Box Starter',
                    price: 9.99,
                    interval: 'monthly',
                    subscribers: 1247,
                    revenue: 12456.53,
                    growth: 15.2,
                    features: ['5GB Storage', 'Basic Templates', 'Email Support'],
                    status: 'active',
                    createdDate: '2024-01-15',
                    conversionRate: 8.4
                },
                {
                    id: 2,
                    name: 'Memory Box Premium',
                    price: 29.99,
                    interval: 'monthly',
                    subscribers: 756,
                    revenue: 22672.44,
                    growth: 23.7,
                    features: ['Unlimited Storage', 'AI Letters', 'Premium Templates', 'Priority Support'],
                    status: 'active',
                    createdDate: '2024-01-15',
                    conversionRate: 12.8
                },
                {
                    id: 3,
                    name: 'Memory Box Family',
                    price: 49.99,
                    interval: 'monthly',
                    subscribers: 153,
                    revenue: 7648.47,
                    growth: 31.4,
                    features: ['Family Sharing', 'Multiple Albums', 'Advanced AI', 'White-glove Support'],
                    status: 'active',
                    createdDate: '2024-02-01',
                    conversionRate: 18.5
                },
                {
                    id: 4,
                    name: 'Memory Box Starter (Yearly)',
                    price: 99.99,
                    interval: 'yearly',
                    subscribers: 234,
                    revenue: 23397.66,
                    growth: 45.8,
                    features: ['5GB Storage', 'Basic Templates', 'Email Support', '2 months free'],
                    status: 'active',
                    createdDate: '2024-01-15',
                    conversionRate: 22.1
                },
                {
                    id: 5,
                    name: 'Memory Box Premium (Yearly)',
                    price: 299.99,
                    interval: 'yearly',
                    subscribers: 89,
                    revenue: 26699.11,
                    growth: 67.3,
                    features: ['Unlimited Storage', 'AI Letters', 'Premium Templates', 'Priority Support', '2 months free'],
                    status: 'active',
                    createdDate: '2024-01-15',
                    conversionRate: 35.2
                }
            ],
            recentTransactions: [
                {
                    id: 'txn_001',
                    customer: 'John Smith',
                    email: 'john.smith@email.com',
                    plan: 'Memory Box Premium',
                    amount: 29.99,
                    status: 'succeeded',
                    date: '2024-07-12',
                    paymentMethod: 'Visa ****4242',
                    invoice: 'INV-2024-001234'
                },
                {
                    id: 'txn_002',
                    customer: 'Sarah Johnson',
                    email: 'sarah.j@email.com',
                    plan: 'Memory Box Starter',
                    amount: 9.99,
                    status: 'succeeded',
                    date: '2024-07-12',
                    paymentMethod: 'MasterCard ****5555',
                    invoice: 'INV-2024-001235'
                },
                {
                    id: 'txn_003',
                    customer: 'Mike Wilson',
                    email: 'mike.wilson@email.com',
                    plan: 'Memory Box Family',
                    amount: 49.99,
                    status: 'failed',
                    date: '2024-07-11',
                    paymentMethod: 'Visa ****1234',
                    invoice: 'INV-2024-001236'
                },
                {
                    id: 'txn_004',
                    customer: 'Emma Davis',
                    email: 'emma.davis@email.com',
                    plan: 'Memory Box Premium (Yearly)',
                    amount: 299.99,
                    status: 'succeeded',
                    date: '2024-07-11',
                    paymentMethod: 'PayPal',
                    invoice: 'INV-2024-001237'
                },
                {
                    id: 'txn_005',
                    customer: 'Alex Chen',
                    email: 'alex.chen@email.com',
                    plan: 'Memory Box Starter',
                    amount: 9.99,
                    status: 'pending',
                    date: '2024-07-11',
                    paymentMethod: 'Bank Transfer',
                    invoice: 'INV-2024-001238'
                }
            ],
            failedPayments: [
                {
                    id: 'fail_001',
                    customer: 'David Kim',
                    email: 'david.kim@email.com',
                    plan: 'Memory Box Premium',
                    amount: 29.99,
                    reason: 'Insufficient funds',
                    date: '2024-07-10',
                    attempts: 2,
                    nextRetry: '2024-07-13'
                },
                {
                    id: 'fail_002',
                    customer: 'Lisa Brown',
                    email: 'lisa.brown@email.com',
                    plan: 'Memory Box Starter',
                    amount: 9.99,
                    reason: 'Card expired',
                    date: '2024-07-09',
                    attempts: 3,
                    nextRetry: '2024-07-12'
                },
                {
                    id: 'fail_003',
                    customer: 'Tom Anderson',
                    email: 'tom.anderson@email.com',
                    plan: 'Memory Box Family',
                    amount: 49.99,
                    reason: 'Card declined',
                    date: '2024-07-08',
                    attempts: 1,
                    nextRetry: '2024-07-11'
                }
            ],
            churnAnalysis: {
                totalChurned: 91,
                churnReasons: [
                    { reason: 'Price too high', count: 34, percentage: 37.4 },
                    { reason: 'Not using enough', count: 23, percentage: 25.3 },
                    { reason: 'Found alternative', count: 18, percentage: 19.8 },
                    { reason: 'Technical issues', count: 9, percentage: 9.9 },
                    { reason: 'Other', count: 7, percentage: 7.7 }
                ],
                preventableChurn: 65,
                churnValue: 2847.32
            },
            invoices: [
                {
                    id: 'INV-2024-001234',
                    customer: 'John Smith',
                    amount: 29.99,
                    status: 'paid',
                    dueDate: '2024-07-12',
                    paidDate: '2024-07-12',
                    plan: 'Memory Box Premium'
                },
                {
                    id: 'INV-2024-001235',
                    customer: 'Sarah Johnson',
                    amount: 9.99,
                    status: 'paid',
                    dueDate: '2024-07-12',
                    paidDate: '2024-07-12',
                    plan: 'Memory Box Starter'
                },
                {
                    id: 'INV-2024-001236',
                    customer: 'Mike Wilson',
                    amount: 49.99,
                    status: 'overdue',
                    dueDate: '2024-07-11',
                    paidDate: null,
                    plan: 'Memory Box Family'
                },
                {
                    id: 'INV-2024-001237',
                    customer: 'Emma Davis',
                    amount: 299.99,
                    status: 'paid',
                    dueDate: '2024-07-11',
                    paidDate: '2024-07-11',
                    plan: 'Memory Box Premium (Yearly)'
                },
                {
                    id: 'INV-2024-001238',
                    customer: 'Alex Chen',
                    amount: 9.99,
                    status: 'pending',
                    dueDate: '2024-07-11',
                    paidDate: null,
                    plan: 'Memory Box Starter'
                }
            ],
            coupons: [
                {
                    id: 'SUMMER2024',
                    name: 'Summer Sale 2024',
                    discount: 25,
                    type: 'percentage',
                    uses: 234,
                    maxUses: 1000,
                    validFrom: '2024-06-01',
                    validTo: '2024-08-31',
                    status: 'active'
                },
                {
                    id: 'WELCOME10',
                    name: 'Welcome Discount',
                    discount: 10,
                    type: 'percentage',
                    uses: 567,
                    maxUses: null,
                    validFrom: '2024-01-01',
                    validTo: null,
                    status: 'active'
                },
                {
                    id: 'FRIEND20',
                    name: 'Friend Referral',
                    discount: 20,
                    type: 'percentage',
                    uses: 89,
                    maxUses: null,
                    validFrom: '2024-01-01',
                    validTo: null,
                    status: 'active'
                }
            ],
            plans: [
                { 
                    name: 'Free', 
                    users: 15420, 
                    revenue: 0, 
                    percentage: 81.4,
                    conversionPotential: 'High',
                    features: ['5GB Storage', 'Basic Timeline', 'Mobile App']
                },
                { 
                    name: 'Premium', 
                    users: 2890, 
                    revenue: 72250, 
                    percentage: 15.3,
                    conversionPotential: 'Medium',
                    features: ['50GB Storage', 'AI Letters', 'Advanced Timeline', 'Priority Support']
                },
                { 
                    name: 'Family', 
                    users: 545, 
                    revenue: 16350, 
                    percentage: 2.9,
                    conversionPotential: 'Low',
                    features: ['200GB Storage', 'Family Sharing', 'Multiple Users', 'Premium Features']
                },
                { 
                    name: 'Enterprise', 
                    users: 90, 
                    revenue: 8999, 
                    percentage: 0.5,
                    conversionPotential: 'Custom',
                    features: ['Unlimited Storage', 'Custom Branding', 'API Access', 'Dedicated Support']
                }
            ],
            monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
                month: new Date(2025, i, 1).toLocaleDateString('en-US', { month: 'short' }),
                revenue: Math.floor(Math.random() * 20000) + 70000,
                subscriptions: Math.floor(Math.random() * 500) + 2000,
                churn: Math.random() * 2 + 1
            })),
            paymentMethods: [
                { method: 'Credit Card', percentage: 68.5, revenue: 61238 },
                { method: 'PayPal', percentage: 18.2, revenue: 16275 },
                { method: 'Apple Pay', percentage: 8.7, revenue: 7779 },
                { method: 'Google Pay', percentage: 4.6, revenue: 4113 }
            ],
            geographicRevenue: [
                { country: 'United States', revenue: 34560, percentage: 38.7, flag: '🇺🇸' },
                { country: 'Canada', revenue: 12890, percentage: 14.4, flag: '🇨🇦' },
                { country: 'United Kingdom', revenue: 9870, percentage: 11.0, flag: '🇬🇧' },
                { country: 'Australia', revenue: 7650, percentage: 8.6, flag: '🇦🇺' },
                { country: 'Germany', revenue: 6540, percentage: 7.3, flag: '🇩🇪' }
            ]
        };

        setRevenueData(mockRevenueData);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'succeeded':
            case 'paid':
            case 'active': return <CheckCircle className="text-green-500" size={16} />;
            case 'failed':
            case 'overdue': return <XCircle className="text-red-500" size={16} />;
            case 'pending': return <Clock className="text-yellow-500" size={16} />;
            case 'processing': return <AlertCircle className="text-blue-500" size={16} />;
            default: return <Clock className="text-gray-500" size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'succeeded':
            case 'paid':
            case 'active': return 'bg-green-100 text-green-800';
            case 'failed':
            case 'overdue': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getChangeColor = (change) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getChangeIcon = (change) => {
        if (change > 0) return <ArrowUp size={16} className="text-green-600" />;
        if (change < 0) return <ArrowDown size={16} className="text-red-600" />;
        return null;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const revenueKPIs = [
        {
            title: 'Total Revenue',
            value: formatCurrency(revenueData.overview?.totalRevenue || 0),
            change: 18.5,
            icon: DollarSign,
            color: 'green',
            description: 'All-time revenue'
        },
        {
            title: 'Monthly Revenue',
            value: formatCurrency(revenueData.overview?.monthlyRevenue || 0),
            change: 12.3,
            icon: Calendar,
            color: 'blue',
            description: 'Current month'
        },
        {
            title: 'Daily Revenue',
            value: formatCurrency(revenueData.overview?.dailyRevenue || 0),
            change: 8.7,
            icon: Clock,
            color: 'purple',
            description: 'Today\'s revenue'
        },
        {
            title: 'ARPU',
            value: formatCurrency(revenueData.overview?.arpu || 0),
            change: 5.2,
            icon: Users,
            color: 'indigo',
            description: 'Avg revenue per user'
        },
        {
            title: 'Customer LTV',
            value: formatCurrency(revenueData.overview?.ltv || 0),
            change: 15.8,
            icon: Star,
            color: 'yellow',
            description: 'Lifetime value'
        },
        {
            title: 'Conversion Rate',
            value: `${revenueData.subscriptions?.conversionRate || 0}%`,
            change: 0.8,
            icon: Target,
            color: 'orange',
            description: 'Free to paid conversion'
        }
    ];

    const subscriptionKPIs = [
        {
            title: 'Total Subscribers',
            value: revenueData.subscriptions?.total?.toLocaleString() || '0',
            change: 18.3,
            icon: Users,
            color: 'blue'
        },
        {
            title: 'MRR',
            value: formatCurrency(revenueData.subscriptions?.mrr || 0),
            change: 15.7,
            icon: Repeat,
            color: 'green'
        },
        {
            title: 'ARR',
            value: formatCurrency(revenueData.subscriptions?.arr || 0),
            change: 18.9,
            icon: TrendingUp,
            color: 'purple'
        },
        {
            title: 'Churn Rate',
            value: `${revenueData.subscriptions?.churnRate || 0}%`,
            change: -0.5,
            icon: AlertCircle,
            color: 'red'
        }
    ];

    const getPlanIcon = (planName) => {
        switch (planName.toLowerCase()) {
            case 'free': return Users;
            case 'premium': return Crown;
            case 'family': return Heart;
            case 'enterprise': return Zap;
            default: return Star;
        }
    };

    const getPlanColor = (planName) => {
        switch (planName.toLowerCase()) {
            case 'free': return 'bg-gray-100 text-gray-800';
            case 'premium': return 'bg-blue-100 text-blue-800';
            case 'family': return 'bg-purple-100 text-purple-800';
            case 'enterprise': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (statsLoading) {
        return (
            <AdminLayout title="Revenue & Billing">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Revenue & Billing">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Revenue & Billing Analytics</h1>
                        <p className="text-gray-600">Comprehensive financial performance, subscriptions, and billing insights</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="failed">Failed</option>
                        </select>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <RefreshCw size={16} />
                            <span>Refresh</span>
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                            <Download size={16} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* Revenue KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {revenueKPIs.map((kpi, index) => {
                        const Icon = kpi.icon;
                        const colorClasses = {
                            green: 'bg-green-100 text-green-600',
                            blue: 'bg-blue-100 text-blue-600',
                            purple: 'bg-purple-100 text-purple-600',
                            indigo: 'bg-indigo-100 text-indigo-600',
                            yellow: 'bg-yellow-100 text-yellow-600',
                            orange: 'bg-orange-100 text-orange-600'
                        };
                        
                        return (
                            <div key={index} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${colorClasses[kpi.color]}`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center">
                                    {getChangeIcon(kpi.change)}
                                    <span className={`ml-1 text-sm font-medium ${getChangeColor(kpi.change)}`}>
                                        {Math.abs(kpi.change)}% vs last period
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Breakdown</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Subscriptions</p>
                                    <p className="text-xl font-bold text-blue-900">{formatCurrency(revenueData.revenueBreakdown?.subscriptions || 0)}</p>
                                </div>
                                <Calendar className="text-blue-600" size={24} />
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">One-time</p>
                                    <p className="text-xl font-bold text-green-900">{formatCurrency(revenueData.revenueBreakdown?.oneTime || 0)}</p>
                                </div>
                                <CreditCard className="text-green-600" size={24} />
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Add-ons</p>
                                    <p className="text-xl font-bold text-purple-900">{formatCurrency(revenueData.revenueBreakdown?.addOns || 0)}</p>
                                </div>
                                <Plus className="text-purple-600" size={24} />
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Upgrades</p>
                                    <p className="text-xl font-bold text-orange-900">{formatCurrency(revenueData.revenueBreakdown?.upgrades || 0)}</p>
                                </div>
                                <TrendingUp className="text-orange-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Metrics */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {subscriptionKPIs.map((metric, index) => {
                            const Icon = metric.icon;
                            const colorClasses = {
                                blue: 'bg-blue-100 text-blue-600',
                                green: 'bg-green-100 text-green-600',
                                purple: 'bg-purple-100 text-purple-600',
                                red: 'bg-red-100 text-red-600'
                            };
                            
                            return (
                                <div key={index} className="text-center">
                                    <div className={`p-3 rounded-lg inline-flex mb-3 ${colorClasses[metric.color]}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                                    <div className="text-sm text-gray-600">{metric.title}</div>
                                    <div className="flex items-center justify-center mt-2">
                                        {getChangeIcon(metric.change)}
                                        <span className={`ml-1 text-sm ${getChangeColor(metric.change)}`}>
                                            {Math.abs(metric.change)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Subscription Plans Breakdown */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Subscription Plans</h2>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <Plus size={16} />
                            <span>New Plan</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        {revenueData.subscriptionPlans?.map((plan) => (
                            <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <Package size={20} className="text-blue-600 mr-3" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">{plan.name}</h3>
                                            <p className="text-sm text-gray-500">{formatCurrency(plan.price)}/{plan.interval}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(plan.status)}
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                                            {plan.status}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <div className="text-gray-600">Subscribers</div>
                                        <div className="font-medium">{plan.subscribers.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Revenue</div>
                                        <div className="font-medium">{formatCurrency(plan.revenue)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Growth</div>
                                        <div className={`font-medium flex items-center ${plan.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {plan.growth > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                            {Math.abs(plan.growth)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600">Conversion</div>
                                        <div className="font-medium">{plan.conversionRate}%</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-1">
                                        {plan.features?.slice(0, 3).map((feature, featureIndex) => (
                                            <span key={featureIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                {feature}
                                            </span>
                                        ))}
                                        {plan.features?.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                +{plan.features.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="text-blue-600 hover:text-blue-800" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button className="text-green-600 hover:text-green-800" title="View">
                                            <Eye size={16} />
                                        </button>
                                        <button className="text-purple-600 hover:text-purple-800" title="Analytics">
                                            <BarChart3 size={16} />
                                        </button>
                                        <button className="text-orange-600 hover:text-orange-800" title="Settings">
                                            <Settings size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Methods and Geographic Revenue */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Transactions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                            <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
                        </div>
                        <div className="space-y-3">
                            {revenueData.recentTransactions?.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                    <div className="flex items-center">
                                        {getStatusIcon(transaction.status)}
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{transaction.customer}</div>
                                            <div className="text-xs text-gray-500">{transaction.plan} • {transaction.paymentMethod}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                                        <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Failed Payments */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Failed Payments</h2>
                            <button className="text-red-600 hover:text-red-800 text-sm">Retry All</button>
                        </div>
                        <div className="space-y-3">
                            {revenueData.failedPayments?.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-3 border border-red-100 bg-red-50 rounded-lg">
                                    <div className="flex items-center">
                                        <XCircle className="text-red-500" size={16} />
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{payment.customer}</div>
                                            <div className="text-xs text-red-600">{payment.reason}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
                                        <div className="text-xs text-gray-500">Attempt {payment.attempts}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Invoices & Coupons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Invoices */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
                            <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
                        </div>
                        <div className="space-y-3">
                            {revenueData.invoices?.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                                    <div className="flex items-center">
                                        {getStatusIcon(invoice.status)}
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                                            <div className="text-xs text-gray-500">{invoice.customer}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</div>
                                        <div className="text-xs text-gray-500">Due: {formatDate(invoice.dueDate)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Coupons */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Active Coupons</h2>
                            <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-1">
                                <Plus size={14} />
                                <span className="text-sm">New Coupon</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {revenueData.coupons?.map((coupon) => (
                                <div key={coupon.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className="font-medium text-gray-900">{coupon.name}</div>
                                            <div className="text-sm text-gray-500">{coupon.id}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-green-600">
                                                {coupon.discount}{coupon.type === 'percentage' ? '%' : '$'} off
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {coupon.uses} uses{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        Valid: {formatDate(coupon.validFrom)} - {coupon.validTo ? formatDate(coupon.validTo) : 'No end date'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Churn Analysis & Payment Methods */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Churn Analysis */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Churn Analysis</h2>
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Total Churned</span>
                                <span className="font-medium">{revenueData.churnAnalysis?.totalChurned}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Preventable Churn</span>
                                <span className="font-medium text-orange-600">{revenueData.churnAnalysis?.preventableChurn}</span>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-600">Churn Value</span>
                                <span className="font-medium text-red-600">{formatCurrency(revenueData.churnAnalysis?.churnValue || 0)}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-medium text-gray-900">Churn Reasons</h3>
                            {revenueData.churnAnalysis?.churnReasons?.map((reason, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{reason.reason}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-red-500 h-2 rounded-full"
                                                style={{ width: `${reason.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-8">{reason.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Payment Methods */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h2>
                        <div className="space-y-4">
                            {revenueData.paymentMethods?.map((method, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <CreditCard size={20} className="text-gray-500 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">{method.method}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="h-2 rounded-full bg-blue-500"
                                                style={{ width: `${method.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(method.revenue)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {method.percentage}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-bold text-green-600">
                                        {revenueData.billing?.successfulPayments || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Successful</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-red-600">
                                        {revenueData.billing?.failedPayments || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Failed</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {revenueData.billing?.successRate || 0}%
                                    </div>
                                    <div className="text-xs text-gray-500">Success Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Geographic Revenue */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue by Country</h2>
                        <div className="space-y-4">
                            {revenueData.geographicRevenue?.map((country, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="text-xl mr-3">{country.flag}</span>
                                        <span className="text-sm font-medium text-gray-900">{country.country}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="h-2 rounded-full bg-green-500"
                                                style={{ width: `${country.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(country.revenue)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {country.percentage}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Revenue & Billing Overview</h3>
                            <p className="text-sm text-gray-600">Comprehensive financial performance and billing analytics</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-4">
                            <strong>Revenue Performance:</strong> {formatCurrency(revenueData.overview?.totalRevenue || 0)} total revenue with {formatCurrency(revenueData.overview?.monthlyRevenue || 0)} MRR from {revenueData.overview?.activeSubscriptions?.toLocaleString()} active subscriptions.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Billing Health:</strong> {revenueData.billing?.successRate || 0}% payment success rate with {revenueData.failedPayments?.length || 0} failed payments requiring attention and {revenueData.coupons?.length || 0} active promotions.
                        </div>
                        <div className="bg-white rounded p-4">
                            <strong>Customer Metrics:</strong> {formatCurrency(revenueData.overview?.averageRevenuePer || 0)} ARPU with {formatCurrency(revenueData.overview?.lifetimeValue || 0)} LTV and {revenueData.overview?.churnRate}% monthly churn rate.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default RevenuePage;
