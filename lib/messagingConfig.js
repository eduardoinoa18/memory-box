/**
 * Messaging Engine Configuration
 * Step 8A: Centralized configuration for SendGrid, Twilio, and notification settings
 */

export const messagingConfig = {
  // Feature flags
  enabled: process.env.MESSAGING_ENABLED === 'true',
  emailEnabled: process.env.EMAIL_ENABLED === 'true',
  smsEnabled: process.env.SMS_ENABLED === 'true',
  inAppEnabled: process.env.IN_APP_NOTIFICATIONS_ENABLED === 'true',

  // SendGrid configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.SENDGRID_FROM,
    fromName: process.env.SENDGRID_FROM_NAME || 'Memory Box',
    baseUrl: 'https://api.sendgrid.com/v3',
    
    // Tracking settings
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true, substitutionTag: '%open_track%' },
      subscriptionTracking: { enable: false }
    }
  },

  // Twilio configuration
  twilio: {
    accountSid: process.env.TWILIO_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
    baseUrl: 'https://api.twilio.com/2010-04-01'
  },

  // Message templates configuration
  templates: {
    defaultLocale: 'en',
    supportedLocales: ['en', 'es'],
    variablePattern: /\{\{(\w+)\}\}/g,
    
    // Template categories
    categories: {
      WELCOME: 'welcome',
      REMINDER: 'reminder',
      CAMPAIGN: 'campaign',
      NOTIFICATION: 'notification',
      SECURITY: 'security'
    }
  },

  // Rate limiting
  rateLimits: {
    email: {
      perMinute: 100,
      perHour: 1000,
      perDay: 10000
    },
    sms: {
      perMinute: 10,
      perHour: 100,
      perDay: 500
    }
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // ms
    maxDelay: 30000, // ms
    backoffMultiplier: 2
  },

  // Analytics configuration
  analytics: {
    enableDeliveryTracking: true,
    enableOpenTracking: true,
    enableClickTracking: true,
    trackingPixelUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/track/open',
    clickTrackingUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/track/click'
  },

  // Default template variables
  defaultVariables: {
    appName: 'Memory Box',
    supportEmail: 'support@memorybox.app',
    websiteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://memorybox.app',
    unsubscribeUrl: process.env.NEXT_PUBLIC_APP_URL + '/unsubscribe'
  }
};

/**
 * Validate messaging configuration
 */
export function validateMessagingConfig() {
  const errors = [];

  if (messagingConfig.enabled) {
    if (messagingConfig.emailEnabled && !messagingConfig.sendgrid.apiKey) {
      errors.push('SendGrid API key is required when email is enabled');
    }

    if (messagingConfig.smsEnabled && (!messagingConfig.twilio.accountSid || !messagingConfig.twilio.authToken)) {
      errors.push('Twilio credentials are required when SMS is enabled');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get messaging provider status
 */
export function getMessagingStatus() {
  const validation = validateMessagingConfig();
  
  return {
    overall: messagingConfig.enabled && validation.isValid,
    email: messagingConfig.emailEnabled && !!messagingConfig.sendgrid.apiKey,
    sms: messagingConfig.smsEnabled && !!messagingConfig.twilio.accountSid,
    inApp: messagingConfig.inAppEnabled,
    errors: validation.errors
  };
}

export default messagingConfig;
