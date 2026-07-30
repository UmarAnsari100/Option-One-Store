import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import { SlidersHorizontal, Search, X, Star } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';
import SEO from '../../components/SEO/SEO';
import { seoService } from '../../services/seoService';
import { formatPrice } from '../../utils/formatter';
import './Shop.css';

const Shop = () => {
  const { products } = useContext(ShopContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(250000);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Advanced filters state
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [stockStatus, setStockStatus] = useState('all'); // 'all', 'in-stock', 'out-of-stock'
  const [showNewArrivals, setShowNewArrivals] = useState(false);
  const [showBestSellers, setShowBestSellers] = useState(false);

  // Trigger loading skeleton on filter change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [
    selectedCategory,
    maxPrice,
    sortBy,
    selectedBrands,
    selectedColors,
    selectedMaterials,
    selectedGenders,
    selectedCollections,
    minRating,
    stockStatus,
    showNewArrivals,
    showBestSellers,
    searchQuery
  ]);

  // Sync state with URL params on load
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const brand = searchParams.get('brand') || '';
    const collection = searchParams.get('collection') || '';
    
    if (search) setSearchQuery(search);
    if (category) setSelectedCategory(category);
    if (brand) setSelectedBrands((prev) => prev.includes(brand) ? prev : [...prev, brand]);
    if (collection) setSelectedCollections((prev) => prev.includes(collection) ? prev : [...prev, collection]);
  }, [searchParams]);

  // Unique values derived from data
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand))).sort();
  const uniqueColors = Array.from(new Set(products.flatMap((p) => p.colorOptions || []))).sort();
  const uniqueMaterials = Array.from(new Set(products.map((p) => p.material))).sort();
  const uniqueGenders = ['Men', 'Women', 'Unisex'];
  const uniqueCollections = Array.from(new Set(products.map((p) => p.collection))).sort();

  // Handler to clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMaxPrice(250000);
    setSortBy('featured');
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedGenders([]);
    setSelectedCollections([]);
    setMinRating(0);
    setStockStatus('all');
    setShowNewArrivals(false);
    setShowBestSellers(false);
    setSearchParams({});
  };

  // Multi-select toggle helpers
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleMaterial = (material) => {
    setSelectedMaterials((prev) =>
      prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]
    );
  };

  const toggleGender = (gender) => {
    setSelectedGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const toggleCollection = (coll) => {
    setSelectedCollections((prev) =>
      prev.includes(coll) ? prev.filter((c) => c !== coll) : [...prev, coll]
    );
  };

  // Filter and Sort Logic
  const filteredProducts = products
    .filter((product) => {
      // 1. Text Search Query
      const matchesSearch = searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Category Link
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      // 3. Price Slider (taking discount into account)
      const finalPrice = product.price * (1 - product.discount / 100);
      const matchesPrice = finalPrice <= maxPrice;

      // 4. Designer Brands (multi-select)
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);

      // 5. Colors (multi-select)
      const matchesColor = selectedColors.length === 0 || 
        product.colorOptions.some((c) => selectedColors.includes(c));

      // 6. Materials (multi-select)
      const matchesMaterial = selectedMaterials.length === 0 || selectedMaterials.includes(product.material);

      // 7. Genders
      const matchesGender = selectedGenders.length === 0 || selectedGenders.includes(product.gender);

      // 8. Collections
      const matchesCollection = selectedCollections.length === 0 || selectedCollections.includes(product.collection);

      // 9. Customer Rating stars
      const matchesRating = product.rating >= minRating;

      // 10. Availability stock check
      const matchesAvailability = stockStatus === 'all' ||
        (stockStatus === 'in-stock' && product.stock > 0) ||
        (stockStatus === 'out-of-stock' && product.stock === 0);

      // 11. New Arrivals
      const matchesNew = !showNewArrivals || product.badge === 'NEW ARRIVAL';

      // 12. Best Sellers
      const matchesBest = !showBestSellers || product.badge === 'BEST SELLER';

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesBrand &&
        matchesColor &&
        matchesMaterial &&
        matchesGender &&
        matchesCollection &&
        matchesRating &&
        matchesAvailability &&
        matchesNew &&
        matchesBest
      );
    })
    .sort((a, b) => {
      const aPrice = a.price * (1 - a.discount / 100);
      const bPrice = b.price * (1 - b.discount / 100);
      if (sortBy === 'price-low-high') return aPrice - bPrice;
      if (sortBy === 'price-high-low') return bPrice - aPrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default (Featured / ID index)
      return a.id - b.id;
    });

  const pageTitle = selectedCategory !== 'all' ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Collection` : 'Signature Collections & Luxury Catalog';

  return (
    <div className="shop-page-wrapper">
      <SEO
        title={`${pageTitle} | Option One Store`}
        description={`Explore our curated ${selectedCategory !== 'all' ? selectedCategory : 'luxury'} collection featuring designer timepieces, fine jewelry, leather bags, and electronics with worldwide shipping.`}
        canonical={`https://optiononestore.com/shop${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
        jsonLd={seoService.getBreadcrumbSchema([{ name: 'Shop', path: '/shop' }])}
      />
      {/* Header Banner */}
      <div className="shop-hero-header">
        <div className="container">
          <span className="shop-hero-subtitle">ELITE CATALOG</span>
          <h1 className="shop-hero-title">Signature Collections</h1>
        </div>
      </div>

      <div className="container section-padding">
        <div className="shop-layout">
          {/* Sidebar Filters */}
          <aside className={`shop-sidebar ${isMobileFilterOpen ? 'active' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button className="close-filter-btn" onClick={() => setIsMobileFilterOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>

            {/* Clear All Button */}
            <button className="btn btn-outline clear-filters-btn" onClick={handleClearFilters}>
              Reset All Filters
            </button>

            {/* Search */}
            <div className="filter-group">
              <h4 className="filter-title">Search Page</h4>
              <div className="sidebar-search">
                <input
                  type="text"
                  placeholder="Search brand, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="search-icon" />
              </div>
            </div>

            {/* Categories */}
            <div className="filter-group">
              <h4 className="filter-title">Categories</h4>
              <ul className="category-list">
                {['all', 'watches', 'jewelry', 'bags', 'automotive', 'electronics', 'audio'].map((cat) => (
                  <li key={cat}>
                    <button
                      className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSearchParams(cat === 'all' ? {} : { category: cat });
                      }}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <h4 className="filter-title">Max Price</h4>
              <div className="price-slider-container">
                <input
                  type="range"
                  min="500"
                  max="250000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="price-slider"
                  aria-label="Price range filter"
                />
                <div className="price-labels">
                  <span>Rs. 500</span>
                  <span className="current-price-label">{formatPrice(maxPrice)}</span>
                  <span>Rs. 250k</span>
                </div>
              </div>
            </div>

            {/* Genders */}
            <div className="filter-group">
              <h4 className="filter-title">Gender</h4>
              <div className="checkbox-group">
                {uniqueGenders.map((g) => (
                  <label key={g} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(g)}
                      onChange={() => toggleGender(g)}
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="filter-group">
              <h4 className="filter-title">Availability</h4>
              <div className="radio-group">
                <label className="filter-radio-label">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockStatus === 'all'}
                    onChange={() => setStockStatus('all')}
                  />
                  <span>All Items</span>
                </label>
                <label className="filter-radio-label">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockStatus === 'in-stock'}
                    onChange={() => setStockStatus('in-stock')}
                  />
                  <span>In Stock Only</span>
                </label>
                <label className="filter-radio-label">
                  <input
                    type="radio"
                    name="stock"
                    checked={stockStatus === 'out-of-stock'}
                    onChange={() => setStockStatus('out-of-stock')}
                  />
                  <span>Out of Stock</span>
                </label>
              </div>
            </div>

            {/* Badge Filters */}
            <div className="filter-group">
              <h4 className="filter-title">Status Exclusives</h4>
              <div className="checkbox-group">
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={showNewArrivals}
                    onChange={(e) => setShowNewArrivals(e.target.checked)}
                  />
                  <span>New Arrivals Only</span>
                </label>
                <label className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={showBestSellers}
                    onChange={(e) => setShowBestSellers(e.target.checked)}
                  />
                  <span>Best Sellers Only</span>
                </label>
              </div>
            </div>

            {/* Brands Multi-Select */}
            <div className="filter-group">
              <h4 className="filter-title">Designer Brands</h4>
              <div className="checkbox-group scroll-filter-group">
                {uniqueBrands.map((b) => (
                  <label key={b} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => toggleBrand(b)}
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="filter-group">
              <h4 className="filter-title">Colors</h4>
              <div className="swatch-grid">
                {uniqueColors.map((color) => {
                  const isSel = selectedColors.includes(color);
                  return (
                    <button
                      key={color}
                      className={`swatch-btn ${isSel ? 'active' : ''}`}
                      title={color}
                      onClick={() => toggleColor(color)}
                      style={{
                        backgroundColor: color.toLowerCase() === 'gold' ? '#D4AF37'
                                      : color.toLowerCase() === 'silver' ? '#C0C0C0'
                                      : color.toLowerCase() === 'black' ? '#1A1A1A'
                                      : color.toLowerCase() === 'emerald' ? '#046307'
                                      : color.toLowerCase() === 'beige' ? '#E1D9C2'
                                      : color.toLowerCase() === 'navy' ? '#1D2A44'
                                      : color.toLowerCase() === 'cognac' ? '#9E5B3C'
                                      : color.toLowerCase() === 'burgundy' ? '#800020'
                                      : color.toLowerCase() === 'rose gold' ? '#B76E79'
                                      : '#e5e5e5'
                      }}
                      aria-label={`Filter by color ${color}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Materials Tag List */}
            <div className="filter-group">
              <h4 className="filter-title">Materials</h4>
              <div className="tag-filters-flex">
                {uniqueMaterials.map((mat) => {
                  const isSel = selectedMaterials.includes(mat);
                  return (
                    <button
                      key={mat}
                      className={`tag-filter-btn ${isSel ? 'active' : ''}`}
                      onClick={() => toggleMaterial(mat)}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editorial Collections */}
            <div className="filter-group">
              <h4 className="filter-title">Editorial Collections</h4>
              <div className="checkbox-group">
                {uniqueCollections.map((coll) => (
                  <label key={coll} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(coll)}
                      onChange={() => toggleCollection(coll)}
                    />
                    <span>{coll}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ratings Filter */}
            <div className="filter-group">
              <h4 className="filter-title">Minimum Rating</h4>
              <div className="rating-select-list">
                {[5, 4.5, 4, 3.5].map((val) => (
                  <button
                    key={val}
                    className={`rating-row-btn ${minRating === val ? 'active' : ''}`}
                    onClick={() => setMinRating(minRating === val ? 0 : val)}
                  >
                    <div className="rating-row-stars">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          size={13}
                          fill={idx < Math.floor(val) ? 'var(--color-accent)' : 'none'}
                          color={idx < Math.floor(val) ? 'var(--color-accent)' : '#ccc'}
                        />
                      ))}
                      {val % 1 !== 0 && (
                        <span className="half-star-symbol">½</span>
                      )}
                    </div>
                    <span>{val === 5 ? '5.0 Stars' : `& Up (${val})`}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Grid Content */}
          <main className="shop-content-main">
            {/* Top Toolbar */}
            <div className="shop-toolbar">
              <div className="results-count">
                Showing {filteredProducts.length} of {products.length} pieces
              </div>

              <div className="toolbar-actions">
                <button className="mobile-filter-trigger" onClick={() => setIsMobileFilterOpen(true)}>
                  <SlidersHorizontal size={16} />
                  <span>Filters</span>
                </button>

                <div className="sort-dropdown-container">
                  <label htmlFor="sort-select">Sort By:</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="featured">Featured Items</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="shop-products-grid">
                <SkeletonLoader type="product-card" count={9} />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-products text-center">
                <h2>No Published Products Found</h2>
                <p>Import products from CJ Dropshipping via Admin Hub, review draft details, and click <strong>Publish</strong> to display products live in store.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.25rem' }}>
                  <button className="btn btn-primary" onClick={handleClearFilters}>
                    Reset Filters
                  </button>
                  <a href="/admin" className="btn btn-secondary">
                    Go to Admin CJ Sync Center
                  </a>
                </div>
              </div>
            ) : (
              <LayoutGroup>
                <motion.div className="shop-products-grid" layout>
                  {filteredProducts.map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </LayoutGroup>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;