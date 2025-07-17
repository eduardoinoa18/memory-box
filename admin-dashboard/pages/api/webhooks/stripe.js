// Stripe webhook handler for admin dashboard
import { buffer } from 'micro';
import Stripe from 'stripe';
import { db } from '../../../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// Initialize Stripe with secret key from environment or Firebase config
let stripe;

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get webhook secret from environment or Firebase config
        let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            // Fallback to Firebase config
            const configDoc = await getDoc(doc(db, 'admin/functions-config'));
            if (configDoc.exists()) {
                const config = configDoc.data();
                webhookSecret = config.stripe?.webhook_secret;
            }
        }

        if (!webhookSecret) {
            console.error('Webhook secret not configured');
            return res.status(400).json({ error: 'Webhook secret not configured' });
        }

        // Initialize Stripe if not already done
        if (!stripe) {
            const stripeSecret = process.env.STRIPE_SECRET_KEY;
            if (!stripeSecret) {
                // Fallback to Firebase config
                const configDoc = await getDoc(doc(db, 'admin/functions-config'));
                if (configDoc.exists()) {
                    const config = configDoc.data();
                    stripe = new Stripe(config.stripe?.secret_key);
                }
            } else {
                stripe = new Stripe(stripeSecret);
            }
        }

        if (!stripe) {
            console.error('Stripe not configured');
            return res.status(400).json({ error: 'Stripe not configured' });
        }

        const buf = await buffer(req);
        const signature = req.headers['stripe-signature'];

        let event;
        try {
            event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).json({ error: 'Webhook signature verification failed' });
        }

        console.log('Received Stripe webhook event:', event.type);

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionCancelled(event.data.object);
                break;

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object);
                break;

            case 'customer.created':
                await handleCustomerCreated(event.data.object);
                break;

            case 'payment_method.attached':
                await handlePaymentMethodAttached(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Log webhook event for admin dashboard
        await logWebhookEvent(event);

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper functions for handling specific webhook events

async function handlePaymentSucceeded(paymentIntent) {
    try {
        const customerId = paymentIntent.customer;

        // Find user by Stripe customer ID and update payment status
        // This would typically involve querying your users collection
        console.log('Payment succeeded for customer:', customerId);

        // Update user's payment status in Firestore
        // Implementation depends on your user data structure
    } catch (error) {
        console.error('Error handling payment succeeded:', error);
    }
}

async function handleSubscriptionUpdated(subscription) {
    try {
        const customerId = subscription.customer;
        const status = subscription.status;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        console.log(`Subscription updated for customer ${customerId}: ${status}`);

        // Update user's subscription in Firestore
        // You would need to implement user lookup by Stripe customer ID

        // Example update (customize based on your data structure):
        // await updateDoc(doc(db, 'users', userId), {
        //   'subscription.status': status,
        //   'subscription.currentPeriodEnd': currentPeriodEnd,
        //   'subscription.stripeSubscriptionId': subscription.id,
        //   'subscription.lastUpdated': new Date().toISOString()
        // });

    } catch (error) {
        console.error('Error handling subscription updated:', error);
    }
}

async function handleSubscriptionCancelled(subscription) {
    try {
        const customerId = subscription.customer;

        console.log('Subscription cancelled for customer:', customerId);

        // Update user's subscription status to cancelled
        // Implementation depends on your user data structure
    } catch (error) {
        console.error('Error handling subscription cancelled:', error);
    }
}

async function handleInvoicePaymentSucceeded(invoice) {
    try {
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;

        console.log(`Invoice payment succeeded for customer ${customerId}`);

        // Update user's billing information
    } catch (error) {
        console.error('Error handling invoice payment succeeded:', error);
    }
}

async function handleInvoicePaymentFailed(invoice) {
    try {
        const customerId = invoice.customer;

        console.log(`Invoice payment failed for customer ${customerId}`);

        // Handle failed payment (e.g., send notification, downgrade subscription)
    } catch (error) {
        console.error('Error handling invoice payment failed:', error);
    }
}

async function handleCustomerCreated(customer) {
    try {
        console.log('New Stripe customer created:', customer.id);
        // Customer creation is usually handled in the signup flow
    } catch (error) {
        console.error('Error handling customer created:', error);
    }
}

async function handlePaymentMethodAttached(paymentMethod) {
    try {
        const customerId = paymentMethod.customer;

        console.log(`Payment method attached for customer ${customerId}`);

        // Update user's payment method information
    } catch (error) {
        console.error('Error handling payment method attached:', error);
    }
}

async function logWebhookEvent(event) {
    try {
        // Log webhook events for admin monitoring
        const webhookLog = {
            eventId: event.id,
            eventType: event.type,
            timestamp: new Date().toISOString(),
            processed: true,
            data: {
                created: event.created,
                livemode: event.livemode
            }
        };

        // Save to webhook logs collection
        await updateDoc(doc(db, 'admin/webhook-logs', event.id), webhookLog, { merge: true });
    } catch (error) {
        console.error('Error logging webhook event:', error);
    }
}

// Disable body parsing for webhook signature verification
export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;
