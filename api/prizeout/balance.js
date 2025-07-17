import prizeoutService from '../../../services/prizeoutService';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Get user balance
    const balance = await prizeoutService.getUserBalance(userId);

    res.status(200).json({
      success: true,
      balance
    });

  } catch (error) {
    console.error('Get balance error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
