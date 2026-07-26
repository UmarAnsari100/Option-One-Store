/**
 * shippingService - Modular Shipping Provider Architecture
 * Supports CJ Shipping, Leopards, TCS, Trax, DHL, FedEx.
 */
export const shippingService = {
  getProviders() {
    return [
      { id: 'cj_packet', name: 'CJ Packet Express', estDays: '5-9 business days', price: 0, provider: 'CJ Shipping' },
      { id: 'tcs', name: 'TCS Express Courier', estDays: '2-4 business days', price: 500, provider: 'TCS Pakistan' },
      { id: 'leopards', name: 'Leopards Overnight Shipping', estDays: '1-3 business days', price: 650, provider: 'Leopards' },
      { id: 'dhl', name: 'DHL Express International', estDays: '3-5 business days', price: 2500, provider: 'DHL' }
    ];
  },

  calculateShippingFee(cartSubtotal, providerId = 'cj_packet') {
    if (cartSubtotal >= 40000 || cartSubtotal === 0) return 0;
    const provider = this.getProviders().find((p) => p.id === providerId);
    return provider ? provider.price : 500;
  }
};
