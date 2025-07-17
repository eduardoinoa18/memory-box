/**
 * Campaign Management Dashboard
 * Step 8D: Admin interface for creating and managing messaging campaigns
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";
import { 
  Plus, 
  Send, 
  Calendar as CalendarIcon, 
  Users, 
  Mail, 
  MessageSquare, 
  Bell,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy,
  where 
} from 'firebase/firestore';
import { getTemplates } from '../../lib/templateParser';

const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState({ email: [], sms: [] });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  // Form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    type: 'email',
    channels: ['email'],
    templateId: '',
    subject: '',
    message: '',
    audience: 'all',
    segmentFilter: {},
    scheduleType: 'immediate',
    scheduledAt: null,
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load campaigns
      const campaignsQuery = query(
        collection(db, 'campaigns'),
        orderBy('createdAt', 'desc')
      );
      const campaignsSnapshot = await getDocs(campaignsQuery);
      const campaignsData = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampaigns(campaignsData);

      // Load templates
      const emailTemplates = await getTemplates('email');
      const smsTemplates = await getTemplates('sms');
      setTemplates({
        email: emailTemplates,
        sms: smsTemplates
      });

      // Load users for audience selection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);

    } catch (error) {
      console.error('Failed to load campaign data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const campaignData = {
        ...campaignForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'draft',
        stats: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          failed: 0
        }
      };

      await addDoc(collection(db, 'campaigns'), campaignData);
      setShowCreateDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const resetForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      type: 'email',
      channels: ['email'],
      templateId: '',
      subject: '',
      message: '',
      audience: 'all',
      segmentFilter: {},
      scheduleType: 'immediate',
      scheduledAt: null,
      active: true
    });
  };

  const sendCampaign = async (campaign) => {
    try {
      // Get recipients based on audience settings
      let recipients = users;
      
      if (campaign.audience === 'premium') {
        recipients = users.filter(user => user.plan === 'premium');
      } else if (campaign.audience === 'free') {
        recipients = users.filter(user => !user.plan || user.plan === 'free');
      }

      // Format recipients for the API
      const formattedRecipients = recipients.map(user => ({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName || 'User',
        lastName: user.lastName || '',
        variables: {
          plan: user.plan || 'free',
          memberSince: user.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'
        }
      }));

      // Send via API
      const response = await fetch('/api/messaging/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: campaign.type === 'multi' ? 'multi_channel' : campaign.type,
          channels: campaign.channels,
          recipients: formattedRecipients,
          templateId: campaign.templateId,
          subject: campaign.subject,
          message: campaign.message,
          campaignId: campaign.id
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update campaign status and stats
        await updateDoc(doc(db, 'campaigns', campaign.id), {
          status: 'sent',
          sentAt: serverTimestamp(),
          'stats.sent': result.sent,
          'stats.failed': result.failed
        });

        loadData();
      }
    } catch (error) {
      console.error('Failed to send campaign:', error);
    }
  };

  const toggleCampaignStatus = async (campaignId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await updateDoc(doc(db, 'campaigns', campaignId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      loadData();
    } catch (error) {
      console.error('Failed to toggle campaign status:', error);
    }
  };

  const deleteCampaign = async (campaignId) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteDoc(doc(db, 'campaigns', campaignId));
        loadData();
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'secondary',
      active: 'default',
      sent: 'success',
      paused: 'destructive',
      scheduled: 'outline'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaign Manager</h1>
          <p className="text-gray-600">Create and manage messaging campaigns</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Set up a new messaging campaign to reach your users
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Holiday Special 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select 
                    value={campaignForm.type} 
                    onValueChange={(value) => setCampaignForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="sms">SMS Only</SelectItem>
                      <SelectItem value="in_app">In-App Only</SelectItem>
                      <SelectItem value="multi">Multi-Channel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this campaign"
                />
              </div>

              {/* Template Selection */}
              <div>
                <Label htmlFor="template">Template</Label>
                <Select 
                  value={campaignForm.templateId} 
                  onValueChange={(value) => setCampaignForm(prev => ({ ...prev, templateId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates[campaignForm.type === 'email' ? 'email' : 'sms']?.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Message */}
              {!campaignForm.templateId && (
                <div className="space-y-4">
                  {(campaignForm.type === 'email' || campaignForm.type === 'multi') && (
                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        value={campaignForm.subject}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Welcome to Memory Box!"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={campaignForm.message}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Your message content..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Audience Selection */}
              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Select 
                  value={campaignForm.audience} 
                  onValueChange={(value) => setCampaignForm(prev => ({ ...prev, audience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users ({users.length})</SelectItem>
                    <SelectItem value="premium">Premium Users ({users.filter(u => u.plan === 'premium').length})</SelectItem>
                    <SelectItem value="free">Free Users ({users.filter(u => !u.plan || u.plan === 'free').length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduling */}
              <div>
                <Label>Schedule</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={campaignForm.scheduleType === 'immediate'}
                      onCheckedChange={(checked) => 
                        setCampaignForm(prev => ({ 
                          ...prev, 
                          scheduleType: checked ? 'immediate' : 'scheduled' 
                        }))
                      }
                    />
                    <Label>Send Immediately</Label>
                  </div>
                  
                  {campaignForm.scheduleType === 'scheduled' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {campaignForm.scheduledAt 
                            ? format(campaignForm.scheduledAt, 'PPP') 
                            : 'Pick a date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={campaignForm.scheduledAt}
                          onSelect={(date) => setCampaignForm(prev => ({ ...prev, scheduledAt: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={!campaignForm.name}>
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">95%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>Manage your messaging campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{campaign.name}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Type: {campaign.type}</span>
                    <span>Audience: {campaign.audience}</span>
                    {campaign.stats && (
                      <span>Sent: {campaign.stats.sent || 0}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  {campaign.status === 'draft' && (
                    <Button 
                      size="sm"
                      onClick={() => sendCampaign(campaign)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send
                    </Button>
                  )}
                  
                  {(campaign.status === 'active' || campaign.status === 'paused') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                    >
                      {campaign.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteCampaign(campaign.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {campaigns.length === 0 && (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No campaigns yet</h3>
                <p className="text-gray-600">Create your first campaign to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignManager;
