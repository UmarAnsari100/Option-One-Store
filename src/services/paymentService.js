/**
 * paymentService - Modular Payment Provider Architecture
 * Supports Pakistan Local (COD, Easypaisa, JazzCash, Bank Transfer) & Global (Stripe, PayPal ready).
 */
export const paymentService = {
  getAvailableMethods() {
    return [
      { id: 'cod', name: 'Cash on Delivery (COD)', icon: 'Truck', enabled: true, region: 'PK' },
      { id: 'easypaisa', name: 'Easypaisa Mobile Wallet', icon: 'Smartphone', enabled: true, region: 'PK' },
      { id: 'jazzcash', name: 'JazzCash Mobile Wallet', icon: 'Smartphone', enabled: true, region: 'PK' },
      { id: 'bank', name: 'Direct Bank Wire Transfer (Meezan/HBL/Faysal)', icon: 'Building2', enabled: true, region: 'PK' },
      { id: 'stripe', name: 'Credit / Debit Card (Stripe)', icon: 'CreditCard', enabled: false, region: 'GLOBAL' },
      { id: 'paypal', name: 'PayPal Express', icon: 'Wallet', enabled: false, region: 'GLOBAL' }
    ];
  },

  processPayment(paymentMethod, orderData) {
    console.log(`[PaymentService] Processing payment via ${paymentMethod} for Order ${orderData.orderId}`);
    return {
      success: true,
      transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentMethod,
      timestamp: new Date().toISOString()
    };
  }
};
