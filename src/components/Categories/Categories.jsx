import React from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

const categories = [
  {
    id: 1,
    title: 'Watches',
    subtitle: 'TIMELESS HERITAGE',
    image: 'https://img.drz.lazcdn.com/static/pk/p/bfb18a56816da1d1bd822744707ab910.jpg_400x400q75.avif',
    link: '/shop?category=watches'
  },
  {
    id: 2,
    title: 'Bags',
    subtitle: 'MODERN ELEGANCE',
    image: 'https://img.drz.lazcdn.com/static/pk/p/da2b0a487a9e2288602dea559feb24c4.jpg_400x400q75.avif',
    link: '/shop?category=bags'
  },
  {
    id: 3,
    title: 'Jewelry',
    subtitle: 'REFINED BEAUTY',
    image: 'https://img.drz.lazcdn.com/g/kf/S04eeb9c30f874373915dbb9c96e56af7C.jpg_400x400q75.avif',
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