import React from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

const categories = [
  {
    id: 1,
    title: 'Watches',
    subtitle: 'TIMELESS HERITAGE',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop',
    link: '/shop?category=watches'
  },
  {
    id: 2,
    title: 'Handbags',
    subtitle: 'MODERN ELEGANCE',
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000&auto=format&fit=crop',
    link: '/shop?category=handbags'
  },
  {
    id: 3,
    title: 'Jewelry',
    subtitle: 'REFINED BEAUTY',
    image: 'https://images.unsplash.com/photo-1599643477874-5c866f466cb5?q=80&w=1000&auto=format&fit=crop',
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