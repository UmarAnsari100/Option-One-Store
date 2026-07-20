// Email Templates Generator
// Generates professional, responsive, luxury-branded HTML emails

/**
 * Generates the Customer Order Confirmation Email HTML
 * @param {Object} orderData Structured order details
 * @returns {string} Complete HTML string
 */
export const generateCustomerEmailHtml = (orderData) => {
  const {
    orderId,
    orderDate,
    customerName,
    shippingAddress,
    paymentMethod,
    items,
    totalAmount,
    discountAmount,
    shippingCost,
    taxAmount,
    cartSubtotal
  } = orderData;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee;">
        <table cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="width: 60px; vertical-align: top;">
              ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #e0e0e0;" />` : ''}
            </td>
            <td style="padding-left: 15px; vertical-align: top;">
              <div style="font-weight: 600; color: #333333; font-size: 14px;">${item.name}</div>
              <div style="color: #888888; font-size: 12px; margin-top: 2px;">${item.brand}</div>
              <div style="color: #666666; font-size: 12px; margin-top: 4px;">Price: Rs. ${item.price.toLocaleString()}</div>
            </td>
          </tr>
        </table>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee; text-align: center; color: #555555; font-size: 14px; vertical-align: middle;">
        ${item.quantity}
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #eeeeee; text-align: right; color: #333333; font-weight: 600; font-size: 14px; vertical-align: middle;">
        Rs. ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Has Been Confirmed - Option One Store</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #ffffff; color: #333333; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #f9f9f9; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-top: 4px solid #336021; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
        .header { padding: 35px 40px 25px; text-align: center; border-bottom: 1px solid #f2f2f2; }
        .content { padding: 40px; }
        .footer { background-color: #fcfcfc; padding: 30px 40px; text-align: center; border-top: 1px solid #f2f2f2; font-size: 12px; color: #888888; }
        .logo-text { font-family: 'Times New Roman', Times, serif; font-size: 26px; letter-spacing: 0.15em; text-transform: uppercase; color: #336021; }
        .logo-accent { color: #E58A2B; font-weight: 600; }
        .logo-sub { font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase; color: #888888; margin-top: 5px; }
        .title { font-family: 'Times New Roman', Times, serif; font-size: 24px; color: #336021; margin-top: 0; margin-bottom: 15px; font-weight: 300; letter-spacing: 0.05em; text-align: center; }
        .lead { font-size: 15px; line-height: 1.6; color: #555555; margin-bottom: 30px; }
        .info-grid { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
        .info-cell { padding: 15px; background-color: #fafafa; border: 1px solid #eeeeee; vertical-align: top; width: 50%; font-size: 13px; line-height: 1.5; }
        .info-title { font-weight: bold; color: #336021; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; margin-bottom: 8px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .table th { padding: 12px 0; border-bottom: 2px solid #336021; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #336021; }
        .totals { width: 100%; margin-bottom: 30px; }
        .totals-row { font-size: 14px; line-height: 2; color: #555555; }
        .totals-label { text-align: right; padding-right: 20px; }
        .totals-val { text-align: right; width: 120px; }
        .grand-total { font-size: 18px; font-weight: bold; color: #336021; border-top: 1px solid #eeeeee; padding-top: 10px; margin-top: 10px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #336021; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 2px; transition: background-color 0.2s; }
        .btn-wrapper { text-align: center; margin: 35px 0 15px; }
        .social-link { display: inline-block; margin: 0 8px; color: #336021; text-decoration: none; font-size: 12px; }
        .highlight { color: #E58A2B; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="logo-text">Option <span class="logo-accent">One</span></div>
            <div class="logo-sub">Maison de Luxe</div>
          </div>
          <div class="content">
            <h1 class="title">Your Order Has Been Confirmed</h1>
            <p class="lead">
              Dear ${customerName},<br/><br/>
              Thank you for your purchase from <strong>Option One Store</strong>. Your order has been successfully placed, and our specialist concierge team is preparing your package. A summary of your luxury purchase and delivery information is detailed below.
            </p>
            
            <table class="info-grid">
              <tr>
                <td class="info-cell" style="border-right: none;">
                  <div class="info-title">Order Details</div>
                  <strong>Order ID:</strong> <span class="highlight">${orderId}</span><br/>
                  <strong>Date:</strong> ${orderDate}<br/>
                  <strong>Estimated Delivery:</strong> 2-3 Business Days
                </td>
                <td class="info-cell">
                  <div class="info-title">Shipping & Payment</div>
                  <strong>Shipping Address:</strong><br/>
                  ${shippingAddress}<br/><br/>
                  <strong>Payment Method:</strong><br/>
                  ${paymentMethod.toUpperCase()}
                </td>
              </tr>
            </table>
            
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 60%;">Product</th>
                  <th style="width: 15%; text-align: center;">Qty</th>
                  <th style="width: 25%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <table class="totals" align="right" cellpadding="0" cellspacing="0">
              <tr class="totals-row">
                <td class="totals-label">Subtotal:</td>
                <td class="totals-val">Rs. ${cartSubtotal.toLocaleString()}</td>
              </tr>
              ${discountAmount > 0 ? `
              <tr class="totals-row" style="color: #E58A2B;">
                <td class="totals-label">Bundle Privilege:</td>
                <td class="totals-val">-Rs. ${discountAmount.toLocaleString()}</td>
              </tr>
              ` : ''}
              <tr class="totals-row">
                <td class="totals-label">Priority Shipping:</td>
                <td class="totals-val">${shippingCost === 0 ? 'Complimentary' : `Rs. ${shippingCost.toLocaleString()}`}</td>
              </tr>
              <tr class="totals-row">
                <td class="totals-label">Estimated Taxes (8%):</td>
                <td class="totals-val">Rs. ${taxAmount.toLocaleString()}</td>
              </tr>
              <tr class="totals-row grand-total">
                <td class="totals-label" style="font-weight: bold; color: #336021;">Order Total:</td>
                <td class="totals-val" style="font-weight: bold; color: #336021;">Rs. ${totalAmount.toLocaleString()}</td>
              </tr>
            </table>
            
            <div style="clear: both;"></div>
            
            <div class="btn-wrapper">
              <a href="https://optiononestore.com/shop" class="btn">Continue Shopping</a>
            </div>
          </div>
          <div class="footer">
            <p style="margin-top: 0;">Option One Store &bull; Maison de Luxe &bull; Contact: support@optiononestore.com | +92 330 0073073</p>
            <p style="margin-bottom: 20px; font-style: italic;">This is an automated confirmation of your order. Thank you for your custom.</p>
            <div style="margin-top: 15px;">
              <a href="#" class="social-link">Instagram</a> &bull;
              <a href="#" class="social-link">Facebook</a> &bull;
              <a href="#" class="social-link">Pinterest</a>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generates the Admin New Order Notification Email HTML
 * @param {Object} orderData Structured order details
 * @returns {string} Complete HTML string
 */
export const generateAdminEmailHtml = (orderData) => {
  const {
    orderId,
    orderDate,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    city,
    zipCode,
    country,
    paymentMethod,
    items,
    totalAmount,
    discountAmount,
    shippingCost,
    taxAmount,
    cartSubtotal,
    customerNotes,
    bankScreenshot
  } = orderData;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-size: 13px;">
        <strong>${item.name}</strong><br/>
        <span style="color: #666666; font-size: 11px;">SKU: ${item.sku || 'N/A'} | Brand: ${item.brand} | Unit Price: Rs. ${item.price.toLocaleString()}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center; font-size: 13px;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; font-size: 13px; font-weight: bold;">
        Rs. ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Received - Option One Store</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333333; margin: 0; padding: 0; }
        .wrapper { width: 100%; background-color: #f5f5f5; padding: 30px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd; border-top: 4px solid #E58A2B; }
        .header { padding: 25px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #eeeeee; }
        .content { padding: 30px; }
        .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #336021; border-bottom: 1px solid #336021; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 8px 0; font-size: 13px; vertical-align: top; }
        .info-label { width: 35%; font-weight: bold; color: #555555; }
        .info-value { width: 65%; color: #111111; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .items-table th { padding: 10px; background-color: #f9f9f9; border-bottom: 2px solid #dddddd; font-size: 11px; text-transform: uppercase; text-align: left; }
        .totals-table { width: 100%; margin-top: 20px; border-collapse: collapse; }
        .totals-table td { padding: 6px 12px; font-size: 13px; text-align: right; }
        .totals-lbl { font-weight: bold; color: #666666; }
        .totals-val { width: 120px; }
        .grand-total { font-size: 16px; font-weight: bold; color: #336021; background-color: #f9f9f9; border-top: 1px solid #dddddd; border-bottom: 1px solid #dddddd; }
        .footer { background-color: #ffffff; padding: 20px; text-align: center; border-top: 1px solid #eeeeee; font-size: 11px; color: #777777; }
        .logo-text { font-family: 'Times New Roman', Times, serif; font-size: 22px; letter-spacing: 0.12em; text-transform: uppercase; color: #336021; }
        .logo-accent { color: #E58A2B; font-weight: 600; }
        .badge { display: inline-block; padding: 4px 8px; background-color: #336021; color: #ffffff; font-size: 11px; font-weight: bold; border-radius: 3px; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="logo-text">Option <span class="logo-accent">One</span> Admin</div>
            <div style="font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #888888; margin-top: 3px;">Order Processing Center</div>
          </div>
          <div class="content">
            <div style="text-align: right; margin-bottom: 15px;">
              <span class="badge">NEW ORDER</span>
            </div>
            
            <div style="font-size: 15px; margin-bottom: 20px;">
              A new order has been successfully placed on <strong>Option One Store</strong>.
            </div>

            <div class="section-title">Order Overview</div>
            <table class="info-table">
              <tr>
                <td class="info-label">Order Number:</td>
                <td class="info-value" style="font-weight: bold; color: #E58A2B;">${orderId}</td>
              </tr>
              <tr>
                <td class="info-label">Order Date:</td>
                <td class="info-value">${orderDate}</td>
              </tr>
              <tr>
                <td class="info-label">Payment Method:</td>
                <td class="info-value" style="text-transform: uppercase; font-weight: bold;">
                  ${paymentMethod}
                  ${bankScreenshot ? `<br/><span style="font-weight: normal; font-size: 11px; color: #666666;">(Receipt uploaded: ${bankScreenshot})</span>` : ''}
                </td>
              </tr>
            </table>

            <div class="section-title">Customer Information</div>
            <table class="info-table">
              <tr>
                <td class="info-label">Customer Name:</td>
                <td class="info-value">${customerName}</td>
              </tr>
              <tr>
                <td class="info-label">Customer Email:</td>
                <td class="info-value"><a href="mailto:${customerEmail}">${customerEmail}</a></td>
              </tr>
              <tr>
                <td class="info-label">Customer Phone:</td>
                <td class="info-value"><a href="tel:${customerPhone}">${customerPhone}</a></td>
              </tr>
            </table>

            <div class="section-title">Shipping Address</div>
            <table class="info-table">
              <tr>
                <td class="info-label">Street Address:</td>
                <td class="info-value">${shippingAddress}</td>
              </tr>
              <tr>
                <td class="info-label">City:</td>
                <td class="info-value">${city}</td>
              </tr>
              <tr>
                <td class="info-label">ZIP / Postal Code:</td>
                <td class="info-value">${zipCode}</td>
              </tr>
              <tr>
                <td class="info-label">Country:</td>
                <td class="info-value">${country}</td>
              </tr>
            </table>

            <div class="section-title">Delivery & Customer Notes</div>
            <table class="info-table">
              <tr>
                <td class="info-label">Delivery Notes:</td>
                <td class="info-value">Standard Shipping (2-3 business days)</td>
              </tr>
              <tr>
                <td class="info-label">Customer Notes:</td>
                <td class="info-value" style="font-style: italic; color: #555555;">${customerNotes || 'No notes provided by customer'}</td>
              </tr>
            </table>

            <div class="section-title">Ordered Items</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="padding: 10px;">Item Description</th>
                  <th style="padding: 10px; text-align: center; width: 60px;">Qty</th>
                  <th style="padding: 10px; text-align: right; width: 100px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <table class="totals-table" align="right">
              <tr>
                <td class="totals-lbl">Subtotal:</td>
                <td class="totals-val">Rs. ${cartSubtotal.toLocaleString()}</td>
              </tr>
              ${discountAmount > 0 ? `
              <tr style="color: #E58A2B;">
                <td class="totals-lbl">Privilege Discount:</td>
                <td class="totals-val">-Rs. ${discountAmount.toLocaleString()}</td>
              </tr>
              ` : ''}
              <tr>
                <td class="totals-lbl">Shipping Cost:</td>
                <td class="totals-val">${shippingCost === 0 ? 'Complimentary' : `Rs. ${shippingCost.toLocaleString()}`}</td>
              </tr>
              <tr>
                <td class="totals-lbl">Taxes (8%):</td>
                <td class="totals-val">Rs. ${taxAmount.toLocaleString()}</td>
              </tr>
              <tr class="grand-total">
                <td class="totals-lbl" style="padding: 10px 12px;">Total Revenue:</td>
                <td class="totals-val" style="padding: 10px 12px;">Rs. ${totalAmount.toLocaleString()}</td>
              </tr>
            </table>
            <div style="clear: both;"></div>

          </div>
          <div class="footer">
            Option One Store &bull; Administrative Order System &bull; Confidential
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
