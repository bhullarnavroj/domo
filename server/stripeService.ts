
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

  // Create checkout session for commission payment
  async createCommissionCheckoutSession(
    invoiceId: number, 
    amount: number, 
    successUrl: string, 
    cancelUrl: string
  ) {
    const stripe = await getUncachableStripeClient();
    
    // Create a product and price on the fly or reuse a standard "Commission" product
    // For simplicity, we'll create a price object inline
    
    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Commission for Invoice #${invoiceId}`,
          },
          unit_amount: amount, // Amount in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        invoiceId: invoiceId.toString(),
        type: 'commission_payment'
      }
    });
  }
}

export const stripeService = new StripeService();
