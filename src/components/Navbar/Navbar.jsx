import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, Heart, User, ShoppingBag, X, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { ShopContext } from '../../context/ShopContext';
import { fadeDown } from '../../utils/animations';
import './Navbar.css';
import { formatPrice } from '../../utils/formatter';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      return saved ? JSON.parse(saved) : ['Watch', 'Earbuds', 'Bracelet', 'Handbag'];
    } catch {
      return ['Watch', 'Earbuds', 'Bracelet', 'Handbag'];
    }
  });

  const { products, cartCount, wishlist, setIsMiniCartOpen } = useContext(ShopContext);
  
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const searchInputRef = useRef(null);

  // Monitor scroll for transition from transparent to solid blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu or search overlay is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  // Focus search input when overlay opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  // Add search term to history
  const handleSearchSubmit = (term) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [cleanTerm, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });

    setIsSearchOpen(false);
    navigate(`/shop?search=${encodeURIComponent(cleanTerm)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop', hasDropdown: true },
    { name: 'Collections', path: '/shop?collection=executive', hasDropdown: true },
    { name: 'Brands', path: '/brands' },
    { name: 'Blog', path: '/blog' }
  ];

  const isItemActive = (item) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    if (item.path.includes('?')) {
      const [path, query] = item.path.split('?');
      if (location.pathname !== path) return false;
      const queryParams = new URLSearchParams(query);
      const urlParams = new URLSearchParams(location.search);
      for (const [key, val] of queryParams.entries()) {
        if (urlParams.get(key) !== val) return false;
      }
      return true;
    }
    if (item.name === 'Shop') {
      return location.pathname === '/shop' && !location.search;
    }
    return location.pathname.startsWith(item.path);
  };

  // Live filter results for search overlay
  const matchingProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const matchingCategories = searchQuery.trim()
    ? Array.from(
        new Set(
          products
            .filter((p) => p.category.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((p) => p.category)
        )
      ).slice(0, 3)
    : [];

  const matchingBrands = searchQuery.trim()
    ? Array.from(
        new Set(
          products
            .filter((p) => p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((p) => p.brand)
        )
      ).slice(0, 3)
    : [];

  // Trending items to show when search is empty
  const trendingProducts = products.filter((p) => p.rating >= 4.8).slice(0, 3);

  const isHeroPage = location.pathname === '/';

  return (
    <>
      <motion.nav
        className={`navbar ${isScrolled || !isHeroPage ? 'scrolled' : ''} ${isMobileMenuOpen ? 'mobile-nav-active' : ''}`}
        initial="hidden"
        animate="visible"
        variants={fadeDown(shouldReduceMotion)}
      >
        <div className="navbar-container">
          {/* Hamburger (Mobile) */}
          <button
            className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="hamburger-inner">
              <span className="hamburger-line line-1"></span>
              <span className="hamburger-line line-2"></span>
              <span className="hamburger-line line-3"></span>
            </div>
          </button>

          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="logo-text">
              <span className="logo-option">Option</span> <span className="logo-one">One</span>
              <small>Maison de Luxe</small>
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <ul className="navbar-links">
            {navItems.map((item, idx) => {
              const isActive = isItemActive(item);
              return (
                <li key={idx} className={item.hasDropdown ? 'has-dropdown' : ''}>
                  <Link to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                    {item.name}
                    {isActive && !shouldReduceMotion && (
                      <motion.div
                        layoutId="navUnderline"
                        className="active-underline"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Mega Menu Dropdowns */}
                  {item.hasDropdown && (
                    <div className="mega-menu">
                      <div className="mega-menu-container">
                        <div className="mega-menu-grid">
                          {/* Column 1: Shop by Category */}
                          <div className="mega-col">
                            <h4 className="mega-title">Shop By Category</h4>
                            <ul className="mega-links">
                              <li><Link to="/shop?category=watches">Watches</Link></li>
                              <li><Link to="/shop?category=jewelry">Jewelry</Link></li>
                              <li><Link to="/shop?category=bags">Bags</Link></li>
                              <li><Link to="/shop?category=automotive">Automotive</Link></li>
                              <li><Link to="/shop?category=electronics">Electronics</Link></li>
                              <li><Link to="/shop?category=audio">Audio</Link></li>
                            </ul>
                          </div>

                          {/* Column 2: Luxury Houses */}
                          <div className="mega-col">
                            <h4 className="mega-title">Luxury Houses</h4>
                            <ul className="mega-links">
                              <li><Link to="/shop?brand=OUBAOER">OUBAOER</Link></li>
                              <li><Link to="/shop?brand=HAIQIN">HAIQIN</Link></li>
                              <li><Link to="/shop?brand=Sports Diving">Sports Diving</Link></li>
                              <li><Link to="/shop?brand=Zircon">Zircon</Link></li>
                              <li><Link to="/shop?brand=Fashion Bag">Fashion Bag</Link></li>
                              <li><Link to="/shop?brand=EcoOBD2">EcoOBD2</Link></li>
                              <li><Link to="/shop?brand=Gaming">Gaming</Link></li>
                              <li><Link to="/shop?brand=UBON">UBON</Link></li>
                              <li><Link to="/shop?brand=M16">M16</Link></li>
                            </ul>
                          </div>

                          {/* Column 3: Featured Collection banner */}
                          <div className="mega-col mega-featured-col">
                            <h4 className="mega-title">Featured Collection</h4>
                            <div className="mega-featured-card">
                              <img
                                src="https://img.drz.lazcdn.com/static/pk/p/bfb18a56816da1d1bd822744707ab910.jpg_400x400q75.avif"
                                alt="Executive Collection"
                                className="mega-featured-img"
                              />
                              <div className="mega-featured-overlay">
                                <h5>Executive Collection</h5>
                                <p>Sleek design. Command the room.</p>
                                <Link to="/shop?collection=executive" className="mega-btn-arrow">
                                  <span>Shop Editorial</span>
                                  <ArrowRight size={12} />
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Column 4: Product Spotlight */}
                          <div className="mega-col mega-featured-col">
                            <h4 className="mega-title">Product Spotlight</h4>
                            <div className="mega-featured-card">
                              <img
                                src="https://img.drz.lazcdn.com/static/pk/p/be750acc45745acc0ea1643acda62dcf.jpg_400x400q75.avif"
                                alt="HAIQIN Tourbillon"
                                className="mega-featured-img"
                              />
                              <div className="mega-featured-overlay">
                                <span className="highlight-tag">MAISON FAVORITE</span>
                                <h5>HAIQIN Waterproof Tourbillon</h5>
                                <p className="price">Rs. 17,000</p>
                                <Link to="/product/6" className="mega-btn-arrow">
                                  <span>View Piece</span>
                                  <ArrowRight size={12} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Icons Grid */}
          <div className="navbar-icons">
            {/* Search Trigger */}
            <button className="icon-btn" onClick={() => setIsSearchOpen(true)} aria-label="Search">
              <Search size={20} />
            </button>

            {/* Profile / Customer Account */}
            <Link to="/account" className="icon-btn" aria-label="Customer Account" onClick={() => setIsMobileMenuOpen(false)}>
              <User size={20} />
            </Link>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="icon-btn wishlist-btn-nav" aria-label="Wishlist" onClick={() => setIsMobileMenuOpen(false)}>
              <Heart size={20} fill={wishlist.length > 0 ? "var(--color-accent)" : "none"} color={wishlist.length > 0 ? "var(--color-accent)" : "currentColor"} />
              {wishlist.length > 0 && <span className="wishlist-count">{wishlist.length}</span>}
            </Link>

            {/* Slide-out Cart Toggle */}
            <button className="icon-btn cart-btn" onClick={() => setIsMiniCartOpen(true)} aria-label="Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Drawer Backdrop Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Sliding Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mobile-menu-inner">
              <ul className="mobile-menu-links">
                {navItems.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.path}
                      className={`mobile-nav-link ${isItemActive(item) ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/account" className={`mobile-nav-link ${location.pathname === '/account' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    User Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/about" className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    About Us
                  </Link>
                </li>
              </ul>

              <div className="mobile-drawer-footer">
                <p>&copy; {new Date().getFullYear()} Option One Store.</p>
                <p className="footer-tag">Maison of Quiet Luxury</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apple-style Intelligent Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="search-overlay-container">
              {/* Search Bar Input Panel */}
              <div className="search-overlay-header">
                <div className="search-bar-inner">
                  <Search size={22} className="search-icon-large" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search optiononestore.com..."
                    className="search-large-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchSubmit(searchQuery);
                    }}
                  />
                  <button className="search-close-large" onClick={() => setIsSearchOpen(false)} aria-label="Close search">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Suggestions Panel */}
              <div className="search-suggestions-body">
                <div className="container">
                  <div className="search-suggestions-grid">
                    
                    {/* State: Empty Query (Popular, Recent, Trending) */}
                    {!searchQuery.trim() && (
                      <>
                        <div className="suggestions-col">
                          <h5 className="suggestions-title-sec">Quick Links</h5>
                          <ul className="quick-links-list">
                            <li><button onClick={() => handleSearchSubmit('Watches')}>Watches Collection</button></li>
                            <li><button onClick={() => handleSearchSubmit('Handbags')}>Luxury Handbags</button></li>
                            <li><button onClick={() => handleSearchSubmit('Rolex')}>Rolex Watches</button></li>
                            <li><button onClick={() => handleSearchSubmit('Emerald')}>Emerald Jewelry</button></li>
                            <li><button onClick={() => handleSearchSubmit('Sunglasses')}>Sunglasses</button></li>
                          </ul>

                          {recentSearches.length > 0 && (
                            <div className="recent-searches-box">
                              <div className="recent-search-header">
                                <h5 className="suggestions-title-sec">Recent Searches</h5>
                                <button className="clear-recent-btn" onClick={clearRecentSearches}>Clear</button>
                              </div>
                              <ul className="quick-links-list">
                                {recentSearches.map((term, idx) => (
                                  <li key={idx}>
                                    <button onClick={() => handleSearchSubmit(term)}>
                                      <TrendingUp size={12} className="arrow-trend-icon" />
                                      <span>{term}</span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="suggestions-col trending-products-col">
                          <h5 className="suggestions-title-sec">Trending Products</h5>
                          <div className="trending-cards-list">
                            {trendingProducts.map((p) => (
                              <Link
                                to={`/product/${p.id}`}
                                key={p.id}
                                className="search-product-row-card"
                                onClick={() => setIsSearchOpen(false)}
                              >
                                <img src={p.image1} alt={p.name} className="search-card-thumb" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
                                <div className="search-card-info">
                                  <span className="search-card-brand">{p.brand}</span>
                                  <h6 className="search-card-name">{p.name}</h6>
                                </div>
                                <span className="search-card-price">{formatPrice(p.price)}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* State: Active Query Matching */}
                    {searchQuery.trim() && (
                      <>
                        <div className="suggestions-col">
                          {matchingCategories.length > 0 && (
                            <div className="matching-segment">
                              <h5 className="suggestions-title-sec">Suggested Categories</h5>
                              <ul className="quick-links-list">
                                {matchingCategories.map((cat, idx) => (
                                  <li key={idx}>
                                    <Link
                                      to={`/shop?category=${cat}`}
                                      onClick={() => setIsSearchOpen(false)}
                                      className="suggest-link-item"
                                    >
                                      <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                                      <ArrowRight size={12} />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {matchingBrands.length > 0 && (
                            <div className="matching-segment" style={{ marginTop: '2rem' }}>
                              <h5 className="suggestions-title-sec">Suggested Designers</h5>
                              <ul className="quick-links-list">
                                {matchingBrands.map((b, idx) => (
                                  <li key={idx}>
                                    <Link
                                      to={`/shop?brand=${b}`}
                                      onClick={() => setIsSearchOpen(false)}
                                      className="suggest-link-item"
                                    >
                                      <span>{b}</span>
                                      <ArrowRight size={12} />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="suggestions-col">
                          <h5 className="suggestions-title-sec">Suggested Products</h5>
                          
                          {matchingProducts.length === 0 ? (
                            <div className="search-no-results-state">
                              <Sparkles size={28} className="empty-sparkle" />
                              <h6>No designer pieces matched your query</h6>
                              <p>Check spelling, search in categories, or try searching for "Rolex", "Handbag", or "Gold".</p>
                            </div>
                          ) : (
                            <div className="trending-cards-list">
                              {matchingProducts.map((p) => (
                                <Link
                                  to={`/product/${p.id}`}
                                  key={p.id}
                                  className="search-product-row-card"
                                  onClick={() => {
                                    handleSearchSubmit(p.name);
                                    setIsSearchOpen(false);
                                  }}
                                >
                                  <img src={p.image1} alt={p.name} className="search-card-thumb" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
                                  <div className="search-card-info">
                                    <span className="search-card-brand">{p.brand}</span>
                                    <h6 className="search-card-name">{p.name}</h6>
                                  </div>
                                  <span className="search-card-price">{formatPrice(p.price)}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;