/**
 * i18n Utility - Internationalization support for English, Urdu, and Arabic.
 */
export const translations = {
  en: {
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    searchPlaceholder: 'Search optiononestore.com...',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    checkout: 'Checkout',
    wishlist: 'Wishlist',
    adminDashboard: 'Admin Control Center'
  },
  ur: {
    home: 'ہوم',
    shop: 'دوکان',
    categories: 'اقسام',
    searchPlaceholder: 'تلاش کریں...',
    addToCart: 'ٹوکری میں شامل کریں',
    buyNow: 'ابھی خریدیں',
    checkout: 'چیک آؤٹ',
    wishlist: 'خواہشات کی فہرست',
    adminDashboard: 'ایڈمن کنٹرول سینٹر'
  },
  ar: {
    home: 'الرئيسية',
    shop: 'المتجر',
    categories: 'الفئات',
    searchPlaceholder: 'ابحث في المتجر...',
    addToCart: 'أضف إلى السلة',
    buyNow: 'اشتري الآن',
    checkout: 'الدفع',
    wishlist: 'قائمة الرغبات',
    adminDashboard: 'لوحة التحكم'
  }
};

export const getTranslation = (lang = 'en', key = '') => {
  return translations[lang]?.[key] || translations['en']?.[key] || key;
};
