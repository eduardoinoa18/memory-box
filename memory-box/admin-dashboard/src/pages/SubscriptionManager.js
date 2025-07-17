import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Filter, 
  Download,
  Eye,
  Ban,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// Sample data - replace with real Stripe/Firebase data
const subscriptionData = {
  stats: {
    totalRevenue: 45678.90,
    monthlyRecurring: 12456.78,
    activeSubscribers: 1247,
    churnRate: 3.2,
    lifetimeValue: 156.78
  },
  revenueData: [
    { month: 'Jan', revenue: 8500, subscribers: 850 },
    { month: 'Feb', revenue: 12300, subscribers: 1023 },
    { month: 'Mar', revenue: 15600, subscribers: 1156 },
    { month: 'Apr', revenue: 18900, subscribers: 1289 },
    { month: 'May', revenue: 22400, subscribers: 1345 },
    { month: 'Jun', revenue: 25800, subscribers: 1456 },
    { month: 'Jul', revenue: 28200, subscribers: 1523 },
    { month: 'Aug', revenue: 31500, subscribers: 1678 },
    { month: 'Sep', revenue: 34800, subscribers: 1789 },
    { month: 'Oct', revenue: 38100, subscribers: 1834 },
    { month: 'Nov', revenue: 41200, subscribers: 1923 },
    { month: 'Dec', revenue: 45678, subscribers: 2034 }
  ],
  planDistribution: [
    { name: 'Premium', value: 65, color: '#6C5CE7' },
    { name: 'Family', value: 30, color: '#00B894' },
    { name: 'Lifetime', value: 5, color: '#FDCB6E' }
  ],
  churnData: [
    { month: 'Jan', churn: 2.1 },
    { month: 'Feb', churn: 1.8 },
    { month: 'Mar', churn: 2.5 },
    { month: 'Apr', churn: 3.1 },
    { month: 'May', churn: 2.8 },
    { month: 'Jun', churn: 3.2 }
  ],
  subscribers: [
    {
      id: 'sub_1',
      userId: 'user_123',
      customerName: 'John Smith',
      email: 'john@example.com',
      plan: 'premium',
      status: 'active',
      amount: 2.99,
      currency: 'usd',
      interval: 'month',
      currentPeriodStart: '2025-06-01',
      currentPeriodEnd: '2025-07-01',
      createdAt: '2024-12-15',
      cancelAtPeriodEnd: false,
      lastPayment: '2025-06-01',
      paymentMethod: 'Visa ****4242',
      lifetimeValue: 125.67
    },
    {
      id: 'sub_2',
      userId: 'user_456',
      customerName: 'Maria Garcia',
      email: 'maria@example.com',
      plan: 'family',
      status: 'active',
      amount: 4.99,
      currency: 'usd',
      interval: 'month',
      currentPeriodStart: '2025-06-15',
      currentPeriodEnd: '2025-07-15',
      createdAt: '2024-11-20',
      cancelAtPeriodEnd: false,
      lastPayment: '2025-06-15',
      paymentMethod: 'Mastercard ****8765',
      lifetimeValue: 234.51
    },
    {
      id: 'sub_3',
      userId: 'user_789',
      customerName: 'David Chen',
      email: 'david@example.com',
      plan: 'premium',
      status: 'past_due',
      amount: 2.99,
      currency: 'usd',
      interval: 'month',
      currentPeriodStart: '2025-05-20',
      currentPeriodEnd: '2025-06-20',
      createdAt: '2024-10-05',
      cancelAtPeriodEnd: false,
      lastPayment: '2025-05-20',
      paymentMethod: 'Visa ****1234',
      lifetimeValue: 89.70
    },
    {
      id: 'sub_4',
      userId: 'user_101',
      customerName: 'Sarah Wilson',
      email: 'sarah@example.com',
      plan: 'lifetime',
      status: 'active',
      amount: 99.00,
      currency: 'usd',
      interval: 'once',
      currentPeriodStart: '2025-03-10',
      currentPeriodEnd: null,
      createdAt: '2025-03-10',
      cancelAtPeriodEnd: false,
      lastPayment: '2025-03-10',
      paymentMethod: 'Visa ****5678',
      lifetimeValue: 99.00
    }
  ]
};

function SubscriptionManager() {
  const [subscribers, setSubscribers] = useState(subscriptionData.subscribers);
  const [filteredSubscribers, setFilteredSubscribers] = useState(subscribers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    filterSubscribers();
  }, [searchTerm, statusFilter, planFilter, subscribers]);

  const filterSubscribers = () => {
    let filtered = subscribers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(sub => sub.plan === planFilter);
    }

    setFilteredSubscribers(filtered);
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      try {
        // Call Firebase function to cancel subscription
        // await cancelSubscription(subscriptionId);
        
        setSubscribers(prev => prev.map(sub => 
          sub.id === subscriptionId 
            ? { ...sub, cancelAtPeriodEnd: true, status: 'canceling' }
            : sub
        ));
        
        alert('Subscription will be canceled at the end of the current period.');
      } catch (error) {
        alert('Error canceling subscription: ' + error.message);
      }
    }
  };

  const handleRefund = async (subscriptionId) => {
    const refundAmount = prompt('Enter refund amount:');
    if (refundAmount && !isNaN(refundAmount)) {
      try {
        // Call Stripe API to process refund
        alert(`Refund of $${refundAmount} processed successfully.`);
      } catch (error) {
        alert('Error processing refund: ' + error.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      canceled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      canceling: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600 mt-2">Manage subscribers, track revenue, and analyze growth</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="btn-primary flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(subscriptionData.stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Recurring</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(subscriptionData.stats.monthlyRecurring)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptionData.stats.activeSubscribers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary-100">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptionData.stats.churnRate}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg LTV</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(subscriptionData.stats.lifetimeValue)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Growth</h3>
            <p className="text-sm text-gray-600">Monthly revenue and subscriber growth</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={subscriptionData.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Revenue' : 'Subscribers'
                ]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#6C5CE7" strokeWidth={2} />
              <Line type="monotone" dataKey="subscribers" stroke="#00B894" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Plan Distribution</h3>
            <p className="text-sm text-gray-600">Breakdown by subscription plan</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionData.planDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {subscriptionData.planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Subscribers</h3>
          <p className="text-sm text-gray-600">Manage individual subscriptions</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
              <option value="trialing">Trialing</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Plans</option>
              <option value="premium">Premium</option>
              <option value="family">Family</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header text-left">Customer</th>
                <th className="table-header text-left">Plan</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Amount</th>
                <th className="table-header text-left">Next Billing</th>
                <th className="table-header text-left">LTV</th>
                <th className="table-header text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {subscriber.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscriber.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {subscriber.id}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="badge badge-primary">
                      {subscriber.plan.charAt(0).toUpperCase() + subscriber.plan.slice(1)}
                    </span>
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(subscriber.status)}
                    {subscriber.cancelAtPeriodEnd && (
                      <div className="text-xs text-orange-600 mt-1">
                        Cancels at period end
                      </div>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(subscriber.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {subscriber.interval === 'once' ? 'One-time' : `per ${subscriber.interval}`}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {subscriber.currentPeriodEnd 
                        ? formatDate(subscriber.currentPeriodEnd)
                        : 'N/A'
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {subscriber.paymentMethod}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(subscriber.lifetimeValue)}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`/users/${subscriber.userId}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800"
                        title="View User"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {subscriber.status === 'active' && !subscriber.cancelAtPeriodEnd && (
                        <button
                          onClick={() => handleCancelSubscription(subscriber.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Cancel Subscription"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRefund(subscriber.id)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Process Refund"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionManager;
