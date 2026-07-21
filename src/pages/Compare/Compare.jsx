import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { X, Star, ShoppingBag, ArrowLeft, Layers } from 'lucide-react';
import './Compare.css';
import { formatPrice } from '../../utils/formatter';

const Compare = () => {
  const { 
    compare, 
    removeFromCompare, 
    clearCompare, 
    addToCart 
  } = useContext(ShopContext);

  const handleAddToCart = (productId) => {
    addToCart(productId, 1);
  };

  return (
    <div className="compare-page-wrapper">
      {/* Header Banner */}
      <div className="compare-header">
        <div className="container header-flex">
          <div>
            <span className="compare-subtitle">MAISON SERVICE</span>
            <h1 className="compare-title">Compare Pieces</h1>
          </div>
          
          {compare.length > 0 && (
            <button className="btn btn-outline clear-compare-btn" onClick={clearCompare}>
              Clear Comparison
            </button>
          )}
        </div>
      </div>

      <div className="container section-padding">
        {compare.length === 0 ? (
          <div className="empty-compare text-center">
            <div className="empty-icon-box">
              <Layers size={48} className="empty-icon" />
            </div>
            <h2>No Pieces Selected for Comparison</h2>
            <p>Go to our signature catalog and select up to four items to compare their dimensions, materials, and features side by side.</p>
            <Link to="/shop" className="btn btn-primary">
              <ArrowLeft size={16} style={{ marginRight: '8px' }} />
              Return to Catalog
            </Link>
          </div>
        ) : (
          <div className="compare-table-container">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-row-title">Product details</th>
                  {compare.map((product) => {
                    const finalPrice = product.price * (1 - product.discount / 100);
                    return (
                      <th key={product.id} className="compare-product-col-header">
                        <div className="compare-header-card">
                          <button 
                            className="remove-from-compare-btn"
                            onClick={() => removeFromCompare(product.id)}
                            aria-label={`Remove ${product.name} from comparison`}
                          >
                            <X size={16} />
                          </button>
                          <img src={product.image1} alt={product.name} className="compare-card-image" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"; }} />
                          <span className="compare-brand-tag">{product.brand}</span>
                          <Link to={`/product/${product.id}`} className="compare-product-name">{product.name}</Link>
                        </div>
                      </th>
                    );
                  })}
                  {/* Fill up remaining spaces to match 4 columns if length < 4 */}
                  {[...Array(4 - compare.length)].map((_, idx) => (
                    <th key={`empty-header-${idx}`} className="compare-empty-col">
                      <div className="empty-column-card">
                        <p>Select another piece to compare</p>
                        <Link to="/shop" className="btn btn-outline select-piece-btn">Add Piece</Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr>
                  <td className="compare-row-title">Price</td>
                  {compare.map((product) => {
                    const finalPrice = product.price * (1 - product.discount / 100);
                    return (
                      <td key={`price-${product.id}`} className="compare-data-cell price-cell">
                        {product.discount > 0 ? (
                          <div className="compare-price-block">
                            <span className="final-price">{formatPrice(finalPrice)}</span>
                            <span className="old-price">{formatPrice(product.price)}</span>
                          </div>
                        ) : (
                          <span>{formatPrice(product.price)}</span>
                        )}
                      </td>
                    );
                  })}
                  {[...Array(4 - compare.length)].map((_, idx) => (
                    <td key={`empty-price-${idx}`} className="compare-empty-cell">—</td>
                  ))}
                </tr>

                {/* Brand Row */}
                <tr>
                  <td className="compare-row-title">Designer House</td>
                  {compare.map((product) => (
                    <td key={`brand-${product.id}`} className="compare-data-cell font-ui-semibold">
                      {product.brand}
                    </td>
                  ))}
                  {[...Array(4 - compare.length)].map((_, idx) => (
                    <td key={`empty-brand-${idx}`} className="compare-empty-cell">—</td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr>
                  <td className="compare-row-title">Customer Rating</td>
                  {compare.map((product) => (
                    <td key={`rating-${product.id}`} className="compare-data-cell">
                      <div className="compare-rating-box">
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < Math.floor(product.rating) ? "var(--color-accent)" : "none"}
                              color={i < Math.floor(product.rating) ? "var(--color-accent)" : "#ccc"}
                            />
                          ))}
                        </div>
                        <span className="rating-count">({product.reviews} reviews)</span>
                      </div>
                    </td>
                  ))}
                  {[...Array(4 - compare.length)].map((_, idx) => (
                    <td key={`empty-rating-${idx}`} className="compare-empty-cell">—</td>
                  ))}
                </tr>

                {/* Material Row */}
                <tr>
                  <td className="compare-row-title">Material</td>
                  {compare.map((product) => (
                    <td key={`material-${product.id}`} className="compare-data-cell">
                      {product.material || product.specs.Material || 'Premium'}
                    </td>
                  ))}
                  {[...Array(4 - compare.length)].map((_, idx) => (
                    <td key={`empty-material-${idx}`} className="compare-empty-cell">—</td>
                  ))}
                </tr>

                {/* Dimensions Row */}
                <tr>
                  <td className="compare-row-title">Dimensions</td>
                  {compare.map((product) => (
                    <td key={`dimensions-${product.id}`} className="compare-data-cell">
                      {product.specs.Dimensions || 'N/A'}
                    </td>
                  ))}
                  {[...Array(4 - compare.length)].map((_, idx) => (
                    <td key={`empty-dimensions-${idx}`} className="compare-empty-cell">—</td>
                  ))}
                </tr>

                {/* Warranty Row */}
                <tr>
                  <td className="compare-row-title">Warranty</td>
                  {compare.map((product) => (
                    <td key={`warranty-${product.id}`} className="compare-data-cell">
                      {product.specs.Warranty || '2 Year Limited'}
                    </td>
                  ))}
                  {[...Array(4 - compare.length)].map((_, idx) => (
                    <td key={`empty-warranty-${idx}`} className="compare-empty-cell">—</td>
                  ))}
                </tr>

                {/* Features Row */}
                <tr>
                  <td className="compare-row-title">Special Features</td>
                  {compare.map((product) => (
                    <td key={`features-${product.id}`} className="compare-data-cell align-top">
                      <ul className="compare-features-list">
                        {product.features.slice(0, 4).map((feat, idx) => (
                          <li key={idx}>{feat}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                  {[...Array(4 - compare.length)].map((_, idx) => (
                    <td key={`empty-features-${idx}`} className="compare-empty-cell">—</td>
                  ))}
                </tr>

                {/* Actions Row */}
                <tr>
                  <td className="compare-row-title">Purchase Option</td>
                  {compare.map((product) => (
                    <td key={`action-${product.id}`} className="compare-data-cell">
                      <button 
                        className="btn btn-primary compare-add-bag-btn"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stock === 0}
                      >
                        <ShoppingBag size={14} style={{ marginRight: '6px' }} />
                        <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}</span>
                      </button>
                    </td>
                  ))}
                  {[...Array(4 - compare.length)].map((_, idx) => (
                    <td key={`empty-action-${idx}`} className="compare-empty-cell">—</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
