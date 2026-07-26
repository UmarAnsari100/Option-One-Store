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
import SEO from '../../components/SEO/SEO';
import { seoService } from '../../services/seoService';
import './Brands.css';

// Rich mock data for Luxury Brands
const BRANDS_DATA = [
  {
    id: 1,
    name: 'OUBAOER',
    origin: 'Guangdong',
    category: 'Watches',
    description: 'Exquisite automatic mechanical timepieces engineered with tourbillon movements.',
    productsCount: 1,
    popularity: 9.8,
    logo: 'https://img.drz.lazcdn.com/static/pk/p/bfb18a56816da1d1bd822744707ab910.jpg_400x400q75.avif',
    founded: '1998',
    headline: 'Tourbillon Mechanical Heritage'
  },
  {
    id: 2,
    name: 'HAIQIN',
    origin: 'Guangdong',
    category: 'Watches',
    description: 'Luxury automatic mechanical watches featuring waterproof tourbillon craftsmanship.',
    productsCount: 1,
    popularity: 9.9,
    logo: 'https://img.drz.lazcdn.com/static/pk/p/be750acc45745acc0ea1643acda62dcf.jpg_400x400q75.avif',
    founded: '2005',
    headline: 'Prestige Mechanical Watches'
  },
  {
    id: 3,
    name: 'Sports Diving',
    origin: 'Japan',
    category: 'Watches',
    description: 'Luxury quartz waterproof sports diving watches crafted with solid stainless steel.',
    productsCount: 1,
    popularity: 9.5,
    logo: 'https://img.drz.lazcdn.com/static/pk/p/e5458024c1a9d817085a611fff449656.jpg_400x400q75.avif',
    founded: '2010',
    headline: 'Sports Timing Utility'
  },
  {
    id: 4,
    name: 'Zircon',
    origin: 'Italy',
    category: 'Jewelry',
    description: 'Designer shiny luxury zircon bracelets and refined ornaments crafted for modern elegance.',
    productsCount: 1,
    popularity: 9.7,
    logo: 'https://img.drz.lazcdn.com/g/kf/S04eeb9c30f874373915dbb9c96e56af7C.jpg_400x400q75.avif',
    founded: '2015',
    headline: 'Refined Beauty'
  },
  {
    id: 5,
    name: 'Fashion Bag',
    origin: 'France',
    category: 'Bags',
    description: 'Premium PU leather handbags, crossbody shoulder bags, and fashion travel bags.',
    productsCount: 1,
    popularity: 9.6,
    logo: 'https://img.drz.lazcdn.com/static/pk/p/da2b0a487a9e2288602dea559feb24c4.jpg_400x400q75.avif',
    founded: '2012',
    headline: 'Modern Elegance'
  },
  {
    id: 6,
    name: 'EcoOBD2',
    origin: 'Germany',
    category: 'Automotive',
    description: 'Innovative chip tuning plug-and-drive diagnostic tools designed to save fuel for petrol and diesel vehicles.',
    productsCount: 1,
    popularity: 9.2,
    logo: 'https://img.drz.lazcdn.com/static/pk/p/e297e57509692948907c22e2972dc56c.jpg_400x400q75.avif',
    founded: '2018',
    headline: 'Engine Performance Tuning'
  },
  {
    id: 7,
    name: 'Gaming',
    origin: 'USA',
    category: 'Electronics',
    description: 'Competitive wired gaming mice designed with responsive optical sensors and customizable RGB backlighting.',
    productsCount: 1,
    popularity: 9.3,
    logo: 'https://img.drz.lazcdn.com/static/pk/p/ecaeefdce1b44e327ce7141b0e40434b.jpg_400x400q75.avif',
    founded: '2016',
    headline: 'Precision eSports Accessories'
  },
  {
    id: 8,
    name: 'UBON',
    origin: 'India',
    category: 'Audio',
    description: 'High-fidelity sound wired earphones with extra bass engineered for immersive acoustic experiences.',
    productsCount: 1,
    popularity: 9.4,
    logo: 'https://img.drz.lazcdn.com/static/pk/p/37042bab3e8ae19ac73768377283b1b4.jpg_400x400q75.avif',
    founded: '2008',
    headline: 'Acoustic Innovation'
  },
  {
    id: 9,
    name: 'M16',
    origin: 'China',
    category: 'Audio',
    description: 'Single pod Bluetooth wireless earbuds featuring advanced noise isolation and clear digital audio.',
    productsCount: 1,
    popularity: 9.1,
    logo: 'https://img.drz.lazcdn.com/static/pk/p/d0f8afb12379f7dec3a88e1ed576d80b.jpg_400x400q75.avif',
    founded: '2020',
    headline: 'True Wireless Mobility'
  }
];

// Spotlight Curated Brand Details
const SPOTLIGHT_BRAND = {
  name: 'OUBAOER',
  founded: '1998',
  origin: 'Guangdong',
  tagline: 'Precision mechanical luxury.',
  image: 'https://img.drz.lazcdn.com/static/pk/p/bfb18a56816da1d1bd822744707ab910.jpg_400x400q75.avif',
  story: 'OUBAOER creates premium automatic mechanical wristwatches for those who command the room. Crafted with tourbillon movements and genuine leather straps, each timepiece is a statement of horological mastery, blending timeless design with contemporary mechanical performance.',
  timeline: [
    { year: '1998', event: 'Atelier launched with a vision for premium automatic movements.' },
    { year: '2012', event: 'Introduction of the signature Tourbillon Leather series.' },
    { year: '2026', event: 'Global expansion of high-end mechanical collections.' }
  ],
  collections: [
    { name: 'Mechanical Automatic', desc: 'Precision mechanical self-winding wristwatches.' },
    { name: 'Tourbillon Leather', desc: 'Classically styled watches featuring genuine leather bands.' }
  ]
};

// Available categories with visual metrics
const CATEGORIES_DATA = [
  { name: 'Watches', count: '3 Products', icon: '⌚' },
  { name: 'Jewelry', count: '1 Product', icon: '💎' },
  { name: 'Bags', count: '1 Product', icon: '👜' },
  { name: 'Automotive', count: '1 Product', icon: '🚗' },
  { name: 'Electronics', count: '1 Product', icon: '💻' },
  { name: 'Audio', count: '2 Products', icon: '🎧' }
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
      <SEO
        title="Designer Houses & Partner Brands | Option One Store"
        description="Explore luxury watches, leather houses, fine jewelry studios, and audio manufacturers partnered with Option One Store."
        canonical="https://optiononestore.com/brands"
        jsonLd={seoService.getBreadcrumbSchema([{ name: 'Designer Brands', path: '/brands' }])}
      />
      
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
