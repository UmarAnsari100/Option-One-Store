// Order Service
// Prepares order structures and manages client-side order history storage

export const orderService = {
  /**
   * Prepares and structures order data from checkout inputs
   * @param {Object} formData Checkout form inputs
   * @param {string} selectedPayment Payment method (cod, card, bank, etc.)
   * @param {string} selectedBank Selected bank name (if bank payment)
   * @param {string} bankScreenshot Uploaded bank receipt filename (if bank payment)
   * @param {Array} cart Cart items array
   * @param {number} totalAmount Calculated order total amount
   * @param {number} cartSubtotal Calculated cart subtotal
   * @param {number} discountAmount Calculated discount amount
   * @param {number} shippingCost Calculated shipping cost
   * @param {number} taxAmount Calculated tax amount
   * @returns {Object} Structured order data
   */
  prepareOrderData(
    formData,
    selectedPayment,
    selectedBank,
    bankScreenshot,
    cart,
    totalAmount,
    cartSubtotal,
    discountAmount,
    shippingCost,
    taxAmount
  ) {
    const generatedId = `OP1-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const items = cart.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      brand: item.product.brand,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image1,
      sku: item.product.sku || `OP1-PRD-${item.product.id}`
    }));

    return {
      orderId: generatedId,
      orderDate,
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`,
      city: formData.city,
      zipCode: formData.zipCode,
      country: formData.country,
      paymentMethod: selectedPayment,
      paymentDetails: selectedPayment === 'bank' ? `Bank: ${selectedBank.toUpperCase()}` : selectedPayment,
      bankScreenshot: bankScreenshot || null,
      items,
      totalAmount,
      discountAmount,
      shippingCost,
      taxAmount,
      cartSubtotal,
      customerNotes: formData.customerNotes || ''
    };
  },

  /**
   * Saves the order to localStorage order history
   * @param {Object} orderData The prepared order data
   */
  saveOrderToHistory(orderData) {
    try {
      const orders = JSON.parse(localStorage.getItem('order_history') || '[]');
      orders.push(orderData);
      localStorage.setItem('order_history', JSON.stringify(orders));
    } catch (error) {
      console.error('Failed to save order to local storage history:', error);
    }
  }
};
