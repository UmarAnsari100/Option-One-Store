import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { ShopContext } from '../../context/ShopContext';
import './MiniCart.css';
import { formatPrice } from '../../utils/formatter';

const MiniCart = () => {
  const {
    cart,
    isMiniCartOpen,
    setIsMiniCartOpen,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    showToast
  } = useContext(ShopContext);

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [shippingCalculated, setShippingCalculated] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'LUXURY20') {
      setDiscountPercent(20);
      setPromoApplied(true);
      showToast('Promo code LUXURY20 (20% OFF) successfully applied!');
    } else {
      showToast('Invalid promo code. Try LUXURY20.', 'error');
    }
  };

  const handleCalculateShipping = (e) => {
    e.preventDefault();
    if (zipCode.trim().length >= 5) {
      setShippingCalculated(true);
      showToast('Estimated shipping successfully calculated.');
    } else {
      showToast('Please enter a valid zip code.', 'warning');
    }
  };

  const shippingCost = cartSubtotal >= 40000 || cartSubtotal === 0 ? 0 : 7000;
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const grandTotal = cartSubtotal - discountAmount + shippingCost;

  const handleCheckoutClick = () => {
    setIsMiniCartOpen(false);
  };

  return (
    <AnimatePresence>
      {isMiniCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            className="mini-cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMiniCartOpen(false)}
          />

          {/* Cart Drawer */}
          <motion.div
            className="mini-cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="mini-cart-header">
              <div className="header-title-box">
                <ShoppingBag size={20} />
                <h3>Your Bag</h3>
                <span className="cart-badge-qty">{cart.length} items</span>
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setIsMiniCartOpen(false)}
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="mini-cart-body">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingBag size={48} className="empty-bag-icon" />
                  <h4>Your bag is empty</h4>
                  <p>Adorn yourself with our custom curated luxury items.</p>
                  <Link
                    to="/shop"
                    className="btn btn-primary start-shopping-btn"
                    onClick={() => setIsMiniCartOpen(false)}
                  >
                    Explore Shop
                  </Link>
                </div>
              ) : (
                <div className="cart-items-wrapper">
                  {cart.map((item) => {
                    const prod = item.product;
                    const finalPrice = prod.price * (1 - prod.discount / 100);
                    return (
                      <div className="mini-cart-item" key={prod.id}>
                        <img src={prod.image1} alt={prod.name} className="item-thumbnail" />
                        <div className="item-details">
                          <span className="item-brand">{prod.brand}</span>
                          <Link
                            to={`/product/${prod.id}`}
                            className="item-name"
                            onClick={() => setIsMiniCartOpen(false)}
                          >
                            {prod.name}
                          </Link>
                          {prod.discount > 0 ? (
                            <div className="price-row">
                              <span className="discounted-price">{formatPrice(finalPrice)}</span>
                              <span className="original-price">{formatPrice(prod.price)}</span>
                            </div>
                          ) : (
                            <span className="price-row">{formatPrice(prod.price)}</span>
                          )}
                          <div className="quantity-and-remove">
                            <div className="item-qty-selector">
                              <button
                                onClick={() => updateQuantity(prod.id, item.quantity - 1)}
                                className="qty-btn"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="qty-number">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(prod.id, item.quantity + 1)}
                                className="qty-btn"
                                disabled={item.quantity >= prod.stock}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              className="remove-item-btn"
                              onClick={() => removeFromCart(prod.id)}
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary (Sticky at bottom) */}
            {cart.length > 0 && (
              <div className="mini-cart-footer">
                {/* Promo Code section */}
                <form className="promo-code-form" onSubmit={handleApplyCoupon}>
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. LUXURY20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={promoApplied}
                  />
                  <button type="submit" disabled={promoApplied}>
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </form>

                {/* Shipping Estimator */}
                <form className="shipping-estimate-form" onSubmit={handleCalculateShipping}>
                  <input
                    type="text"
                    placeholder="Enter Zip Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                  <button type="submit">Estimate Shipping</button>
                </form>

                {/* Subtotal, Shipping, Grand Total breakdown */}
                <div className="summary-breakdown">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartSubtotal)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="summary-row discount-row">
                      <span>Discount (20% OFF)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>
                      {shippingCalculated
                        ? shippingCost === 0
                          ? 'Complimentary'
                          : formatPrice(shippingCost)
                        : 'Calculated next'}
                    </span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Estimated Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="checkout-action-box">
                  <Link
                    to="/checkout"
                    className="btn btn-primary checkout-btn-large"
                    onClick={handleCheckoutClick}
                  >
                    <span>Proceed To Checkout</span>
                    <ArrowRight size={16} />
                  </Link>
                  <button
                    className="btn btn-outline continue-shopping-btn"
                    onClick={() => setIsMiniCartOpen(false)}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MiniCart;
