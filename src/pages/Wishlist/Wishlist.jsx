import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { Heart, ShoppingBag, Share2, Plus, Check } from 'lucide-react';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart, products, showToast } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [sharedProducts, setSharedProducts] = useState([]);
  const [isSharedMode, setIsSharedMode] = useState(false);

  // Sync / check for shared wishlist in URL query
  useEffect(() => {
    const sharedParam = searchParams.get('shared');
    if (sharedParam) {
      const ids = sharedParam.split(',').map(Number);
      const matched = products.filter((p) => ids.includes(p.id));
      setSharedProducts(matched);
      setIsSharedMode(true);
    } else {
      setIsSharedMode(false);
    }
  }, [searchParams, products]);

  // Copy shareable link to clipboard
  const handleShareWishlist = () => {
    if (wishlist.length === 0) return;
    const ids = wishlist.map((p) => p.id).join(',');
    const shareUrl = `${window.location.origin}/wishlist?shared=${ids}`;
    
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        showToast('Wishlist sharing link copied to clipboard!');
      },
      () => {
        showToast('Failed to copy sharing link.', 'error');
      }
    );
  };

  // Import shared items to user wishlist
  const handleImportShared = () => {
    sharedProducts.forEach((prod) => {
      // Add if not already in wishlist
      const exists = wishlist.some((item) => item.id === prod.id);
      if (!exists) {
        toggleWishlist(prod);
      }
    });
    showToast('Imported all shared favorites to your wishlist!');
  };

  // Move item to cart (adds to cart and removes from wishlist)
  const handleMoveToCart = (product) => {
    addToCart(product.id, 1);
    toggleWishlist(product); // removes it
  };

  const displayList = isSharedMode ? sharedProducts : wishlist;

  return (
    <div className="wishlist-page-wrapper">
      {/* Header Banner */}
      <div className="wishlist-header">
        <div className="container header-flex-container">
          <div>
            <span className="wishlist-subtitle">{isSharedMode ? 'CURATED LIST' : 'YOUR FAVORITES'}</span>
            <h1 className="wishlist-title">{isSharedMode ? 'Shared Favorites' : 'My Wishlist'}</h1>
          </div>
          
          {/* Share Button (if own list has items) */}
          {!isSharedMode && wishlist.length > 0 && (
            <button className="btn btn-secondary share-wishlist-btn" onClick={handleShareWishlist}>
              <Share2 size={16} style={{ marginRight: '8px' }} />
              Share List
            </button>
          )}

          {/* Import Button (if shared mode has items) */}
          {isSharedMode && sharedProducts.length > 0 && (
            <button className="btn btn-primary share-wishlist-btn" onClick={handleImportShared}>
              <Plus size={16} style={{ marginRight: '8px' }} />
              Add All to My Favorites
            </button>
          )}
        </div>
      </div>

      <div className="container section-padding">
        {displayList.length === 0 ? (
          <div className="empty-wishlist text-center">
            <div className="empty-icon-wrapper">
              <Heart size={48} className="empty-icon" />
            </div>
            <h2>{isSharedMode ? 'No Shared Items Found' : 'Your Wishlist is Empty'}</h2>
            <p>
              {isSharedMode 
                ? 'This shared list has no valid luxury pieces or is expired.' 
                : 'Save your favorite items here to view them later, compare, or add them to your bag.'}
            </p>
            <Link to="/shop" className="btn btn-primary">
              <ShoppingBag size={18} style={{ marginRight: '8px' }} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {displayList.map((product) => (
              <div key={product.id} className="wishlist-card-container">
                <ProductCard product={product} />
                
                {/* Actions Grid below product card */}
                {!isSharedMode && (
                  <div className="wishlist-card-actions">
                    <button 
                      className="btn btn-secondary move-to-cart-btn"
                      onClick={() => handleMoveToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingBag size={14} style={{ marginRight: '6px' }} />
                      <span>{product.stock === 0 ? 'Sold Out' : 'Move to Cart'}</span>
                    </button>
                    <button 
                      className="wishlist-card-remove-btn"
                      onClick={() => toggleWishlist(product)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
