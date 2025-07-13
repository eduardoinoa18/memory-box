// Memory Box Admin Dashboard - System Settings
// Configure app settings and manage system parameters
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Settings, Shield, Database, Mail, Bell, Globe,
  Users, Crown, Upload, Share2, ArrowLeft, Save,
  AlertTriangle, CheckCircle, Info, Zap, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function SystemSettingsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [activeSection, setActiveSection] = useState('plans');
  const [settings, setSettings] = useState({
    plans: {
      free: {
        storageLimit: 1024, // MB
        folderLimit: 5,
        fileLimit: 50,
        videoUpload: false,
        voiceRecording: false,
        shareLimit: 10
      },
      premium: {
        storageLimit: 51200, // MB (50GB)
        folderLimit: 50,
        fileLimit: 1000,
        videoUpload: true,
        voiceRecording: true,
        shareLimit: 100,
        price: 4.99
      },
      family: {
        storageLimit: 204800, // MB (200GB)
        folderLimit: 100,
        fileLimit: 5000,
        videoUpload: true,
        voiceRecording: true,
        shareLimit: -1, // unlimited
        price: 9.99,
        maxMembers: 6
      }
    },
    system: {
      maintenanceMode: false,
      newRegistrations: true,
      fileUploadEnabled: true,
      sharingEnabled: true,
      maxFileSize: 100, // MB
      supportedFormats: ['jpg', 'png', 'gif', 'mp4', 'pdf', 'doc', 'docx'],
      linkExpiryDays: 30
    },
    notifications: {
      emailNotifications: true,
      welcomeEmail: true,
      upgradePremiumEmail: true,
      storageWarningEmail: true,
      weeklyDigest: true
    },
    security: {
      passwordMinLength: 8,
      requireEmailVerification: true,
      twoFactorAuth: false,
      loginAttempts: 5,
      sessionTimeout: 24 // hours
    }
  });
  const [hasChanges, setHasChanges] = useState(false);

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
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updatePlanSetting = (plan, key, value) => {
    setSettings(prev => ({
      ...prev,
      plans: {
        ...prev.plans,
        [plan]: {
          ...prev.plans[plan],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // In a real app, this would save to backend
    setTimeout(() => {
      setHasChanges(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const formatStorageSize = (mb) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)}GB`;
    }
    return `${mb}MB`;
  };

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
                  System Settings
                </h1>
                <p className="text-gray-600">Configure Memory Box app parameters</p>
              </div>
            </div>
            
            {hasChanges && (
              <button
                onClick={saveSettings}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('plans')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'plans' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>Plan Settings</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('system')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'system' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>System Config</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('notifications')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'notifications' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('security')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === 'security' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Plan Settings */}
            {activeSection === 'plans' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plan Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Plan */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-3 h-3 bg-gray-500 rounded"></div>
                        <h4 className="font-semibold text-gray-900">Free Plan</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Storage Limit</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={settings.plans.free.storageLimit}
                              onChange={(e) => updatePlanSetting('free', 'storageLimit', parseInt(e.target.value))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <span className="text-sm text-gray-500">MB</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{formatStorageSize(settings.plans.free.storageLimit)}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Folder Limit</label>
                          <input
                            type="number"
                            value={settings.plans.free.folderLimit}
                            onChange={(e) => updatePlanSetting('free', 'folderLimit', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">File Limit</label>
                          <input
                            type="number"
                            value={settings.plans.free.fileLimit}
                            onChange={(e) => updatePlanSetting('free', 'fileLimit', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Video Upload</span>
                          <input
                            type="checkbox"
                            checked={settings.plans.free.videoUpload}
                            onChange={(e) => updatePlanSetting('free', 'videoUpload', e.target.checked)}
                            className="rounded"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Voice Recording</span>
                          <input
                            type="checkbox"
                            checked={settings.plans.free.voiceRecording}
                            onChange={(e) => updatePlanSetting('free', 'voiceRecording', e.target.checked)}
                            className="rounded"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Premium Plan */}
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <h4 className="font-semibold text-gray-900">Premium Plan</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Storage Limit</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={settings.plans.premium.storageLimit}
                              onChange={(e) => updatePlanSetting('premium', 'storageLimit', parseInt(e.target.value))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <span className="text-sm text-gray-500">MB</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{formatStorageSize(settings.plans.premium.storageLimit)}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (Monthly)</label>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={settings.plans.premium.price}
                              onChange={(e) => updatePlanSetting('premium', 'price', parseFloat(e.target.value))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Folder Limit</label>
                          <input
                            type="number"
                            value={settings.plans.premium.folderLimit}
                            onChange={(e) => updatePlanSetting('premium', 'folderLimit', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Video Upload</span>
                          <input
                            type="checkbox"
                            checked={settings.plans.premium.videoUpload}
                            onChange={(e) => updatePlanSetting('premium', 'videoUpload', e.target.checked)}
                            className="rounded"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Family Plan */}
                    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <h4 className="font-semibold text-gray-900">Family Plan</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Storage Limit</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={settings.plans.family.storageLimit}
                              onChange={(e) => updatePlanSetting('family', 'storageLimit', parseInt(e.target.value))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <span className="text-sm text-gray-500">MB</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{formatStorageSize(settings.plans.family.storageLimit)}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (Monthly)</label>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={settings.plans.family.price}
                              onChange={(e) => updatePlanSetting('family', 'price', parseFloat(e.target.value))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
                          <input
                            type="number"
                            value={settings.plans.family.maxMembers}
                            onChange={(e) => updatePlanSetting('family', 'maxMembers', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Unlimited Sharing</span>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Configuration */}
            {activeSection === 'system' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900">Maintenance Mode</label>
                          <p className="text-sm text-gray-500">Disable app for maintenance</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.system.maintenanceMode}
                          onChange={(e) => updateSetting('system', 'maintenanceMode', e.target.checked)}
                          className="rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900">New Registrations</label>
                          <p className="text-sm text-gray-500">Allow new user sign-ups</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.system.newRegistrations}
                          onChange={(e) => updateSetting('system', 'newRegistrations', e.target.checked)}
                          className="rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900">File Upload</label>
                          <p className="text-sm text-gray-500">Enable file uploads</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.system.fileUploadEnabled}
                          onChange={(e) => updateSetting('system', 'fileUploadEnabled', e.target.checked)}
                          className="rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-900">Sharing</label>
                          <p className="text-sm text-gray-500">Enable link sharing</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.system.sharingEnabled}
                          onChange={(e) => updateSetting('system', 'sharingEnabled', e.target.checked)}
                          className="rounded"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Max File Size (MB)</label>
                        <input
                          type="number"
                          value={settings.system.maxFileSize}
                          onChange={(e) => updateSetting('system', 'maxFileSize', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Link Expiry (Days)</label>
                        <input
                          type="number"
                          value={settings.system.linkExpiryDays}
                          onChange={(e) => updateSetting('system', 'linkExpiryDays', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block font-medium text-gray-900 mb-2">Supported Formats</label>
                        <textarea
                          value={settings.system.supportedFormats.join(', ')}
                          onChange={(e) => updateSetting('system', 'supportedFormats', e.target.value.split(', '))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20"
                          placeholder="jpg, png, gif, mp4, pdf..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Email Notifications</label>
                      <p className="text-sm text-gray-500">Enable all email notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Welcome Email</label>
                      <p className="text-sm text-gray-500">Send welcome email to new users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.welcomeEmail}
                      onChange={(e) => updateSetting('notifications', 'welcomeEmail', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Upgrade Notifications</label>
                      <p className="text-sm text-gray-500">Notify users about plan upgrades</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.upgradePremiumEmail}
                      onChange={(e) => updateSetting('notifications', 'upgradePremiumEmail', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Storage Warnings</label>
                      <p className="text-sm text-gray-500">Warn users when approaching storage limits</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.storageWarningEmail}
                      onChange={(e) => updateSetting('notifications', 'storageWarningEmail', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Weekly Digest</label>
                      <p className="text-sm text-gray-500">Send weekly activity summary</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.weeklyDigest}
                      onChange={(e) => updateSetting('notifications', 'weeklyDigest', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Password Min Length</label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Login Attempts Limit</label>
                      <input
                        type="number"
                        value={settings.security.loginAttempts}
                        onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">Session Timeout (Hours)</label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-900">Email Verification</label>
                        <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.requireEmailVerification}
                        onChange={(e) => updateSetting('security', 'requireEmailVerification', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-900">Two-Factor Auth</label>
                        <p className="text-sm text-gray-500">Enable 2FA for admin accounts</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
