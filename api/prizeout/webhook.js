import prizeoutService from '../../../services/prizeoutService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    
    if (!signature || !timestamp) {
      return res.status(400).json({ error: 'Missing signature or timestamp' });
    }

    // Process webhook
    await prizeoutService.handleWebhook(req.body, signature, parseInt(timestamp));

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    if (error.message.includes('signature') || error.message.includes('timestamp')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
