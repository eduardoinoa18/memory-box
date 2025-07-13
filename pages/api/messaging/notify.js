/**
 * Unified Messaging API Endpoint
 * Step 8B: API endpoint for sending notifications via any channel
 */

import { NextResponse } from 'next/server';
import { sendEmail, sendSMS, sendInAppNotification, sendMultiChannelNotification } from '../../../services/notifyService';
import { renderTemplate } from '../../../lib/templateParser';
import { verifySession } from '../../../lib/auth';

export async function POST(request) {
  try {
    // Verify admin authentication
    const session = await verifySession(request);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      type, 
      channels = ['email'], 
      recipients,
      templateId,
      variables = {},
      subject,
      message,
      htmlMessage,
      campaignId,
      scheduleAt 
    } = body;

    // Validate required fields
    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Recipients are required' },
        { status: 400 }
      );
    }

    if (!templateId && !message) {
      return NextResponse.json(
        { error: 'Either templateId or message is required' },
        { status: 400 }
      );
    }

    // If scheduling is requested, save to queue instead
    if (scheduleAt) {
      // TODO: Implement scheduling logic
      return NextResponse.json(
        { error: 'Scheduling not yet implemented' },
        { status: 501 }
      );
    }

    const results = [];
    const errors = [];

    // Process each recipient
    for (const recipient of recipients) {
      try {
        let finalSubject = subject;
        let finalMessage = message;
        let finalHtmlMessage = htmlMessage;

        // Render template if provided
        if (templateId) {
          const emailTemplate = await renderTemplate(templateId, {
            ...variables,
            ...recipient.variables,
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            email: recipient.email,
            fullName: `${recipient.firstName} ${recipient.lastName}`
          }, 'email');

          finalSubject = emailTemplate.subject || subject;
          finalMessage = emailTemplate.body || message;
          finalHtmlMessage = emailTemplate.html || htmlMessage;
        }

        let result;

        // Send based on type
        if (type === 'multi_channel') {
          result = await sendMultiChannelNotification({
            userId: recipient.userId,
            email: recipient.email,
            phone: recipient.phone,
            channels,
            subject: finalSubject,
            body: finalMessage,
            htmlBody: finalHtmlMessage,
            templateId,
            campaignId
          });
        } else if (type === 'email') {
          result = await sendEmail({
            to: recipient.email,
            subject: finalSubject,
            html: finalHtmlMessage || finalMessage,
            text: finalMessage,
            templateId,
            campaignId,
            userId: recipient.userId
          });
        } else if (type === 'sms') {
          result = await sendSMS({
            to: recipient.phone,
            body: finalMessage,
            templateId,
            campaignId,
            userId: recipient.userId
          });
        } else if (type === 'in_app') {
          result = await sendInAppNotification({
            userId: recipient.userId,
            title: finalSubject,
            body: finalMessage,
            templateId,
            campaignId
          });
        } else {
          throw new Error(`Unsupported notification type: ${type}`);
        }

        results.push({
          recipient: recipient.email || recipient.phone || recipient.userId,
          success: true,
          result
        });

      } catch (error) {
        console.error(`Failed to send to ${recipient.email || recipient.phone}:`, error);
        errors.push({
          recipient: recipient.email || recipient.phone || recipient.userId,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications', details: error.message },
      { status: 500 }
    );
  }
}

// Test endpoint
export async function GET(request) {
  try {
    const { testMessagingSetup } = await import('../../../services/notifyService');
    const status = await testMessagingSetup();

    return NextResponse.json({
      status: 'Messaging service status',
      ...status
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to test messaging setup', details: error.message },
      { status: 500 }
    );
  }
}
