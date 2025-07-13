// Subscription service for Memory Box
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { functions, db } from '../config/firebase';

class SubscriptionService {
    /**
     * Create Stripe checkout session
     * @param {string} priceId - Stripe price ID
     * @param {string} userId - Firebase user ID
     * @param {object} options - Additional options
     * @returns {Promise<object>} Checkout session data
     */
    async createCheckoutSession(priceId, userId, options = {}) {
        try {
            const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

            const payload = {
                priceId,
                userId,
                successUrl: options.successUrl || `${window.location.origin}/success`,
                cancelUrl: options.cancelUrl || `${window.location.origin}/cancel`,
                ...options
            };

            const result = await createCheckoutSession(payload);
            return result.data;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw new Error('Failed to create checkout session. Please try again.');
        }
    }

    /**
     * Subscribe to user subscription status changes
     * @param {string} userId - Firebase user ID
     * @param {function} callback - Callback function for subscription updates
     * @returns {function} Unsubscribe function
     */
    subscribeToUserSubscription(userId, callback) {
        if (!userId) {
            console.warn('No user ID provided for subscription listener');
            return () => { };
        }

        const userRef = doc(db, 'users', userId);

        return onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();

                // Parse subscription data from enhanced Firestore structure
                const subscriptionData = {
                    plan: userData.plan || 'free',
                    status: userData.stripeStatus || 'inactive',
                    subscriptionId: userData.subscriptionId || userData.stripeSubscriptionId || null,
                    customerId: userData.stripeCustomerId || null,

                    // Billing period information
                    currentPeriodStart: userData.currentPeriodStart?.toDate() || null,
                    currentPeriodEnd: userData.currentPeriodEnd?.toDate() || null,
                    subscriptionStarted: userData.subscriptionStarted?.toDate() || null,
                    subscriptionEnded: userData.subscriptionEnded?.toDate() || null,

                    // Payment status
                    paymentIssue: userData.paymentIssue || false,
                    hasPaymentMethod: userData.hasPaymentMethod || false,
                    lastPaymentSucceeded: userData.lastPaymentSucceeded?.toDate() || null,
                    lastPaymentFailed: userData.lastPaymentFailed?.toDate() || null,
                    lastPaymentAmount: userData.lastPaymentAmount || 0,

                    // Billing configuration
                    billing: userData.billing || null,

                    // Legacy compatibility
                    subscriptionStatus: userData.stripeStatus || userData.subscriptionStatus || 'inactive',

                    // Usage data (existing)
                    usage: userData.usage || {
                        storageUsed: 0,
                        foldersUsed: 0,
                        filesUploaded: 0
                    },

                    // Computed properties
                    isActive: userData.stripeStatus === 'active' || userData.stripeStatus === 'trialing',
                    isPastDue: userData.stripeStatus === 'past_due',
                    isCanceled: userData.stripeStatus === 'canceled' || userData.stripeStatus === 'unpaid'
                };

                callback(subscriptionData);
            } else {
                callback({
                    plan: 'free',
                    status: 'inactive',
                    subscriptionStatus: 'inactive',
                    subscriptionId: null,
                    customerId: null,
                    paymentIssue: false,
                    hasPaymentMethod: false,
                    isActive: false,
                    isPastDue: false,
                    isCanceled: false,
                    usage: { storageUsed: 0, foldersUsed: 0, filesUploaded: 0 }
                });
            }
        }, (error) => {
            console.error('Error listening to subscription changes:', error);
            callback({
                plan: 'free',
                subscriptionStatus: 'error',
                status: 'error',
                error: error.message,
                isActive: false,
                isPastDue: false,
                isCanceled: true
            });
        });
    }

    /**
     * Cancel subscription (at period end)
     * @param {string} subscriptionId - Stripe subscription ID
     * @returns {Promise<object>} Cancellation result
     */
    async cancelSubscription(subscriptionId) {
        try {
            const cancelSubscription = httpsCallable(functions, 'cancelSubscription');
            const result = await cancelSubscription({ subscriptionId });
            return result.data;
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw new Error('Failed to cancel subscription. Please try again.');
        }
    }

    /**
     * Create customer portal session for subscription management
     * @param {string} customerId - Stripe customer ID
     * @returns {Promise<object>} Customer portal session data
     */
    async createCustomerPortalSession(customerId) {
        try {
            const createPortalSession = httpsCallable(functions, 'createCustomerPortalSession');
            const result = await createPortalSession({ customerId });
            return result.data;
        } catch (error) {
            console.error('Error creating customer portal session:', error);
            throw new Error('Failed to create customer portal session. Please try again.');
        }
    }

    /**
     * Reactivate cancelled subscription
     * @param {string} subscriptionId - Stripe subscription ID
     * @returns {Promise<object>} Reactivation result
     */
    async reactivateSubscription(subscriptionId) {
        try {
            const reactivateSubscription = httpsCallable(functions, 'reactivateSubscription');
            const result = await reactivateSubscription({ subscriptionId });
            return result.data;
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            throw new Error('Failed to reactivate subscription. Please try again.');
        }
    }

    /**
     * Update subscription plan
     * @param {string} subscriptionId - Current subscription ID
     * @param {string} newPriceId - New Stripe price ID
     * @returns {Promise<object>} Update result
     */
    async updateSubscriptionPlan(subscriptionId, newPriceId) {
        try {
            const updateSubscription = httpsCallable(functions, 'updateSubscription');
            const result = await updateSubscription({
                subscriptionId,
                newPriceId
            });
            return result.data;
        } catch (error) {
            console.error('Error updating subscription:', error);
            throw new Error('Failed to update subscription. Please try again.');
        }
    }

    /**
     * Get billing portal URL
     * @param {string} customerId - Stripe customer ID
     * @returns {Promise<string>} Billing portal URL
     */
    async getBillingPortalUrl(customerId) {
        try {
            const createBillingPortalSession = httpsCallable(functions, 'createBillingPortalSession');
            const result = await createBillingPortalSession({
                customerId,
                returnUrl: window.location.origin
            });
            return result.data.url;
        } catch (error) {
            console.error('Error creating billing portal session:', error);
            throw new Error('Failed to open billing portal. Please try again.');
        }
    }

    /**
     * Check if user can perform action based on plan limits
     * @param {object} subscriptionData - User subscription data
     * @param {string} action - Action to check ('upload', 'create_folder', etc.)
     * @param {object} currentUsage - Current usage stats
     * @returns {object} Permission result
     */
    checkPlanLimits(subscriptionData, action, currentUsage = {}) {
        const plan = subscriptionData.plan || 'free';

        const limits = {
            free: { folders: 5, files: 50, storage: 1024 * 1024 * 1024 }, // 1GB
            premium: { folders: 50, files: 1000, storage: 50 * 1024 * 1024 * 1024 }, // 50GB
            family: { folders: 100, files: 5000, storage: 200 * 1024 * 1024 * 1024 } // 200GB
        };

        const userLimits = limits[plan] || limits.free;

        switch (action) {
            case 'create_folder':
                return {
                    allowed: currentUsage.foldersUsed < userLimits.folders,
                    limit: userLimits.folders,
                    current: currentUsage.foldersUsed,
                    message: `You can create ${userLimits.folders - currentUsage.foldersUsed} more folders`
                };

            case 'upload_file':
                return {
                    allowed: currentUsage.filesUploaded < userLimits.files &&
                        currentUsage.storageUsed < userLimits.storage,
                    limit: userLimits.files,
                    current: currentUsage.filesUploaded,
                    storageLimit: userLimits.storage,
                    storageUsed: currentUsage.storageUsed,
                    message: `You can upload ${userLimits.files - currentUsage.filesUploaded} more files`
                };

            default:
                return { allowed: true, message: 'Action allowed' };
        }
    }

    /**
     * Format subscription status for display
     * @param {string} status - Stripe subscription status
     * @returns {object} Formatted status
     */
    formatSubscriptionStatus(status) {
        const statusMap = {
            active: { text: 'Active', color: '#4CAF50', icon: 'checkmark-circle' },
            past_due: { text: 'Past Due', color: '#FF9800', icon: 'warning' },
            canceled: { text: 'Cancelled', color: '#F44336', icon: 'close-circle' },
            incomplete: { text: 'Incomplete', color: '#FF9800', icon: 'time' },
            incomplete_expired: { text: 'Expired', color: '#F44336', icon: 'close-circle' },
            trialing: { text: 'Trial', color: '#2196F3', icon: 'gift' },
            unpaid: { text: 'Unpaid', color: '#F44336', icon: 'card' }
        };

        return statusMap[status] || { text: 'Unknown', color: '#666', icon: 'help-circle' };
    }
}

export default new SubscriptionService();
