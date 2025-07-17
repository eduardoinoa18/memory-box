/**
 * Unified Notification Service
 * Step 8B: Core service for sending email, SMS, and in-app notifications
 */

import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import messagingConfig from '../lib/messagingConfig';

// Initialize SendGrid
if (messagingConfig.sendgrid.apiKey) {
  sgMail.setApiKey(messagingConfig.sendgrid.apiKey);
}

// Initialize Twilio
let twilioClient = null;
if (messagingConfig.twilio.accountSid && messagingConfig.twilio.authToken) {
  twilioClient = twilio(messagingConfig.twilio.accountSid, messagingConfig.twilio.authToken);
}

/**
 * Send email notification
 */
export async function sendEmail({ 
  to, 
  subject, 
  html, 
  text = null,
  templateId = null,
  variables = {},
  campaignId = null,
  userId = null 
}) {
  if (!messagingConfig.emailEnabled || !messagingConfig.sendgrid.apiKey) {
    throw new Error('Email service is not configured or disabled');
  }

  // Create tracking record
  const messageDoc = await addDoc(collection(db, 'messagesSent'), {
    type: 'email',
    to,
    subject,
    templateId,
    campaignId,
    userId,
    status: 'pending',
    sentAt: serverTimestamp(),
    deliveredAt: null,
    openedAt: null,
    clickedAt: null,
    variables,
    provider: 'sendgrid'
  });

  try {
    // Prepare email data
    const emailData = {
      to: Array.isArray(to) ? to : [to],
      from: {
        email: messagingConfig.sendgrid.from,
        name: messagingConfig.sendgrid.fromName
      },
      subject,
      html: html || text,
      text: text,
      trackingSettings: messagingConfig.sendgrid.trackingSettings,
      customArgs: {
        messageId: messageDoc.id,
        campaignId: campaignId || '',
        userId: userId || ''
      }
    };

    // Add tracking pixel to HTML
    if (html && messagingConfig.analytics.enableOpenTracking) {
      const trackingPixel = `<img src="${messagingConfig.analytics.trackingPixelUrl}?mid=${messageDoc.id}" width="1" height="1" style="display:none;" />`;
      emailData.html = html + trackingPixel;
    }

    // Send email
    const response = await sgMail.send(emailData);

    // Update status
    await updateDoc(doc(db, 'messagesSent', messageDoc.id), {
      status: 'sent',
      deliveredAt: serverTimestamp(),
      providerResponse: response[0]?.headers || {},
      messageId: response[0]?.headers?.['x-message-id']
    });

    return {
      success: true,
      messageId: messageDoc.id,
      providerMessageId: response[0]?.headers?.['x-message-id'],
      response
    };

  } catch (error) {
    // Update error status
    await updateDoc(doc(db, 'messagesSent', messageDoc.id), {
      status: 'failed',
      error: error.message,
      errorDetails: error.response?.body || error
    });

    throw error;
  }
}

/**
 * Send SMS notification
 */
export async function sendSMS({ 
  to, 
  body, 
  templateId = null,
  variables = {},
  campaignId = null,
  userId = null 
}) {
  if (!messagingConfig.smsEnabled || !twilioClient) {
    throw new Error('SMS service is not configured or disabled');
  }

  // Create tracking record
  const messageDoc = await addDoc(collection(db, 'messagesSent'), {
    type: 'sms',
    to,
    body,
    templateId,
    campaignId,
    userId,
    status: 'pending',
    sentAt: serverTimestamp(),
    deliveredAt: null,
    variables,
    provider: 'twilio'
  });

  try {
    // Send SMS
    const message = await twilioClient.messages.create({
      body,
      from: messagingConfig.twilio.fromNumber,
      to,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/messaging/twilio-webhook`
    });

    // Update status
    await updateDoc(doc(db, 'messagesSent', messageDoc.id), {
      status: 'sent',
      deliveredAt: serverTimestamp(),
      providerMessageId: message.sid,
      providerResponse: {
        sid: message.sid,
        status: message.status,
        direction: message.direction
      }
    });

    return {
      success: true,
      messageId: messageDoc.id,
      providerMessageId: message.sid,
      message
    };

  } catch (error) {
    // Update error status
    await updateDoc(doc(db, 'messagesSent', messageDoc.id), {
      status: 'failed',
      error: error.message,
      errorDetails: error
    });

    throw error;
  }
}

/**
 * Send in-app notification
 */
export async function sendInAppNotification({ 
  userId, 
  title, 
  body, 
  data = {},
  actionUrl = null,
  priority = 'normal',
  templateId = null,
  campaignId = null 
}) {
  if (!messagingConfig.inAppEnabled) {
    throw new Error('In-app notifications are disabled');
  }

  try {
    // Create notification record
    const notificationDoc = await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      body,
      data,
      actionUrl,
      priority,
      templateId,
      campaignId,
      read: false,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // 30 days
    });

    // Create tracking record
    await addDoc(collection(db, 'messagesSent'), {
      type: 'in_app',
      userId,
      title,
      body,
      templateId,
      campaignId,
      status: 'delivered',
      sentAt: serverTimestamp(),
      deliveredAt: serverTimestamp(),
      notificationId: notificationDoc.id,
      provider: 'firebase'
    });

    return {
      success: true,
      notificationId: notificationDoc.id
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Send notification via all enabled channels
 */
export async function sendMultiChannelNotification({
  userId,
  email = null,
  phone = null,
  channels = ['email', 'sms', 'in_app'],
  subject,
  body,
  htmlBody = null,
  data = {},
  templateId = null,
  campaignId = null
}) {
  const results = {
    email: null,
    sms: null,
    inApp: null
  };

  const errors = [];

  // Send email if requested and configured
  if (channels.includes('email') && email && messagingConfig.emailEnabled) {
    try {
      results.email = await sendEmail({
        to: email,
        subject,
        html: htmlBody || body,
        text: body,
        templateId,
        campaignId,
        userId
      });
    } catch (error) {
      errors.push({ channel: 'email', error: error.message });
    }
  }

  // Send SMS if requested and configured
  if (channels.includes('sms') && phone && messagingConfig.smsEnabled) {
    try {
      results.sms = await sendSMS({
        to: phone,
        body,
        templateId,
        campaignId,
        userId
      });
    } catch (error) {
      errors.push({ channel: 'sms', error: error.message });
    }
  }

  // Send in-app if requested and configured
  if (channels.includes('in_app') && messagingConfig.inAppEnabled) {
    try {
      results.inApp = await sendInAppNotification({
        userId,
        title: subject,
        body,
        data,
        templateId,
        campaignId
      });
    } catch (error) {
      errors.push({ channel: 'in_app', error: error.message });
    }
  }

  return {
    results,
    errors,
    success: errors.length === 0
  };
}

/**
 * Retry failed message
 */
export async function retryMessage(messageId) {
  // Implementation for retrying failed messages
  // This would fetch the original message and attempt to resend
  console.log('Retry functionality to be implemented', messageId);
}

/**
 * Get message delivery status
 */
export async function getMessageStatus(messageId) {
  const messageDoc = await getDoc(doc(db, 'messagesSent', messageId));
  
  if (!messageDoc.exists()) {
    throw new Error('Message not found');
  }

  return messageDoc.data();
}

/**
 * Test messaging configuration
 */
export async function testMessagingSetup() {
  const status = {
    email: false,
    sms: false,
    inApp: false,
    errors: []
  };

  // Test email
  if (messagingConfig.emailEnabled && messagingConfig.sendgrid.apiKey) {
    try {
      // This is a basic test - in production you'd send to a test email
      status.email = true;
    } catch (error) {
      status.errors.push({ service: 'email', error: error.message });
    }
  }

  // Test SMS
  if (messagingConfig.smsEnabled && twilioClient) {
    try {
      // Basic client validation
      status.sms = true;
    } catch (error) {
      status.errors.push({ service: 'sms', error: error.message });
    }
  }

  // Test in-app
  if (messagingConfig.inAppEnabled) {
    status.inApp = true;
  }

  return status;
}

export default {
  sendEmail,
  sendSMS,
  sendInAppNotification,
  sendMultiChannelNotification,
  retryMessage,
  getMessageStatus,
  testMessagingSetup
};
