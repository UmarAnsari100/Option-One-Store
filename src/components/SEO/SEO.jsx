import React, { useEffect } from 'react';

/**
 * Native Pure-React SEO Component
 * Dynamically updates document.title, meta tags, OpenGraph, Twitter Cards, Canonical URLs & JSON-LD Schemas with zero external package dependencies.
 */
const SEO = ({
  title = 'Option One Store | Premium Watches, Fashion, Electronics & Luxury Accessories',
  description = 'Shop premium watches, perfumes, fashion accessories, bags, electronics and luxury lifestyle products with worldwide shipping from Option One Store.',
  keywords = 'Option One Store, luxury watches, designer bags, fine jewelry, premium electronics, Pakistan ecommerce, global shipping',
  canonical = 'https://optiononestore.com/',
  ogImage = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
  ogType = 'website',
  jsonLd = null
}) => {
  useEffect(() => {
    // 1. Update Document Title
    const siteName = 'Option One Store';
    const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
    document.title = fullTitle;

    // Helper to set/update meta tag
    const setMetaTag = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const cleanSelector = selector.replace('meta[', '').replace(']', '');
        const parts = cleanSelector.split('=');
        const attrName = parts[0];
        const attrVal = parts[1] ? parts[1].replace(/"/g, '') : '';
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Helper to set link tag
    const setLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Set Standard Meta Tags
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('meta[name="keywords"]', 'content', keywords);
    setLinkTag('canonical', canonical);

    // 3. Set OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'content', fullTitle);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:type"]', 'content', ogType);
    setMetaTag('meta[property="og:url"]', 'content', canonical);
    setMetaTag('meta[property="og:image"]', 'content', ogImage);
    setMetaTag('meta[property="og:site_name"]', 'content', siteName);

    // 4. Set Twitter Cards
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'content', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:image"]', 'content', ogImage);

    // 5. Inject JSON-LD Structured Data
    let scriptTag = document.querySelector('#dynamic-json-ld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'dynamic-json-ld';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }

    if (jsonLd) {
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else {
      scriptTag.textContent = '';
    }
  }, [title, description, keywords, canonical, ogImage, ogType, jsonLd]);

  return null;
};

export default SEO;
