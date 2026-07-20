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
    { id: 1, img: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800&auto=format&fit=crop', name: 'Chronology & Heritage', category: 'watches', sizeClass: 'grid-large' },
    { id: 2, img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop', name: 'Haute Leathercraft', category: 'handbags', sizeClass: 'grid-tall' },
    { id: 3, img: 'https://images.unsplash.com/photo-1599643477874-5c866f466cb5?q=80&w=800&auto=format&fit=crop', name: 'Refined Vermeil', category: 'jewelry', sizeClass: 'grid-small' },
    { id: 4, img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop', name: 'Signature Eyewear', category: 'sunglasses', sizeClass: 'grid-small' },
    { id: 5, img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop', name: 'Maison Aromatics', category: 'fragrances', sizeClass: 'grid-wide' },
    { id: 6, img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop', name: 'Atelier Footwear', category: 'shoes', sizeClass: 'grid-small' },
    { id: 7, img: 'https://images.unsplash.com/photo-1627124703853-3a6639901989?q=80&w=800&auto=format&fit=crop', name: 'Curated Essentials', category: 'accessories', sizeClass: 'grid-small' }
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
              <li><Link to="/shop?category=handbags">Designer Handbags</Link></li>
              <li><Link to="/shop?category=jewelry">Fine Jewelry</Link></li>
              <li><Link to="/shop?category=sunglasses">Sunglasses</Link></li>
              <li><Link to="/shop?category=shoes">Shoes & Footwear</Link></li>
              <li><Link to="/shop?category=fragrances">Fragrances</Link></li>
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