// Stripe checkout utilities for Memory Box
import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

/**
 * Get Stripe instance
 * @returns {Promise} Stripe instance
 */
export const getStripe = () => {
    if (!stripePromise) {
        const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            console.error('❌ Stripe publishable key missing! Please set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local');
            throw new Error('Stripe configuration incomplete');
        }

        stripePromise = loadStripe(publishableKey);
    }
    return stripePromise;
};

/**
 * Redirect to Stripe Checkout
 * @param {string} sessionId - Stripe checkout session ID
 */
export const redirectToCheckout = async (sessionId) => {
    try {
        const stripe = await getStripe();
        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) {
            console.error('Stripe checkout error:', error);
            throw new Error(error.message || 'Checkout failed');
        }
    } catch (error) {
        console.error('Failed to redirect to checkout:', error);
        throw error;
    }
};

/**
 * Format price for display
 * @param {number} amount - Price in cents
 * @param {string} currency - Currency code (default: 'usd')
 * @returns {string} Formatted price
 */
export const formatPrice = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount / 100);
};

/**
 * Get plan configuration
 * @param {string} planId - Plan identifier
 * @returns {object} Plan configuration
 */
export const getPlanConfig = (planId) => {
    const plans = {
        free: {
            name: 'Free',
            price: 0,
            storage: '1GB',
            folders: 5,
            files: 50,
            features: ['Basic photo upload', 'Limited folders', 'Basic sharing']
        },
        premium: {
            name: 'Premium',
            price: 499, // $4.99 in cents
            priceId: process.env.EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
            storage: '50GB',
            folders: 50,
            files: 1000,
            features: [
                '50GB Storage',
                '50 Folders',
                '1000 Photos/Videos',
                'Priority Support',
                'HD Quality',
                'Advanced Sharing'
            ]
        },
        family: {
            name: 'Family+',
            price: 999, // $9.99 in cents
            priceId: process.env.EXPO_PUBLIC_STRIPE_FAMILY_PRICE_ID,
            storage: '200GB',
            folders: 100,
            files: 5000,
            features: [
                '200GB Storage',
                '100 Folders',
                '5000 Photos/Videos',
                'Family Sharing',
                '24/7 Support',
                '4K Quality',
                'Unlimited Members'
            ]
        }
    };

    return plans[planId] || plans.free;
};

export default {
    getStripe,
    redirectToCheckout,
    formatPrice,
    getPlanConfig
};
