import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Globe,
  ShieldCheck,
  Truck,
  Award,
  Lock,
  ArrowRight
} from 'lucide-react';
import SocialFeed from '../SocialFeed/SocialFeed';
import './Footer.css';

// Inline SVGs to guarantee build stability across Lucide versions
const Instagram = ({ size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = ({ size = 18, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = ({ size = 18, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const TikTok = ({ size = 18, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.3 6.3 0 0 0 1.95-4.46V8.04a8.2 8.2 0 0 0 4.82 1.57V6.16c-.33 0-.67-.03-1-.07z" />
  </svg>
);

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer-section">
      {/* Instagram Curated Lifestyle Feed */}
      <SocialFeed />

      <div className="container">
        {/* Trust Badges */}
        <div className="footer-trust-badges">
          <div className="badge-item">
            <Award size={24} />
            <div>
              <h5>100% Certified Authentic</h5>
              <p>Direct designer house partnerships</p>
            </div>
          </div>
          <div className="badge-item">
            <Truck size={24} />
            <div>
              <h5>Insured Shipping</h5>
              <p>Complimentary white-glove transport</p>
            </div>
          </div>
          <div className="badge-item">
            <Lock size={24} />
            <div>
              <h5>SSL Protected Checkout</h5>
              <p>Fully encrypted transactions</p>
            </div>
          </div>
        </div>

        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-text">Option</span>
              <span className="logo-text-one">One</span>
            </Link>
            <p className="footer-desc">
              Curating the world's most exquisite accessories for the modern individual who demands nothing less than perfection.
            </p>

            {/* Email Support */}
            <div className="email-support">
              <Mail size={16} className="email-icon" />
              <a href="mailto:support@optiononestore.com" className="email-link">
                support@optiononestore.com
              </a>
            </div>

            <div className="social-links">
              <a href="https://www.instagram.com/option_one_store/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" className="social-link" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" className="social-link" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" className="social-link" aria-label="TikTok"><TikTok size={18} /></a>
            </div>
          </div>

          {/* Links Column: Shop */}
          <div className="footer-col">
            <h5 className="footer-heading">SHOP ATELIER</h5>
            <ul className="footer-links">
              <li><Link to="/shop?category=watches">Luxury Watches</Link></li>
              <li><Link to="/shop?category=jewelry">Fine Jewelry</Link></li>
              <li><Link to="/shop?category=bags">Designer Bags</Link></li>
              <li><Link to="/shop?category=automotive">Automotive Upgrades</Link></li>
              <li><Link to="/shop?category=electronics">Premium Electronics</Link></li>
              <li><Link to="/shop?category=audio">Acoustic Audio</Link></li>
            </ul>
          </div>

          {/* Links Column: Services */}
          <div className="footer-col">
            <h5 className="footer-heading">SERVICES</h5>
            <ul className="footer-links">
              <li><Link to="/account">Customer Account</Link></li>
              <li><Link to="/admin">Admin Control Center</Link></li>
              <li><Link to="/contact">Private Concierge</Link></li>
              <li><Link to="/compare">Compare Pieces</Link></li>
              <li><Link to="/wishlist">My Favorites</Link></li>
            </ul>
          </div>

          {/* Links Column: Newsletter */}
          <div className="footer-col footer-newsletter-col">
            <h5 className="footer-heading">Maison Newsletter</h5>
            <p className="newsletter-text">Subscribe to receive private sale invitations, limited edition releases, and horology updates.</p>
            {subscribed ? (
              <div className="newsletter-success-box">
                <ShieldCheck size={16} />
                <span>Subscription confirmed. Welcome.</span>
              </div>
            ) : (
              <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" aria-label="Subscribe">
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Bottom (selectors, copy, payments) */}
        <div className="footer-bottom">
          <div className="footer-selectors">
            <div className="selector-box">
              <Globe size={13} />
              <select aria-label="Select Country">
                <option value="PK">Pakistan (PKR)</option>
              </select>
            </div>

            <div className="selector-box">
              <select aria-label="Select Language">
                <option value="en">English</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>
          </div>

          <p className="copyright-text">&copy; {new Date().getFullYear()} Option One Store. All rights reserved. Quiet Luxury Horology.</p>

          <div className="payment-methods">
            <span className="secure-badge-bottom">SECURED CHECKOUT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;