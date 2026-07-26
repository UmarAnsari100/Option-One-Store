/**
 * analyticsService - Centralized Analytics Event Tracking
 * Interfaces for GA4, Meta Pixel, TikTok Pixel, Microsoft Clarity.
 */
export const analyticsService = {
  trackEvent(eventName, payload = {}) {
    console.log(`[Analytics Event Tracked]: ${eventName}`, payload);
    
    // GA4 Event Trigger
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, payload);
    }

    // Meta Pixel Trigger
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, payload);
    }
  },

  trackViewItem(product) {
    this.trackEvent('view_item', {
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      price: product.price
    });
  },

  trackAddToCart(product, quantity = 1) {
    this.trackEvent('add_to_cart', {
      item_id: product.id,
      item_name: product.name,
      value: product.price * quantity,
      currency: 'PKR',
      quantity
    });
  },

  trackPurchase(orderId, value, items = []) {
    this.trackEvent('purchase', {
      transaction_id: orderId,
      value: value,
      currency: 'PKR',
      items
    });
  }
};
