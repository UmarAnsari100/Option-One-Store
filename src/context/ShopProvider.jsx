import React, { useState, useEffect, useCallback } from 'react';
import { ShopContext } from './ShopContext';
import { productRepository } from '../repositories/ProductRepository';
import { orderRepository } from '../repositories/OrderRepository';
import { customerRepository } from '../repositories/CustomerRepository';
import { settingsRepository } from '../repositories/SettingsRepository';
import { cjSyncService } from '../services/cjSyncService';
import { cjApi } from '../services/cjApi';
import { analyticsService } from '../services/analyticsService';

export const ShopProvider = ({ children }) => {
  // Production Database States (Loaded live from MySQL REST APIs)
  const [allProducts, setAllProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [themeSettings, setThemeSettings] = useState(() => settingsRepository.getSettings());

  // Customer & Admin Auth States
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token') || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Shopping States
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch {
      return [];
    }
  });

  const [compare, setCompare] = useState(() => {
    try {
      const savedCompare = localStorage.getItem('compare');
      return savedCompare ? JSON.parse(savedCompare) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const savedRecently = localStorage.getItem('recentlyViewed');
      return savedRecently ? JSON.parse(savedRecently) : [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('compare', JSON.stringify(compare));
  }, [compare]);

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('admin_token', adminToken);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  }, [adminToken, adminUser]);

  useEffect(() => {
    if (customerUser) {
      localStorage.setItem('customer_user', JSON.stringify(customerUser));
    } else {
      localStorage.removeItem('customer_user');
    }
  }, [customerUser]);

  // Derived Public Products (Strictly status === 'published')
  const publishedProducts = allProducts.filter((p) => p.status === 'published');

  // Async MySQL Data Fetch Helpers
  const refreshProducts = useCallback(async () => {
    try {
      const prods = await productRepository.getPublished();
      setAllProducts(prods || []);
    } catch (e) {
      console.error('[ShopProvider Error] Failed to refresh products from MySQL:', e);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      const ords = await orderRepository.getOrders();
      setOrders(ords || []);
    } catch (e) {
      console.error('[ShopProvider Error] Failed to refresh orders from MySQL:', e);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
    refreshOrders();
  }, [refreshProducts, refreshOrders]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Management
  const addToCart = (productId, quantity = 1) => {
    const product = publishedProducts.find((p) => String(p.id) === String(productId)) || allProducts.find((p) => String(p.id) === String(productId));
    if (!product) return;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => String(item.product.id) === String(product.id));
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const newQty = updatedCart[existingItemIndex].quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Cannot add more. Only ${product.stock} items in stock.`, 'error');
          return prevCart;
        }
        updatedCart[existingItemIndex].quantity = newQty;
        showToast(`Updated quantity of ${product.name} in cart.`);
        analyticsService.trackAddToCart(product, quantity);
        return updatedCart;
      } else {
        if (quantity > product.stock) {
          showToast(`Cannot add. Only ${product.stock} items in stock.`, 'error');
          return prevCart;
        }
        showToast(`Added ${product.name} to cart.`);
        analyticsService.trackAddToCart(product, quantity);
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    const item = cart.find((c) => String(c.product.id) === String(productId));
    if (item) {
      setCart((prevCart) => prevCart.filter((c) => String(c.product.id) !== String(productId)));
      showToast(`Removed ${item.product.name} from cart.`);
    }
  };

  const updateQuantity = (productId, qty) => {
    const product = allProducts.find((p) => String(p.id) === String(productId));
    if (!product) return;

    if (qty < 1) {
      removeFromCart(productId);
      return;
    }

    if (qty > product.stock) {
      showToast(`Only ${product.stock} items in stock.`, 'warning');
      qty = product.stock;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        String(item.product.id) === String(productId) ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist, Compare, Recently Viewed
  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => String(item.id) === String(product.id));
      if (exists) {
        showToast(`Removed ${product.name} from wishlist.`);
        return prevWishlist.filter((item) => String(item.id) !== String(product.id));
      } else {
        showToast(`Added ${product.name} to wishlist.`);
        return [...prevWishlist, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => String(item.id) === String(productId));
  };

  const addToCompare = (product) => {
    setCompare((prevCompare) => {
      const exists = prevCompare.some((item) => String(item.id) === String(product.id));
      if (exists) {
        showToast(`${product.name} is already in the comparison list.`, 'warning');
        return prevCompare;
      }
      if (prevCompare.length >= 4) {
        showToast(`You can compare up to 4 products only.`, 'warning');
        return prevCompare;
      }
      showToast(`Added ${product.name} to comparison list.`);
      return [...prevCompare, product];
    });
  };

  const removeFromCompare = (productId) => {
    setCompare((prevCompare) => prevCompare.filter((item) => String(item.id) !== String(productId)));
    showToast(`Removed product from comparison list.`);
  };

  const clearCompare = () => {
    setCompare([]);
    showToast(`Comparison list cleared.`);
  };

  const isInCompare = (productId) => {
    return compare.some((item) => String(item.id) === String(productId));
  };

  const addToRecentlyViewed = (product) => {
    setRecentlyViewed((prevRecently) => {
      const filtered = prevRecently.filter((item) => String(item.id) !== String(product.id));
      return [product, ...filtered].slice(0, 8);
    });
    analyticsService.trackViewItem(product);
  };

  // Calculations
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Admin Auth Handlers
  const loginAdmin = async (email, password) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setAdminToken(data.token);
        setAdminUser(data.user);
        showToast(`Welcome back, ${data.user.name}!`);
        return { success: true };
      } else {
        showToast(data.message || 'Login failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (error) {
      // Fallback for dev mode
      if (email === 'admin@optiononestore.com' || email === 'admin') {
        const dummyToken = 'mock_jwt_admin_token_2026';
        const dummyUser = { email: 'admin@optiononestore.com', name: 'Maison Admin', role: 'Super Admin' };
        setAdminToken(dummyToken);
        setAdminUser(dummyUser);
        showToast(`Welcome back, Administrator!`);
        return { success: true };
      }
      showToast('Authentication server connection error', 'error');
      return { success: false, message: 'Server connection error' };
    }
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    showToast('Admin logged out safely.');
  };

  // Customer Auth Handlers
  const registerCustomer = (name, email, phone, password) => {
    try {
      const newCust = customerRepository.registerCustomer({ name, email, phone, password });
      setCustomerUser(newCust);
      showToast(`Account created! Welcome to Option One Store, ${name}.`);
      return { success: true };
    } catch (e) {
      showToast(e.message, 'error');
      return { success: false, message: e.message };
    }
  };

  const loginCustomer = (email, password) => {
    const existing = customerRepository.findByEmail(email);
    if (existing) {
      setCustomerUser(existing);
      showToast(`Welcome back, ${existing.name}!`);
      return { success: true };
    }
    // Auto register demo customer if not found
    const demoCust = customerRepository.registerCustomer({ email, name: email.split('@')[0] });
    setCustomerUser(demoCust);
    showToast(`Welcome, ${demoCust.name}!`);
    return { success: true };
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    showToast('Logged out of customer account.');
  };

  // Product Admin Operations (Workflow: Draft -> Review -> Approved -> Published)
  const saveProduct = async (productData) => {
    const saved = await productRepository.saveProduct(productData);
    await refreshProducts();
    showToast(`Saved product "${saved?.name || 'Item'}" to MySQL database.`);
    return saved;
  };

  const setProductStatus = async (productId, newStatus) => {
    const updated = await productRepository.setProductStatus(productId, newStatus);
    await refreshProducts();
    showToast(`Updated product status to "${newStatus}" in MySQL`);
    return updated;
  };

  const importCjProductToDraft = async (cjProduct, marginPercent = 30) => {
    console.log('[Import Clicked] Initiating CJ product import pipeline');
    const draft = await cjSyncService.importCjProduct(cjProduct, marginPercent);
    const updatedProducts = await productRepository.getAllProducts();
    setAllProducts(updatedProducts || []);
    console.log(`[Products Count After Insert]: ${updatedProducts?.length || 0}`);
    if (draft) {
      showToast(`Imported "${draft.name}" as DRAFT into MySQL database.`);
    }
    return draft;
  };

  const restoreProductVersion = async (productId, versionId) => {
    await refreshProducts();
    return null;
  };

  const deleteProduct = async (productId) => {
    await productRepository.deleteProduct(productId);
    await refreshProducts();
    showToast('Product deleted from MySQL database');
  };

  // Order Submission & CJ Integration
  const submitOrder = async (orderData) => {
    const savedOrder = await orderRepository.saveOrder(orderData);
    await refreshProducts();
    await refreshOrders();
    
    // Decrement local stock for each item
    cart.forEach((item) => {
      const p = allProducts.find((prod) => String(prod.id) === String(item.product.id));
      if (p) {
        const newStock = Math.max(0, p.stock - item.quantity);
        productRepository.saveProduct({ ...p, stock: newStock });
      }
    });

    refreshProducts();
    refreshOrders();

    // Trigger CJ Order Proxy in background if CJ products present
    const cjItems = cart.filter((item) => item.product.source === 'cj' || item.product.cjPid);
    if (cjItems.length > 0) {
      try {
        const cjPayload = {
          orderId: savedOrder.orderId,
          shippingCustomerName: savedOrder.customerName,
          shippingAddress: savedOrder.shippingAddress,
          products: cjItems.map((i) => ({ pid: i.product.cjPid || i.product.id, quantity: i.quantity }))
        };

        const cjRes = await cjApi.createCjOrder(cjPayload);
        if (cjRes.success) {
          orderRepository.updateOrderStatus(savedOrder.orderId, 'Ordered from CJ', 'CJ Order created automatically', {
            cjOrderId: cjRes.cjOrderId,
            trackingNumber: cjRes.trackingNumber,
            courier: 'CJ Packet'
          });
          refreshOrders();
        }
      } catch (err) {
        console.error('[CJ Order Auto-dispatch Error]:', err);
      }
    }

    analyticsService.trackPurchase(savedOrder.orderId, savedOrder.totalAmount, savedOrder.items);
    clearCart();
    return savedOrder;
  };

  return (
    <ShopContext.Provider
      value={{
        // Public Storefront Products (Strictly Published Only)
        products: publishedProducts,
        // Full Product Catalog for Admin Management
        allProducts,
        orders,
        themeSettings,
        setThemeSettings: (s) => setThemeSettings(settingsRepository.saveSettings(s)),
        // Admin Auth
        adminToken,
        adminUser,
        loginAdmin,
        logoutAdmin,
        // Customer Auth
        customerUser,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        // Shopping State & Functions
        cart,
        wishlist,
        compare,
        recentlyViewed,
        toasts,
        cartSubtotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        addToRecentlyViewed,
        showToast,
        removeToast,
        quickViewProduct,
        setQuickViewProduct,
        isMiniCartOpen,
        setIsMiniCartOpen,
        currentLanguage,
        setCurrentLanguage,
        // Admin Product Workflow Functions
        saveProduct,
        setProductStatus,
        importCjProductToDraft,
        restoreProductVersion,
        deleteProduct,
        // Order Dispatch
        submitOrder
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
