import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useScroll, useReducedMotion } from 'framer-motion';
import { ArrowRight, Heart, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { ShopContext } from '../../context/ShopContext';
import { staggerContainer, staggerItem } from '../../utils/animations';
import './Hero.css';

const Hero = () => {
  const { addToCart, toggleWishlist, isInWishlist } = useContext(ShopContext);
  const shouldReduceMotion = useReducedMotion();

  // Scroll offset for parallax background (Apple style scroll-parallax)
  const { scrollY } = useScroll();
  const bgScrollY = useTransform(scrollY, [0, 1000], [0, 120]);
  const modelScrollY = useTransform(scrollY, [0, 1000], [0, 40]);

  // Mouse coordinates tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 45, stiffness: 200, mass: 0.8 };
  const springMouseX = useSpring(mouseX, springConfig);
  const springMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) - 0.5;
    const y = (clientY / innerHeight) - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Ultra-subtle luxury parallax offsets (5px model, 2px bg)
  const bgX = useTransform(springMouseX, [-0.5, 0.5], [-2, 2]);
  const bgY = useTransform(springMouseY, [-0.5, 0.5], [-2, 2]);

  const modelX = useTransform(springMouseX, [-0.5, 0.5], [-5, 5]);
  const modelY = useTransform(springMouseY, [-0.5, 0.5], [-5, 5]);

  const card1X = useTransform(springMouseX, [-0.5, 0.5], [-3, 3]);
  const card1Y = useTransform(springMouseY, [-0.5, 0.5], [-3, 3]);

  const card2X = useTransform(springMouseX, [-0.5, 0.5], [3, -3]);
  const card2Y = useTransform(springMouseY, [-0.5, 0.5], [3, -3]);

  const card3X = useTransform(springMouseX, [-0.5, 0.5], [-2, 2]);
  const card3Y = useTransform(springMouseY, [-0.5, 0.5], [2, -2]);

  const isHandbagInWishlist = isInWishlist(3);

  return (
    <section className="hero-section" onMouseMove={handleMouseMove}>
      {/* Parallax & Zoom Showroom Background */}
      <motion.div className="hero-bg-scroll-wrapper" style={{ y: shouldReduceMotion ? 0 : bgScrollY }}>
        <div className="hero-bg-zoom-wrapper">
          <motion.div
            className="hero-bg"
            style={{ x: bgX, y: bgY }}
          />
        </div>
      </motion.div>

      {/* Cinematic Overlays */}
      <div className="hero-overlay-left"></div>
      <div className="hero-overlay-warm"></div>

      {/* Sparks/Floating Particles (5% opacity) */}
      <div className="luxury-particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`luxury-sparkle sparkle-${i + 1}`}>
            <Sparkles size={8} />
          </div>
        ))}
      </div>

      <div className="container hero-split-container">
        <motion.div
          className="hero-grid-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Left Editorial Content */}
          <div className="hero-content-col">
            {/* EST Badge */}
            <motion.div className="luxury-badge" variants={staggerItem(shouldReduceMotion)}>
              <span className="badge-line"></span>
              <span className="badge-text">EST. 2026 — CRAFTED FOR ELEGANCE</span>
            </motion.div>

            {/* Headline */}
            <h1 className="hero-headline-split">
              <div className="headline-line-wrapper">
                <motion.div variants={staggerItem(shouldReduceMotion)}>Luxury That Defines</motion.div>
              </div>
              <div className="headline-line-wrapper">
                <motion.div variants={staggerItem(shouldReduceMotion)} className="headline-highlight">
                  Your <span>Signature</span> Style
                </motion.div>
              </div>
            </h1>

            {/* Paragraph */}
            <motion.p className="hero-paragraph-split" variants={staggerItem(shouldReduceMotion)}>
              Step into a space where time, structure, and design align. Discover premium mechanical watches, designer handbags, shiny zircon bracelets, and high-fidelity audio gear curated for the discerning individual.
            </motion.p>

            {/* Actions */}
            <motion.div className="hero-actions-split" variants={staggerItem(shouldReduceMotion)}>
              <Link to="/shop" className="btn btn-luxury-solid">
                <span>Shop Collection</span>
                <ArrowRight size={15} className="btn-arrow" />
              </Link>
              <Link to="/about" className="btn btn-luxury-outlined">
                Explore Maison
              </Link>
            </motion.div>
          </div>

          {/* Right Visual Column (~45% width occupancy) */}
          <div className="hero-visual-col">
            <div className="cinematic-backdrop"></div>

            <div className="model-composition-container">
              {/* Model Parallax & Float wrappers */}
              <motion.div
                className="model-scroll-parallax"
                style={{ y: shouldReduceMotion ? 0 : modelScrollY }}
              >
                <motion.div
                  className="model-parallax-wrapper"
                  style={{ x: modelX, y: shouldReduceMotion ? 0 : modelY }}
                >
                  <div className={shouldReduceMotion ? '' : 'model-float-wrapper'}>
                    <motion.div
                      className="model-frame"
                      variants={staggerItem(shouldReduceMotion)}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop"
                        alt="Option One Luxury Model"
                        className="model-img"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>              {/* FLOATING PRODUCT CARDS */}

              {/* Card 1: Watch Card */}
              <motion.div
                className="floating-glass-card watch-card"
                style={{ x: card1X, y: card1Y }}
                variants={staggerItem(shouldReduceMotion)}
                whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -5 }}
                transition={{ duration: 0.5, ease: luxuryEase }}
              >
                <div className="card-badge">NEW ARRIVAL</div>
                <div className="card-product-img">
                  <img src="https://cf.cjdropshipping.com/cb01749d-a005-45b8-8a8f-ef5fc3d0417f.jpg" alt="Luminous Steel Quartz Watch" />
                </div>
                <div className="card-meta">
                  <h5>Luminous Steel Watch</h5>
                  <span className="card-price">Rs 12000.00</span>
                  <div className="card-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={9} fill="var(--color-accent)" color="var(--color-accent)" />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Handbag Card */}
              <motion.div
                className="floating-glass-card bag-card"
                style={{ x: card2X, y: card2Y }}
                variants={staggerItem(shouldReduceMotion)}
                whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: 5 }}
                transition={{ duration: 0.5, ease: luxuryEase }}
              >
                <button
                  className={`card-icon-btn ${isHandbagInWishlist ? 'active' : ''}`}
                  onClick={() => toggleWishlist({ id: 3, name: 'Retro Single-Shoulder Bag', price: 4500.00 })}
                  aria-label="Add to wishlist"
                >
                  <Heart size={11} fill={isHandbagInWishlist ? "var(--color-accent)" : "none"} color={isHandbagInWishlist ? "var(--color-accent)" : "currentColor"} />
                </button>
                <div className="card-product-img">
                  <img src="https://oss-cf.cjdropshipping.com/product/2026/09/11/09/48e5a0fc-48f0-4469-9c0e-92923fb33f99.jpg" alt="Retro Single-Shoulder Bag" />
                </div>
                <div className="card-meta">
                  <h5>Retro Shoulder Bag</h5>
                  <span className="card-price">Rs 4500.00</span>
                </div>
              </motion.div>

              {/* Card 3: Necklace Card */}
              <motion.div
                className="floating-glass-card jewelry-card"
                style={{ x: card3X, y: card3Y }}
                variants={staggerItem(shouldReduceMotion)}
                whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -3 }}
                transition={{ duration: 0.5, ease: luxuryEase }}
              >
                <button
                  className="card-icon-btn add-to-cart"
                  onClick={() => addToCart(2, 1)}
                  aria-label="Add to cart"
                >
                  <ShoppingBag size={11} />
                </button>
                <div className="card-product-img">
                  <img src="https://cf.cjdropshipping.com/ea5b4ee6-eff3-485f-98ac-d14a7c45a37e.jpg" alt="Fashion Bracelet Set" />
                </div>
                <div className="card-meta">
                  <h5>Fashion Bracelet Set</h5>
                  <span className="card-price">Rs 1850.00</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>


    </section>
  );
};

const luxuryEase = [0.22, 1, 0.36, 1];

export default Hero;