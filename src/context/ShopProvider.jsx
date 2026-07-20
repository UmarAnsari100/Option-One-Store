import React, { useState, useEffect } from 'react';
import { products } from '../data/products';
import { ShopContext } from './ShopContext';

export const ShopProvider = ({ children }) => {
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

  const [toasts, setToasts] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  // Luxury enhancements: Mini Cart, Compare, recently viewed
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
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

  const addToCart = (productId, quantity = 1) => {
    const product = products.find((p) => p.id === Number(productId));
    if (!product) return;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const newQty = updatedCart[existingItemIndex].quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Cannot add more. Only ${product.stock} items in stock.`, 'error');
          return prevCart;
        }
        updatedCart[existingItemIndex].quantity = newQty;
        showToast(`Updated quantity of ${product.name} in cart.`);
        return updatedCart;
      } else {
        if (quantity > product.stock) {
          showToast(`Cannot add. Only ${product.stock} items in stock.`, 'error');
          return prevCart;
        }
        showToast(`Added ${product.name} to cart.`);
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    const item = cart.find((c) => c.product.id === Number(productId));
    if (item) {
      setCart((prevCart) => prevCart.filter((c) => c.product.id !== Number(productId)));
      showToast(`Removed ${item.product.name} from cart.`);
    }
  };

  const updateQuantity = (productId, qty) => {
    const product = products.find((p) => p.id === Number(productId));
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
        item.product.id === Number(productId) ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed ${product.name} from wishlist.`);
        return prevWishlist.filter((item) => item.id !== product.id);
      } else {
        showToast(`Added ${product.name} to wishlist.`);
        return [...prevWishlist, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === Number(productId));
  };

  // Compare List Handlers
  const addToCompare = (product) => {
    setCompare((prevCompare) => {
      const exists = prevCompare.some((item) => item.id === product.id);
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
    setCompare((prevCompare) => {
      const updated = prevCompare.filter((item) => item.id !== Number(productId));
      showToast(`Removed product from comparison list.`);
      return updated;
    });
  };

  const clearCompare = () => {
    setCompare([]);
    showToast(`Comparison list cleared.`);
  };

  const isInCompare = (productId) => {
    return compare.some((item) => item.id === Number(productId));
  };

  // Recently Viewed Handlers
  const addToRecentlyViewed = (product) => {
    setRecentlyViewed((prevRecently) => {
      const filtered = prevRecently.filter((item) => item.id !== product.id);
      const updated = [product, ...filtered];
      // Cap at 8 items
      return updated.slice(0, 8);
    });
  };

  // Calculations
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  
  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        wishlist,
        toasts,
        cartSubtotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        showToast,
        removeToast,
        quickViewProduct,
        setQuickViewProduct,
        compare,
        recentlyViewed,
        isMiniCartOpen,
        setIsMiniCartOpen,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        addToRecentlyViewed
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
