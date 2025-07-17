/**
 * Twilio Webhook Handler
 * Handles SMS delivery status updates
 */

import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const messageSid = formData.get('MessageSid');
    const messageStatus = formData.get('MessageStatus');
    const errorCode = formData.get('ErrorCode');
    const errorMessage = formData.get('ErrorMessage');

    if (!messageSid) {
      return NextResponse.json({ error: 'Missing MessageSid' }, { status: 400 });
    }

    // Find our message record by Twilio SID
    const q = query(
      collection(db, 'messagesSent'),
      where('providerMessageId', '==', messageSid)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`No message found for SID: ${messageSid}`);
      return NextResponse.json({ success: true, message: 'No matching message found' });
    }

    // Update all matching messages (should be just one)
    const updates = [];
    snapshot.forEach(doc => {
      const updateData = {
        lastWebhookEvent: messageStatus,
        lastWebhookAt: serverTimestamp(),
        webhookData: {
          MessageSid: messageSid,
          MessageStatus: messageStatus,
          ErrorCode: errorCode,
          ErrorMessage: errorMessage
        }
      };

      switch (messageStatus) {
        case 'delivered':
          updateData.status = 'delivered';
          updateData.deliveredAt = serverTimestamp();
          break;

        case 'failed':
        case 'undelivered':
          updateData.status = 'failed';
          updateData.error = errorMessage || 'SMS delivery failed';
          break;

        case 'sent':
          updateData.status = 'sent';
          break;
      }

      updates.push(updateDoc(doc.ref, updateData));
    });

    await Promise.all(updates);

    return NextResponse.json({ 
      success: true, 
      updated: updates.length,
      status: messageStatus 
    });

  } catch (error) {
    console.error('Twilio webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
