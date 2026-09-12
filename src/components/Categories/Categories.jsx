import React from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

const categories = [
  {
    id: 1,
    title: 'Watches',
    subtitle: 'TIMELESS HERITAGE',
    image: 'https://cf.cjdropshipping.com/cb01749d-a005-45b8-8a8f-ef5fc3d0417f.jpg',
    link: '/shop?category=watches'
  },
  {
    id: 2,
    title: 'Bags',
    subtitle: 'MODERN ELEGANCE',
    image: 'https://oss-cf.cjdropshipping.com/product/2026/09/11/09/48e5a0fc-48f0-4469-9c0e-92923fb33f99.jpg',
    link: '/shop?category=bags'
  },
  {
    id: 3,
    title: 'Jewelry',
    subtitle: 'REFINED BEAUTY',
    image: 'https://cf.cjdropshipping.com/ea5b4ee6-eff3-485f-98ac-d14a7c45a37e.jpg',
    link: '/shop?category=jewelry'
  }
];

const Categories = () => {
  return (
    <section className="categories-section section-padding">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">CATEGORY</span>
          <div className="header-flex">
            <h2 className="section-title">Signature Selections</h2>
            <Link to="/shop" className="view-all-link">View All</Link>
          </div>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link to={category.link} key={category.id} className="category-card">
              <div className="category-image-wrapper">
                <img src={category.image} alt={category.title} className="category-image" loading="lazy" />
                <div className="category-overlay"></div>
              </div>
              <div className="category-content">
                <h3 className="category-title">{category.title}</h3>
                <span className="category-desc">{category.subtitle}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;