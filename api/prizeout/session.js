import prizeoutService from '../../../services/prizeoutService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, amount, retailerId } = req.body;

    // Validate input
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Create Prizeout session
    const session = await prizeoutService.createSession(userId, amount, retailerId);

    res.status(200).json({
      success: true,
      sessionId: session.sessionId,
      launchUrl: session.launchUrl,
      expiresAt: session.expiresAt
    });

  } catch (error) {
    console.error('Create session error:', error);
    
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    if (error.message === 'Prizeout not configured') {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
