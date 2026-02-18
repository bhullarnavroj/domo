
import { storage } from './storage';
import { getUncachableStripeClient } from './stripeClient';

/**
 * StripeService: Handles direct Stripe API operations
 * Pattern: Use Stripe client for write operations, storage for read operations
 */
export class StripeService {
  // Create customer in Stripe
  async createCustomer(email: string, userId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createPaymentCheckoutSession(
    invoiceId: number, 
    amount: number, 
    successUrl: string, 
    cancelUrl: string
  ) {
    const stripe = await getUncachableStripeClient();
    
    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Payment for DOMO Invoice #${invoiceId}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl + (successUrl.includes('?') ? '&' : '?') + 'session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      metadata: {
        invoiceId: invoiceId.toString(),
        type: 'service_payment'
      }
    });
  }
}

export const stripeService = new StripeService();
