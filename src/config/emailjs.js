// EmailJS Configuration
// You can replace these default values with your own EmailJS settings here
// or define them in your environment variables (.env file)

export const EMAILJS_CONFIG = {
  // Public Key (User ID) from EmailJS Account > API Keys
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY',

  // Service ID representing your email service (e.g. Gmail, Outlook, etc.)
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_EMAILJS_SERVICE_ID',

  // Template ID for customer order confirmation email
  CUSTOMER_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID || 'YOUR_CUSTOMER_TEMPLATE_ID',

  // Template ID for admin order notification email
  ADMIN_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID || 'YOUR_ADMIN_TEMPLATE_ID',

  // Email address to send the admin notification to
  ADMIN_EMAIL: import.meta.env.VITE_EMAILJS_ADMIN_EMAIL || 'admin@optiononestore.com'
};
