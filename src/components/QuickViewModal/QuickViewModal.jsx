import React, { useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';
import { X, Star, Heart, ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import './QuickViewModal.css';
import { formatPrice } from '../../utils/formatter';

const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useContext(ShopContext);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isWish = isInWishlist(product.id);

  const handleClose = () => {
    setQuickViewProduct(null);
  };

  const handleAddToCart = () => {
    addToCart(product.id, 1);
    handleClose();
  };

  const handleToggleWish = () => {
    toggleWishlist(product);
  };

  return (
    <div className="quickview-overlay" onClick={handleClose}>
      <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="quickview-close-btn" onClick={handleClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="quickview-grid">
          {/* Images */}
          <div className="quickview-gallery">
            <div className="quickview-main-image-container">
              <img src={product.image1} alt={product.name} className="quickview-image" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
            </div>
          </div>

          {/* Details */}
          <div className="quickview-details">
            {product.badge && <span className="quickview-badge">{product.badge}</span>}
            <h2 className="quickview-name">{product.name}</h2>
            
            <div className="quickview-rating">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(product.rating) ? "var(--color-accent)" : "none"}
                  color={i < Math.floor(product.rating) ? "var(--color-accent)" : "#ccc"}
                />
              ))}
              <span className="quickview-reviews-count">({product.reviews} reviews)</span>
            </div>

            <p className="quickview-price">{formatPrice(product.price)}</p>
            <p className="quickview-desc">{product.description}</p>

            <div className="quickview-stock-status">
              <span className={`status-dot ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
              <span className="status-text">
                {product.stock > 0 ? `${product.stock} items available in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="quickview-actions">
              <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingBag size={18} style={{ marginRight: '8px' }} />
                Add to Cart
              </button>
              
              <button className={`btn btn-outline quickview-wish-btn ${isWish ? 'active' : ''}`} onClick={handleToggleWish}>
                <Heart size={18} fill={isWish ? "var(--color-accent)" : "none"} color={isWish ? "var(--color-accent)" : "currentColor"} />
              </button>
            </div>

            <Link to={`/product/${product.id}`} className="view-details-link" onClick={handleClose}>
              <Eye size={16} style={{ marginRight: '6px' }} />
              View full details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
