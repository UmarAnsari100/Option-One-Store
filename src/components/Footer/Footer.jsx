import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Globe,
  Heart,
  ShieldCheck,
  Truck,
  Award,
  Lock,
  ArrowRight
} from 'lucide-react';
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

  const lifestyleGallery = [
    { id: 1, img: 'https://img.drz.lazcdn.com/static/pk/p/bfb18a56816da1d1bd822744707ab910.jpg_400x400q75.avif', name: 'Maison Chronometers', category: 'watches', sizeClass: 'grid-wide' },
    { id: 2, img: 'https://img.drz.lazcdn.com/static/pk/p/da2b0a487a9e2288602dea559feb24c4.jpg_400x400q75.avif', name: 'Atelier Bags', category: 'bags', sizeClass: 'grid-tall' },
    { id: 3, img: 'https://img.drz.lazcdn.com/g/kf/S04eeb9c30f874373915dbb9c96e56af7C.jpg_400x400q75.avif', name: 'Refined Jewelry', category: 'jewelry', sizeClass: 'grid-small' },
    { id: 4, img: 'https://img.drz.lazcdn.com/static/pk/p/37042bab3e8ae19ac73768377283b1b4.jpg_400x400q75.avif', name: 'Audio Essentials', category: 'audio', sizeClass: 'grid-small' },
    { id: 5, img: 'https://img.drz.lazcdn.com/static/pk/p/ecaeefdce1b44e327ce7141b0e40434b.jpg_400x400q75.avif', name: 'Premium Electronics', category: 'electronics', sizeClass: 'grid-wide' },
    { id: 6, img: 'https://img.drz.lazcdn.com/static/pk/p/e297e57509692948907c22e2972dc56c.jpg_400x400q75.avif', name: 'Automotive Upgrades', category: 'automotive', sizeClass: 'grid-small' },
    { id: 7, img: 'https://img.drz.lazcdn.com/static/pk/p/be750acc45745acc0ea1643acda62dcf.jpg_400x400q75.avif', name: 'Atelier Timepieces', category: 'watches', sizeClass: 'grid-small' }
  ];

  return (
    <footer className="footer-section">
      {/* Luxury Lifestyle Gallery */}
      <div className="footer-lifestyle-gallery">
        <div className="lifestyle-gallery-header text-center">
          <span className="lifestyle-subtitle">CURATED COLLECTION</span>
          <h3>Experience the Option One Lifestyle</h3>
          <p>Discover carefully selected luxury pieces designed for timeless elegance and modern living.</p>
        </div>

        <div className="lifestyle-grid">
          {lifestyleGallery.map((item) => (
            <Link
              to={`/shop?category=${item.category}`}
              className={`lifestyle-grid-item ${item.sizeClass}`}
              key={item.id}
            >
              <img src={item.img} alt={item.name} className="lifestyle-img" />
              <div className="lifestyle-overlay">
                <div className="lifestyle-overlay-content">
                  <h4>{item.name}</h4>
                  <span className="explore-link-text">Explore Collection →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

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
              <li><Link to="/contact">Private Concierge</Link></li>
              <li><Link to="/compare">Compare Pieces</Link></li>
              <li><Link to="/wishlist">My Favorites</Link></li>
              <li><Link to="/shipping">Shipping & Returns</Link></li>
              <li><Link to="/store-locator">Boutique Finder</Link></li>
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