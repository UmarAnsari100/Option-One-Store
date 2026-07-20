// Email Service
// Interfaces with EmailJS to send customer and admin notification emails

import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';
import { generateCustomerEmailHtml, generateAdminEmailHtml } from './emailTemplates';

export const emailService = {
  /**
   * Sends the order confirmation email to the customer
   * @param {Object} orderData Prepared order data
   */
  async sendCustomerEmail(orderData) {
    const htmlContent = generateCustomerEmailHtml(orderData);

    const templateParams = {
      to_email: orderData.customerEmail,
      to_name: orderData.customerName,
      subject: 'Your Order Has Been Confirmed - Option One Store',
      customer_name: orderData.customerName,
      order_id: orderData.orderId,
      order_date: orderData.orderDate,
      total_amount: `Rs. ${orderData.totalAmount.toLocaleString()}`,
      shipping_address: orderData.shippingAddress,
      payment_method: orderData.paymentMethod.toUpperCase(),
      estimated_delivery: '2-3 Business Days',
      message_html: htmlContent, // Rich HTML template parameter. Map {{{message_html}}} in EmailJS dashboard.
      items_text: orderData.items
        .map((item) => `- ${item.name} (${item.brand}) | Qty: ${item.quantity} | Price: Rs. ${item.price.toLocaleString()} | Total: Rs. ${(item.price * item.quantity).toLocaleString()}`)
        .join('\n')
    };

    return emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.CUSTOMER_TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
  },

  /**
   * Sends the new order notification email to the admin/seller
   * @param {Object} orderData Prepared order data
   */
  async sendAdminEmail(orderData) {
    const htmlContent = generateAdminEmailHtml(orderData);

    const templateParams = {
      to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
      to_name: 'Admin',
      subject: `New Order Received - Option One Store (${orderData.orderId})`,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      order_id: orderData.orderId,
      order_date: orderData.orderDate,
      total_amount: `Rs. ${orderData.totalAmount.toLocaleString()}`,
      shipping_address: orderData.shippingAddress,
      city: orderData.city,
      zip_code: orderData.zipCode,
      country: orderData.country,
      payment_method: orderData.paymentMethod.toUpperCase(),
      message_html: htmlContent, // Rich HTML template parameter. Map {{{message_html}}} in EmailJS dashboard.
      items_text: orderData.items
        .map((item) => `- ${item.name} (${item.brand}) | Qty: ${item.quantity} | Price: Rs. ${item.price.toLocaleString()} | Total: Rs. ${(item.price * item.quantity).toLocaleString()}`)
        .join('\n')
    };

    return emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.ADMIN_TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
  }
};
