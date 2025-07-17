/**
 * Messaging Analytics Dashboard
 * Step 8E: Analytics and reporting for messaging campaigns
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Mail,
  MessageSquare,
  Bell,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointer,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const MessagingAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    overview: {},
    campaigns: [],
    messages: [],
    trends: [],
    channels: {}
  });
  const [dateRange, setDateRange] = useState('7d');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedChannel]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const days = parseInt(dateRange.replace('d', ''));
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = endOfDay(new Date());

      // Load messages data
      let messagesQuery = query(
        collection(db, 'messagesSent'),
        where('sentAt', '>=', Timestamp.fromDate(startDate)),
        where('sentAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('sentAt', 'desc')
      );

      if (selectedChannel !== 'all') {
        messagesQuery = query(
          messagesQuery,
          where('type', '==', selectedChannel)
        );
      }

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate()
      }));

      // Load campaigns data
      const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
      const campaigns = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // Calculate analytics
      const analyticsData = calculateAnalytics(messages, campaigns, days);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (messages, campaigns, days) => {
    // Overview metrics
    const totalSent = messages.length;
    const delivered = messages.filter(m => m.status === 'delivered').length;
    const opened = messages.filter(m => m.opened).length;
    const clicked = messages.filter(m => m.clicked).length;
    const failed = messages.filter(m => m.status === 'failed').length;

    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
    const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
    const failureRate = totalSent > 0 ? (failed / totalSent) * 100 : 0;

    // Channel breakdown
    const channels = {
      email: messages.filter(m => m.type === 'email').length,
      sms: messages.filter(m => m.type === 'sms').length,
      in_app: messages.filter(m => m.type === 'in_app').length
    };

    // Daily trends
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayMessages = messages.filter(m => 
        m.sentAt && 
        format(m.sentAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      trends.push({
        date: format(date, 'MMM dd'),
        sent: dayMessages.length,
        delivered: dayMessages.filter(m => m.status === 'delivered').length,
        opened: dayMessages.filter(m => m.opened).length,
        clicked: dayMessages.filter(m => m.clicked).length,
        failed: dayMessages.filter(m => m.status === 'failed').length
      });
    }

    // Campaign performance
    const campaignStats = campaigns.map(campaign => {
      const campaignMessages = messages.filter(m => m.campaignId === campaign.id);
      const sent = campaignMessages.length;
      const delivered = campaignMessages.filter(m => m.status === 'delivered').length;
      const opened = campaignMessages.filter(m => m.opened).length;
      const clicked = campaignMessages.filter(m => m.clicked).length;

      return {
        ...campaign,
        stats: {
          sent,
          delivered,
          opened,
          clicked,
          deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
          openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
          clickRate: opened > 0 ? (clicked / opened) * 100 : 0
        }
      };
    });

    return {
      overview: {
        totalSent,
        delivered,
        opened,
        clicked,
        failed,
        deliveryRate,
        openRate,
        clickRate,
        failureRate
      },
      campaigns: campaignStats,
      messages,
      trends,
      channels
    };
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const exportData = () => {
    // Implementation for exporting analytics data
    console.log('Export functionality to be implemented');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messaging Analytics</h1>
          <p className="text-gray-600">Track delivery, engagement, and campaign performance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="in_app">In-App</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages Sent</p>
                <p className="text-2xl font-bold">{analytics.overview.totalSent?.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last period
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold">{analytics.overview.deliveryRate?.toFixed(1)}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Excellent
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold">{analytics.overview.openRate?.toFixed(1)}%</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Eye className="w-3 h-3 mr-1" />
                  Above average
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold">{analytics.overview.clickRate?.toFixed(1)}%</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <MousePointer className="w-3 h-3 mr-1" />
                  Good engagement
                </p>
              </div>
              <MousePointer className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="messages">Recent Messages</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Volume</CardTitle>
                <CardDescription>Daily message sending trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="sent" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Opens, clicks, and delivery rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="delivered" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="opened" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicked" 
                      stroke="#FFBB28" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Analyze individual campaign results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.campaigns.map(campaign => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">{campaign.type}</Badge>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold">{campaign.stats?.sent || 0}</p>
                          <p className="text-xs text-gray-600">Sent</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">
                            {campaign.stats?.deliveryRate?.toFixed(1) || 0}%
                          </p>
                          <p className="text-xs text-gray-600">Delivered</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-blue-600">
                            {campaign.stats?.openRate?.toFixed(1) || 0}%
                          </p>
                          <p className="text-xs text-gray-600">Opened</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-600">
                            {campaign.stats?.clickRate?.toFixed(1) || 0}%
                          </p>
                          <p className="text-xs text-gray-600">Clicked</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {analytics.campaigns.length === 0 && (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No campaign data</h3>
                    <p className="text-gray-600">Campaign analytics will appear here once you send campaigns</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Channel Distribution</CardTitle>
                <CardDescription>Message volume by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Email', value: analytics.channels.email, color: '#0088FE' },
                        { name: 'SMS', value: analytics.channels.sms, color: '#00C49F' },
                        { name: 'In-App', value: analytics.channels.in_app, color: '#FFBB28' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Email', value: analytics.channels.email, color: '#0088FE' },
                        { name: 'SMS', value: analytics.channels.sms, color: '#00C49F' },
                        { name: 'In-App', value: analytics.channels.in_app, color: '#FFBB28' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Success rates by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Email', sent: analytics.channels.email, icon: Mail, color: 'blue' },
                    { name: 'SMS', sent: analytics.channels.sms, icon: MessageSquare, color: 'green' },
                    { name: 'In-App', sent: analytics.channels.in_app, icon: Bell, color: 'yellow' }
                  ].map(channel => {
                    const Icon = channel.icon;
                    const channelMessages = analytics.messages.filter(m => m.type === channel.name.toLowerCase().replace('-', '_'));
                    const delivered = channelMessages.filter(m => m.status === 'delivered').length;
                    const rate = channel.sent > 0 ? (delivered / channel.sent) * 100 : 0;
                    
                    return (
                      <div key={channel.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-8 h-8 text-${channel.color}-500`} />
                          <div>
                            <h3 className="font-medium">{channel.name}</h3>
                            <p className="text-sm text-gray-600">{channel.sent} messages sent</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{rate.toFixed(1)}%</p>
                          <p className="text-xs text-gray-600">Success rate</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest message delivery status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.messages.slice(0, 20).map(message => (
                  <div key={message.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {message.type === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                      {message.type === 'sms' && <MessageSquare className="w-4 h-4 text-green-500" />}
                      {message.type === 'in_app' && <Bell className="w-4 h-4 text-yellow-500" />}
                      
                      <div>
                        <p className="font-medium">{message.to || message.userId}</p>
                        <p className="text-sm text-gray-600">
                          {message.subject || message.body?.substring(0, 50) + '...'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          message.status === 'delivered' ? 'default' :
                          message.status === 'failed' ? 'destructive' : 'secondary'
                        }
                      >
                        {message.status}
                      </Badge>
                      
                      {message.opened && <Eye className="w-4 h-4 text-blue-500" />}
                      {message.clicked && <MousePointer className="w-4 h-4 text-purple-500" />}
                      
                      <span className="text-xs text-gray-500">
                        {message.sentAt ? format(message.sentAt, 'MMM dd, HH:mm') : 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {analytics.messages.length === 0 && (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                    <p className="text-gray-600">Message delivery logs will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingAnalytics;
