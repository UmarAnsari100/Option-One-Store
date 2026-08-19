import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import Product from './pages/Product/Product';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Wishlist from './pages/Wishlist/Wishlist';
import Brands from './pages/Brands/Brands';
import Compare from './pages/Compare/Compare';
import Lookbook from './pages/Lookbook/Lookbook';
import Blog from './pages/Blog/Blog';
import Toast from './components/Toast/Toast';
import QuickViewModal from './components/QuickViewModal/QuickViewModal';
import MiniCart from './components/MiniCart/MiniCart';
import CursorGlow from './components/CursorGlow/CursorGlow';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton/WhatsAppFloatingButton';
import { ShopProvider } from './context/ShopProvider';
import { motion, AnimatePresence } from 'framer-motion';

// Code-split heavy Admin and Customer Portal pages
const Admin = lazy(() => import('./pages/Admin/Admin'));
const Account = lazy(() => import('./pages/Account/Account'));

// Loading Fallback Spinner
const PageFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Loading Maison Module...</div>
  </div>
);

// Premium Page Transition Wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Sub-component for App Routes
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/brands" element={<Brands />} />~
        <Route path="/compare" element={<Compare />} />
        <Route path="/lookbook" element={<Lookbook />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ShopProvider>
      <Router>
        <ScrollToTop />
        <CursorGlow />
        <Navbar />
        <MiniCart />
        <Toast />
        <QuickViewModal />
        <main id="main-content">
          <AppRoutes />
        </main>
        <Footer />
        <WhatsAppFloatingButton />
      </Router>
    </ShopProvider>
  );
}

export default App;
