import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Token & Rate-Limiter Cache
let cjTokenCache = {
  accessToken: process.env.CJ_ACCESS_TOKEN || null,
  expiry: 0
};

const rateLimitMap = new Map();

// Simple Throttling / Rate-Limiter Middleware
const rateLimiter = (req, res, next) => {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  const userRecord = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > userRecord.resetTime) {
    userRecord.count = 1;
    userRecord.resetTime = now + windowMs;
  } else {
    userRecord.count += 1;
  }

  rateLimitMap.set(ip, userRecord);

  if (userRecord.count > maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please try again in a minute.'
    });
  }

  next();
};

app.use(rateLimiter);

// JWT Secret Key (Never expose to frontend!)
const JWT_SECRET = process.env.JWT_SECRET || 'option_one_super_secret_jwt_key_2026_lux';

// JWT Verification Middleware for Admin Routes
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ==========================================
// 1. HEALTH, SEO & DIAGNOSTICS ENDPOINTS
// ==========================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    cjApiConfigured: Boolean(process.env.CJ_API_KEY),
    mode: process.env.CJ_API_KEY ? 'LIVE_CJ_API' : 'SMART_MOCK_MODE',
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  });
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Sitemap: https://optiononestore.com/sitemap.xml
`);
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://optiononestore.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://optiononestore.com/shop</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://optiononestore.com/brands</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://optiononestore.com/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://optiononestore.com/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);
});

// ==========================================
// 2. ADMIN AUTHENTICATION ENDPOINTS
// ==========================================

// Login endpoint for Admin Dashboard
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;

  // Default credentials (Configurable via environment variables)
  const envEmail = process.env.ADMIN_EMAIL || 'admin@optiononestore.com';
  const envPassword = process.env.ADMIN_PASSWORD || 'OptionOne@2026!';

  if (email === envEmail && password === envPassword) {
    const token = jwt.sign(
      { email, role: 'Super Admin', name: 'Maison Admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        email,
        name: 'Maison Admin',
        role: 'Super Admin'
      }
    });
  }

  // Demo fallback check
  if (email === 'admin' && password === 'admin') {
    const token = jwt.sign(
      { email: 'admin@optiononestore.com', role: 'Super Admin', name: 'Demo Administrator' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      success: true,
      token,
      user: {
        email: 'admin@optiononestore.com',
        name: 'Demo Administrator',
        role: 'Super Admin'
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid administrator credentials. Please verify your email and password.'
  });
});

// Verify active token
app.get('/api/auth/verify', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ==========================================
// 3. CJ DROPSHIPPING PROXY ENDPOINTS
// ==========================================

/**
 * Fetch or Refresh Official CJ Access Token
 * CJ V2 Endpoint: POST https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken
 */
app.post('/api/cj/auth/token', async (req, res) => {
  const apiKey = process.env.CJ_API_KEY;

  if (!apiKey) {
    return res.json({
      success: true,
      mode: 'MOCK',
      message: 'CJ API Key/Secret not set in server .env. Operating in Smart Mock Mode.',
      accessToken: 'mock_cj_access_token_88992211',
      expiresIn: 86400
    });
  }

  try {
    const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: process.env.CJ_API_KEY
      })
    });

    const data = await response.json();

    if (data.code === 200 && data.data?.accessToken) {
      cjTokenCache.accessToken = data.data.accessToken;
      cjTokenCache.expiry = Date.now() + (data.data.accessTokenExpiryDate ? new Date(data.data.accessTokenExpiryDate).getTime() - Date.now() : 86400 * 1000);

      return res.json({
        success: true,
        mode: 'LIVE',
        accessToken: data.data.accessToken,
        expiry: cjTokenCache.expiry
      });
    }

    return res.status(400).json({
      success: false,
      message: data.message || 'Failed to authenticate with CJ Dropshipping API',
      raw: data
    });
  } catch (error) {
    console.error('[CJ Proxy Auth Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'CJ Proxy connection failed',
      error: error.message
    });
  }
});

/**
 * Search/List CJ Products
 * CJ V2 Endpoint: GET https://developers.cjdropshipping.com/api2.0/v1/product/list
 */
app.get('/api/cj/products/search', async (req, res) => {
  const { keyword = '', categoryId = '', page = 1, pageSize = 20 } = req.query;
  const apiKey = process.env.CJ_API_KEY;

  if (!apiKey) {
    // Return rich mock CJ catalog for immediate testing
    return res.json({
      success: true,
      mode: 'MOCK',
      total: 6,
      list: [
        {
          pid: 'CJ-PRD-9001',
          productName: 'Automatic Tourbillon Skeleton Watch Gold & Black',
          productSku: 'CJ-SKU-9001',
          productImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
          categoryName: 'Watches',
          sellPrice: 45.00,
          costPrice: 28.50,
          stock: 150,
          weight: 220,
          createTime: '2026-07-01'
        },
        {
          pid: 'CJ-PRD-9002',
          productName: 'Luxury Diamond Leather Clutch Handbag (Emerald)',
          productSku: 'CJ-SKU-9002',
          productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
          categoryName: 'Bags',
          sellPrice: 68.00,
          costPrice: 42.00,
          stock: 85,
          weight: 450,
          createTime: '2026-07-05'
        },
        {
          pid: 'CJ-PRD-9003',
          productName: 'ANC Wireless Noise Cancelling Earbuds (Obsidian Gold)',
          productSku: 'CJ-SKU-9003',
          productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop',
          categoryName: 'Audio',
          sellPrice: 38.00,
          costPrice: 22.00,
          stock: 310,
          weight: 180,
          createTime: '2026-07-10'
        },
        {
          pid: 'CJ-PRD-9004',
          productName: 'Minimalist Titanium Slim Minimalist Wallet',
          productSku: 'CJ-SKU-9004',
          productImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800&auto=format&fit=crop',
          categoryName: 'Accessories',
          sellPrice: 29.00,
          costPrice: 14.00,
          stock: 220,
          weight: 95,
          createTime: '2026-07-12'
        },
        {
          pid: 'CJ-PRD-9005',
          productName: 'OBD2 Diagnostic Performance Chip Tuner',
          productSku: 'CJ-SKU-9005',
          productImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop',
          categoryName: 'Automotive',
          sellPrice: 34.00,
          costPrice: 16.50,
          stock: 90,
          weight: 150,
          createTime: '2026-07-15'
        },
        {
          pid: 'CJ-PRD-9006',
          productName: '18K Gold Plated Cubic Zirconia Tennis Bracelet',
          productSku: 'CJ-SKU-9006',
          productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
          categoryName: 'Jewelry',
          sellPrice: 52.00,
          costPrice: 27.00,
          stock: 175,
          weight: 80,
          createTime: '2026-07-18'
        }
      ]
    });
  }

  try {
    const url = new URL('https://developers.cjdropshipping.com/api2.0/v1/product/list');
    url.searchParams.append('pageNum', page);
    url.searchParams.append('pageSize', pageSize);
    if (keyword) url.searchParams.append('productName', keyword);
    if (categoryId) url.searchParams.append('categoryId', categoryId);

    console.log("Current CJ Token:", cjTokenCache.accessToken);

    const response = await fetch(url.toString(), {
      headers: {
        'CJ-Access-Token': cjTokenCache.accessToken || ''
      }
    });

    const data = await response.json();
    return res.json({ success: true, mode: 'LIVE', data });
  } catch (error) {
    console.error('[CJ Product Search Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to search CJ products', error: error.message });
  }
});

/**
 * Get CJ Product Detail
 */
app.get('/api/cj/products/detail', async (req, res) => {
  const { pid } = req.query;

  if (!pid) {
    return res.status(400).json({ success: false, message: 'PID query parameter is required' });
  }

  if (!process.env.CJ_API_KEY) {
    return res.json({
      success: true,
      mode: 'MOCK',
      data: {
        pid: pid,
        productName: 'Automatic Tourbillon Skeleton Watch Gold & Black',
        productSku: `SKU-${pid}`,
        productImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Watches',
        sellPrice: 45.00,
        costPrice: 28.50,
        stock: 150,
        weight: 220,
        packingWeight: 280,
        productType: 'NORMAL',
        description: 'Exquisite precision engineering encapsulated in a stainless steel casing with gold plating and sapphire crystal glass.',
        variants: [
          { variantId: `${pid}-VAR-1`, variantName: 'Gold / Black Strap', variantPrice: 28.50, variantSku: `${pid}-GB`, stock: 80 },
          { variantId: `${pid}-VAR-2`, variantName: 'Silver / Blue Strap', variantPrice: 28.50, variantSku: `${pid}-SB`, stock: 70 }
        ]
      }
    });
  }

  try {
    const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=${pid}`, {
      headers: { 'CJ-Access-Token': cjTokenCache.accessToken || '' }
    });

    const data = await response.json();
    return res.json({ success: true, mode: 'LIVE', data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch product details', error: error.message });
  }
});

/**
 * Calculate Shipping Freight
 */
app.post('/api/cj/freight/calculate', async (req, res) => {
  const { startCountryCode = 'CN', endCountryCode = 'PK', weight = 250 } = req.body;

  if (!process.env.CJ_API_KEY) {
    return res.json({
      success: true,
      mode: 'MOCK',
      options: [
        { logisticName: 'CJ Packet Ordinary', logisticPrice: 8.50, logisticTime: '7-12 days' },
        { logisticName: 'DHL Express International', logisticPrice: 24.00, logisticTime: '3-5 days' },
        { logisticName: 'CJPacket Fast Express', logisticPrice: 14.20, logisticTime: '5-8 days' }
      ]
    });
  }

  try {
    const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/logistic/freightCalculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': cjTokenCache.accessToken || ''
      },
      body: JSON.stringify({ startCountryCode, endCountryCode, weight })
    });

    const data = await response.json();
    return res.json({ success: true, mode: 'LIVE', data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Freight calculation failed', error: error.message });
  }
});

/**
 * Create CJ Order
 */
app.post('/api/cj/orders/create', async (req, res) => {
  const orderPayload = req.body;

  console.log('[CJ Order Created Request Received]:', orderPayload.orderId || 'NEW-ORDER');

  if (!process.env.CJ_API_KEY) {
    const cjOrderId = `CJ-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `CJPK${Math.floor(10000000 + Math.random() * 90000000)}YQ`;

    return res.json({
      success: true,
      mode: 'MOCK',
      cjOrderId,
      trackingNumber,
      status: 'CJ Order Submitted Successfully (Mock Mode)',
      createdDate: new Date().toISOString()
    });
  }

  try {
    const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': cjTokenCache.accessToken || ''
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();
    return res.json({ success: true, mode: 'LIVE', data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'CJ Order creation failed', error: error.message });
  }
});

/**
 * Track CJ Order Shipment
 */
app.get('/api/cj/orders/track', async (req, res) => {
  const { trackNumber, orderId } = req.query;

  if (!process.env.CJ_API_KEY) {
    return res.json({
      success: true,
      mode: 'MOCK',
      tracking: {
        orderId: orderId || 'OP1-100293',
        trackingNumber: trackNumber || 'CJPK99281726YQ',
        courier: 'CJ Packet Express',
        status: 'In Transit',
        origin: 'Shenzhen Warehouse',
        destination: 'Lahore, Pakistan',
        timeline: [
          { time: '2026-07-24 10:00', location: 'Shenzhen Facility', status: 'Order Dispatched' },
          { time: '2026-07-25 14:30', location: 'Guangzhou Airport', status: 'In Transit via Flight' },
          { time: '2026-07-26 09:15', location: 'Lahore Cargo Hub', status: 'Customs Clearance Completed' }
        ]
      }
    });
  }

  try {
    const response = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/logistic/track/getTrackInfo?trackNumber=${trackNumber}`, {
      headers: { 'CJ-Access-Token': cjTokenCache.accessToken || '' }
    });

    const data = await response.json();
    return res.json({ success: true, mode: 'LIVE', data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Tracking info fetch failed', error: error.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Option One Store Backend Proxy running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔒 CJ API Key: ${process.env.CJ_API_KEY ? 'CONFIGURED (LIVE)' : 'NOT SET (SMART MOCK MODE)'}`);
  console.log(`==================================================`);
});
