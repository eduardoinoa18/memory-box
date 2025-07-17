/**
 * Template Parser and Engine
 * Step 8C: Dynamic template rendering with variable substitution
 */

import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import messagingConfig from './messagingConfig';

/**
 * Parse template variables and replace with actual values
 */
export function parseTemplate(template, variables = {}) {
  if (!template) return '';

  // Merge with default variables
  const mergedVariables = {
    ...messagingConfig.defaultVariables,
    ...variables,
    // Add current date/time
    currentDate: new Date().toLocaleDateString(),
    currentTime: new Date().toLocaleTimeString(),
    currentYear: new Date().getFullYear()
  };

  // Replace variables using the pattern {{variableName}}
  return template.replace(messagingConfig.templates.variablePattern, (match, varName) => {
    const value = mergedVariables[varName];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Get available template variables for a given context
 */
export function getTemplateVariables(context = 'general') {
  const baseVariables = {
    // User variables
    firstName: 'User\'s first name',
    lastName: 'User\'s last name',
    email: 'User\'s email address',
    fullName: 'User\'s full name',
    
    // App variables
    appName: 'Application name',
    websiteUrl: 'Website URL',
    supportEmail: 'Support email address',
    
    // Dynamic variables
    currentDate: 'Current date',
    currentTime: 'Current time',
    currentYear: 'Current year',
    
    // Action variables
    actionUrl: 'Action button URL',
    unsubscribeUrl: 'Unsubscribe URL'
  };

  const contextVariables = {
    welcome: {
      ...baseVariables,
      activationUrl: 'Account activation URL',
      verificationCode: 'Email verification code'
    },
    reminder: {
      ...baseVariables,
      reminderType: 'Type of reminder',
      dueDate: 'Due date',
      itemCount: 'Number of items'
    },
    campaign: {
      ...baseVariables,
      campaignName: 'Campaign name',
      discount: 'Discount amount',
      expiryDate: 'Offer expiry date',
      productName: 'Product name'
    },
    notification: {
      ...baseVariables,
      notificationType: 'Type of notification',
      actionRequired: 'Required action description'
    },
    security: {
      ...baseVariables,
      ipAddress: 'Login IP address',
      deviceInfo: 'Device information',
      loginTime: 'Login timestamp'
    }
  };

  return contextVariables[context] || baseVariables;
}

/**
 * Validate template syntax
 */
export function validateTemplate(template) {
  const errors = [];
  const warnings = [];

  if (!template) {
    errors.push('Template content is required');
    return { isValid: false, errors, warnings };
  }

  // Check for unclosed variables
  const matches = template.match(/\{\{[^}]*$/g);
  if (matches) {
    errors.push('Unclosed template variables found');
  }

  // Check for nested variables
  const nestedMatches = template.match(/\{\{[^}]*\{\{/g);
  if (nestedMatches) {
    errors.push('Nested template variables are not supported');
  }

  // Extract all variables
  const variables = [];
  let match;
  const regex = new RegExp(messagingConfig.templates.variablePattern);
  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1]);
  }

  // Check for potentially missing common variables
  const commonVariables = ['firstName', 'email', 'appName'];
  const hasCommonVar = commonVariables.some(v => variables.includes(v));
  if (!hasCommonVar && variables.length > 0) {
    warnings.push('Consider adding user personalization variables like {{firstName}}');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    variables: [...new Set(variables)] // Remove duplicates
  };
}

/**
 * Get template from Firestore
 */
export async function getTemplate(templateId, type = 'email') {
  try {
    const templateDoc = await getDoc(doc(db, 'templates', type, templateId));
    
    if (!templateDoc.exists()) {
      throw new Error(`Template ${templateId} not found`);
    }

    const template = templateDoc.data();
    
    if (!template.active) {
      throw new Error(`Template ${templateId} is inactive`);
    }

    return {
      id: templateDoc.id,
      ...template
    };
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
}

/**
 * Get all templates for a specific type and category
 */
export async function getTemplates(type = 'email', category = null, activeOnly = true) {
  try {
    let q = collection(db, 'templates', type);
    
    const constraints = [];
    
    if (category) {
      constraints.push(where('category', '==', category));
    }
    
    if (activeOnly) {
      constraints.push(where('active', '==', true));
    }
    
    constraints.push(orderBy('name'));
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
}

/**
 * Render template with variables
 */
export async function renderTemplate(templateId, variables = {}, type = 'email') {
  try {
    const template = await getTemplate(templateId, type);
    
    const rendered = {
      id: template.id,
      name: template.name,
      category: template.category,
      type: type
    };

    // Render subject if it exists
    if (template.subject) {
      rendered.subject = parseTemplate(template.subject, variables);
    }

    // Render body/content
    if (template.body || template.content) {
      rendered.body = parseTemplate(template.body || template.content, variables);
    }

    // Render HTML version if it exists (for emails)
    if (template.html) {
      rendered.html = parseTemplate(template.html, variables);
    }

    // Include original template for reference
    rendered.originalTemplate = template;

    return rendered;
  } catch (error) {
    console.error('Error rendering template:', error);
    throw error;
  }
}

/**
 * Preview template with sample data
 */
export function previewTemplate(template, context = 'general') {
  const sampleData = {
    general: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      fullName: 'John Doe'
    },
    welcome: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      fullName: 'Sarah Johnson',
      activationUrl: 'https://memorybox.app/activate?token=abc123',
      verificationCode: '123456'
    },
    reminder: {
      firstName: 'Mike',
      lastName: 'Wilson',
      email: 'mike@example.com',
      fullName: 'Mike Wilson',
      reminderType: 'Memory backup',
      dueDate: 'December 31, 2025',
      itemCount: '15'
    },
    campaign: {
      firstName: 'Lisa',
      lastName: 'Brown',
      email: 'lisa@example.com',
      fullName: 'Lisa Brown',
      campaignName: 'Holiday Special',
      discount: '25%',
      expiryDate: 'January 1, 2026',
      productName: 'Premium Memory Box'
    }
  };

  const data = sampleData[context] || sampleData.general;

  return {
    subject: template.subject ? parseTemplate(template.subject, data) : undefined,
    body: template.body ? parseTemplate(template.body, data) : undefined,
    html: template.html ? parseTemplate(template.html, data) : undefined,
    sampleData: data
  };
}

/**
 * Create default templates
 */
export const defaultTemplates = {
  email: {
    welcome: {
      name: 'Welcome Email',
      category: 'welcome',
      subject: 'Welcome to {{appName}}, {{firstName}}!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to {{appName}}!</h1>
          <p>Hi {{firstName}},</p>
          <p>Thanks for joining {{appName}}! We're excited to help you preserve and share your precious memories.</p>
          <p>To get started, click the button below to verify your email address:</p>
          <a href="{{activationUrl}}" style="background: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
          <p>If you have any questions, feel free to reach out to us at {{supportEmail}}.</p>
          <p>Best regards,<br>The {{appName}} Team</p>
        </div>
      `,
      body: 'Hi {{firstName}}, welcome to {{appName}}! Please verify your email by visiting: {{activationUrl}}',
      active: true
    },
    reminder: {
      name: 'Memory Backup Reminder',
      category: 'reminder',
      subject: 'Don\'t forget to backup your memories, {{firstName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Time to backup your memories!</h1>
          <p>Hi {{firstName}},</p>
          <p>It's been a while since your last backup. You have {{itemCount}} new memories waiting to be safely stored.</p>
          <p>Don't let precious moments slip away - backup now!</p>
          <a href="{{actionUrl}}" style="background: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Backup Now</a>
        </div>
      `,
      body: 'Hi {{firstName}}, time to backup your {{itemCount}} new memories! Visit: {{actionUrl}}',
      active: true
    }
  },
  sms: {
    welcome: {
      name: 'Welcome SMS',
      category: 'welcome',
      body: 'Welcome to {{appName}}, {{firstName}}! Verify your account: {{activationUrl}}',
      active: true
    },
    reminder: {
      name: 'Backup Reminder SMS',
      category: 'reminder',
      body: 'Hi {{firstName}}, you have {{itemCount}} memories to backup. Don\'t lose them! {{actionUrl}}',
      active: true
    }
  }
};

export default {
  parseTemplate,
  getTemplateVariables,
  validateTemplate,
  getTemplate,
  getTemplates,
  renderTemplate,
  previewTemplate,
  defaultTemplates
};
