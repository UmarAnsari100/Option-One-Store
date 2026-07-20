import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import { ShoppingBag, Eye, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Lookbook.css';
import { formatPrice } from '../../utils/formatter';

const Lookbook = () => {
  const { products, addToCart } = useContext(ShopContext);
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Curated hotspots on editorial images mapping to real product IDs
  const looks = [
    {
      id: 'look-1',
      title: 'The Executive Presence',
      subtitle: 'VOL. I — MODERN METROPOLITAN',
      bgImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
      desc: 'Refining the boundaries of corporate posture. Premium Swiss automatic calibres paired with fine grain Saffiano leather portfolios create an unmistakable statement of intent.',
      hotspots: [
        {
          id: 'h-1-1',
          productId: 1, // Watches: Rolex Classic
          top: '45%',
          left: '30%',
          label: 'Maison Chronometer'
        },
        {
          id: 'h-1-2',
          productId: 17, // Handbags: Louis Vuitton Pebbled Leather
          top: '72%',
          left: '60%',
          label: 'Executive Saffiano Port'
        }
      ]
    },
    {
      id: 'look-2',
      title: 'Evening Vermeil',
      subtitle: 'VOL. II — QUIET GLAMOUR',
      bgImage: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1600&auto=format&fit=crop',
      desc: 'A studied elegance. Sunlight reflecting off thick 18k gold plating vermeil sterling silver links, layered alongside deep forest emerald pendants to create a radiant aura.',
      hotspots: [
        {
          id: 'h-2-1',
          productId: 49, // Jewelry: Tiffany Emerald Pendant
          top: '35%',
          left: '52%',
          label: 'Forest Emerald Pendant'
        },
        {
          id: 'h-2-2',
          productId: 65, // Sunglasses: Tom Ford Sunglasses
          top: '18%',
          left: '42%',
          label: 'Wayfarer Acetate Frames'
        }
      ]
    },
    {
      id: 'look-3',
      title: 'The Weekend Voyager',
      subtitle: 'VOL. III — ALPINE RESORT',
      bgImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1600&auto=format&fit=crop',
      desc: 'Escaping the grid with uncompromised posture. Heavyweight vegetable-tanned duffles, water-repellent travel bags, and flexible calfskin Chelsea boots.',
      hotspots: [
        {
          id: 'h-3-1',
          productId: 145, // Travel Bags: Rolex canvas weekender
          top: '60%',
          left: '48%',
          label: 'Weekender Duffle Bag'
        },
        {
          id: 'h-3-2',
          productId: 81, // Shoes: Louboutin Loafers
          top: '88%',
          left: '35%',
          label: 'Chelsea Calfskin Boots'
        }
      ]
    }
  ];

  const handleHotspotClick = (e, hotspotId) => {
    e.stopPropagation();
    setActiveHotspot(activeHotspot === hotspotId ? null : hotspotId);
  };

  const getProductData = (pId) => {
    return products.find((p) => p.id === Number(pId));
  };

  return (
    <div className="lookbook-page-wrapper" onClick={() => setActiveHotspot(null)}>
      {/* Editorial Title Banner */}
      <section className="lookbook-title-banner text-center">
        <span className="editorial-vol">MAISON JOURNAL</span>
        <h1 className="lookbook-title-h1">The Lookbook</h1>
        <p className="lookbook-subtitle">Autumn / Winter Edition 2026</p>
      </section>

      {/* Lookbook Slides */}
      <div className="lookbook-sections-list">
        {looks.map((look, index) => (
          <section className="lookbook-slide-section" key={look.id}>
            {/* Parallax Image container */}
            <div className="look-image-frame">
              <div 
                className="look-parallax-bg"
                style={{ backgroundImage: `url(${look.bgImage})` }}
              />
              <div className="look-overlay-tint" />
              
              {/* Hotspots Render */}
              {look.hotspots.map((hs) => {
                const prod = getProductData(hs.productId);
                if (!prod) return null;
                const finalPrice = prod.price * (1 - prod.discount / 100);
                const isOpen = activeHotspot === hs.id;

                return (
                  <div 
                    key={hs.id} 
                    className="look-hotspot-container"
                    style={{ top: hs.top, left: hs.left }}
                  >
                    <button 
                      className={`hotspot-pin ${isOpen ? 'active' : ''}`}
                      onClick={(e) => handleHotspotClick(e, hs.id)}
                      aria-label={`View product details for ${hs.label}`}
                    >
                      <Plus size={16} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          className="hotspot-popup-card"
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <img src={prod.image1} alt={prod.name} className="popup-card-img" />
                          <div className="popup-card-details">
                            <span className="popup-brand">{prod.brand}</span>
                            <h5 className="popup-title">{prod.name}</h5>
                            <span className="popup-price">{formatPrice(finalPrice)}</span>
                            
                            <div className="popup-actions">
                              <Link to={`/product/${prod.id}`} className="popup-action-btn view">
                                <Eye size={12} />
                                <span>Inspect</span>
                              </Link>
                              <button 
                                className="popup-action-btn bag"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(prod.id, 1);
                                }}
                                disabled={prod.stock === 0}
                              >
                                <ShoppingBag size={12} />
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Description Card */}
            <div className="look-text-block container">
              <div className="look-text-wrapper">
                <span className="look-sub">{look.subtitle}</span>
                <h2>{look.title}</h2>
                <p>{look.desc}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Lookbook;
