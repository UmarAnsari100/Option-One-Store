import React from 'react';
import './Newsletter.css';

const Newsletter = () => {
  return (
    <section className="newsletter-section section-padding">
      <div className="container">
        <div className="newsletter-card">
          <h2 className="newsletter-title">Stay Within The Circle</h2>
          <p className="newsletter-desc">
            Join our exclusive list for early access to new collections, limited releases, and private events in your area.
          </p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" className="newsletter-input" required />
            <button type="submit" className="btn btn-primary newsletter-btn">Subscribe</button>
          </form>
          <span className="newsletter-disclaimer">By subscribing you agree to our Terms & Conditions and Privacy Policy.</span>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;