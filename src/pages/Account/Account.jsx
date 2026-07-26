import React, { useState, useContext } from 'react';
import SEO from '../../components/SEO/SEO';
import { seoService } from '../../services/seoService';
import { ShopContext } from '../../context/ShopContext';
import { formatPrice } from '../../utils/formatter';
import { cjApi } from '../../services/cjApi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  Heart,
  MapPin,
  Clock,
  Printer,
  Truck,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Mail,
  Phone,
  Plus,
  X,
  Check
} from 'lucide-react';
import './Account.css';

const Account = () => {
  const {
    customerUser,
    loginCustomer,
    registerCustomer,
    logoutCustomer,
    orders,
    wishlist,
    recentlyViewed,
    showToast
  } = useContext(ShopContext);

  const [mode, setMode] = useState('login'); // 'login', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Active Customer Portal Tab
  const [activeAccountTab, setActiveAccountTab] = useState('orders'); // 'orders', 'addresses', 'wishlist', 'recently', 'security'

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([
    { id: 1, label: 'Primary Residence', name: 'Haris Khan', street: 'House 42, Block C, Gulberg III', city: 'Lahore', zip: '54000', country: 'Pakistan', isDefault: true }
  ]);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Office / Secondary', name: '', street: '', city: '', zip: '', country: 'Pakistan' });

  // Tracking Modal State
  const [activeTrackingModal, setActiveTrackingModal] = useState(null);
  const [isFetchingTracking, setIsFetchingTracking] = useState(false);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      loginCustomer(email, password);
    } else {
      registerCustomer(name, email, phone, password);
    }
  };

  const handleDemoLogin = (type = 'customer') => {
    if (type === 'customer') {
      setEmail('customer@optiononestore.com');
      setPassword('Customer@2026!');
      loginCustomer('customer@optiononestore.com', 'Customer@2026!');
    }
  };

  const handleFetchTracking = async (trackingNum, orderId) => {
    setIsFetchingTracking(true);
    try {
      const res = await cjApi.getTrackingInfo(trackingNum, orderId);
      if (res.tracking) {
        setActiveTrackingModal(res.tracking);
      } else {
        showToast('Tracking info is being updated by courier', 'warning');
      }
    } catch (e) {
      showToast('Could not fetch tracking info', 'error');
    } finally {
      setIsFetchingTracking(false);
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city) return;
    setSavedAddresses([...savedAddresses, { ...newAddress, id: Date.now() }]);
    setShowAddAddressModal(false);
    showToast('Saved new delivery address');
  };

  const myOrders = orders.filter((o) => o.customerEmail?.toLowerCase() === customerUser?.email?.toLowerCase() || !o.customerEmail);

  if (!customerUser) {
    return (
      <div className="account-auth-page">
        <SEO
          title="Sign In / Register Customer Account | Option One Store"
          description="Access your Option One Store customer portal to view order history, saved addresses, wishlist favorites, and package tracking."
          canonical="https://optiononestore.com/account"
          jsonLd={seoService.getBreadcrumbSchema([{ name: 'Customer Account', path: '/account' }])}
        />
        <div className="container">
          <motion.div
            className="account-auth-card glass-panel shadow-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Brand */}
            <div className="text-center auth-header">
              <div className="auth-brand-badge">
                <Sparkles size={20} color="var(--color-primary)" />
                <span>OPTION ONE STORE</span>
              </div>
              <h2>{mode === 'login' ? 'Sign In to Your Account' : 'Create Luxury Account'}</h2>
              <p className="subtitle">Maison de Luxe Private Access</p>
            </div>

            {/* Auth Toggle Tabs */}
            <div className="auth-toggle-tabs">
              <button
                className={`toggle-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
              >
                Sign In
              </button>
              <button
                className={`toggle-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => setMode('register')}
              >
                Create Account
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleAuthSubmit} className="auth-form">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="form-group icon-input-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="e.g. Haris Khan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group icon-input-group">
                    <label>Phone Number</label>
                    <div className="input-wrapper">
                      <Phone size={18} className="input-icon" />
                      <input
                        type="tel"
                        placeholder="+92 300 1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="form-group icon-input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="customer@optiononestore.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group icon-input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="form-options-row">
                  <label className="remember-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block shadow-btn">
                {mode === 'login' ? 'Sign In to Account' : 'Register Customer Account'}
              </button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="demo-access-divider">
              <span>Quick Demo Sign In</span>
            </div>

            <div className="demo-buttons-grid">
              <button
                type="button"
                className="btn btn-secondary btn-sm btn-block"
                onClick={() => handleDemoLogin('customer')}
              >
                Sign In as Customer Demo
              </button>
            </div>

            <div className="auth-footer-note text-center">
              <p><small><ShieldCheck size={14} /> 256-Bit SSL Encrypted & Secure Authentication</small></p>
            </div>
          </motion.div>
        </div>

        {/* Forgot Password Modal */}
        <AnimatePresence>
          {showForgotModal && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="modal-card glass-panel animate-scale">
                <div className="modal-header">
                  <h3>Reset Your Password</h3>
                  <button onClick={() => setShowForgotModal(false)} className="close-btn"><X size={18} /></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted">Enter your email address and we will send you a password reset link.</p>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowForgotModal(false)}>Cancel</button>
                  <button
                    className="btn btn-primary shadow-btn"
                    onClick={() => {
                      showToast(`Password reset link sent to ${forgotEmail || 'your email'}`);
                      setShowForgotModal(false);
                    }}
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="customer-account-page">
      <div className="container">
        {/* Account Banner */}
        <motion.div
          className="account-banner glass-panel"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="user-profile-info">
            <div className="avatar-circle">
              {customerUser.name ? customerUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2>{customerUser.name || 'Valued Member'}</h2>
              <p className="text-muted">{customerUser.email}</p>
              <span className="member-tier-badge">Maison Preferred Member</span>
            </div>
          </div>
          <button className="btn btn-outline shadow-btn" onClick={logoutCustomer}>
            <LogOut size={16} /> Sign Out
          </button>
        </motion.div>

        {/* Account Tabs & Dashboard */}
        <div className="account-grid" style={{ marginTop: '2rem' }}>
          <aside className="account-sidebar glass-panel">
            <button className={`account-nav-item ${activeAccountTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveAccountTab('orders')}>
              <Package size={18} /> My Orders ({myOrders.length})
            </button>
            <button className={`account-nav-item ${activeAccountTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveAccountTab('addresses')}>
              <MapPin size={18} /> Saved Addresses ({savedAddresses.length})
            </button>
            <button className={`account-nav-item ${activeAccountTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveAccountTab('wishlist')}>
              <Heart size={18} /> Wishlist ({wishlist.length})
            </button>
            <button className={`account-nav-item ${activeAccountTab === 'recently' ? 'active' : ''}`} onClick={() => setActiveAccountTab('recently')}>
              <Clock size={18} /> Recently Viewed ({recentlyViewed.length})
            </button>
          </aside>

          <main className="account-content">
            {/* ORDERS TAB */}
            {activeAccountTab === 'orders' && (
              <div className="account-pane glass-panel">
                <div className="pane-header-row">
                  <h3>Order History ({myOrders.length})</h3>
                </div>

                {myOrders.length === 0 ? (
                  <div className="empty-state text-center" style={{ padding: '3rem 0' }}>
                    <Package size={48} color="var(--color-primary)" />
                    <h4>No orders recorded yet</h4>
                    <p className="text-muted">Explore our luxury catalog to place your first order.</p>
                    <Link to="/shop" className="btn btn-primary shadow-btn" style={{ marginTop: '1rem' }}>
                      Explore Shop
                    </Link>
                  </div>
                ) : (
                  <div className="orders-list">
                    {myOrders.map((order) => (
                      <div key={order.orderId} className="customer-order-card">
                        <div className="order-header-row">
                          <div>
                            <strong>Order #{order.orderId}</strong>
                            <p className="order-date">{order.orderDate || order.createdAt}</p>
                          </div>
                          <div>
                            <span className="status-badge">{order.status}</span>
                          </div>
                        </div>

                        <div className="order-items-preview">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="item-row">
                              <img src={item.image} alt={item.name} className="item-thumb" />
                              <div className="item-details">
                                <span className="item-name">{item.name}</span>
                                <span className="item-qty">Qty: {item.quantity} × {formatPrice(item.price)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-footer-row">
                          <span>Total Amount: <strong>{formatPrice(order.totalAmount)}</strong></span>
                          <div className="order-actions">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => window.print()}
                            >
                              <Printer size={14} /> Printable Invoice
                            </button>
                            {order.trackingNumber && (
                              <button
                                className="btn btn-primary btn-sm shadow-btn"
                                onClick={() => handleFetchTracking(order.trackingNumber, order.orderId)}
                              >
                                <Truck size={14} /> Track Package
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeAccountTab === 'addresses' && (
              <div className="account-pane glass-panel">
                <div className="pane-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Saved Delivery Addresses</h3>
                  <button className="btn btn-primary btn-sm shadow-btn" onClick={() => setShowAddAddressModal(true)}>
                    <Plus size={16} /> Add Address
                  </button>
                </div>

                <div className="addresses-grid" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} className="address-card glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{addr.label}</strong>
                        {addr.isDefault && <span className="status-badge">Default</span>}
                      </div>
                      <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600 }}>{addr.name}</p>
                      <p style={{ color: '#a0a0ab', fontSize: '0.9rem', margin: '0.25rem 0' }}>{addr.street}</p>
                      <p style={{ color: '#a0a0ab', fontSize: '0.9rem' }}>{addr.city}, {addr.zip}, {addr.country}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeAccountTab === 'wishlist' && (
              <div className="account-pane glass-panel">
                <h3>My Favorites ({wishlist.length})</h3>
                {wishlist.length === 0 ? (
                  <p className="text-muted" style={{ marginTop: '1rem' }}>Your wishlist is currently empty.</p>
                ) : (
                  <div className="wishlist-grid" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    {wishlist.map((item) => (
                      <Link to={`/product/${item.id}`} key={item.id} className="wishlist-card-mini glass-panel" style={{ padding: '1rem', borderRadius: '12px', textDecoration: 'none', color: '#fff' }}>
                        <img src={item.image1} alt={item.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                        <h5 style={{ fontSize: '0.9rem', margin: '0.5rem 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h5>
                        <p style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{formatPrice(item.price)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RECENTLY VIEWED TAB */}
            {activeAccountTab === 'recently' && (
              <div className="account-pane glass-panel">
                <h3>Recently Viewed Items</h3>
                {recentlyViewed.length === 0 ? (
                  <p className="text-muted" style={{ marginTop: '1rem' }}>No recently viewed items.</p>
                ) : (
                  <div className="recently-grid" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                    {recentlyViewed.map((item) => (
                      <Link to={`/product/${item.id}`} key={item.id} className="wishlist-card-mini glass-panel" style={{ padding: '1rem', borderRadius: '12px', textDecoration: 'none', color: '#fff' }}>
                        <img src={item.image1} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                        <h5 style={{ fontSize: '0.85rem', margin: '0.5rem 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h5>
                        <p style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{formatPrice(item.price)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Add Address Modal */}
        {showAddAddressModal && (
          <div className="modal-backdrop">
            <div className="modal-card glass-panel animate-scale">
              <div className="modal-header">
                <h3>Add Delivery Address</h3>
                <button onClick={() => setShowAddAddressModal(false)} className="close-btn"><X size={18} /></button>
              </div>
              <form onSubmit={handleAddAddress} className="modal-body">
                <div className="form-group">
                  <label>Label (e.g. Home, Work)</label>
                  <input type="text" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Recipient Name</label>
                  <input type="text" value={newAddress.name} onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Street Address</label>
                  <input type="text" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Postal Zip Code</label>
                    <input type="text" value={newAddress.zip} onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })} required />
                  </div>
                </div>
                <div className="modal-footer" style={{ marginTop: '1rem', padding: 0 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddAddressModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary shadow-btn">Save Address</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live Shipment Tracking Modal */}
        {activeTrackingModal && (
          <div className="modal-backdrop">
            <div className="modal-card glass-panel animate-scale">
              <div className="modal-header">
                <h3>Shipment Tracking: <strong>{activeTrackingModal.trackingNumber}</strong></h3>
                <button onClick={() => setActiveTrackingModal(null)} className="close-btn"><X size={18} /></button>
              </div>
              <div className="modal-body">
                <p>Courier: <strong>{activeTrackingModal.courier}</strong></p>
                <p>Status: <strong style={{ color: 'var(--color-primary)' }}>{activeTrackingModal.status}</strong></p>
                <div className="tracking-timeline" style={{ marginTop: '1.5rem' }}>
                  {(activeTrackingModal.timeline || []).map((step, i) => (
                    <div key={i} className="timeline-step" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="step-bullet" style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '4px' }}></div>
                      <div>
                        <strong>{step.status}</strong>
                        <p style={{ fontSize: '0.85rem', color: '#a0a0ab', margin: 0 }}>{step.location} • {step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
