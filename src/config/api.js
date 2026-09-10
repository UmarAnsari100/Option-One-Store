// Centralized production API configuration
// The storefront is hosted on Vercel, while the Express/MySQL API is hosted on cPanel.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.optiononestore.com').replace(/\/$/, '');

export const apiUrl = (path = '') => {
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
