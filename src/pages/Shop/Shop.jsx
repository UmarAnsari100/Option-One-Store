import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import { 
  SlidersHorizontal, 
  Search, 
  X, 
  Star, 
  ChevronDown, 
  RotateCcw,
  Check
} from 'lucide-react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import SEO from '../../components/SEO/SEO';
import { seoService } from '../../services/seoService';
import { formatPrice } from '../../utils/formatter';
import './Shop.css';

/**
 * Word stemming helper to safely handle singular/plural variations
 * e.g. "watches" -> "watch", "dresses" -> "dress", "bags" -> "bag"
 */
const stemWord = (w) => {
  if (!w) return '';
  const lower = String(w).toLowerCase();
  if (lower.endsWith('ies')) return lower.slice(0, -3) + 'y';
  if (
    lower.endsWith('es') &&
    (lower.endsWith('shes') ||
      lower.endsWith('ches') ||
      lower.endsWith('sses') ||
      lower.endsWith('xes') ||
      lower.endsWith('tches'))
  ) {
    return lower.slice(0, -2);
  }
  if (lower.endsWith('s') && !lower.endsWith('ss')) return lower.slice(0, -1);
  return lower;
};

/**
 * Normalizes category strings (trimmed, lowercase, unified whitespace and separators)
 */
const normalizeCategory = (cat) => {
  return String(cat || '')
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ');
};

/**
 * Robust category matching that checks exact match, singular/plural stemming,
 * and primary noun alignment (e.g. "quartz watches", "mechanical watches", "luxury watches"
 * all safely match the "watches" category, while genuinely distinct categories like
 * "watch accessories" are preserved).
 */
const isCategoryMatch = (productCat, selectedCat) => {
  if (!selectedCat || selectedCat === 'all') return true;
  const p = normalizeCategory(productCat);
  const s = normalizeCategory(selectedCat);
  if (!p) return false;
  if (p === s) return true;

  const pStem = stemWord(p);
  const sStem = stemWord(s);
  if (pStem === sStem) return true;

  // Suffix matching: if target is 'watches' or 'watch', match compound categories whose primary noun is watch
  const pWords = p.split(' ');
  const lastPWord = pWords[pWords.length - 1];
  const lastPStem = stemWord(lastPWord);

  if (sStem === lastPStem || s === lastPWord) {
    return true;
  }

  return false;
};

const Shop = () => {
  const { products = [] } = useContext(ShopContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Dynamic Catalog Bounds
  const { catalogMinPrice, catalogMaxPrice } = useMemo(() => {
    if (!products || products.length === 0) {
      return { catalogMinPrice: 500, catalogMaxPrice: 250000 };
    }
    const prices = products
      .map((p) => {
        const discount = Number(p.discount || 0);
        const price = Number(p.price || 0);
        return price * (1 - discount / 100);
      })
      .filter((pr) => !isNaN(pr) && pr > 0);

    if (prices.length === 0) {
      return { catalogMinPrice: 500, catalogMaxPrice: 250000 };
    }

    return {
      catalogMinPrice: Math.max(0, Math.floor(Math.min(...prices))),
      catalogMaxPrice: Math.ceil(Math.max(...prices, 10000))
    };
  }, [products]);

  // Primary filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(catalogMaxPrice);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  const [showOnSale, setShowOnSale] = useState(false);

  // Accordion open/close state for sidebar filter groups
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    brands: true,
    availability: true,
    status: true,
    colors: false,
    materials: false,
    gender: false,
    collections: false,
    rating: false
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Sync state with URL params whenever searchParams changes
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const brand = searchParams.get('brand') || '';
    const collection = searchParams.get('collection') || '';

    setSearchQuery(search);
    setSelectedCategory(normalizeCategory(category) || 'all');

    if (brand) {
      setSelectedBrands([brand]);
    } else {
      setSelectedBrands([]);
    }

    if (collection) {
      setSelectedCollections([collection]);
    } else {
      setSelectedCollections([]);
    }
  }, [searchParams]);

  // Update maxPrice when products load and catalog bounds are computed
  useEffect(() => {
    if (catalogMaxPrice > 0) {
      setMaxPrice((prev) => (prev > catalogMaxPrice || prev === 250000 ? catalogMaxPrice : prev));
    }
  }, [catalogMaxPrice]);

  // Lock body scroll when mobile filter drawer is active
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  // Trigger brief subtle loading skeleton when user modifies filters
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 280);
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
    showOnSale,
    searchQuery
  ]);

  // Derived unique categories from catalog merged with signature luxury segments
  const allAvailableCategories = useMemo(() => {
    const base = ['all', 'watches', 'jewelry', 'bags', 'automotive', 'electronics', 'audio'];
    const seen = new Set();
    const result = [];

    base.forEach((cat) => {
      const norm = normalizeCategory(cat);
      if (!seen.has(norm)) {
        seen.add(norm);
        result.push(norm);
      }
    });

    products.forEach((p) => {
      if (p.category) {
        const norm = normalizeCategory(p.category);
        if (!seen.has(norm)) {
          seen.add(norm);
          result.push(norm);
        }
      }
    });

    return result;
  }, [products]);

  // Count items per category using safe normalized category matching
  const getCategoryCount = (cat) => {
    if (cat === 'all') return products.length;
    return products.filter((p) => isCategoryMatch(p.category, cat)).length;
  };

  // Derived unique brands from catalog
  const uniqueBrands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((p) => (p.brand || '').trim())
          .filter(Boolean)
      )
    ).sort();
  }, [products]);

  const getBrandCount = (brandName) => {
    return products.filter(
      (p) => (p.brand || '').trim().toLowerCase() === brandName.trim().toLowerCase()
    ).length;
  };

  // Derived unique colors from catalog & variants
  const uniqueColors = useMemo(() => {
    const standardColors = ['Gold', 'Silver', 'Black', 'Rose Gold', 'Emerald', 'Beige', 'Navy', 'Cognac', 'Burgundy', 'White'];
    const detected = new Set();

    products.forEach((p) => {
      if (Array.isArray(p.colorOptions)) {
        p.colorOptions.forEach((c) => detected.add(c));
      }
      if (Array.isArray(p.variants)) {
        p.variants.forEach((v) => {
          standardColors.forEach((sc) => {
            if ((v.variantName || '').toLowerCase().includes(sc.toLowerCase())) {
              detected.add(sc);
            }
          });
        });
      }
      standardColors.forEach((sc) => {
        if ((p.name || '').toLowerCase().includes(sc.toLowerCase())) {
          detected.add(sc);
        }
      });
    });

    return detected.size > 0 ? Array.from(detected).sort() : standardColors;
  }, [products]);

  // Derived unique materials
  const uniqueMaterials = useMemo(() => {
    const standardMaterials = ['Stainless Steel', 'Leather', 'Gold Plated', 'Zircon', 'Sapphire', 'Beryllium', 'PU Leather', 'Titanium'];
    const detected = new Set();

    products.forEach((p) => {
      if (p.material) detected.add(p.material);
      standardMaterials.forEach((sm) => {
        if (
          (p.name || '').toLowerCase().includes(sm.toLowerCase()) ||
          (p.description || '').toLowerCase().includes(sm.toLowerCase())
        ) {
          detected.add(sm);
        }
      });
    });

    return detected.size > 0 ? Array.from(detected).sort() : standardMaterials;
  }, [products]);

  const uniqueGenders = ['Men', 'Women', 'Unisex'];

  // Derived collections
  const uniqueCollections = useMemo(() => {
    const detected = new Set();
    products.forEach((p) => {
      if (p.collection) detected.add(p.collection);
    });
    ['Executive', 'Timeless Classics', 'Modern Metropolitan'].forEach((c) => {
      if (
        products.some(
          (p) =>
            (p.name || '').toLowerCase().includes(c.toLowerCase()) ||
            (p.description || '').toLowerCase().includes(c.toLowerCase())
        )
      ) {
        detected.add(c);
      }
    });
    return Array.from(detected).sort();
  }, [products]);

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

  // Handler to clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMaxPrice(catalogMaxPrice);
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
    setShowOnSale(false);
    setSearchParams({});
  };

  // Select a category with URL update
  const handleCategorySelect = useCallback((cat) => {
    setSelectedCategory(cat);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cat === 'all') {
        next.delete('category');
      } else {
        next.set('category', cat);
      }
      return next;
    });
  }, [setSearchParams]);

  // Robust Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    const filtered = (products || []).filter((product) => {
        // 1. Text Search Query (Safe against null / undefined)
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          (product.name || '').toLowerCase().includes(q) ||
          (product.brand || '').toLowerCase().includes(q) ||
          (product.category || '').toLowerCase().includes(q) ||
          (product.description || '').toLowerCase().includes(q) ||
          (product.sku || '').toLowerCase().includes(q);

        // 2. Category Match (Normalized, case-insensitive & primary noun match)
        const matchesCategory =
          selectedCategory === 'all' || isCategoryMatch(product.category, selectedCategory);

        // 3. Price Filter (discounted price)
        const discount = Number(product.discount || 0);
        const basePrice = Number(product.price || 0);
        const finalPrice = basePrice * (1 - discount / 100);
        const matchesPrice = maxPrice >= catalogMaxPrice ? true : finalPrice <= maxPrice;

        // 4. Designer Brands (Multi-select)
        const matchesBrand =
          selectedBrands.length === 0 ||
          selectedBrands.some(
            (b) => b.trim().toLowerCase() === (product.brand || '').trim().toLowerCase()
          );

        // 5. Colors (Safe check against colorOptions, variants, and product text)
        const matchesColor =
          selectedColors.length === 0 ||
          selectedColors.some((selColor) => {
            const sc = selColor.toLowerCase();
            if (Array.isArray(product.colorOptions) && product.colorOptions.some((c) => c.toLowerCase().includes(sc))) {
              return true;
            }
            if (Array.isArray(product.variants) && product.variants.some((v) => (v.variantName || '').toLowerCase().includes(sc))) {
              return true;
            }
            return (
              (product.name || '').toLowerCase().includes(sc) ||
              (product.description || '').toLowerCase().includes(sc)
            );
          });

        // 6. Materials (Safe check against material field & product text)
        const matchesMaterial =
          selectedMaterials.length === 0 ||
          selectedMaterials.some((mat) => {
            const m = mat.toLowerCase();
            if (product.material && product.material.toLowerCase().includes(m)) return true;
            return (
              (product.name || '').toLowerCase().includes(m) ||
              (product.description || '').toLowerCase().includes(m)
            );
          });

        // 7. Genders
        const matchesGender =
          selectedGenders.length === 0 ||
          selectedGenders.some((gen) => {
            const g = gen.toLowerCase();
            if (product.gender && product.gender.toLowerCase() === g) return true;
            const fullText = `${product.name || ''} ${product.description || ''}`.toLowerCase();
            if (g === 'men' && (fullText.includes('men') || fullText.includes('him') || fullText.includes('male'))) return true;
            if (g === 'women' && (fullText.includes('women') || fullText.includes('her') || fullText.includes('ladies') || fullText.includes('female'))) return true;
            if (g === 'unisex' && fullText.includes('unisex')) return true;
            return false;
          });

        // 8. Collections
        const matchesCollection =
          selectedCollections.length === 0 ||
          selectedCollections.some((coll) => {
            const c = coll.toLowerCase();
            if (product.collection && product.collection.toLowerCase().includes(c)) return true;
            return (
              (product.name || '').toLowerCase().includes(c) ||
              (product.description || '').toLowerCase().includes(c)
            );
          });

        // 9. Customer Rating stars
        const matchesRating = Number(product.rating || 0) >= minRating;

        // 10. Availability stock check
        const stock = Number(product.stock ?? 0);
        const matchesAvailability =
          stockStatus === 'all' ||
          (stockStatus === 'in-stock' && stock > 0) ||
          (stockStatus === 'out-of-stock' && stock === 0);

        // 11. New Arrivals
        const matchesNew =
          !showNewArrivals ||
          Boolean(product.isNewArrival) ||
          (product.badge || '').toLowerCase().includes('new');

        // 12. Best Sellers
        const matchesBest =
          !showBestSellers ||
          Boolean(product.isBestSeller) ||
          (product.badge || '').toLowerCase().includes('best');

        // 13. On Sale
        const matchesSale =
          !showOnSale ||
          discount > 0 ||
          (product.badge || '').toLowerCase().includes('sale');

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
          matchesBest &&
          matchesSale
        );
      });

    // Safe Deduplication
    const seen = new Set();
    const deduplicated = [];
    for (const item of filtered) {
      const key = String(item.id || item.sku || Math.random());
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    // Safe Non-Mutating Sort on Array Copy
    return [...deduplicated].sort((a, b) => {
      if (sortBy === 'name-a-z') {
        const nameA = String(a.name || a.title || '').trim();
        const nameB = String(b.name || b.title || '').trim();
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true });
      }
      if (sortBy === 'name-z-a') {
        const nameA = String(a.name || a.title || '').trim();
        const nameB = String(b.name || b.title || '').trim();
        return nameB.localeCompare(nameA, undefined, { sensitivity: 'base', numeric: true });
      }

      const aPrice = Number(a.price || 0) * (1 - Number(a.discount || 0) / 100);
      const bPrice = Number(b.price || 0) * (1 - Number(b.discount || 0) / 100);

      if (sortBy === 'price-low-high') return aPrice - bPrice;
      if (sortBy === 'price-high-low') return bPrice - aPrice;
      if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === 'newest') {
        return new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || a.created_at || 0).getTime() - new Date(b.createdAt || b.created_at || 0).getTime();
      }
      // Default Featured
      return String(a.id).localeCompare(String(b.id));
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    maxPrice,
    catalogMaxPrice,
    selectedBrands,
    selectedColors,
    selectedMaterials,
    selectedGenders,
    selectedCollections,
    minRating,
    stockStatus,
    showNewArrivals,
    showBestSellers,
    showOnSale,
    sortBy
  ]);

  // Compute list of currently active filters for chip badges
  const activeFilters = useMemo(() => {
    const list = [];

    if (searchQuery.trim()) {
      list.push({
        id: 'search',
        label: `"${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery('')
      });
    }

    if (selectedCategory !== 'all') {
      const displayLabel = selectedCategory
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      list.push({
        id: 'category',
        label: displayLabel,
        onRemove: () => handleCategorySelect('all')
      });
    }

    if (maxPrice < catalogMaxPrice) {
      list.push({
        id: 'price',
        label: `≤ ${formatPrice(maxPrice)}`,
        onRemove: () => setMaxPrice(catalogMaxPrice)
      });
    }

    selectedBrands.forEach((b) => {
      list.push({
        id: `brand-${b}`,
        label: b,
        onRemove: () => toggleBrand(b)
      });
    });

    selectedColors.forEach((c) => {
      list.push({
        id: `color-${c}`,
        label: c,
        onRemove: () => toggleColor(c)
      });
    });

    selectedMaterials.forEach((m) => {
      list.push({
        id: `material-${m}`,
        label: m,
        onRemove: () => toggleMaterial(m)
      });
    });

    selectedGenders.forEach((g) => {
      list.push({
        id: `gender-${g}`,
        label: g,
        onRemove: () => toggleGender(g)
      });
    });

    selectedCollections.forEach((coll) => {
      list.push({
        id: `collection-${coll}`,
        label: coll,
        onRemove: () => toggleCollection(coll)
      });
    });

    if (stockStatus !== 'all') {
      list.push({
        id: 'stock',
        label: stockStatus === 'in-stock' ? 'In Stock Only' : 'Out of Stock',
        onRemove: () => setStockStatus('all')
      });
    }

    if (showNewArrivals) {
      list.push({
        id: 'new-arrivals',
        label: 'New Arrivals',
        onRemove: () => setShowNewArrivals(false)
      });
    }

    if (showBestSellers) {
      list.push({
        id: 'best-sellers',
        label: 'Best Sellers',
        onRemove: () => setShowBestSellers(false)
      });
    }

    if (showOnSale) {
      list.push({
        id: 'on-sale',
        label: 'Sale Items',
        onRemove: () => setShowOnSale(false)
      });
    }

    if (minRating > 0) {
      list.push({
        id: 'rating',
        label: `${minRating}★ & Up`,
        onRemove: () => setMinRating(0)
      });
    }

    return list;
  }, [
    searchQuery,
    selectedCategory,
    maxPrice,
    catalogMaxPrice,
    selectedBrands,
    selectedColors,
    selectedMaterials,
    selectedGenders,
    selectedCollections,
    stockStatus,
    showNewArrivals,
    showBestSellers,
    showOnSale,
    minRating,
    handleCategorySelect
  ]);

  const pageTitle =
    selectedCategory !== 'all'
      ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Collection`
      : 'Signature Collections & Luxury Catalog';

  return (
    <div className="shop-page-wrapper">
      <SEO
        title={`${pageTitle} | Option One Store`}
        description={`Explore our curated ${
          selectedCategory !== 'all' ? selectedCategory : 'luxury'
        } collection featuring designer timepieces, fine jewelry, leather bags, and electronics with worldwide shipping.`}
        canonical={`https://optiononestore.com/shop${
          selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''
        }`}
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
          {/* Mobile Filter Backdrop Overlay */}
          <div
            className={`sidebar-backdrop ${isMobileFilterOpen ? 'active' : ''}`}
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar Filters */}
          <aside className={`shop-sidebar ${isMobileFilterOpen ? 'active' : ''}`}>
            {/* Sidebar Header */}
            <div className="sidebar-header">
              <div className="sidebar-header-left">
                <h3>Filters</h3>
                {activeFilters.length > 0 && (
                  <span className="active-filter-count-badge">
                    {activeFilters.length} Active
                  </span>
                )}
              </div>
              <button
                className="close-filter-btn"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Reset All Filters Button */}
            {activeFilters.length > 0 && (
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                <RotateCcw size={14} className="reset-icon" />
                <span>Reset All Filters ({activeFilters.length})</span>
              </button>
            )}

            {/* Search Filter */}
            <div className="filter-group">
              <div className="sidebar-search">
                <input
                  type="text"
                  placeholder="Search catalog, brand, sku..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search within store catalog"
                />
                {searchQuery ? (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                  >
                    <X size={15} />
                  </button>
                ) : (
                  <Search size={18} className="search-icon" />
                )}
              </div>
            </div>

            {/* 1. Categories Accordion */}
            <div className="filter-group">
              <button
                className="filter-group-header"
                onClick={() => toggleSection('categories')}
                type="button"
                aria-expanded={openSections.categories}
              >
                <div className="filter-group-title-wrap">
                  <h4 className="filter-title">Categories</h4>
                  {selectedCategory !== 'all' && <span className="group-active-dot" />}
                </div>
                <ChevronDown
                  size={16}
                  className={`accordion-chevron ${openSections.categories ? 'open' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openSections.categories && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="filter-group-content"
                  >
                    <ul className="category-list">
                      {allAvailableCategories.map((cat) => {
                        const count = getCategoryCount(cat);
                        const isSelected = selectedCategory === cat;
                        const label =
                          cat === 'all'
                            ? 'All Collections'
                            : cat
                                .split(' ')
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(' ');

                        return (
                          <li key={cat}>
                            <button
                              className={`category-btn ${isSelected ? 'active' : ''}`}
                              onClick={() => handleCategorySelect(cat)}
                              type="button"
                            >
                              <span className="category-name-text">{label}</span>
                              <span className="category-count-badge">({count})</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Price Range Accordion */}
            <div className="filter-group">
              <button
                className="filter-group-header"
                onClick={() => toggleSection('price')}
                type="button"
                aria-expanded={openSections.price}
              >
                <div className="filter-group-title-wrap">
                  <h4 className="filter-title">Price Range</h4>
                  {maxPrice < catalogMaxPrice && <span className="group-active-dot" />}
                </div>
                <ChevronDown
                  size={16}
                  className={`accordion-chevron ${openSections.price ? 'open' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openSections.price && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="filter-group-content"
                  >
                    <div className="price-slider-container">
                      <div className="current-price-display">
                        <span className="price-upto-label">Maximum Price:</span>
                        <span className="current-price-label">{formatPrice(maxPrice)}</span>
                      </div>
                      <input
                        type="range"
                        min={catalogMinPrice}
                        max={catalogMaxPrice}
                        step={Math.max(100, Math.floor((catalogMaxPrice - catalogMinPrice) / 100))}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="price-slider"
                        aria-label="Price range filter"
                      />
                      <div className="price-labels">
                        <span>{formatPrice(catalogMinPrice)}</span>
                        <span>{formatPrice(catalogMaxPrice)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Availability Accordion */}
            <div className="filter-group">
              <button
                className="filter-group-header"
                onClick={() => toggleSection('availability')}
                type="button"
                aria-expanded={openSections.availability}
              >
                <div className="filter-group-title-wrap">
                  <h4 className="filter-title">Availability</h4>
                  {stockStatus !== 'all' && <span className="group-active-dot" />}
                </div>
                <ChevronDown
                  size={16}
                  className={`accordion-chevron ${openSections.availability ? 'open' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openSections.availability && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="filter-group-content"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Status Exclusives Accordion */}
            <div className="filter-group">
              <button
                className="filter-group-header"
                onClick={() => toggleSection('status')}
                type="button"
                aria-expanded={openSections.status}
              >
                <div className="filter-group-title-wrap">
                  <h4 className="filter-title">Status Exclusives</h4>
                  {(showNewArrivals || showBestSellers || showOnSale) && (
                    <span className="group-active-dot" />
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`accordion-chevron ${openSections.status ? 'open' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openSections.status && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="filter-group-content"
                  >
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
                      <label className="filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={showOnSale}
                          onChange={(e) => setShowOnSale(e.target.checked)}
                        />
                        <span>Promotional Sale Items</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 5. Designer Brands Accordion */}
            {uniqueBrands.length > 0 && (
              <div className="filter-group">
                <button
                  className="filter-group-header"
                  onClick={() => toggleSection('brands')}
                  type="button"
                  aria-expanded={openSections.brands}
                >
                  <div className="filter-group-title-wrap">
                    <h4 className="filter-title">Designer Brands</h4>
                    {selectedBrands.length > 0 && (
                      <span className="group-active-badge">{selectedBrands.length}</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`accordion-chevron ${openSections.brands ? 'open' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openSections.brands && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="filter-group-content"
                    >
                      <div className="checkbox-group scroll-filter-group">
                        {uniqueBrands.map((b) => (
                          <label key={b} className="filter-checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(b)}
                              onChange={() => toggleBrand(b)}
                            />
                            <span className="filter-item-name">{b}</span>
                            <span className="filter-item-count">({getBrandCount(b)})</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 6. Colors Accordion */}
            {uniqueColors.length > 0 && (
              <div className="filter-group">
                <button
                  className="filter-group-header"
                  onClick={() => toggleSection('colors')}
                  type="button"
                  aria-expanded={openSections.colors}
                >
                  <div className="filter-group-title-wrap">
                    <h4 className="filter-title">Colors</h4>
                    {selectedColors.length > 0 && (
                      <span className="group-active-badge">{selectedColors.length}</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`accordion-chevron ${openSections.colors ? 'open' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openSections.colors && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="filter-group-content"
                    >
                      <div className="swatch-grid">
                        {uniqueColors.map((color) => {
                          const isSel = selectedColors.includes(color);
                          const colorMap = {
                            gold: '#D4AF37',
                            silver: '#C0C0C0',
                            black: '#1A1A1A',
                            emerald: '#046307',
                            beige: '#E1D9C2',
                            navy: '#1D2A44',
                            cognac: '#9E5B3C',
                            burgundy: '#800020',
                            'rose gold': '#B76E79',
                            white: '#FFFFFF',
                            brown: '#654321',
                            blue: '#1E3A8A'
                          };
                          const bg = colorMap[color.toLowerCase()] || '#E5E5E5';

                          return (
                            <button
                              key={color}
                              className={`swatch-btn ${isSel ? 'active' : ''}`}
                              title={color}
                              onClick={() => toggleColor(color)}
                              style={{ backgroundColor: bg }}
                              type="button"
                              aria-label={`Filter by color ${color}`}
                            >
                              {isSel && (
                                <Check
                                  size={12}
                                  className="swatch-check-icon"
                                  color={['white', 'beige', 'silver'].includes(color.toLowerCase()) ? '#111' : '#fff'}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 7. Materials Accordion */}
            {uniqueMaterials.length > 0 && (
              <div className="filter-group">
                <button
                  className="filter-group-header"
                  onClick={() => toggleSection('materials')}
                  type="button"
                  aria-expanded={openSections.materials}
                >
                  <div className="filter-group-title-wrap">
                    <h4 className="filter-title">Materials</h4>
                    {selectedMaterials.length > 0 && (
                      <span className="group-active-badge">{selectedMaterials.length}</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`accordion-chevron ${openSections.materials ? 'open' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openSections.materials && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="filter-group-content"
                    >
                      <div className="tag-filters-flex">
                        {uniqueMaterials.map((mat) => {
                          const isSel = selectedMaterials.includes(mat);
                          return (
                            <button
                              key={mat}
                              className={`tag-filter-btn ${isSel ? 'active' : ''}`}
                              onClick={() => toggleMaterial(mat)}
                              type="button"
                            >
                              {mat}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 8. Gender Accordion */}
            <div className="filter-group">
              <button
                className="filter-group-header"
                onClick={() => toggleSection('gender')}
                type="button"
                aria-expanded={openSections.gender}
              >
                <div className="filter-group-title-wrap">
                  <h4 className="filter-title">Gender & Department</h4>
                  {selectedGenders.length > 0 && (
                    <span className="group-active-badge">{selectedGenders.length}</span>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`accordion-chevron ${openSections.gender ? 'open' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openSections.gender && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="filter-group-content"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 9. Editorial Collections Accordion */}
            {uniqueCollections.length > 0 && (
              <div className="filter-group">
                <button
                  className="filter-group-header"
                  onClick={() => toggleSection('collections')}
                  type="button"
                  aria-expanded={openSections.collections}
                >
                  <div className="filter-group-title-wrap">
                    <h4 className="filter-title">Editorial Collections</h4>
                    {selectedCollections.length > 0 && (
                      <span className="group-active-badge">{selectedCollections.length}</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`accordion-chevron ${openSections.collections ? 'open' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openSections.collections && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="filter-group-content"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 10. Ratings Filter Accordion */}
            <div className="filter-group">
              <button
                className="filter-group-header"
                onClick={() => toggleSection('rating')}
                type="button"
                aria-expanded={openSections.rating}
              >
                <div className="filter-group-title-wrap">
                  <h4 className="filter-title">Minimum Rating</h4>
                  {minRating > 0 && <span className="group-active-dot" />}
                </div>
                <ChevronDown
                  size={16}
                  className={`accordion-chevron ${openSections.rating ? 'open' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openSections.rating && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="filter-group-content"
                  >
                    <div className="rating-select-list">
                      {[5, 4.5, 4, 3.5].map((val) => (
                        <button
                          key={val}
                          className={`rating-row-btn ${minRating === val ? 'active' : ''}`}
                          onClick={() => setMinRating(minRating === val ? 0 : val)}
                          type="button"
                        >
                          <div className="rating-row-stars">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                size={14}
                                fill={idx < Math.floor(val) ? 'var(--color-accent)' : 'none'}
                                color={idx < Math.floor(val) ? 'var(--color-accent)' : '#ccc'}
                              />
                            ))}
                            {val % 1 !== 0 && (
                              <span className="half-star-symbol">½</span>
                            )}
                          </div>
                          <span className="rating-text-label">
                            {val === 5 ? '5.0 Stars' : `& Up (${val})`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Bottom Action Bar */}
            <div className="mobile-sidebar-footer">
              <button
                type="button"
                className="mobile-reset-btn"
                onClick={handleClearFilters}
              >
                Reset All
              </button>
              <button
                type="button"
                className="mobile-apply-btn"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </aside>

          {/* Main Grid Content */}
          <main className="shop-content-main">
            {/* Top Toolbar */}
            <div className="shop-toolbar">
              <div className="results-count">
                Showing <strong>{filteredProducts.length}</strong> of{' '}
                <strong>{products.length}</strong> luxury pieces
              </div>

              <div className="toolbar-actions">
                <button
                  className="mobile-filter-trigger"
                  onClick={() => setIsMobileFilterOpen(true)}
                  type="button"
                >
                  <SlidersHorizontal size={16} />
                  <span>Filters</span>
                  {activeFilters.length > 0 && (
                    <span className="mobile-filter-trigger-badge">
                      {activeFilters.length}
                    </span>
                  )}
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
                    <option value="name-a-z">Name: A → Z</option>
                    <option value="name-z-a">Name: Z → A</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="oldest">Oldest Items</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Bar Chips */}
            {activeFilters.length > 0 && (
              <div className="active-filters-bar">
                <span className="active-filters-label">Active Filters:</span>
                <div className="active-filter-chips">
                  {activeFilters.map((af) => (
                    <button
                      key={af.id}
                      className="filter-chip"
                      onClick={af.onRemove}
                      title={`Remove filter: ${af.label}`}
                      type="button"
                    >
                      <span>{af.label}</span>
                      <X size={13} className="chip-remove-icon" />
                    </button>
                  ))}
                  <button
                    className="clear-all-chips-btn"
                    onClick={handleClearFilters}
                    type="button"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {isLoading ? (
              <div className="shop-products-grid">
                <SkeletonLoader type="product-card" count={8} />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-products text-center">
                <h2>No Products Match Your Criteria</h2>
                <p>
                  We couldn't find any catalog pieces matching your current filter selections.
                  Try resetting one or more filters to view our full collection.
                </p>
                <div className="no-products-actions">
                  <button className="btn btn-primary" onClick={handleClearFilters}>
                    Reset All Filters
                  </button>
                  {selectedCategory !== 'all' && (
                    <button
                      className="btn btn-outline"
                      onClick={() => handleCategorySelect('all')}
                    >
                      View All Collections
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <LayoutGroup>
                <motion.div className="shop-products-grid" layout>
                  {filteredProducts.map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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