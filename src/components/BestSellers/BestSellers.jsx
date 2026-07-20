import React, { useContext } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { ShopContext } from '../../context/ShopContext';
import './BestSellers.css';

const BestSellers = () => {
  const { products } = useContext(ShopContext);
  
  // Dynamic slice of first 4 items as best sellers
  const bestSellers = products.slice(0, 4);

  return (
    <section className="best-sellers-section section-padding">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Curated Best Sellers</h2>
          <p className="section-desc">Our most coveted pieces, meticulously handpicked. A harmonious blend of design and purpose for your everyday style.</p>
        </div>

        <div className="products-grid">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;

