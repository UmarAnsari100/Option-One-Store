import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  Globe, 
  Sparkles, 
  Compass, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Star
} from 'lucide-react';
import './Brands.css';

// Rich mock data for Luxury Brands
const BRANDS_DATA = [
  {
    id: 1,
    name: 'Rolex',
    origin: 'Switzerland',
    category: 'Watches',
    description: 'The absolute standard of prestige, precision, and timeless horological excellence.',
    productsCount: 42,
    popularity: 9.8,
    logo: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=300&auto=format&fit=crop',
    founded: '1905',
    headline: 'Prestige & Chronometric Precision'
  },
  {
    id: 2,
    name: 'Cartier',
    origin: 'France',
    category: 'Jewelry',
    description: 'King of Jewellers and Jeweller of Kings, crafting exquisite ornaments and luxury timepieces.',
    productsCount: 35,
    popularity: 9.6,
    logo: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=300&auto=format&fit=crop',
    founded: '1847',
    headline: 'The Art of Exquisite Ornaments'
  },
  {
    id: 3,
    name: 'Dior',
    origin: 'France',
    category: 'Fashion',
    description: 'Pioneering high-fashion maison redefining luxury tailoring, accessories, and modern aesthetics.',
    productsCount: 56,
    popularity: 9.5,
    logo: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=300&auto=format&fit=crop',
    founded: '1946',
    headline: 'Defining Modern Haute Couture'
  },
  {
    id: 4,
    name: 'Chanel',
    origin: 'France',
    category: 'Fashion',
    description: 'The epitome of timeless elegance, luxury handbags, classic suits, and legendary fragrances.',
    productsCount: 48,
    popularity: 9.7,
    logo: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=300&auto=format&fit=crop',
    founded: '1910',
    headline: 'Timeless Elegance & Absolute Style'
  },
  {
    id: 5,
    name: 'Louis Vuitton',
    origin: 'France',
    category: 'Leather Goods',
    description: 'Iconic trunks and luggage maker, now a global giant of luxury monogram accessories and apparel.',
    productsCount: 65,
    popularity: 9.9,
    logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300&auto=format&fit=crop',
    founded: '1854',
    headline: 'The Legend of Travel Monograms'
  },
  {
    id: 6,
    name: 'Gucci',
    origin: 'Italy',
    category: 'Fashion',
    description: 'Bold, modern, and eclectic Italian luxury fashion house blending heritage with contemporary pop culture.',
    productsCount: 51,
    popularity: 9.3,
    logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=300&auto=format&fit=crop',
    founded: '1921',
    headline: 'Eclectic Italian Glamour'
  },
  {
    id: 7,
    name: 'Prada',
    origin: 'Italy',
    category: 'Fashion',
    description: 'Avant-garde design, intellectual luxury, and refined collections of premium Saffiano leather and nylon.',
    productsCount: 39,
    popularity: 9.2,
    logo: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=300&auto=format&fit=crop',
    founded: '1913',
    headline: 'Intellectual Luxury & Avant-Garde'
  },
  {
    id: 8,
    name: 'Hermès',
    origin: 'France',
    category: 'Leather Goods',
    description: 'Ultra-exquisite craftsmanship, handmade Birkin & Kelly bags, and premium silk scarves.',
    productsCount: 22,
    popularity: 9.9,
    logo: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=300&auto=format&fit=crop',
    founded: '1837',
    headline: 'The Zenith of Handcrafted Luxury'
  },
  {
    id: 9,
    name: 'Saint Laurent',
    origin: 'France',
    category: 'Fashion',
    description: 'Chic Parisian elegance, luxury tailoring, rock-and-roll attitude, and refined leather accessories.',
    productsCount: 34,
    popularity: 9.1,
    logo: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=300&auto=format&fit=crop',
    founded: '1961',
    headline: 'Chic Parisian Tailoring'
  },
  {
    id: 10,
    name: 'Tiffany & Co.',
    origin: 'USA',
    category: 'Jewelry',
    description: 'The legendary jeweler of blue boxes, sterling silver luxury, and glamorous diamonds.',
    productsCount: 28,
    popularity: 9.4,
    logo: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=300&auto=format&fit=crop',
    founded: '1837',
    headline: 'The Romance of New York Diamonds'
  }
];

// Spotlight Curated Brand Details
const SPOTLIGHT_BRAND = {
  name: 'Rolex',
  founded: '1905',
  origin: 'Geneva, Switzerland',
  tagline: 'A crown for every achievement.',
  image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=1200&auto=format&fit=crop',
  story: 'Rolex was founded in London in 1905 by Hans Wilsdorf and Alfred Davis, later relocating to Geneva in 1919. Rolex pioneered the waterproof wristwatch ("Oyster") and the self-winding rotor mechanism. Today, it stands as the global emblem of quiet luxury, engineering mastery, and social prestige, preserving watchmaking heritage with unmatched mechanical longevity.',
  timeline: [
    { year: '1905', event: 'Hans Wilsdorf launches the watchmaking company in London.' },
    { year: '1926', event: 'Creation of the Oyster, the first waterproof wristwatch.' },
    { year: '1931', event: 'Patenting of the self-winding Perpetual rotor mechanism.' },
    { year: '1953', event: 'The Submariner dive watch is unveiled, conquering deep-sea frontiers.' },
    { year: '2026', event: 'Option One is designated as an elite curated digital retail partner.' }
  ],
  collections: [
    { name: 'Oyster Perpetual', desc: 'The purest expression of the Oyster concept.' },
    { name: 'Submariner', desc: 'The archetype of the divers’ watch.' },
    { name: 'Cosmograph Daytona', desc: 'Designed to meet the demands of professional racing drivers.' }
  ]
};

// Available categories with visual metrics
const CATEGORIES_DATA = [
  { name: 'Fashion', count: '146 Products', icon: '👔' },
  { name: 'Watches', count: '98 Products', icon: '⌚' },
  { name: 'Jewelry', count: '63 Products', icon: '💎' },
  { name: 'Leather Goods', count: '87 Products', icon: '💼' }
];

const alphabets = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

const Brands = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOrigin, setSelectedOrigin] = useState('All');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [visibleBrandsCount, setVisibleBrandsCount] = useState(8);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Filtered and sorted brands list
  const filteredBrands = useMemo(() => {
    let result = [...BRANDS_DATA];

    if (searchQuery.trim() !== '') {
      result = result.filter(brand => 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        brand.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(brand => brand.category === selectedCategory);
    }

    if (selectedOrigin !== 'All') {
      result = result.filter(brand => brand.origin === selectedOrigin);
    }

    if (selectedLetter !== 'All') {
      result = result.filter(brand => brand.name.startsWith(selectedLetter));
    }

    if (sortBy === 'popular') {
      result.sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === 'az') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchQuery, selectedCategory, selectedOrigin, selectedLetter, sortBy]);

  const uniqueOrigins = useMemo(() => {
    const list = BRANDS_DATA.map(b => b.origin);
    return ['All', ...Array.from(new Set(list))];
  }, []);

  const uniqueCategories = useMemo(() => {
    const list = BRANDS_DATA.map(b => b.category);
    return ['All', ...Array.from(new Set(list))];
  }, []);

  const loadMore = () => {
    setVisibleBrandsCount(prev => Math.min(prev + 4, filteredBrands.length));
  };

  return (
    <div className="brands-page-wrapper">
      
      {/* Editorial Hero Section */}
      <section className="brands-hero-section">
        <div className="brands-hero-bg-gradients">
          <div className="gradient-sphere sphere-1"></div>
          <div className="gradient-sphere sphere-2"></div>
        </div>
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="editorial-badge">
              <Sparkles size={12} className="sparkle-icon" />
              <span>THE CURATED CHRONICLE</span>
            </div>
            <h1 className="brands-headline">Curated Luxury Houses</h1>
            <p className="brands-subheading">
              Step into a digital gallery of luxury. Every partner house is handpicked for its commitment to heritage, craftsmanship, and quiet sophistication.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky Search & Multi-Filters Panel */}
      <section className="filters-outer-container">
        <div className="container">
          <div className="sticky-filter-bar">
            
            {/* Search Input */}
            <div className="filter-search-box">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search designer houses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Selector Fields */}
            <div className="filter-dropdowns">
              <div className="select-wrapper">
                <SlidersHorizontal size={14} className="select-icon" />
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter by Category"
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="select-wrapper">
                <Globe size={14} className="select-icon" />
                <select 
                  value={selectedOrigin} 
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  aria-label="Filter by Origin"
                >
                  <option value="All">All Origins</option>
                  {uniqueOrigins.filter(o => o !== 'All').map(origin => (
                    <option key={origin} value={origin}>{origin}</option>
                  ))}
                </select>
              </div>

              <div className="select-wrapper">
                <TrendingUp size={14} className="select-icon" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort Brands"
                >
                  <option value="popular">Most Popular</option>
                  <option value="az">A-Z Name</option>
                </select>
              </div>
            </div>

          </div>

          {/* Alphabetical Quick Links */}
          <div className="alphabet-selector-bar">
            <span className="alphabet-label">A-Z Navigation</span>
            <div className="alphabet-grid">
              {alphabets.map((letter) => (
                <button
                  key={letter}
                  className={`alphabet-btn ${selectedLetter === letter ? 'active' : ''}`}
                  onClick={() => setSelectedLetter(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Brands Grid */}
      <section className="featured-brands-section">
        <div className="container">
          <div className="section-header-editorial">
            <h2>Maison Showcase</h2>
            <p>Direct collections from the world’s elite creative ateliers.</p>
          </div>

          <div className="brands-cards-grid">
            <AnimatePresence mode="popLayout">
              {filteredBrands.slice(0, visibleBrandsCount).map((brand, index) => (
                <motion.div
                  key={brand.id}
                  className="brand-glass-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8, scale: 1.01 }}
                >
                  <div className="brand-card-img-wrapper">
                    <img 
                      src={brand.logo} 
                      alt={brand.name} 
                      className="brand-card-img" 
                      loading="lazy"
                    />
                    <div className="brand-card-origin">
                      <Globe size={11} />
                      <span>{brand.origin}</span>
                    </div>
                  </div>

                  <div className="brand-card-body">
                    <div className="brand-card-category-row">
                      <span className="brand-category-badge">{brand.category}</span>
                      <span className="brand-founded-text">Est. {brand.founded}</span>
                    </div>
                    <h3 className="brand-card-title">{brand.name}</h3>
                    <p className="brand-card-desc">{brand.description}</p>
                    
                    <div className="brand-card-footer">
                      <span className="products-available-label">{brand.productsCount} Available Items</span>
                      <Link to={`/shop?brand=${brand.name}`} className="brand-explore-btn">
                        <span>Explore</span>
                        <ChevronRight size={14} className="arrow-icon" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No results placeholder */}
          {filteredBrands.length === 0 && (
            <motion.div 
              className="no-brands-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Compass size={40} className="no-results-icon" />
              <h3>No Luxury Houses Found</h3>
              <p>We couldn't find any partner brands matching your search filter options.</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedOrigin('All');
                  setSelectedLetter('All');
                }}
              >
                Reset Search Filters
              </button>
            </motion.div>
          )}

          {/* Load More Button */}
          {filteredBrands.length > visibleBrandsCount && (
            <div className="load-more-brands-container">
              <button className="load-more-btn" onClick={loadMore}>
                Show More Luxury Houses
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Brand Spotlight Editorial Section */}
      <section className="brand-spotlight-section">
        <div className="container">
          <div className="spotlight-grid">
            
            {/* Visual Column */}
            <div className="spotlight-visual-col">
              <div className="spotlight-image-wrapper">
                <img 
                  src={SPOTLIGHT_BRAND.image} 
                  alt={SPOTLIGHT_BRAND.name} 
                  className="spotlight-img"
                  loading="lazy"
                />
                <div className="spotlight-overlay"></div>
                <div className="spotlight-card-floating">
                  <Star size={18} fill="var(--color-accent)" color="var(--color-accent)" />
                  <div>
                    <h4>Maison of the Month</h4>
                    <p>{SPOTLIGHT_BRAND.name} Atelier</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Story Column */}
            <div className="spotlight-content-col">
              <div className="spotlight-header">
                <span className="spotlight-badge">Designer Spotlight</span>
                <h2>{SPOTLIGHT_BRAND.name} Geneva</h2>
                <p className="spotlight-tagline">"{SPOTLIGHT_BRAND.tagline}"</p>
              </div>

              <div className="spotlight-story-body">
                <p className="story-paragraph">{SPOTLIGHT_BRAND.story}</p>
                
                <h4 className="timeline-title">Heritage Milestones</h4>
                <div className="heritage-timeline">
                  {SPOTLIGHT_BRAND.timeline.map((item, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <span className="timeline-year">{item.year}</span>
                        <p className="timeline-event">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="spotlight-cta-container">
                  <Link to={`/shop?brand=${SPOTLIGHT_BRAND.name}`} className="spotlight-cta-btn">
                    <span>Explore {SPOTLIGHT_BRAND.name} Collection</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Grayscale Logo Wall */}
      <section className="brand-wall-section">
        <div className="container text-center">
          <div className="section-header-editorial text-center">
            <h2>The Luxury Directory</h2>
            <p>Our curated global list of authenticated creators.</p>
          </div>

          <div className="logo-wall-grid">
            {BRANDS_DATA.map((brand) => (
              <div key={brand.id} className="logo-wall-item">
                <span className="logo-text-wall">{brand.name}</span>
                <span className="logo-wall-origin">{brand.origin}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section className="category-browse-section">
        <div className="container">
          <div className="section-header-editorial text-center">
            <h2>Browse Collections</h2>
            <p>Explore luxury segments directly curated for you.</p>
          </div>

          <div className="category-browse-grid">
            {CATEGORIES_DATA.map((cat, idx) => (
              <Link 
                to={`/shop?category=${cat.name.toLowerCase()}`}
                key={idx}
                className="category-browse-card"
              >
                <div className="category-browse-icon-wrapper">
                  <span className="category-icon-emoji">{cat.icon}</span>
                </div>
                <div className="category-browse-meta">
                  <h3>{cat.name}</h3>
                  <span>{cat.count}</span>
                </div>
                <div className="category-browse-arrow">
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Brands;
