import React, { useContext } from 'react';
import { Heart, Star, ShoppingBag, Eye, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import './ProductCard.css';
import { formatPrice } from '../../utils/formatter';

const ProductCard = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
    addToCompare,
    removeFromCompare,
    isInCompare
  } = useContext(ShopContext);

  const isWish = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const finalPrice = product.price * (1 - product.discount / 100);

  const handleCompareClick = (e) => {
    e.preventDefault();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <Link to={`/product/${product.id}`}>
          <img src={product.image1} alt={product.name} className="product-image primary" loading="lazy" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
          <img src={product.image2} alt={product.name} className="product-image secondary" loading="lazy" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
        </Link>
        
        {/* Badges */}
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {product.stock === 0 && <span className="product-badge out-of-stock-badge">OUT OF STOCK</span>}
        {product.stock > 0 && product.stock <= 5 && <span className="product-badge low-stock-badge">ONLY {product.stock} LEFT</span>}

        {/* Wishlist Button */}
        <button
          className={`wishlist-btn ${isWish ? 'active' : ''}`}
          onClick={() => toggleWishlist(product)}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isWish ? "var(--color-accent)" : "none"} color={isWish ? "var(--color-accent)" : "currentColor"} />
        </button>

        {/* Compare Button */}
        <button
          className={`compare-btn-card ${isCompared ? 'active' : ''}`}
          onClick={handleCompareClick}
          aria-label="Compare product"
        >
          <GitCompare size={16} />
        </button>

      </div>

      <div className="product-actions">
        <button
          className="action-btn quick-view"
          onClick={() => setQuickViewProduct(product)}
          aria-label="Quick View"
        >
          <Eye size={18} />
        </button>
        
        <button
          className="action-btn add-to-cart"
          onClick={() => addToCart(product.id, 1)}
          aria-label="Add to cart"
          disabled={product.stock === 0}
        >
          <ShoppingBag size={18} />
          <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>

      <div className="product-info">
        {/* Brand Name */}
        <span className="product-card-brand">{product.brand}</span>

        {/* Product Name */}
        <h3 className="product-name-heading" style={{ fontSize: 'inherit', fontWeight: 'inherit', margin: 0 }}>
          <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        </h3>

        {/* Rating Stars */}
        <div className="product-rating">
          <div className="stars-wrapper">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                fill={i < Math.floor(product.rating) ? "var(--color-accent)" : "none"}
                color={i < Math.floor(product.rating) ? "var(--color-accent)" : "#ccc"}
              />
            ))}
          </div>
          <span className="review-count">({product.reviews})</span>
        </div>

        {/* Pricing */}
        <div className="product-price-row">
          {product.discount > 0 ? (
            <>
              <span className="product-price discounted">{formatPrice(finalPrice)}</span>
              <span className="product-original-price">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="product-price">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;