/**
 * Email Open Tracking Pixel
 * 1x1 transparent pixel to track email opens
 */

import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('mid');

    if (messageId) {
      // Update the message record to mark as opened
      try {
        await updateDoc(doc(db, 'messagesSent', messageId), {
          opened: true,
          openedAt: serverTimestamp(),
          openCount: increment(1)
        });
      } catch (error) {
        // Don't fail the pixel request if tracking fails
        console.error('Failed to track email open:', error);
      }
    }

    // Return a 1x1 transparent PNG pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pixel.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Tracking pixel error:', error);
    
    // Still return pixel even if tracking fails
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': pixel.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}
