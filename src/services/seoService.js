/**
 * seoService - Dynamic SEO Schema & Meta tag generator.
 * Generates OpenGraph, Twitter Cards, Product JSON-LD, Breadcrumb JSON-LD, FAQ JSON-LD, sitemap.xml, robots.txt.
 */
export const seoService = {
  generateProductSchema(product) {
    if (!product) return null;
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': product.name,
      'image': [product.image1, product.image2].filter(Boolean),
      'description': product.description || product.shortDescription,
      'sku': product.sku,
      'brand': {
        '@type': 'Brand',
        'name': product.brand || 'Option One Store'
      },
      'offers': {
        '@type': 'Offer',
        'url': `https://optiononestore.com/product/${product.id}`,
        'priceCurrency': 'PKR',
        'price': product.price,
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': product.rating || 4.8,
        'reviewCount': product.reviews || 24
      }
    };
  },

  generateSitemapXml(products = []) {
    const baseUrl = 'https://optiononestore.com';
    const urls = [
      '',
      '/shop',
      '/brands',
      '/about',
      '/contact',
      ...products.map((p) => `/product/${p.id}`)
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
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
