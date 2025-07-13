// Commission Ledger Firestore Schema and Operations
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp,
  doc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

class CommissionLedger {
  constructor() {
    this.collectionName = 'commissionLedger';
  }

  // Create a new commission entry
  async createEntry(data) {
    const entry = {
      userId: data.userId,
      sessionId: data.sessionId,
      prizeoutTxnId: data.prizeoutTxnId,
      
      // Gift card details
      retailer: data.retailer,
      cardDetails: {
        brand: data.cardDetails?.brand || '',
        denomination: data.cardDetails?.denomination || data.faceValue,
        cardNumber: data.cardDetails?.cardNumber || '',
        pin: data.cardDetails?.pin || '',
        expiryDate: data.cardDetails?.expiryDate || null,
        instructions: data.cardDetails?.instructions || ''
      },
      
      // Financial details
      faceValue: data.faceValue,
      bonusValue: data.bonusValue,
      userPaid: data.userPaid,
      commissionAmount: data.commissionAmount,
      commissionRate: data.commissionRate || 0.03,
      
      // Status and tracking
      status: data.status || 'pending', // pending, success, failed, refunded
      createdAt: Timestamp.fromDate(new Date()),
      processedAt: data.processedAt ? Timestamp.fromDate(data.processedAt) : null,
      
      // Metadata
      reference: data.reference || '',
      notes: data.notes || '',
      
      // Payout tracking
      payoutStatus: 'pending', // pending, paid, disputed
      payoutDate: null,
      payoutAmount: null,
      payoutReference: null,
      
      // Tax and compliance
      taxYear: new Date().getFullYear(),
      reportedFor1099: false,
      
      // User context
      userEmail: data.userEmail || '',
      userPlan: data.userPlan || 'free'
    };

    try {
      const docRef = await addDoc(collection(db, this.collectionName), entry);
      return { id: docRef.id, ...entry };
    } catch (error) {
      console.error('Error creating commission entry:', error);
      throw error;
    }
  }

  // Update commission entry status
  async updateStatus(entryId, status, additionalData = {}) {
    try {
      const entryRef = doc(db, this.collectionName, entryId);
      const updateData = {
        status,
        updatedAt: Timestamp.fromDate(new Date()),
        ...additionalData
      };

      if (status === 'success') {
        updateData.processedAt = Timestamp.fromDate(new Date());
      }

      await updateDoc(entryRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating commission entry:', error);
      throw error;
    }
  }

  // Get commission summary for date range
  async getSummary(startDate = null, endDate = null, userId = null) {
    try {
      let q = collection(db, this.collectionName);
      const constraints = [];

      if (userId) {
        constraints.push(where('userId', '==', userId));
      }

      if (startDate) {
        constraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
      }

      if (endDate) {
        constraints.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      
      let totalRedemptions = 0;
      let totalFaceValue = 0;
      let totalBonusValue = 0;
      let totalCommission = 0;
      let totalUserPaid = 0;
      let successfulRedemptions = 0;
      let failedRedemptions = 0;
      let pendingRedemptions = 0;

      const retailerBreakdown = {};
      const monthlyBreakdown = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        totalRedemptions++;
        
        switch (data.status) {
          case 'success':
            successfulRedemptions++;
            totalFaceValue += data.faceValue || 0;
            totalBonusValue += data.bonusValue || 0;
            totalCommission += data.commissionAmount || 0;
            break;
          case 'failed':
            failedRedemptions++;
            break;
          case 'pending':
            pendingRedemptions++;
            break;
        }

        totalUserPaid += data.userPaid || 0;

        // Retailer breakdown
        const retailer = data.retailer || 'Unknown';
        if (!retailerBreakdown[retailer]) {
          retailerBreakdown[retailer] = {
            count: 0,
            faceValue: 0,
            commission: 0
          };
        }
        retailerBreakdown[retailer].count++;
        if (data.status === 'success') {
          retailerBreakdown[retailer].faceValue += data.faceValue || 0;
          retailerBreakdown[retailer].commission += data.commissionAmount || 0;
        }

        // Monthly breakdown
        const month = data.createdAt.toDate().toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyBreakdown[month]) {
          monthlyBreakdown[month] = {
            count: 0,
            faceValue: 0,
            commission: 0
          };
        }
        monthlyBreakdown[month].count++;
        if (data.status === 'success') {
          monthlyBreakdown[month].faceValue += data.faceValue || 0;
          monthlyBreakdown[month].commission += data.commissionAmount || 0;
        }
      });

      return {
        totalRedemptions,
        successfulRedemptions,
        failedRedemptions,
        pendingRedemptions,
        totalFaceValue,
        totalBonusValue,
        totalCommission,
        totalUserPaid,
        avgRedemptionValue: successfulRedemptions > 0 ? totalFaceValue / successfulRedemptions : 0,
        conversionRate: totalRedemptions > 0 ? (successfulRedemptions / totalRedemptions) * 100 : 0,
        retailerBreakdown,
        monthlyBreakdown
      };
    } catch (error) {
      console.error('Error getting commission summary:', error);
      throw error;
    }
  }

  // Get user's redemption history
  async getUserHistory(userId, limit = 20) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (limit) {
        q = query(q, limit(limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user history:', error);
      throw error;
    }
  }

  // Mark entries as paid for payout
  async markAsPaid(entryIds, payoutAmount, payoutReference) {
    try {
      const batch = writeBatch(db);
      const payoutDate = Timestamp.fromDate(new Date());

      entryIds.forEach(entryId => {
        const entryRef = doc(db, this.collectionName, entryId);
        batch.update(entryRef, {
          payoutStatus: 'paid',
          payoutDate,
          payoutAmount: payoutAmount / entryIds.length, // Split evenly or calculate individually
          payoutReference,
          updatedAt: Timestamp.fromDate(new Date())
        });
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error marking entries as paid:', error);
      throw error;
    }
  }

  // Generate 1099-K report data
  async get1099KData(taxYear = new Date().getFullYear()) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('taxYear', '==', taxYear),
        where('status', '==', 'success')
      );

      const snapshot = await getDocs(q);
      
      let totalCommission = 0;
      let totalTransactions = 0;
      const monthlyTotals = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        totalCommission += data.commissionAmount || 0;
        totalTransactions++;

        const month = data.createdAt.toDate().getMonth() + 1; // 1-12
        monthlyTotals[month] = (monthlyTotals[month] || 0) + (data.commissionAmount || 0);
      });

      // Check if 1099-K threshold is met ($600+ per year)
      const requires1099K = totalCommission >= 600;

      return {
        taxYear,
        totalCommission,
        totalTransactions,
        monthlyTotals,
        requires1099K,
        reportGenerated: false, // Set to true when actual 1099-K is generated
        reportDate: null
      };
    } catch (error) {
      console.error('Error generating 1099-K data:', error);
      throw error;
    }
  }

  // Get pending payouts
  async getPendingPayouts() {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'success'),
        where('payoutStatus', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting pending payouts:', error);
      throw error;
    }
  }
}

export default new CommissionLedger();
