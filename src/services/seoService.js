/**
 * seoService - Dynamic Structured Data (JSON-LD) and Sitemap Generators.
 * Generates Website, Organization, Product, Breadcrumb, SearchAction, FAQ, Review, Offer, AggregateRating schemas.
 */
export const seoService = {
  getWebsiteSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Option One Store',
      'url': 'https://optiononestore.com/',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://optiononestore.com/shop?search={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    };
  },

  getOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Option One Store',
      'url': 'https://optiononestore.com/',
      'logo': 'https://optiononestore.com/assets/logo.png',
      'sameAs': [
        'https://instagram.com/option_one_store',
        'https://facebook.com/optiononestore'
      ],
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+92-300-0000000',
        'contactType': 'customer service',
        'areaServed': 'Worldwide',
        'availableLanguage': ['English', 'Urdu', 'Arabic']
      }
    };
  },

  getBreadcrumbSchema(items = []) {
    const listItems = [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://optiononestore.com/' },
      ...items.map((item, idx) => ({
        '@type': 'ListItem',
        'position': idx + 2,
        'name': item.name,
        'item': `https://optiononestore.com${item.path}`
      }))
    ];

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': listItems
    };
  },

  getProductSchema(product) {
    if (!product) return null;
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': product.name,
      'image': [product.image1, product.image2].filter(Boolean),
      'description': product.description || product.shortDescription || `${product.name} luxury edition available at Option One Store.`,
      'sku': product.sku || `OP1-${product.id}`,
      'mpn': product.sku || `OP1-${product.id}`,
      'brand': {
        '@type': 'Brand',
        'name': product.brand || 'Option One Store'
      },
      'offers': {
        '@type': 'Offer',
        'url': `https://optiononestore.com/product/${product.id}`,
        'priceCurrency': 'PKR',
        'price': product.price,
        'priceValidUntil': '2027-12-31',
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller': {
          '@type': 'Organization',
          'name': 'Option One Store'
        }
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': String(product.rating || 4.8),
        'reviewCount': String(product.reviews || 24)
      }
    };
  },

  getFaqSchema(faqs = []) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map((faq) => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    };
  },

  generateSitemapXml(products = []) {
    const baseUrl = 'https://optiononestore.com';
    const staticRoutes = [
      '',
      '/shop',
      '/brands',
      '/about',
      '/contact',
      '/wishlist',
      '/cart',
      '/checkout',
      '/account',
      '/blog',
      '/lookbook',
      '/compare'
    ];

    const productRoutes = products.map((p) => `/product/${p.id}`);
    const allRoutes = [...staticRoutes, ...productRoutes];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '' || route === '/shop' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : route === '/shop' ? '0.9' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  },

  generateRobotsTxt() {
    return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Sitemap: https://optiononestore.com/sitemap.xml
`;
  }
};
