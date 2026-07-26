import React, { useContext, useState } from 'react';
import SEO from '../../components/SEO/SEO';
import { useLocation, Link } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { CheckCircle2, CreditCard, ShieldCheck, ArrowRight, ArrowLeft, Truck, Check, Copy, Upload } from 'lucide-react';
import './Checkout.css';
import { formatPrice } from '../../utils/formatter';
import { emailService } from '../../services/emailService';
import { orderService } from '../../services/orderService';

// Simplified Premium Logos & SVGs for Payment Options
const VisaLogo = () => (
  <svg width="40" height="26" viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="26" rx="4" fill="#0F1B4E" />
    <path d="M28.3 16.5l1.5-6.7h1.9l-1.5 6.7h-1.9zm6.6-6.7c-.4-.1-1-.2-1.6-.2-1.6 0-2.8.8-2.8 2 0 .9.8 1.3 1.4 1.6.6.3.8.5.8.8 0 .5-.6.7-1.2.7-.8 0-1.3-.1-2-.5l-.3-.1-.3 1.9c.6.3 1.6.5 2.6.5 1.8 0 2.9-.8 2.9-2.1 0-.7-.5-1.2-1.5-1.6-.6-.3-1-.5-1-.8 0-.4.4-.7 1.1-.7.6 0 1.1.1 1.6.4l.2.1.4-2.1zm-15 0l-1.5 6.7h1.8l1.5-6.7H19.9zm-4.5 0h-2.1c-.6 0-1.2.3-1.5.9l-3.6 5.8h2l.4-1.1h2.5l.2 1.1h1.8l-1.5-6.7h-.2zm-3.5 4.5l.8-2.1.4 2.1h-1.2z" fill="#FFF"/>
  </svg>
);

const MastercardLogo = () => (
  <svg width="40" height="26" viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="26" rx="4" fill="#1E1E1E" />
    <circle cx="16" cy="13" r="7" fill="#EB001B" />
    <circle cx="24" cy="13" r="7" fill="#F79E1B" opacity="0.85" />
  </svg>
);

const EasypaisaLogo = () => (
  <svg width="80" height="26" viewBox="0 0 80 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="26" rx="4" fill="#00A859" />
    <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif" fontWeight="800" letterSpacing="0.05em">easypaisa</text>
  </svg>
);

const JazzCashLogo = () => (
  <svg width="80" height="26" viewBox="0 0 80 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="26" rx="4" fill="#1C1C1C" />
    <circle cx="15" cy="13" r="6" fill="#FFC800" />
    <circle cx="21" cy="13" r="4" fill="#D93838" />
    <text x="53" y="17" fill="#FFFFFF" fontSize="9" fontFamily="sans-serif" fontWeight="800">JazzCash</text>
  </svg>
);

const RaastLogo = () => (
  <svg width="65" height="26" viewBox="0 0 65 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="65" height="26" rx="4" fill="#2E3192" />
    <path d="M12 7l4 6h-8l4-6z" fill="#FF8C00" />
    <text x="40" y="17" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif" fontWeight="900" letterSpacing="0.08em">RAAST</text>
  </svg>
);

const CODLogo = () => (
  <svg width="40" height="26" viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="26" rx="4" fill="#1A3322" />
    <path d="M10 18h20v2H10zM10 6h20v2H10z" fill="#25D366" opacity="0.3" />
    <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#25D366" fontSize="11" fontFamily="sans-serif" fontWeight="900" letterSpacing="0.05em">COD</text>
  </svg>
);

const QRIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm12-2h4v2h-4v-2zm2 2h2v4h-2v-4zm-2 2h-2v-2h2v2zm-2 2h-2v-2h2v2zm-4-4h2v2h-2v-2zm2 2h2v2h-2v-2zm-6-2h2v2H9v-2zm2 2h2v2h-2v-2zm4 2h2v2h-2v-2zm-6-6h2v2H9v-2z" fill="currentColor" />
  </svg>
);

const Checkout = () => {
  const { cart, cartSubtotal, clearCart, updateQuantity, removeFromCart, showToast } = useContext(ShopContext);
  const location = useLocation();

  // Multi-step state: 1: Cart, 2: Shipping, 3: Payment, 4: Review
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Payment selection states
  const [selectedPayment, setSelectedPayment] = useState('cod'); 
  const [selectedBank, setSelectedBank] = useState('meezan'); 
  const [bankScreenshot, setBankScreenshot] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // EmailJS & Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [emailSendingError, setEmailSendingError] = useState(false);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBankScreenshot(file.name);
    }
  };
  
  // Retrieve discount rate if passed from Cart page state
  const discountRate = location.state?.discount || 0;

  // Inputs State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Pakistan',
    zipCode: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep) => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cardRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    const cvvRegex = /^\d{3,4}$/;

    if (currentStep === 2) {
      // Shipping validations
      if (!formData.firstName.trim()) tempErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) tempErrors.lastName = 'Last name is required';
      if (!formData.email.trim() || !emailRegex.test(formData.email)) tempErrors.email = 'Valid email address is required';
      if (!formData.phone.trim()) tempErrors.phone = 'Phone number is required';
      if (!formData.address.trim()) tempErrors.address = 'Shipping address is required';
      if (!formData.city.trim()) tempErrors.city = 'City is required';
      if (!formData.zipCode.trim()) tempErrors.zipCode = 'ZIP Code is required';
    }

    if (currentStep === 3) {
      // Payment validations
      if (selectedPayment === 'card') {
        if (!formData.cardName.trim()) tempErrors.cardName = 'Name on card is required';
        const plainCard = formData.cardNumber.replace(/\s+/g, '');
        if (!plainCard || !cardRegex.test(plainCard)) tempErrors.cardNumber = 'Card number must be 16 digits';
        if (!formData.cardExpiry.trim() || !expiryRegex.test(formData.cardExpiry)) {
          tempErrors.cardExpiry = 'Expiry must be MM/YY';
        }
        if (!formData.cardCvv.trim() || !cvvRegex.test(formData.cardCvv)) {
          tempErrors.cardCvv = 'CVV must be 3 or 4 digits';
        }
      } else if (selectedPayment === 'bank') {
        if (!bankScreenshot) {
          tempErrors.bankScreenshot = 'Please upload a screenshot of your bank transfer receipt';
        }
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // 1. Validation before sending:
    // Check that the cart is not empty
    if (cart.length === 0) {
      showToast('Your bag is empty. Please add items to your cart before placing an order.', 'error');
      return;
    }

    // Validate payment step first
    if (!validateStep(3)) {
      return;
    }

    // Validate name, email, phone, address fields
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showToast('Please fill out all required shipping fields.', 'error');
      setStep(2); // Go back to shipping details if invalid
      return;
    }

    // Prepare or reuse the order data
    let orderData = pendingOrderData;
    if (!orderData) {
      orderData = orderService.prepareOrderData(
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
      );
      setPendingOrderData(orderData);
    }

    // 2. Show loading state
    setIsLoading(true);
    setEmailSendingError(false);

    try {
      // 3. Send emails (both customer and admin)
      // Send customer confirmation email
      await emailService.sendCustomerEmail(orderData);
      
      // Send admin confirmation email
      await emailService.sendAdminEmail(orderData);

      // Save order to history
      orderService.saveOrderToHistory(orderData);

      // 4. Show success message / Redirect to success page view
      setOrderNumber(orderData.orderId);
      setIsSubmitted(true);
      clearCart();
      setPendingOrderData(null); // Clear pending order data
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      // 5. Error handling:
      // - Do not crash the website.
      // - Show a friendly error notification.
      // - Allow the user to retry.
      // - Log the error in the console.
      console.error('Order email notification failed to send:', error);
      showToast('We encountered an issue sending confirmation emails. Please try again.', 'error');
      setEmailSendingError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Pricing calculations
  const discountAmount = cartSubtotal * discountRate;
  const shippingCost = cartSubtotal >= 40000 || cartSubtotal === 0 ? 0 : 7000;
  const taxAmount = (cartSubtotal - discountAmount) * 0.08;
  const totalAmount = cartSubtotal - discountAmount + shippingCost + taxAmount;

  const stepsList = [
    { num: 1, label: 'Cart Preview' },
    { num: 2, label: 'Shipping Details' },
    { num: 3, label: 'Payment Method' },
    { num: 4, label: 'Final Review' }
  ];

  if (isSubmitted) {
    return (
      <div className="checkout-success-page">
        <div className="container">
          <div className="success-card text-center animate-scale">
            <div className="success-icon-container">
              <CheckCircle2 size={64} color="var(--color-primary)" />
            </div>
            <h1>✓ Thank you for your purchase!</h1>
            <p className="success-order-id" style={{ fontSize: '1.25rem', marginTop: '1rem', color: 'var(--color-primary)' }}>
              Your order has been successfully placed.
            </p>
            <p className="success-order-id" style={{ margin: '0.75rem 0' }}>
              Order Number: <strong>{orderNumber}</strong>
            </p>
            <p className="success-details-text">
              A confirmation email has been sent to <strong>{formData.email}</strong>.
            </p>
            
            <div className="success-summary">
              <h3>Delivery Details</h3>
              <p className="recipient">{formData.firstName} {formData.lastName}</p>
              <p>{formData.address}</p>
              <p>{formData.city}, {formData.zipCode}</p>
              <p>{formData.country}</p>
            </div>

            <Link to="/" className="btn btn-primary back-home-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <SEO
        title="Secure Checkout | Option One Store"
        description="Complete your order securely with 256-bit encryption. Cash on Delivery, Easypaisa, JazzCash, and Bank Wire supported."
        canonical="https://optiononestore.com/checkout"
      />
      {/* Header Banner */}
      <div className="checkout-header-banner">
        <div className="container">
          <span className="checkout-subtitle">SECURE PLATFORM</span>
          <h1 className="checkout-title">Maison Checkout</h1>
        </div>
      </div>

      <div className="container section-padding">
        {cart.length === 0 && step === 1 ? (
          <div className="empty-checkout text-center">
            <h2>Your bag is empty</h2>
            <p>You cannot check out without placing luxury pieces in your bag.</p>
            <Link to="/shop" className="btn btn-primary">Return to Shop</Link>
          </div>
        ) : (
          <div className="checkout-wizard-layout">
            
            {/* Steps Progress Bar */}
            <div className="checkout-progress-bar">
              {stepsList.map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div className={`step-dot-wrapper ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                    <div className="step-dot">
                      {step > s.num ? <Check size={12} /> : <span>{s.num}</span>}
                    </div>
                    <span className="step-label">{s.label}</span>
                  </div>
                  {idx < stepsList.length - 1 && (
                    <div className={`step-connector ${step > s.num ? 'completed' : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="checkout-layout">
              {/* Wizard Form Panels */}
              <div className="checkout-forms-col">
                
                {/* Step 1: Cart Review */}
                {step === 1 && (
                  <div className="step-panel-card">
                    <h2 className="panel-title">Review Your Pieces</h2>
                    <div className="cart-checkout-items">
                      {cart.map((item) => (
                        <div key={item.product.id} className="cart-checkout-row">
                          <img src={item.product.image1} alt={item.product.name} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
                          <div className="row-details">
                            <span className="row-brand">{item.product.brand}</span>
                            <h5>{item.product.name}</h5>
                            <span className="row-price">{formatPrice(item.product.price)}</span>
                          </div>
                          
                          <div className="row-qty-controls">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>+</button>
                          </div>
                          
                          <button className="row-remove" onClick={() => removeFromCart(item.product.id)}>Remove</button>
                        </div>
                      ))}
                    </div>

                    <div className="panel-actions">
                      <Link to="/shop" className="btn btn-outline back-btn-flex">
                        <ArrowLeft size={16} />
                        <span>Continue Shopping</span>
                      </Link>
                      <button className="btn btn-primary next-btn-flex" onClick={() => setStep(2)}>
                        <span>Add Shipping Address</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Shipping Address */}
                {step === 2 && (
                  <div className="step-panel-card">
                    <h2 className="panel-title">1. Shipping & Delivery</h2>
                    <div className="form-grid">
                      <div className="form-field">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={errors.firstName ? 'error' : ''}
                        />
                        {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                      </div>
                      <div className="form-field">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={errors.lastName ? 'error' : ''}
                        />
                        {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                      </div>
                      <div className="form-field full-width">
                        <label htmlFor="email">Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                      </div>
                      <div className="form-field full-width">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                      </div>
                      <div className="form-field full-width">
                        <label htmlFor="address">Street Address</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          placeholder="Avenue de l'Opéra, Suite 4B"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={errors.address ? 'error' : ''}
                        />
                        {errors.address && <span className="error-text">{errors.address}</span>}
                      </div>
                      <div className="form-field">
                        <label htmlFor="city">City</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={errors.city ? 'error' : ''}
                        />
                        {errors.city && <span className="error-text">{errors.city}</span>}
                      </div>
                      <div className="form-field">
                        <label htmlFor="zipCode">ZIP Code</label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className={errors.zipCode ? 'error' : ''}
                        />
                        {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
                      </div>
                    </div>

                    <div className="panel-actions">
                      <button className="btn btn-outline back-btn-flex" onClick={handlePrevStep}>
                        <ArrowLeft size={16} />
                        <span>Back</span>
                      </button>
                      <button className="btn btn-primary next-btn-flex" onClick={handleNextStep}>
                        <span>Proceed to Payment</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Method */}
                {step === 3 && (
                  <div className="step-panel-card">
                    <div className="card-title-flex">
                      <h2 className="panel-title">2. Choose Payment Method</h2>
                      <div className="secure-badge">
                        <ShieldCheck size={14} />
                        <span>SSL encrypted</span>
                      </div>
                    </div>

                    <div className="payment-methods-grid">
                      {/* 1. Cash on Delivery (COD) */}
                      <div 
                        className={`payment-method-card ${selectedPayment === 'cod' ? 'active' : ''}`}
                        onClick={() => setSelectedPayment('cod')}
                      >
                        <div className="payment-card-header">
                          <div className="radio-icon-group">
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              checked={selectedPayment === 'cod'} 
                              onChange={() => setSelectedPayment('cod')} 
                            />
                            <div className="payment-card-title-block">
                              <span className="payment-card-title">Cash on Delivery (COD)</span>
                              <span className="recommended-badge">Recommended</span>
                            </div>
                          </div>
                          <CODLogo />
                        </div>
                        <div className="payment-card-details">
                          <div className="payment-details-inner">
                            <p className="payment-details-desc">Pay cash when your order is delivered.</p>
                            <p className="payment-sub-text">Available throughout Pakistan.</p>
                          </div>
                        </div>
                      </div>

                      {/* 2. Easypaisa */}
                      <div 
                        className={`payment-method-card ${selectedPayment === 'easypaisa' ? 'active' : ''}`}
                        onClick={() => setSelectedPayment('easypaisa')}
                      >
                        <div className="payment-card-header">
                          <div className="radio-icon-group">
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              checked={selectedPayment === 'easypaisa'} 
                              onChange={() => setSelectedPayment('easypaisa')} 
                            />
                            <span className="payment-card-title">Easypaisa</span>
                          </div>
                          <EasypaisaLogo />
                        </div>
                        <div className="payment-card-details">
                          <div className="payment-details-inner qr-flex">
                            <div className="qr-container">
                              <QRIcon />
                              <span>Scan to Pay</span>
                            </div>
                            <div className="details-fields">
                              <span className="details-label">Wallet Number</span>
                              <div className="copy-field">
                                <span className="copy-value">03300073073</span>
                                <button 
                                  type="button"
                                  className="btn-copy" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy('03300073073', 'easypaisa');
                                  }}
                                >
                                  {copiedField === 'easypaisa' ? <Check size={12} /> : <Copy size={12} />}
                                  <span>{copiedField === 'easypaisa' ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <p className="help-text">Pay instantly using your Easypaisa Wallet.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. JazzCash */}
                      <div 
                        className={`payment-method-card ${selectedPayment === 'jazzcash' ? 'active' : ''}`}
                        onClick={() => setSelectedPayment('jazzcash')}
                      >
                        <div className="payment-card-header">
                          <div className="radio-icon-group">
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              checked={selectedPayment === 'jazzcash'} 
                              onChange={() => setSelectedPayment('jazzcash')} 
                            />
                            <span className="payment-card-title">JazzCash</span>
                          </div>
                          <JazzCashLogo />
                        </div>
                        <div className="payment-card-details">
                          <div className="payment-details-inner qr-flex">
                            <div className="qr-container">
                              <QRIcon />
                              <span>Scan to Pay</span>
                            </div>
                            <div className="details-fields">
                              <span className="details-label">Wallet Number</span>
                              <div className="copy-field">
                                <span className="copy-value">03300073073</span>
                                <button 
                                  type="button"
                                  className="btn-copy" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy('03300073073', 'jazzcash');
                                  }}
                                >
                                  {copiedField === 'jazzcash' ? <Check size={12} /> : <Copy size={12} />}
                                  <span>{copiedField === 'jazzcash' ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <p className="help-text">Fast and secure mobile wallet payment.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. Raast */}
                      <div 
                        className={`payment-method-card ${selectedPayment === 'raast' ? 'active' : ''}`}
                        onClick={() => setSelectedPayment('raast')}
                      >
                        <div className="payment-card-header">
                          <div className="radio-icon-group">
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              checked={selectedPayment === 'raast'} 
                              onChange={() => setSelectedPayment('raast')} 
                            />
                            <span className="payment-card-title">Raast</span>
                          </div>
                          <RaastLogo />
                        </div>
                        <div className="payment-card-details">
                          <div className="payment-details-inner qr-flex">
                            <div className="qr-container">
                              <QRIcon />
                              <span>Scan to Pay</span>
                            </div>
                            <div className="details-fields">
                              <span className="details-label">Raast ID</span>
                              <div className="copy-field">
                                <span className="copy-value">03300073073</span>
                                <button 
                                  type="button"
                                  className="btn-copy" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy('03300073073', 'raast');
                                  }}
                                >
                                  {copiedField === 'raast' ? <Check size={12} /> : <Copy size={12} />}
                                  <span>{copiedField === 'raast' ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <p className="help-text">Instant bank transfer using Raast.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5. Debit / Credit Card */}
                      <div 
                        className={`payment-method-card ${selectedPayment === 'card' ? 'active' : ''}`}
                        onClick={() => setSelectedPayment('card')}
                      >
                        <div className="payment-card-header">
                          <div className="radio-icon-group">
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              checked={selectedPayment === 'card'} 
                              onChange={() => setSelectedPayment('card')} 
                            />
                            <span className="payment-card-title">Debit / Credit Card</span>
                          </div>
                          <div className="card-logos-flex">
                            <VisaLogo />
                            <MastercardLogo />
                          </div>
                        </div>
                        <div className="payment-card-details">
                          <div className="payment-details-inner card-fields-panel" onClick={(e) => e.stopPropagation()}>
                            <div className="form-field-floating">
                              <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                placeholder=" "
                                maxLength="19"
                                value={formData.cardNumber}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                  let matches = val.match(/\d{4,16}/g);
                                  let match = matches && matches[0] || '';
                                  let parts = [];
                                  for (let i=0, len=match.length; i<len; i+=4) {
                                    parts.push(match.substring(i, i+4));
                                  }
                                  if (parts.length > 0) {
                                    e.target.value = parts.join(' ');
                                  }
                                  handleInputChange(e);
                                }}
                                className={errors.cardNumber ? 'error' : ''}
                              />
                              <label htmlFor="cardNumber">Card Number</label>
                              {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                            </div>

                            <div className="form-field-floating">
                              <input
                                type="text"
                                id="cardName"
                                name="cardName"
                                placeholder=" "
                                value={formData.cardName}
                                onChange={handleInputChange}
                                className={errors.cardName ? 'error' : ''}
                              />
                              <label htmlFor="cardName">Cardholder Name</label>
                              {errors.cardName && <span className="error-text">{errors.cardName}</span>}
                            </div>

                            <div className="card-expiry-cvv-grid">
                              <div className="form-field-floating">
                                <input
                                  type="text"
                                  id="cardExpiry"
                                  name="cardExpiry"
                                  placeholder=" "
                                  maxLength="5"
                                  value={formData.cardExpiry}
                                  onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, '');
                                    if (val.length > 2) {
                                      val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                    }
                                    e.target.value = val;
                                    handleInputChange(e);
                                  }}
                                  className={errors.cardExpiry ? 'error' : ''}
                                />
                                <label htmlFor="cardExpiry">Expiry Date (MM/YY)</label>
                                {errors.cardExpiry && <span className="error-text">{errors.cardExpiry}</span>}
                              </div>

                              <div className="form-field-floating">
                                <input
                                  type="password"
                                  id="cardCvv"
                                  name="cardCvv"
                                  placeholder=" "
                                  maxLength="4"
                                  value={formData.cardCvv}
                                  onChange={handleInputChange}
                                  className={errors.cardCvv ? 'error' : ''}
                                />
                                <label htmlFor="cardCvv">CVV</label>
                                {errors.cardCvv && <span className="error-text">{errors.cardCvv}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 6. Direct Bank Transfer */}
                      <div 
                        className={`payment-method-card ${selectedPayment === 'bank' ? 'active' : ''}`}
                        onClick={() => setSelectedPayment('bank')}
                      >
                        <div className="payment-card-header">
                          <div className="radio-icon-group">
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              checked={selectedPayment === 'bank'} 
                              onChange={() => setSelectedPayment('bank')} 
                            />
                            <span className="payment-card-title">Direct Bank Transfer</span>
                          </div>
                          <span className="bank-logo-text">Bank Transfer</span>
                        </div>
                        <div className="payment-card-details">
                          <div className="payment-details-inner bank-transfer-panel" onClick={(e) => e.stopPropagation()}>
                            
                            {/* Bank selector pills */}
                            <div className="bank-pills-row">
                              {['meezan', 'hbl', 'ubl', 'alfalah', 'allied'].map((b) => (
                                <button 
                                  key={b}
                                  type="button"
                                  className={`bank-pill ${selectedBank === b ? 'active' : ''}`} 
                                  onClick={() => setSelectedBank(b)}
                                >
                                  {b === 'meezan' && 'Meezan Bank'}
                                  {b === 'hbl' && 'HBL'}
                                  {b === 'ubl' && 'UBL'}
                                  {b === 'alfalah' && 'Bank Alfalah'}
                                  {b === 'allied' && 'Allied Bank'}
                                </button>
                              ))}
                            </div>

                            {/* Selected Bank Details */}
                            <div className="bank-details-box">
                              <div className="bank-detail-item">
                                <span className="bank-lbl">Account Title</span>
                                <span className="bank-val">Option One Store</span>
                              </div>

                              <div className="bank-detail-item">
                                <span className="bank-lbl">Account Number</span>
                                <div className="bank-val-copy">
                                  <span className="bank-val">
                                    {selectedBank === 'meezan' && '1234010567890'}
                                    {selectedBank === 'hbl' && '00427901567803'}
                                    {selectedBank === 'ubl' && '2345678901'}
                                    {selectedBank === 'alfalah' && '5678901234'}
                                    {selectedBank === 'allied' && '8901234567'}
                                  </span>
                                  <button 
                                    type="button" 
                                    className="bank-mini-copy"
                                    onClick={() => {
                                      const num = {
                                        meezan: '1234010567890',
                                        hbl: '00427901567803',
                                        ubl: '2345678901',
                                        alfalah: '5678901234',
                                        allied: '8901234567'
                                      }[selectedBank];
                                      handleCopy(num, `acct-${selectedBank}`);
                                    }}
                                  >
                                    {copiedField === `acct-${selectedBank}` ? 'Copied' : <Copy size={11} />}
                                  </button>
                                </div>
                              </div>

                              <div className="bank-detail-item">
                                <span className="bank-lbl">IBAN</span>
                                <div className="bank-val-copy">
                                  <span className="bank-val">
                                    {selectedBank === 'meezan' && 'PK21 MEZN 0012 3401 0567 8901'}
                                    {selectedBank === 'hbl' && 'PK39 HABB 0000 4279 0156 7803'}
                                    {selectedBank === 'ubl' && 'PK12 UNIL 0002 3456 7890 1234'}
                                    {selectedBank === 'alfalah' && 'PK87 ALFH 0056 7890 1234 5678'}
                                    {selectedBank === 'allied' && 'PK45 ALYD 0089 0123 4567 8901'}
                                  </span>
                                  <button 
                                    type="button" 
                                    className="bank-mini-copy"
                                    onClick={() => {
                                      const iban = {
                                        meezan: 'PK21 MEZN 0012 3401 0567 8901',
                                        hbl: 'PK39 HABB 0000 4279 0156 7803',
                                        ubl: 'PK12 UNIL 0002 3456 7890 1234',
                                        alfalah: 'PK87 ALFH 0056 7890 1234 5678',
                                        allied: 'PK45 ALYD 0089 0123 4567 8901'
                                      }[selectedBank];
                                      handleCopy(iban, `iban-${selectedBank}`);
                                    }}
                                  >
                                    {copiedField === `iban-${selectedBank}` ? 'Copied' : <Copy size={11} />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Upload screenshot */}
                            <div className="upload-receipt-container">
                              <label className="upload-zone">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleFileUpload} 
                                  style={{ display: 'none' }}
                                />
                                <Upload size={16} className="upload-icon" />
                                <span>{bankScreenshot ? 'Change Screenshot' : 'Upload Payment Screenshot'}</span>
                              </label>
                              {bankScreenshot && (
                                <div className="uploaded-file-row">
                                  <Check size={14} color="var(--color-primary)" />
                                  <span className="file-name">{bankScreenshot}</span>
                                </div>
                              )}
                              {errors.bankScreenshot && <span className="error-text">{errors.bankScreenshot}</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="panel-actions" style={{ marginTop: '2rem' }}>
                      <button className="btn btn-outline back-btn-flex" onClick={handlePrevStep}>
                        <ArrowLeft size={16} />
                        <span>Back</span>
                      </button>
                      <button className="btn btn-primary next-btn-flex" onClick={handleNextStep}>
                        <span>Review Order Details</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Final Review */}
                {step === 4 && (
                  <div className="step-panel-card">
                    <h2 className="panel-title">3. Final Order Review</h2>
                    
                    <div className="review-section">
                      <h4>Delivery Destination</h4>
                      <p className="review-text-bold">{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.zipCode}</p>
                      <p>{formData.country}</p>
                      <p>Contact: {formData.phone} | {formData.email}</p>
                    </div>

                    <div className="review-section" style={{ marginTop: '1.5rem' }}>
                      <h4>Payment Method</h4>
                      {selectedPayment === 'cod' && (
                        <>
                          <p className="review-text-bold">Cash on Delivery (COD)</p>
                          <p>Pay cash when your order is delivered.</p>
                        </>
                      )}
                      {selectedPayment === 'easypaisa' && (
                        <>
                          <p className="review-text-bold">Easypaisa Mobile Wallet</p>
                          <p>Wallet Number: 03300073073</p>
                        </>
                      )}
                      {selectedPayment === 'jazzcash' && (
                        <>
                          <p className="review-text-bold">JazzCash Mobile Wallet</p>
                          <p>Wallet Number: 03300073073</p>
                        </>
                      )}
                      {selectedPayment === 'raast' && (
                        <>
                          <p className="review-text-bold">Raast Instant Transfer</p>
                          <p>Raast ID: 03300073073</p>
                        </>
                      )}
                      {selectedPayment === 'card' && (
                        <>
                          <p className="review-text-bold">Debit / Credit Card (SSL Protected)</p>
                          <p>Card Ending: **** **** **** {formData.cardNumber.slice(-4)}</p>
                          <p>Name: {formData.cardName}</p>
                        </>
                      )}
                      {selectedPayment === 'bank' && (
                        <>
                          <p className="review-text-bold">Direct Bank Transfer</p>
                          <p>Bank: {selectedBank.toUpperCase()}</p>
                          {bankScreenshot && <p>Screenshot: {bankScreenshot}</p>}
                        </>
                      )}
                    </div>

                    <div className="panel-actions" style={{ marginTop: '2.5rem' }}>
                      <button 
                        className="btn btn-outline back-btn-flex" 
                        onClick={handlePrevStep}
                        disabled={isLoading}
                      >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                      </button>
                      
                      <button 
                        className="btn btn-primary place-order-btn-large" 
                        onClick={handleSubmitOrder}
                        disabled={isLoading}
                      >
                        <ShieldCheck size={18} style={{ marginRight: '6px' }} />
                        <span>
                          {isLoading 
                            ? 'Processing Order...' 
                            : emailSendingError 
                              ? `Retry Placing Order (${formatPrice(totalAmount)})` 
                              : `Place Secure Order (${formatPrice(totalAmount)})`}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Sidebar Summary Col */}
              <div className="checkout-summary-col">
                <div className="checkout-summary-card">
                  <h3>Order Summary ({cart.length})</h3>
                  
                  <div className="checkout-summary-list">
                    {cart.map((item) => (
                      <div key={item.product.id} className="checkout-summary-item">
                        <img src={item.product.image1} alt={item.product.name} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
                        <div className="summary-item-details">
                          <h5>{item.product.name}</h5>
                          <p>Qty: {item.quantity} &times; {formatPrice(item.product.price)}</p>
                        </div>
                        <span className="summary-item-total">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="checkout-totals">
                    <div className="totals-row">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartSubtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="totals-row discount">
                        <span>Bundle Privilege</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="totals-row">
                      <span>Priority Shipping</span>
                      <span>{shippingCost === 0 ? 'Complimentary' : formatPrice(shippingCost)}</span>
                    </div>
                    <div className="totals-row">
                      <span>Estimated Taxes (8%)</span>
                      <span>{formatPrice(taxAmount)}</span>
                    </div>
                    <div className="totals-divider"></div>
                    <div className="totals-row checkout-grand-total">
                      <span>Order Total</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="accepted-payments-section">
                    <h4>Accepted Payments</h4>
                    <div className="accepted-icons-grid">
                      <span className="payment-icon-wrapper" title="Visa"><VisaLogo /></span>
                      <span className="payment-icon-wrapper" title="Mastercard"><MastercardLogo /></span>
                      <span className="payment-icon-wrapper" title="Cash on Delivery"><CODLogo /></span>
                      <span className="payment-icon-wrapper" title="Easypaisa"><EasypaisaLogo /></span>
                      <span className="payment-icon-wrapper" title="JazzCash"><JazzCashLogo /></span>
                      <span className="payment-icon-wrapper" title="Raast"><RaastLogo /></span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;