/**
 * SendGrid Webhook Handler
 * Handles delivery, open, and click tracking events
 */

import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
  try {
    const events = await request.json();

    for (const event of events) {
      const { event: eventType, sg_message_id, customArgs } = event;
      
      if (!customArgs?.messageId) {
        continue; // Skip events without our tracking ID
      }

      const messageId = customArgs.messageId;
      const updateData = {};

      switch (eventType) {
        case 'delivered':
          updateData.status = 'delivered';
          updateData.deliveredAt = serverTimestamp();
          break;

        case 'open':
          updateData.openedAt = serverTimestamp();
          updateData.opened = true;
          break;

        case 'click':
          updateData.clickedAt = serverTimestamp();
          updateData.clicked = true;
          updateData.clickUrl = event.url;
          break;

        case 'bounce':
        case 'dropped':
          updateData.status = 'failed';
          updateData.error = event.reason || 'Email bounced or dropped';
          break;

        case 'spam_report':
          updateData.status = 'spam';
          updateData.error = 'Marked as spam';
          break;

        case 'unsubscribe':
          updateData.unsubscribed = true;
          updateData.unsubscribedAt = serverTimestamp();
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await updateDoc(doc(db, 'messagesSent', messageId), {
          ...updateData,
          lastWebhookEvent: eventType,
          lastWebhookAt: serverTimestamp(),
          webhookData: event
        });
      }
    }

    return NextResponse.json({ success: true, processed: events.length });

  } catch (error) {
    console.error('SendGrid webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
