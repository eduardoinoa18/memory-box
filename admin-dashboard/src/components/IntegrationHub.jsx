import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  TestTube as TestIcon,
  Save as SaveIcon,
  CloudSync as CloudSyncIcon
} from '@mui/icons-material';

const IntegrationHub = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [integrations, setIntegrations] = useState({});
  const [editDialog, setEditDialog] = useState({ open: false, integration: null });
  const [testResults, setTestResults] = useState({});
  const [showSecrets, setShowSecrets] = useState({});

  // Integration configurations
  const integrationConfigs = {
    firebase: {
      name: 'Firebase',
      description: 'Backend services, authentication, database, and storage',
      icon: '🔥',
      required: true,
      status: 'connected',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'authDomain', label: 'Auth Domain', type: 'text', required: true },
        { key: 'projectId', label: 'Project ID', type: 'text', required: true },
        { key: 'storageBucket', label: 'Storage Bucket', type: 'text', required: true },
        { key: 'messagingSenderId', label: 'Messaging Sender ID', type: 'text', required: true },
        { key: 'appId', label: 'App ID', type: 'text', required: true }
      ]
    },
    stripe: {
      name: 'Stripe',
      description: 'Payment processing and subscription management',
      icon: '💳',
      required: true,
      status: 'pending',
      fields: [
        { key: 'publishableKey', label: 'Publishable Key', type: 'text', required: true },
        { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true },
        { key: 'testMode', label: 'Test Mode', type: 'boolean', required: false }
      ]
    },
    openai: {
      name: 'OpenAI',
      description: 'AI features: Rob AI letter writer, smart categorization',
      icon: '🤖',
      required: true,
      status: 'disconnected',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'organization', label: 'Organization ID', type: 'text', required: false },
        { key: 'model', label: 'Default Model', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo'], required: true }
      ]
    },
    sendgrid: {
      name: 'SendGrid',
      description: 'Email notifications and marketing communications',
      icon: '📧',
      required: false,
      status: 'disconnected',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'fromEmail', label: 'From Email', type: 'email', required: true },
        { key: 'fromName', label: 'From Name', type: 'text', required: true }
      ]
    },
    twilio: {
      name: 'Twilio',
      description: 'SMS notifications and phone verification',
      icon: '📱',
      required: false,
      status: 'disconnected',
      fields: [
        { key: 'accountSid', label: 'Account SID', type: 'text', required: true },
        { key: 'authToken', label: 'Auth Token', type: 'password', required: true },
        { key: 'phoneNumber', label: 'Twilio Phone Number', type: 'tel', required: true }
      ]
    },
    prizeout: {
      name: 'PrizeOut',
      description: 'Reward system and loyalty program integration',
      icon: '🎁',
      required: false,
      status: 'disconnected',
      fields: [
        { key: 'partnerId', label: 'Partner ID', type: 'text', required: true },
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'secret', label: 'Secret Key', type: 'password', required: true },
        { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'production'], required: true }
      ]
    },
    analytics: {
      name: 'Google Analytics',
      description: 'User behavior tracking and insights',
      icon: '📊',
      required: false,
      status: 'disconnected',
      fields: [
        { key: 'measurementId', label: 'Measurement ID', type: 'text', required: true },
        { key: 'apiSecret', label: 'API Secret', type: 'password', required: true }
      ]
    },
    sentry: {
      name: 'Sentry',
      description: 'Error monitoring and performance tracking',
      icon: '🚨',
      required: false,
      status: 'disconnected',
      fields: [
        { key: 'dsn', label: 'DSN', type: 'text', required: true },
        { key: 'environment', label: 'Environment', type: 'select', options: ['development', 'staging', 'production'], required: true }
      ]
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      // Load saved integrations from backend
      const response = await fetch('/api/admin/integrations');
      const data = await response.json();
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const saveIntegration = async (integrationKey, values) => {
    try {
      const response = await fetch(`/api/admin/integrations/${integrationKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        setIntegrations(prev => ({
          ...prev,
          [integrationKey]: { ...values, status: 'connected' }
        }));
        setEditDialog({ open: false, integration: null });
      }
    } catch (error) {
      console.error('Failed to save integration:', error);
    }
  };

  const testIntegration = async (integrationKey) => {
    try {
      setTestResults(prev => ({ ...prev, [integrationKey]: { testing: true } }));
      
      const response = await fetch(`/api/admin/integrations/${integrationKey}/test`, {
        method: 'POST'
      });
      
      const result = await response.json();
      setTestResults(prev => ({ ...prev, [integrationKey]: result }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [integrationKey]: { success: false, error: error.message } 
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'success';
      case 'pending': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon color="success" />;
      case 'pending': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <SettingsIcon color="disabled" />;
    }
  };

  const renderIntegrationCard = (key, config) => {
    const integration = integrations[key] || {};
    const testResult = testResults[key];

    return (
      <Grid item xs={12} md={6} lg={4} key={key}>
        <Card 
          elevation={2}
          sx={{ 
            height: '100%', 
            border: config.required ? '2px solid #1976d2' : '1px solid #e0e0e0',
            backgroundColor: config.status === 'connected' ? '#f8fff8' : '#fff'
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h4">{config.icon}</Typography>
                <Box>
                  <Typography variant="h6">{config.name}</Typography>
                  {config.required && (
                    <Chip label="Required" color="primary" size="small" />
                  )}
                </Box>
              </Box>
              {getStatusIcon(config.status)}
            </Box>

            <Typography variant="body2" color="textSecondary" paragraph>
              {config.description}
            </Typography>

            <Chip 
              label={config.status || 'Not configured'}
              color={getStatusColor(config.status)}
              size="small"
              sx={{ mb: 2 }}
            />

            {testResult && (
              <Box mt={1}>
                {testResult.testing ? (
                  <LinearProgress />
                ) : (
                  <Alert 
                    severity={testResult.success ? 'success' : 'error'}
                    size="small"
                  >
                    {testResult.success ? 'Test successful' : testResult.error}
                  </Alert>
                )}
              </Box>
            )}
          </CardContent>

          <CardActions>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setEditDialog({ open: true, integration: key })}
            >
              Configure
            </Button>
            <Button
              size="small"
              startIcon={<TestIcon />}
              onClick={() => testIntegration(key)}
              disabled={config.status !== 'connected'}
            >
              Test
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  const renderEditDialog = () => {
    if (!editDialog.integration) return null;

    const config = integrationConfigs[editDialog.integration];
    const currentValues = integrations[editDialog.integration] || {};

    return (
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, integration: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Configure {config.name} {config.icon}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            {config.description}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {config.fields.map((field) => (
              <Grid item xs={12} key={field.key}>
                {field.type === 'boolean' ? (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentValues[field.key] || false}
                        onChange={(e) => {
                          // Handle boolean change
                        }}
                      />
                    }
                    label={field.label}
                  />
                ) : field.type === 'select' ? (
                  <TextField
                    select
                    fullWidth
                    label={field.label}
                    value={currentValues[field.key] || ''}
                    required={field.required}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    fullWidth
                    label={field.label}
                    type={showSecrets[field.key] ? 'text' : field.type}
                    value={currentValues[field.key] || ''}
                    required={field.required}
                    InputProps={field.type === 'password' ? {
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowSecrets(prev => ({
                            ...prev,
                            [field.key]: !prev[field.key]
                          }))}
                        >
                          {showSecrets[field.key] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      )
                    } : undefined}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Security Note:</strong> All API keys are encrypted and stored securely. 
            They are only accessible by authorized administrators.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, integration: null })}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={() => saveIntegration(editDialog.integration, currentValues)}
          >
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const tabs = [
    { label: 'All Integrations', value: 'all' },
    { label: 'Required', value: 'required' },
    { label: 'Connected', value: 'connected' },
    { label: 'Payment', value: 'payment' },
    { label: 'AI Services', value: 'ai' },
    { label: 'Communications', value: 'communications' }
  ];

  const getFilteredIntegrations = () => {
    const tab = tabs[activeTab].value;
    return Object.entries(integrationConfigs).filter(([key, config]) => {
      switch (tab) {
        case 'required': return config.required;
        case 'connected': return config.status === 'connected';
        case 'payment': return ['stripe', 'prizeout'].includes(key);
        case 'ai': return ['openai'].includes(key);
        case 'communications': return ['sendgrid', 'twilio'].includes(key);
        default: return true;
      }
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            🔌 Integration Hub
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage all third-party API integrations and services for Memory Box
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudSyncIcon />}
          onClick={loadIntegrations}
        >
          Refresh Status
        </Button>
      </Box>

      {/* Quick Status Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {Object.values(integrationConfigs).filter(c => c.status === 'connected').length}
              </Typography>
              <Typography variant="body2">Connected</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {Object.values(integrationConfigs).filter(c => c.required && c.status !== 'connected').length}
              </Typography>
              <Typography variant="body2">Required Missing</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error">
                {Object.values(integrationConfigs).filter(c => c.status === 'error').length}
              </Typography>
              <Typography variant="body2">Errors</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {Object.keys(integrationConfigs).length}
              </Typography>
              <Typography variant="body2">Total Services</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        {tabs.map((tab, index) => (
          <Tab key={tab.value} label={tab.label} />
        ))}
      </Tabs>

      {/* Integration Cards */}
      <Grid container spacing={3}>
        {getFilteredIntegrations().map(([key, config]) => 
          renderIntegrationCard(key, config)
        )}
      </Grid>

      {/* Setup Instructions */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          🚀 Launch Checklist
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Required for Beta Launch:</Typography>
            <ul>
              <li>Firebase (Backend & Auth)</li>
              <li>Stripe (Payments - Test Mode OK)</li>
              <li>OpenAI (AI Features)</li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>Optional but Recommended:</Typography>
            <ul>
              <li>SendGrid (Email notifications)</li>
              <li>Google Analytics (User tracking)</li>
              <li>Sentry (Error monitoring)</li>
            </ul>
          </Grid>
        </Grid>
      </Paper>

      {renderEditDialog()}
    </Box>
  );
};

export default IntegrationHub;
