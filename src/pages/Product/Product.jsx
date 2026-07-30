import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { productRepository } from '../../repositories/ProductRepository';
import { cjApi } from '../../services/cjApi';
import { normalizeCjItem } from '../../services/cjSyncService';
import SEO from '../../components/SEO/SEO';
import { seoService } from '../../services/seoService';
import ProductCard from '../../components/ProductCard/ProductCard';
import SkeletonLoader from '../../components/SkeletonLoader/SkeletonLoader';
import { formatPrice } from '../../utils/formatter';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Video,
  Sparkles,
  Maximize2,
  Share2,
  Award,
  CreditCard,
  Gift,
  Globe,
  ChevronDown,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Product.css';

const Product = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const id = params.id;

  const {
    products,
    allProducts,
    addToCart,
    toggleWishlist,
    isInWishlist,
    addToRecentlyViewed,
    recentlyViewed,
    showToast
  } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeMedia, setActiveMedia] = useState('gallery'); // 'gallery', 'video'
  const [isLoading, setIsLoading] = useState(true);

  // Gallery magnifier and lightbox states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [magnifierStyle, setMagnifierStyle] = useState({ display: 'none' });
  const zoomContainerRef = useRef(null);
  const touchStartX = useRef(null);

  // Sticky Bar state
  const [showStickyBar, setShowStickyBar] = useState(false);

  // 360 Fullscreen modal states
  const [is360Open, setIs360Open] = useState(false);
  const [angleIndex, setAngleIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [imagesLoaded360, setImagesLoaded360] = useState(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  // FAQ Accordion state
  const [activeFAQIndex, setActiveFAQIndex] = useState(null);

  // Review submission state
  const [reviewsList, setReviewsList] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');

  // Complete Audited Data Loader for Product Detail Page
  useEffect(() => {
    console.log('==================================================');
    console.log('🔍 [Product Page Audit]');
    console.log('• useEffect execution started');
    console.log('• Router params:', params);
    console.log('• Product ID parameter:', id);
    console.log('• location.state:', location.state);
    console.log('==================================================');

    let isMounted = true;

    async function loadProductData() {
      console.log(`⚡ [Product Page] Invoking fetchProduct / data loader for ID: ${id}`);
      if (isMounted) setIsLoading(true);

      try {
        if (!id) {
          console.warn('[Product Page Warning]: No product ID found in router params');
          if (isMounted) setProduct(null);
          return;
        }

        // 1. Search in-memory context (Published & All products)
        const localFound =
          (products || []).find((p) => String(p.id) === String(id) || String(p.cjPid) === String(id)) ||
          (allProducts || []).find((p) => String(p.id) === String(id) || String(p.cjPid) === String(id));

        if (localFound) {
          console.log('[Product Page Success]: Found product in context:', localFound.name);
          if (isMounted) {
            setProduct(localFound);
            setActiveImage(localFound.image1 || localFound.images?.[0] || '');
            if (localFound.variants && localFound.variants.length > 0) {
              setSelectedVariant(localFound.variants[0]);
            } else {
              setSelectedVariant(null);
            }
            setQuantity(1);
            setActiveMedia('gallery');
            setAngleIndex(0);
            setZoomScale(1);
            setReviewsList(localFound.reviewsList || []);
            addToRecentlyViewed(localFound);
          }
          return;
        }

        // 2. Fetch directly from MySQL REST API endpoint (/api/products/:id)
        const dbRes = await productRepository.getById(id);
        if (dbRes) {
          console.log('[Product Page Success]: Received product detail from MySQL API:', dbRes.name);
          if (isMounted) {
            setProduct(dbRes);
            setActiveImage(dbRes.image1 || dbRes.images?.[0] || '');
            if (dbRes.variants && dbRes.variants.length > 0) {
              setSelectedVariant(dbRes.variants[0]);
            } else {
              setSelectedVariant(null);
            }
            setQuantity(1);
            setActiveMedia('gallery');
            setAngleIndex(0);
            setZoomScale(1);
            setReviewsList(dbRes.reviewsList || []);
            addToRecentlyViewed(dbRes);
          }
          return;
        }

        // 3. Check location.state
        if (location.state?.product) {
          console.log('[Product Page Success]: Found product in location.state payload:', location.state.product.name);
          const stateProd = location.state.product;
          if (isMounted) {
            setProduct(stateProd);
            setActiveImage(stateProd.image1 || stateProd.image || stateProd.productImage || '');
            if (stateProd.variants && stateProd.variants.length > 0) {
              setSelectedVariant(stateProd.variants[0]);
            }
            addToRecentlyViewed(stateProd);
          }
          return;
        }

        // 3. Fallback: Fetch directly from CJ API proxy (/api/cj/products/detail?pid=...)
        console.log(`🌐 [Product Page Network Call]: Requesting CJ Product Detail from API proxy for PID: ${id}`);
        const res = await cjApi.getProductDetail(id);

        if (!isMounted) return;

        if (res && res.success && res.data) {
          console.log('[Product Page Success]: Received live CJ Product Detail API response:', res.data);
          const norm = normalizeCjItem(res.data);
          const liveCjProduct = {
            id: norm.pid || id,
            cjPid: norm.pid || id,
            sku: norm.sku,
            name: norm.title,
            brand: res.data.brand || 'Maison Selected',
            price: norm.costPrice ? Math.ceil(norm.costPrice * 1.3) : 2990,
            costPrice: norm.costPrice,
            stock: norm.stock > 0 ? norm.stock : 50,
            category: norm.category,
            image1: norm.mainImage,
            image2: norm.secondaryImage,
            images: norm.images,
            description: norm.description,
            variants: norm.variants,
            rating: 4.8,
            reviews: 12,
            badge: norm.stock > 0 ? 'In Stock' : 'Low Stock',
            source: 'cj',
            status: 'published'
          };

          setProduct(liveCjProduct);
          setActiveImage(liveCjProduct.image1);
          if (liveCjProduct.variants && liveCjProduct.variants.length > 0) {
            setSelectedVariant(liveCjProduct.variants[0]);
          }
          addToRecentlyViewed(liveCjProduct);
        } else {
          console.warn('[Product Page Warning]: CJ API returned unsuccessful response for PID:', id, res);
          setProduct(null);
        }
      } catch (err) {
        console.error('[Product Page Error]: Exception while loading product data:', err);
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) {
          console.log('[Product Page]: Transitioning loading state -> setIsLoading(false)');
          setIsLoading(false);
        }
      }
    }

    loadProductData();

    return () => {
      isMounted = false;
    };
  }, [id, products, allProducts, location.state]);

  // Cleanup overlays and body scroll locks when leaving Product Page
  useEffect(() => {
    return () => {
      setIsLightboxOpen(false);
      setIs360Open(false);
      setShowStickyBar(false);
      setMagnifierStyle({ display: 'none', pointerEvents: 'none' });
      document.body.style.overflow = '';
    };
  }, [id, location.pathname]);

  // Keyboard navigation inside image gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeMedia !== 'gallery' || !product) return;
      const imagesList = [product.image1, product.image2, ...(product.multiAngleImages || []).slice(2, 5)];
      const currentIndex = imagesList.indexOf(activeImage);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const nextIndex = (currentIndex + 1) % imagesList.length;
        setActiveImage(imagesList[nextIndex]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const nextIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
        setActiveImage(imagesList[nextIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImage, activeMedia, product]);

  // Scroll listener for sticky bottom bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768) {
        const buyForm = document.querySelector('.product-buy-form');
        if (buyForm) {
          const rect = buyForm.getBoundingClientRect();
          setShowStickyBar(rect.bottom < 0);
        }
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="product-page-wrapper">
        <div className="container section-padding">
          <SkeletonLoader type="product-detail" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found container section-padding text-center">
        <h2>Product Not Found</h2>
        <p>We couldn't find the product you were looking for.</p>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const isWish = isInWishlist(product.id);
  const finalPrice = product.price * (1 - product.discount / 100);

  // Recommendations setup
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const customersAlsoBought = products
    .filter((p) => p.brand === product.brand && p.id !== product.id)
    .slice(0, 4);

  // Complete The Look setup: Pair with items from other complementary categories
  const completeTheLook = products
    .filter((p) => p.category !== product.category && p.brand === product.brand)
    .slice(0, 4);

  // Magnifier Zoom Handlers (Desktop Only)
  const handleMouseMove = (e) => {
    if (window.innerWidth <= 1024 || !zoomContainerRef.current) return;
    const { left, top, width, height } = zoomContainerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const zoomLevel = 2.2;
    const magnifierWidth = 160;
    const magnifierHeight = 160;

    setMagnifierStyle({
      display: 'block',
      left: `${x - magnifierWidth / 2}px`,
      top: `${y - magnifierHeight / 2}px`,
      backgroundImage: `url(${activeImage})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: `${width * zoomLevel}px ${height * zoomLevel}px`,
      backgroundPosition: `-${x * zoomLevel - magnifierWidth / 2}px -${y * zoomLevel - magnifierHeight / 2}px`,
      pointerEvents: 'none'
    });
  };

  const handleMouseLeave = () => {
    setMagnifierStyle({ display: 'none', pointerEvents: 'none' });
  };

  // Touch Swipe Handlers for Mobile swipeable gallery
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Swipe threshold (e.g. 50px)
    if (Math.abs(diff) > 50) {
      const idxList = [product.image1, product.image2, ...(product.multiAngleImages || []).slice(2, 5)];
      const currentIdx = idxList.indexOf(activeImage);
      if (diff > 0) {
        // swipe left -> next image
        const nextIdx = (currentIdx + 1) % idxList.length;
        setActiveImage(idxList[nextIdx]);
      } else {
        // swipe right -> prev image
        const nextIdx = (currentIdx - 1 + idxList.length) % idxList.length;
        setActiveImage(idxList[nextIdx]);
      }
    }
    touchStartX.current = null;
  };

  // 360 Drag Handlers
  const handleDragStart = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX || e.touches[0].clientX;
  };

  const handleDragMove = (e) => {
    if (!isDragging.current || !product.multiAngleImages) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const diff = clientX - dragStartX.current;

    if (Math.abs(diff) > 12) {
      const dir = diff > 0 ? -1 : 1;
      const nextIdx = (angleIndex + dir + product.multiAngleImages.length) % product.multiAngleImages.length;
      setAngleIndex(nextIdx);
      dragStartX.current = clientX;
    }
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoomScale((prev) => Math.min(Math.max(prev - e.deltaY * 0.005, 1), 2.5));
  };

  // Review Submission
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewText.trim() || !newReviewName.trim()) return;

    const newRev = {
      id: Date.now(),
      user: newReviewName,
      rating: newReviewRating,
      date: new Date().toISOString().split('T')[0],
      comment: newReviewText,
      verified: true
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewText('');
    setNewReviewName('');
    showToast('Your verified review was submitted successfully!');
  };

  // Immediate Buy Now action
  const handleBuyNow = () => {
    addToCart(product.id, quantity);
    navigate('/checkout');
  };

  // Copy product link to share
  const handleShareProduct = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => showToast('Product link copied to clipboard!'),
      () => showToast('Failed to copy product link.', 'error')
    );
  };

  // FAQ Accordion Data
  const faqData = [
    { q: 'Is this item authentic and certified?', a: 'Yes, Option One partners directly with designer heritage houses. Every purchase includes a certificate of authenticity signed by our specialists alongside serial registration papers.' },
    { q: 'What white-glove shipping rates are available?', a: 'We offer complimentary priority insured delivery for orders exceeding $150. Items are securely couriered in temperature-stabilized crates.' },
    { q: 'How do discreet returns work?', a: 'Enjoy complimentary courier collections for returns requested within 30 days of receipt. All luxury pieces must be returned with safety lock tags intact.' },
    { q: 'What is the international warranty scope?', a: `Your ${product.specs.Warranty || '5 Year International'} Warranty certifies complimentary annual cleaning, mechanical adjustments, bezel alignments, and leather care conditioning.` },
    { q: 'What payment and finance structures are supported?', a: 'We support fully encrypted secure transactions via Visa, Mastercard, American Express, Apple Pay, PayPal, and interest-free luxury finance options.' }
  ];

  const totalReviewsCount = reviewsList.length + 128;
  const ratingsBreakdown = {
    5: Math.round((reviewsList.filter(r => r.rating === 5).length + 95) / totalReviewsCount * 100),
    4: Math.round((reviewsList.filter(r => r.rating === 4).length + 20) / totalReviewsCount * 100),
    3: Math.round((reviewsList.filter(r => r.rating === 3).length + 8) / totalReviewsCount * 100),
    2: Math.round((reviewsList.filter(r => r.rating === 2).length + 3) / totalReviewsCount * 100),
    1: Math.round((reviewsList.filter(r => r.rating === 1).length + 2) / totalReviewsCount * 100),
  };

  const imagesList = Array.from(
    new Set([
      product.image1,
      product.image2,
      ...(product.images || []),
      ...(product.multiAngleImages || [])
    ])
  ).filter(Boolean);

  return (
    <div className="product-page-wrapper">
      <SEO
        title={`${product.name} | Option One Store`}
        description={product.description || `Buy ${product.name} with secure checkout, worldwide shipping, and premium quality from Option One Store.`}
        canonical={`https://optiononestore.com/product/${product.id}`}
        ogImage={product.image1}
        ogType="product"
        jsonLd={[
          seoService.getProductSchema(product),
          seoService.getBreadcrumbSchema([
            { name: 'Shop', path: '/shop' },
            { name: product.category, path: `/shop?category=${product.category}` },
            { name: product.name, path: `/product/${product.id}` }
          ])
        ]}
      />
      {/* Breadcrumbs */}
      <div className="product-breadcrumbs">
        <div className="container">
          <div className="breadcrumbs-content">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop">Shop</Link>
            <ChevronRight size={14} />
            <Link to={`/shop?category=${product.category}`} className="category-crumb">
              {product.category}
            </Link>
            <ChevronRight size={14} />
            <span className="current-crumb">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container section-padding">
        {/* Main Product Showcase Grid */}
        <div className="product-showcase-grid">

          {/* Gallery Module */}
          <div className="luxury-gallery-container">
            {/* Vertical Thumbnails strip */}
            {activeMedia === 'gallery' && (
              <div className="vertical-thumbnails">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    className={`vertical-thumb-btn ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
                  </button>
                ))}
              </div>
            )}

            <div className="main-visual-container">
              {/* Main Visual Frame */}
              <div className="luxury-visual-viewport">
                <div className="media-toggle-pill">
                  <button
                    className={`pill-btn ${activeMedia === 'gallery' ? 'active' : ''}`}
                    onClick={() => setActiveMedia('gallery')}
                  >
                    Gallery
                  </button>
                  <button
                    className={`pill-btn ${activeMedia === 'video' ? 'active' : ''}`}
                    onClick={() => setActiveMedia('video')}
                  >
                    Cinema Reel
                  </button>
                </div>

                {activeMedia === 'gallery' ? (
                  <div
                    className="magnifier-container"
                    ref={zoomContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => setIsLightboxOpen(true)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img src={activeImage} alt={product.name} className="magnifier-target-img" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
                    <div className="magnifier-lens" style={magnifierStyle} />
                    <div className="gallery-maximize-floating">
                      <Maximize2 size={13} />
                    </div>
                  </div>
                ) : (
                  <div className="visual-video-viewport">
                    <video
                      src={product.videoUrl}
                      className="viewport-video"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                    />
                  </div>
                )}
              </div>

              {/* 360 Fullscreen trigger */}
              {product.multiAngleImages && (
                <button className="open-360-trigger-btn" onClick={() => setIs360Open(true)}>
                  <Compass size={14} />
                  <span>View in 360°</span>
                </button>
              )}
            </div>
          </div>

          {/* Details & Custom Options Column */}
          <div className="luxury-details-container">
            <span className="details-brand-tag">{product.brand}</span>
            <h1 className="details-name-h1">{product.name}</h1>

            <div className="details-submeta">
              <div className="details-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(product.rating) ? "var(--color-accent)" : "none"}
                    color={i < Math.floor(product.rating) ? "var(--color-accent)" : "#ccc"}
                  />
                ))}
                <span>({totalReviewsCount} reviews)</span>
              </div>
              <span className="sku-details-label">SKU: {selectedVariant?.variantSku || product.sku}</span>
            </div>

            <div className="details-pricing">
              {product.discount > 0 ? (
                <div className="pricing-grid-luxury">
                  <span className="price-primary">{formatPrice(finalPrice)}</span>
                  <span className="price-struck">{formatPrice(product.price)}</span>
                  <span className="discount-luxury-badge">{product.discount}% PRIVILEGE</span>
                </div>
              ) : (
                <span className="price-primary">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="details-excerpt">{product.description}</p>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="variants-selector-wrapper" style={{ margin: '1.25rem 0' }}>
                <span className="qty-title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                  Select Option:
                </span>
                <div className="variants-grid-btn" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {product.variants.map((variant, idx) => (
                    <button
                      key={variant.variantId || idx}
                      type="button"
                      className={`variant-pill-btn ${selectedVariant?.variantId === variant.variantId ? 'active' : ''}`}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontFamily: 'var(--font-ui)',
                        border: selectedVariant?.variantId === variant.variantId ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: selectedVariant?.variantId === variant.variantId ? 'rgba(51, 96, 33, 0.08)' : 'var(--color-white)',
                        color: selectedVariant?.variantId === variant.variantId ? 'var(--color-primary)' : 'var(--color-text-main)',
                        fontWeight: selectedVariant?.variantId === variant.variantId ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        setSelectedVariant(variant);
                        if (variant.variantImage) setActiveImage(variant.variantImage);
                      }}
                    >
                      {variant.variantName} {variant.stock !== undefined ? `(${variant.stock} available)` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Buy Form */}
            <div className="product-buy-form">
              {/* Qty */}
              <div className="details-qty-wrapper">
                <span className="qty-title">Select Quantity</span>
                <div className="qty-control-box">
                  <button onClick={() => handleQtyChange('dec')} disabled={quantity <= 1}>-</button>
                  <input type="text" value={quantity} readOnly />
                  <button onClick={() => handleQtyChange('inc')} disabled={quantity >= product.stock}>+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="details-cta-grid">
                <button
                  className="btn btn-primary add-bag-cta"
                  onClick={() => addToCart(product.id, quantity)}
                  disabled={product.stock === 0}
                >
                  <ShoppingBag size={18} />
                  <span>{product.stock === 0 ? 'Sold Out' : 'Add to Bag'}</span>
                </button>

                <button
                  className="btn btn-secondary buy-now-cta"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                >
                  Acquire Now
                </button>
              </div>

              <div className="utility-buttons-row">
                <button
                  className={`utility-fav-btn ${isWish ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart size={16} fill={isWish ? "var(--color-accent)" : "none"} />
                  <span>{isWish ? 'Saved to Favorites' : 'Add to Favorites'}</span>
                </button>

                <button className="utility-share-btn" onClick={handleShareProduct}>
                  <Share2 size={16} />
                  <span>Share Piece</span>
                </button>
              </div>
            </div>
          </div>
        </div>
          {/* Info Tabs Section (Full Width Editorial Layout below the Showcase Grid) */}
          <div className="luxury-tabs-section">
            <div className="tabs-bar">
              {['description', 'specifications', 'shipping', 'care', 'reviews'].map((tabKey) => (
                <button
                  key={tabKey}
                  className={`tab-btn-title ${activeTab === tabKey ? 'active' : ''}`}
                  onClick={() => setActiveTab(tabKey)}
                >
                  <span>{tabKey === 'shipping' ? 'Shipping & Returns' : tabKey === 'care' ? 'Care Guide' : tabKey}</span>
                  {activeTab === tabKey && (
                    <motion.div layoutId="underlineTab" className="active-tab-line" />
                  )}
                </button>
              ))}
            </div>

            <div className="tabs-content-viewport">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeTab === 'description' && (
                    <div className="tab-description-box">
                      <p>{product.description}</p>
                      <ul className="tab-bullet-list">
                        {product.features.map((feat, idx) => (
                          <li key={idx}>
                            <Sparkles size={11} className="bullet-glow" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === 'specifications' && (
                    <table className="luxury-specs-table">
                      <tbody>
                        {Object.entries(product.specs).map(([k, v]) => (
                          <tr key={k}>
                            <td className="spec-label">{k}</td>
                            <td className="spec-desc">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'shipping' && (
                    <div className="luxury-shipping-tab">
                      <div className="tab-shipping-row">
                        <Truck size={18} />
                        <div>
                          <h5>Priority White-Glove Shipping</h5>
                          <p>Complimentary secure delivery on orders over $150. Courier delivery within 2-3 business days. Sealed signature verify required.</p>
                        </div>
                      </div>
                      <div className="tab-shipping-row">
                        <RotateCcw size={18} />
                        <div>
                          <h5>Discreet Insured Returns</h5>
                          <p>We provide return pickup within 30 days of receiving your item. The return is complimentary if tags remain untampered.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'care' && (
                    <div className="luxury-care-tab">
                      <h5>Aesthetic Preservation Guidelines</h5>
                      <p>Keep this piece stored inside its micro-suede pouch when not in use. Wipe dirt and fingerprint smudges with a dry microfiber cleaning cloth. Avoid chemical solvents and intense temperature changes.</p>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="luxury-reviews-tab">
                      <div className="reviews-tab-top-row">
                        <div className="tab-avg-block">
                          <h3>{product.rating.toFixed(1)}</h3>
                          <div className="stars-mini-row">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                size={12}
                                fill={idx < Math.floor(product.rating) ? 'var(--color-accent)' : 'none'}
                                color={idx < Math.floor(product.rating) ? 'var(--color-accent)' : '#ccc'}
                              />
                            ))}
                          </div>
                          <span className="reviews-caption">({totalReviewsCount} reviews)</span>
                        </div>

                        <div className="tab-bars-list">
                          {Object.entries(ratingsBreakdown).reverse().map(([s, p]) => (
                            <div key={s} className="tab-bar-row">
                              <span className="bar-stars">{s} ★</span>
                              <div className="bar-track">
                                <div className="bar-fill" style={{ width: `${p}%` }} />
                              </div>
                              <span className="bar-percentage">{p}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Review Submission Form */}
                      <form className="luxury-write-review-form" onSubmit={handleReviewSubmit}>
                        <h5>Publish Certified Review</h5>
                        <div className="rating-select-row">
                          <span>Rating:</span>
                          <div className="stars-selector-buttons">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setNewReviewRating(s)}
                                className={s <= newReviewRating ? 'active' : ''}
                              >
                                <Star size={14} fill={s <= newReviewRating ? 'var(--color-accent)' : 'none'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="form-double-fields">
                          <input
                            type="text"
                            placeholder="Your full name"
                            value={newReviewName}
                            onChange={(e) => setNewReviewName(e.target.value)}
                            required
                          />
                        </div>
                        <textarea
                          placeholder="Write your verification statement..."
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          required
                        />
                        <button type="submit" className="btn btn-outline submit-review-luxury">Post Review</button>
                      </form>

                      {/* Feeds list */}
                      <div className="tab-reviews-feed">
                        {reviewsList.map((rev) => (
                          <div className="tab-review-card" key={rev.id}>
                            <div className="review-card-header">
                              <h6>{rev.user}</h6>
                              <span className="card-date">{rev.date}</span>
                            </div>
                            <div className="card-stars">
                              {[...Array(5)].map((_, idx) => (
                                <Star
                                  key={idx}
                                  size={10}
                                  fill={idx < rev.rating ? 'var(--color-accent)' : 'none'}
                                  color={idx < rev.rating ? 'var(--color-accent)' : '#ccc'}
                                />
                              ))}
                            </div>
                            <p className="card-comment">{rev.comment}</p>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Premium Trust Cards Section */}
          <div className="luxury-trust-cards-section">
            <div className="trust-card">
              <Award size={20} />
              <h5>100% Authentic Guarantee</h5>
              <p>Every piece is certified and sealed by our atelier curators.</p>
            </div>
            <div className="trust-card">
              <CreditCard size={20} />
              <h5>Secure Encrypted Payments</h5>
              <p>SSL-protected protocols with zero card information stored.</p>
            </div>
            <div className="trust-card">
              <Globe size={20} />
              <h5>Worldwide Insured Transit</h5>
              <p>White-glove priority shipping, fully insured in transit.</p>
            </div>
            <div className="trust-card">
              <RotateCcw size={20} />
              <h5>Discreet 30-Day Returns</h5>
              <p>Complimentary pickup service in original condition.</p>
            </div>
            <div className="trust-card">
              <Gift size={20} />
              <h5>Signature Premium Packaging</h5>
              <p>Shipped in our suede-lined embossed green box.</p>
            </div>
          </div>

          {/* Clean FAQ Accordion Section */}
          <div className="luxury-faq-section">
            <h3 className="faq-section-title">Frequently Asked Questions</h3>
            <div className="faq-accordion-container">
              {faqData.map((faq, idx) => {
                const isFAQActive = activeFAQIndex === idx;
                return (
                  <div key={idx} className="faq-accordion-item">
                    <button
                      className={`faq-accordion-trigger ${isFAQActive ? 'active' : ''}`}
                      onClick={() => setActiveFAQIndex(isFAQActive ? null : idx)}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={16} className="accordion-chevron" />
                    </button>

                    <AnimatePresence initial={false}>
                      {isFAQActive && (
                        <motion.div
                          className="faq-accordion-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <p>{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="faq-advisor-cta">
              <span>Still need help?</span>
              <a href="https://wa.me/923300073073" target="_blank" rel="noopener noreferrer">
                Chat with a Luxury Advisor →
              </a>
            </div>
          </div>

          {/* CURATED RECOMMENDATIONS grids */}

          {/* Row 1: You May Also Like (Category recommendations) */}
          {relatedProducts.length > 0 && (
            <div className="luxury-recommendation-row">
              <h3 className="rec-row-title text-center">You May Also Like</h3>
              <p className="rec-row-subtitle text-center">Curated items matching this piece's aesthetic.</p>
              <div className="rec-row-grid">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Row 2: Complete The Look (Cross-category pairings) */}
          {completeTheLook.length > 0 && (
            <div className="luxury-recommendation-row">
              <h3 className="rec-row-title text-center">Complete The Look</h3>
              <p className="rec-row-subtitle text-center">Accessorize with designer matching pairings.</p>
              <div className="rec-row-grid">
                {completeTheLook.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Row 3: Customers Also Bought (Brand matches) */}
          {customersAlsoBought.length > 0 && (
            <div className="luxury-recommendation-row">
              <h3 className="rec-row-title text-center">Customers Also Bought</h3>
              <p className="rec-row-subtitle text-center">Design pieces from the house of {product.brand}.</p>
              <div className="rec-row-grid">
                {customersAlsoBought.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Row 4: Recently Viewed */}
          {recentlyViewed.length > 1 && (
            <div className="luxury-recommendation-row">
              <h3 className="rec-row-title text-center">Recently Viewed</h3>
              <p className="rec-row-subtitle text-center">Items you have recently inspected.</p>
              <div className="rec-row-grid">
                {recentlyViewed
                  .filter((p) => p.id !== product.id)
                  .slice(0, 4)
                  .map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
              </div>
            </div>
          )}

        </div>

        {/* Lightbox / Fullscreen Gallery Modal */}
        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div
              className="fullscreen-lightbox-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
            >
              <button className="close-lightbox-btn" onClick={() => setIsLightboxOpen(false)}>
                <X size={20} />
              </button>
              <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <img src={activeImage} alt={product.name} className="lightbox-img" />
                <div className="lightbox-caption">{product.brand} — {product.name}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive 360 Fullscreen Modal Viewer */}
        <AnimatePresence>
          {is360Open && (
            <motion.div
              className="fullscreen-360-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="modal-360-header">
                <h3>{product.brand} — Interactive 360° Studio</h3>
                <button className="close-360-btn" onClick={() => setIs360Open(false)}>
                  <X size={20} />
                </button>
              </div>

              <div
                className="modal-360-viewport"
                onWheel={handleWheel}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                <img
                  src={product.multiAngleImages[angleIndex]}
                  alt="Rotational angle frame"
                  className="image-360-rotational"
                  style={{ transform: `scale(${zoomScale})` }}
                  draggable="false"
                />

                {/* Pulsing Hotspots */}
                <div className="hotspot-360 pulse-dot-1" style={{ top: '48%', left: '52%' }}>
                  <span className="tooltip-text">Atelier Hallmark Engraving</span>
                </div>
                <div className="hotspot-360 pulse-dot-2" style={{ top: '65%', left: '46%' }}>
                  <span className="tooltip-text">Calfskin Finish Integrity</span>
                </div>

                <div className="studio-instructions">
                  Drag to Rotate | Wheel to Zoom
                </div>
              </div>

              <div className="modal-360-footer">
                <input
                  type="range"
                  min="0"
                  max={product.multiAngleImages.length - 1}
                  value={angleIndex}
                  onChange={(e) => setAngleIndex(Number(e.target.value))}
                  className="scrub-slider-360"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Purchase Panel (Desktop Only) */}
        <AnimatePresence>
          {showStickyBar && (
            <motion.div
              className="sticky-purchase-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="container sticky-panel-inner">
                <div className="sticky-product-details">
                  <img src={product.image1} alt={product.name} className="sticky-thumb" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
                  <div className="sticky-title-meta">
                    <h5>{product.name}</h5>
                    <div className="sticky-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          fill={i < Math.floor(product.rating) ? "var(--color-accent)" : "none"}
                          color={i < Math.floor(product.rating) ? "var(--color-accent)" : "#ccc"}
                        />
                      ))}
                      <span>({totalReviewsCount})</span>
                    </div>
                  </div>
                </div>

                <div className="sticky-price-box">
                  <span>{formatPrice(finalPrice)}</span>
                </div>

                <div className="sticky-actions">
                  <div className="sticky-qty-box">
                    <button onClick={() => handleQtyChange('dec')} disabled={quantity <= 1}>-</button>
                    <input type="text" value={quantity} readOnly />
                    <button onClick={() => handleQtyChange('inc')} disabled={quantity >= product.stock}>+</button>
                  </div>

                  <button
                    className="btn btn-primary sticky-add-bag"
                    onClick={() => addToCart(product.id, quantity)}
                    disabled={product.stock === 0}
                  >
                    Add to Bag
                  </button>

                  <button
                    className="btn btn-secondary sticky-buy-now"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                  >
                    Buy Now
                  </button>

                  <button
                    className={`sticky-fav-icon ${isWish ? 'active' : ''}`}
                    onClick={() => toggleWishlist(product)}
                  >
                    <Heart size={16} fill={isWish ? "var(--color-accent)" : "none"} />
                  </button>

                  <button className="sticky-share-icon" onClick={handleShareProduct}>
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      );
};

      export default Product;