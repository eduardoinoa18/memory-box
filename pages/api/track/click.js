/**
 * Click Tracking Endpoint
 * Tracks email link clicks and redirects to target URL
 */

import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('mid');
    const targetUrl = searchParams.get('url');
    const linkId = searchParams.get('lid');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
    }

    if (messageId) {
      // Update the message record to track the click
      try {
        await updateDoc(doc(db, 'messagesSent', messageId), {
          clicked: true,
          clickedAt: serverTimestamp(),
          clickCount: increment(1),
          clickUrl: targetUrl,
          linkId
        });
      } catch (error) {
        // Don't fail the redirect if tracking fails
        console.error('Failed to track email click:', error);
      }
    }

    // Redirect to the target URL
    return NextResponse.redirect(decodeURIComponent(targetUrl));

  } catch (error) {
    console.error('Click tracking error:', error);
    
    // If we have a target URL, still redirect even if tracking fails
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    
    if (targetUrl) {
      return NextResponse.redirect(decodeURIComponent(targetUrl));
    }

    return NextResponse.json(
      { error: 'Click tracking failed' },
      { status: 500 }
    );
  }
}
