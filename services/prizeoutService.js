import crypto from 'crypto';
import { prizeoutConfig } from '../../lib/prizeoutConfig';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';

class PrizeoutService {
  constructor() {
    this.config = prizeoutConfig;
  }

  // Create signature for API requests
  createSignature(payload) {
    return crypto
      .createHmac('sha256', this.config.securityToken)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature, timestamp) {
    const timestampThreshold = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    if (Math.abs(now - timestamp) > timestampThreshold) {
      throw new Error('Webhook timestamp too old');
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.config.securityToken)
      .update(timestamp + JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }

    return true;
  }

  // Get user's available balance/points
  async getUserBalance(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      return {
        credits: userData.rewardCredits || 0,
        points: userData.loyaltyPoints || 0,
        totalAvailable: (userData.rewardCredits || 0) + (userData.loyaltyPoints || 0)
      };
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  // Create redemption session with Prizeout
  async createSession(userId, amount, retailerId = null) {
    try {
      if (!this.config.isConfigured()) {
        throw new Error('Prizeout not configured');
      }

      // Verify user has sufficient balance
      const balance = await this.getUserBalance(userId);
      if (balance.totalAvailable < amount) {
        throw new Error('Insufficient balance');
      }

      // Create session payload
      const payload = {
        userId,
        amount,
        currency: 'USD',
        bonusPercentage: this.config.bonusPercentage,
        retailerId,
        timestamp: Date.now(),
        reference: `memorybox_${userId}_${Date.now()}`
      };

      const signature = this.createSignature(payload);

      // Make API request to Prizeout
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.createSession}`, {
        method: 'POST',
        headers: {
          ...this.config.headers,
          'x-signature': signature
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Prizeout API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Store pending session in Firestore
      await this.storePendingSession(userId, {
        sessionId: data.sessionId,
        amount,
        bonusValue: amount * (this.config.bonusPercentage / 100),
        status: 'pending',
        createdAt: new Date(),
        reference: payload.reference
      });

      return {
        sessionId: data.sessionId,
        launchUrl: data.launchUrl,
        expiresAt: data.expiresAt
      };

    } catch (error) {
      console.error('Error creating Prizeout session:', error);
      throw error;
    }
  }

  // Store pending session
  async storePendingSession(userId, sessionData) {
    const sessionRef = await addDoc(collection(db, 'prizeoutSessions'), {
      userId,
      ...sessionData
    });
    return sessionRef.id;
  }

  // Handle webhook notifications
  async handleWebhook(payload, signature, timestamp) {
    try {
      // Verify signature
      this.verifyWebhookSignature(payload, signature, timestamp);

      const { sessionId, status, transactionData } = payload;

      switch (status) {
        case 'completed':
          await this.handleSuccessfulRedemption(sessionId, transactionData);
          break;
        case 'failed':
          await this.handleFailedRedemption(sessionId, transactionData);
          break;
        case 'cancelled':
          await this.handleCancelledRedemption(sessionId);
          break;
        default:
          console.log(`Unknown webhook status: ${status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  // Handle successful redemption
  async handleSuccessfulRedemption(sessionId, transactionData) {
    try {
      // Find session in Firestore
      const sessionQuery = await db.collection('prizeoutSessions')
        .where('sessionId', '==', sessionId)
        .get();

      if (sessionQuery.empty) {
        throw new Error('Session not found');
      }

      const sessionDoc = sessionQuery.docs[0];
      const sessionData = sessionDoc.data();

      // Calculate commission
      const faceValue = transactionData.giftCard.faceValue;
      const bonusValue = sessionData.bonusValue;
      const commissionAmount = faceValue * this.config.commissionRate;

      // Create commission ledger entry
      await addDoc(collection(db, 'commissionLedger'), {
        userId: sessionData.userId,
        sessionId,
        prizeoutTxnId: transactionData.transactionId,
        retailer: transactionData.giftCard.retailer,
        cardDetails: transactionData.giftCard,
        faceValue,
        bonusValue,
        commissionAmount,
        userPaid: sessionData.amount,
        status: 'success',
        createdAt: new Date(),
        processedAt: new Date()
      });

      // Deduct user balance
      await this.deductUserBalance(sessionData.userId, sessionData.amount);

      // Update session status
      await sessionDoc.ref.update({
        status: 'completed',
        completedAt: new Date(),
        transactionData
      });

      console.log(`Redemption completed for user ${sessionData.userId}: $${faceValue} gift card`);

    } catch (error) {
      console.error('Error handling successful redemption:', error);
      throw error;
    }
  }

  // Handle failed redemption
  async handleFailedRedemption(sessionId, errorData) {
    try {
      const sessionQuery = await db.collection('prizeoutSessions')
        .where('sessionId', '==', sessionId)
        .get();

      if (!sessionQuery.empty) {
        const sessionDoc = sessionQuery.docs[0];
        await sessionDoc.ref.update({
          status: 'failed',
          failedAt: new Date(),
          errorData
        });
      }

      console.log(`Redemption failed for session ${sessionId}:`, errorData);
    } catch (error) {
      console.error('Error handling failed redemption:', error);
    }
  }

  // Handle cancelled redemption
  async handleCancelledRedemption(sessionId) {
    try {
      const sessionQuery = await db.collection('prizeoutSessions')
        .where('sessionId', '==', sessionId)
        .get();

      if (!sessionQuery.empty) {
        const sessionDoc = sessionQuery.docs[0];
        await sessionDoc.ref.update({
          status: 'cancelled',
          cancelledAt: new Date()
        });
      }

      console.log(`Redemption cancelled for session ${sessionId}`);
    } catch (error) {
      console.error('Error handling cancelled redemption:', error);
    }
  }

  // Deduct user balance
  async deductUserBalance(userId, amount) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentCredits = userData.rewardCredits || 0;
      const currentPoints = userData.loyaltyPoints || 0;

      let newCredits = currentCredits;
      let newPoints = currentPoints;
      let remaining = amount;

      // Deduct from credits first
      if (remaining > 0 && newCredits > 0) {
        const creditDeduction = Math.min(remaining, newCredits);
        newCredits -= creditDeduction;
        remaining -= creditDeduction;
      }

      // Deduct remaining from points
      if (remaining > 0 && newPoints > 0) {
        const pointDeduction = Math.min(remaining, newPoints);
        newPoints -= pointDeduction;
        remaining -= pointDeduction;
      }

      await updateDoc(userRef, {
        rewardCredits: newCredits,
        loyaltyPoints: newPoints,
        lastBalanceUpdate: new Date()
      });
    }
  }

  // Get available retailers
  async getRetailers() {
    try {
      if (!this.config.isConfigured()) {
        return [];
      }

      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.getRetailers}`, {
        headers: this.config.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch retailers: ${response.statusText}`);
      }

      const data = await response.json();
      return data.retailers || [];
    } catch (error) {
      console.error('Error fetching retailers:', error);
      return [];
    }
  }

  // Get commission summary
  async getCommissionSummary(startDate = null, endDate = null) {
    try {
      let query = collection(db, 'commissionLedger');
      
      if (startDate) {
        query = query.where('createdAt', '>=', startDate);
      }
      if (endDate) {
        query = query.where('createdAt', '<=', endDate);
      }

      const snapshot = await query.get();
      
      let totalRedemptions = 0;
      let totalFaceValue = 0;
      let totalBonusValue = 0;
      let totalCommission = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'success') {
          totalRedemptions++;
          totalFaceValue += data.faceValue || 0;
          totalBonusValue += data.bonusValue || 0;
          totalCommission += data.commissionAmount || 0;
        }
      });

      return {
        totalRedemptions,
        totalFaceValue,
        totalBonusValue,
        totalCommission,
        avgRedemptionValue: totalRedemptions > 0 ? totalFaceValue / totalRedemptions : 0
      };
    } catch (error) {
      console.error('Error getting commission summary:', error);
      throw error;
    }
  }
}

export default new PrizeoutService();
