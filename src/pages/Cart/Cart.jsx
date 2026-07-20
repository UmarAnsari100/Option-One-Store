import React, { useContext, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import './Cart.css';
import { formatPrice } from '../../utils/formatter';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartSubtotal } = useContext(ShopContext);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // decimal percent
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'WELCOME10') {
      setAppliedDiscount(0.10);
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try WELCOME10');
      setAppliedDiscount(0);
      setPromoApplied(false);
    }
  };

  const discountAmount = cartSubtotal * appliedDiscount;
  const shippingCost = cartSubtotal > 40000 || cartSubtotal === 0 ? 0 : 4000;
  const taxAmount = (cartSubtotal - discountAmount) * 0.08; // 8% tax
  const totalAmount = cartSubtotal - discountAmount + shippingCost + taxAmount;

  return (
    <div className="cart-page-wrapper">
      {/* Header */}
      <div className="cart-header-banner">
        <div className="container">
          <span className="cart-subtitle">YOUR BAG</span>
          <h1 className="cart-title">Shopping Cart</h1>
        </div>
      </div>

      <div className="container section-padding">
        {cart.length === 0 ? (
          <div className="empty-cart-state text-center">
            <div className="empty-cart-icon-wrapper">
              <ShoppingBag size={48} />
            </div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any luxury pieces to your bag yet.</p>
            <Link to="/shop" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* List items Col */}
            <div className="cart-items-column">
              <div className="cart-items-header">
                <span>Product</span>
                <span className="hide-mobile">Price</span>
                <span>Quantity</span>
                <span className="text-right">Total</span>
              </div>

              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.product.id} className="cart-item-row">
                    {/* Info */}
                    <div className="cart-item-info">
                      <div className="cart-item-img-container">
                        <img src={item.product.image1} alt={item.product.name} />
                      </div>
                      <div className="cart-item-details">
                        <Link to={`/product/${item.product.id}`} className="cart-item-name">
                          {item.product.name}
                        </Link>
                        <span className="cart-item-category">{item.product.category}</span>
                        <span className="show-mobile mobile-item-price">{formatPrice(item.product.price)}</span>
                      </div>
                    </div>

                    {/* Price (desktop) */}
                    <div className="cart-item-price-unit hide-mobile">
                      {formatPrice(item.product.price)}
                    </div>

                    {/* Qty */}
                    <div className="cart-item-qty">
                      <div className="cart-qty-picker">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                        <input type="text" value={item.quantity} readOnly />
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="cart-item-subtotal-action">
                      <span className="item-subtotal-price">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <button
                        className="delete-item-btn"
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code area */}
              <div className="cart-promo-container">
                <form onSubmit={handleApplyPromo} className="promo-form">
                  <input
                    type="text"
                    placeholder="Enter promo code (e.g. WELCOME10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                  />
                  <button type="submit" className="btn btn-outline" disabled={promoApplied}>
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </form>
                {promoError && <p className="promo-error">{promoError}</p>}
                {promoApplied && (
                  <p className="promo-success">
                    Promo code WELCOME10 applied successfully! You saved 10% on your luxury order.
                  </p>
                )}
              </div>
            </div>

            {/* Pricing Summary Col */}
            <div className="cart-summary-column">
              <div className="summary-card">
                <h3>Order Summary</h3>
                
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Discount (10%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Estimated Shipping</span>
                  <span>{shippingCost === 0 ? 'Complimentary' : formatPrice(shippingCost)}</span>
                </div>
                {shippingCost > 0 && (
                  <p className="shipping-hint">Add {formatPrice(40000 - cartSubtotal)} more for Complimentary Shipping</p>
                )}

                <div className="summary-row">
                  <span>Estimated Tax (8%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>

                <Link
                  to="/checkout"
                  state={{ discount: appliedDiscount }}
                  className="btn btn-primary proceed-btn"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                </Link>

                <p className="summary-terms">
                  Taxes and shipping are calculated at checkout. Secure SSL Encrypted checkout transaction.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;