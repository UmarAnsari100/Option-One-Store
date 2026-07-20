import React from 'react';
import './PromoBanner.css';

const PromoBanner = () => {
  return (
    <section className="promo-banner-section section-padding">
      <div className="container">
        <div className="promo-banner-card">
          <div className="promo-background"></div>
          <div className="promo-content">
            <span className="promo-subtitle">SHOP THE EVENT</span>
            <h2 className="promo-title">Exclusive Summer Collection</h2>
            <p className="promo-desc">
              Sign up today and get access to the limited run accessories crafted for the bold. Secure yours before they are gone forever.
            </p>
            <div className="promo-actions">
              <button className="btn btn-primary">Shop The Event</button>
              <button className="btn btn-outline" style={{ borderColor: 'var(--color-white)', color: 'var(--color-white)' }}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
