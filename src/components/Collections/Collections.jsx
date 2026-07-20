import React from 'react';
import { Link } from 'react-router-dom';
import './Collections.css';

const Collections = () => {
  return (
    <section className="collections-section section-padding">
      <div className="container">
        {/* Collection 1: Executive Collection */}
        <div className="collection-row">
          <div className="collection-image-col">
            <img 
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop" 
              alt="Executive Collection" 
              className="collection-img"
              loading="lazy"
            />
          </div>
          <div className="collection-content-col">
            <div className="collection-text-wrapper">
              <span className="collection-subtitle">FOR HIM / ALL</span>
              <h2 className="collection-title">The Executive Collection</h2>
              <p className="collection-desc">
                Engineered for the boardroom and beyond. Our Executive Collection combines unmatched durability with a classic aesthetic that commands respect.
              </p>
              <Link to="/shop?collection=executive" className="collection-cta">EXPLORE COLLECTION</Link>
            </div>
          </div>
        </div>

        {/* Collection 2: Modern Classics */}
        <div className="collection-row reverse">
          <div className="collection-image-col">
            <img 
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop" 
              alt="Modern Classics" 
              className="collection-img"
              loading="lazy"
            />
          </div>
          <div className="collection-content-col">
            <div className="collection-text-wrapper">
              <span className="collection-subtitle">FOR HER / PIECES</span>
              <h2 className="collection-title">Timeless Classics</h2>
              <p className="collection-desc">
                Designed to transcend seasons. These pieces are crafted to be passed down through generations, ensuring with you while remaining forever in style.
              </p>
              <Link to="/shop?collection=classics" className="collection-cta">DISCOVER MORE</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Collections;