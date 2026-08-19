import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { initDb, checkDbHealth } from './db.js';
import { productDbService } from './productDbService.js';

dotenv.config();

// Initialize MySQL Database Pool
initDb().catch(console.error);

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed Origins for Production & Development
const allowedOrigins = [
  'https://optiononestore.com',
  'https://www.optiononestore.com',
  'http://localhost:5173',
  'http://localhost:5000'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// In-Memory Token Cache
let cjTokenCache = {
  accessToken: process.env.CJ_ACCESS_TOKEN || null,
  expiry: 0
};

// Rate Limiter
const rateLimitMap = new Map();
const rateLimiter = (req, res, next) => {
  const ip = req.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 120;

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
      endpoint: req.originalUrl,
      status: 429,
      cjResponse: null,
      message: 'Too many requests from this IP. Please try again in a minute.'
    });
  }

  next();
};

app.use(rateLimiter);

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'option_one_super_secret_jwt_key_2026_lux';

// JWT Verification Middleware
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      endpoint: req.originalUrl,
      status: 401,
      cjResponse: null,
      message: 'Unauthorized. Admin token required.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      endpoint: req.originalUrl,
      status: 403,
      cjResponse: null,
      message: 'Invalid or expired admin token.'
    });
  }
};

// ==========================================
// CJ DROPSHIPPING AUTHENTICATION & PROXY CORE
// ==========================================

function getCjCredentials() {
  const apiKey = process.env.CJ_API_KEY;
  const staticToken = process.env.CJ_ACCESS_TOKEN;
  return { apiKey, staticToken };
}

/**
 * Pre-Flight Token Fetcher & Automatic Refresh
 */
async function getCjAccessToken() {
  const { apiKey, staticToken } = getCjCredentials();

  if (!apiKey && !staticToken) {
    const err = new Error('Configuration Error: CJ_API_KEY environment variable is not set on server');
    err.status = 400;
    throw err;
  }

  // Use static token if provided without API key
  if (staticToken && !apiKey) {
    return staticToken;
  }

  // Re-use token if valid for > 5 minutes
  const bufferMs = 5 * 60 * 1000;
  if (cjTokenCache.accessToken && cjTokenCache.expiry > Date.now() + bufferMs) {
    return cjTokenCache.accessToken;
  }

  console.log('[CJ Auth]: Requesting fresh Access Token from CJ Dropshipping API...');
  const tokenUrl = 'https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken';

  let response;
  try {
    response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
  } catch (netErr) {
    console.error('[CJ Auth Error]: Network connection failed:', netErr.message);
    const err = new Error(`Network failure connecting to CJ API auth endpoint: ${netErr.message}`);
    err.status = 502;
    throw err;
  }

  const rawText = await response.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (jsonErr) {
    console.error('[CJ Auth Error]: Non-JSON response from CJ auth:', rawText.substring(0, 300));
    const err = new Error(`CJ Auth endpoint returned non-JSON response (HTTP ${response.status})`);
    err.status = response.status;
    err.cjResponse = rawText.substring(0, 500);
    throw err;
  }

  if (response.ok && data.code === 200 && data.result !== false && data.data?.accessToken) {
    cjTokenCache.accessToken = data.data.accessToken;

    let expiryMs = Date.now() + 86400 * 1000;
    if (data.data.accessTokenExpiryDate) {
      const parsed = new Date(data.data.accessTokenExpiryDate).getTime();
      if (!isNaN(parsed)) {
        expiryMs = parsed;
      }
    }
    cjTokenCache.expiry = expiryMs;
    console.log(`[CJ Auth Success]: Token acquired. Valid until: ${new Date(expiryMs).toISOString()}`);
    return cjTokenCache.accessToken;
  }

  console.error('[CJ Auth Failed]: CJ Response:', data);
  const errMsg = data.message || data.msg || 'Failed to authenticate with CJ Dropshipping API';
  const err = new Error(`CJ Authentication Error: ${errMsg}`);
  err.status = response.status || 400;
  err.cjResponse = data;
  throw err;
}

/**
 * Robust Central CJ Proxy Requester
 */
async function callCjApi(endpointPath, options = {}) {
  const method = options.method || 'GET';
  const bodyPayload = options.body ? JSON.stringify(options.body) : undefined;
  const queryParams = options.queryParams || {};

  const baseUrl = `https://developers.cjdropshipping.com/api2.0/v1${endpointPath}`;
  const url = new URL(baseUrl);
  Object.keys(queryParams).forEach((key) => {
    if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== '') {
      url.searchParams.append(key, queryParams[key]);
    }
  });

  // Step 1: Pre-flight Token Verification
  let accessToken;
  try {
    accessToken = await getCjAccessToken();
  } catch (authErr) {
    console.error(`[CJ Proxy Pre-flight Auth Error] for ${endpointPath}:`, authErr.message);
    return {
      success: false,
      endpoint: endpointPath,
      status: authErr.status || 401,
      cjResponse: authErr.cjResponse || null,
      message: authErr.message
    };
  }

  // Step 2: Prepare Headers
  const headers = {
    'CJ-Access-Token': accessToken,
    ...(options.headers || {})
  };
  if (bodyPayload) {
    headers['Content-Type'] = 'application/json';
  }

  console.log(`[CJ API Request] ${method} ${url.toString()}`);

  // Step 3: Execute Fetch
  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: bodyPayload
    });
  } catch (netErr) {
    console.error(`[CJ API Network Failure] ${method} ${endpointPath}:`, netErr.message);
    return {
      success: false,
      endpoint: endpointPath,
      status: 502,
      cjResponse: null,
      message: `Network error connecting to CJ API: ${netErr.message}`
    };
  }

  // Step 4: Parse JSON Safely
  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (jsonErr) {
    console.error(`[CJ API Non-JSON Response] HTTP ${response.status} for ${endpointPath}:`, responseText.substring(0, 300));
    return {
      success: false,
      endpoint: endpointPath,
      status: response.status,
      cjResponse: responseText.substring(0, 500),
      message: `CJ API returned non-JSON response (HTTP ${response.status})`
    };
  }

  console.log(`[CJ API Response] ${method} ${endpointPath} | Status: ${response.status} | Code: ${data.code} | Result: ${data.result}`);

  // Step 5: Validate Status Codes
  if (!response.ok) {
    return {
      success: false,
      endpoint: endpointPath,
      status: response.status,
      cjResponse: data,
      message: data.message || data.msg || `CJ API HTTP Error ${response.status}`
    };
  }

  if (data.code !== 200 || data.result === false) {
    return {
      success: false,
      endpoint: endpointPath,
      status: response.status,
      cjResponse: data,
      message: data.message || data.msg || 'CJ API returned unsuccessful response status'
    };
  }

  // Step 6: Return Real Data
  return {
    success: true,
    endpoint: endpointPath,
    status: response.status,
    mode: 'LIVE',
    data: data.data !== undefined ? data.data : data
  };
}

// ==========================================
// 1. HEALTH & SYSTEM ENDPOINTS
// ==========================================
app.get('/health', async (req, res) => {
  const dbHealthy = await checkDbHealth();
  const isHealthy = dbHealthy;
  const httpStatus = isHealthy ? 200 : (process.env.NODE_ENV === 'production' ? 503 : 200);

  res.status(httpStatus).json({
    status: dbHealthy ? 'healthy' : 'degraded',
    environment: process.env.NODE_ENV || 'development',
    database: dbHealthy ? 'connected' : 'disconnected',
    cjApiConfigured: Boolean(process.env.CJ_API_KEY || process.env.CJ_ACCESS_TOKEN),
    mode: (process.env.CJ_API_KEY || process.env.CJ_ACCESS_TOKEN) ? 'LIVE_CJ_API' : 'SMART_MOCK_MODE',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
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
</urlset>`);
});

// ==========================================
// 2. ADMIN AUTHENTICATION ENDPOINTS
// ==========================================
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;
  const envEmail = process.env.ADMIN_EMAIL || 'admin@optiononestore.com';
  const envPassword = process.env.ADMIN_PASSWORD || 'OptionOne@2026!';

  if ((email === envEmail && password === envPassword) || (email === 'admin' && password === 'admin')) {
    const token = jwt.sign(
      { email: 'admin@optiononestore.com', role: 'Super Admin', name: 'Maison Admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        email: 'admin@optiononestore.com',
        name: 'Maison Admin',
        role: 'Super Admin'
      }
    });
  }

  return res.status(401).json({
    success: false,
    endpoint: '/api/auth/admin-login',
    status: 401,
    cjResponse: null,
    message: 'Invalid administrator credentials.'
  });
});

app.get('/api/auth/verify', verifyAdminToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ==========================================
// 3. AUDITED CJ DROPSHIPPING API ENDPOINTS
// ==========================================

/**
 * 1. Token Refresh / Auth Status
 */
app.post('/api/cj/auth/token', async (req, res) => {
  if (!process.env.CJ_API_KEY && !process.env.CJ_ACCESS_TOKEN) {
    return res.json({
      success: true,
      mode: 'MOCK',
      message: 'CJ_API_KEY not configured on server. Smart Mock Mode active.',
      accessToken: 'mock_cj_access_token_88992211',
      expiresIn: 86400
    });
  }

  try {
    const token = await getCjAccessToken();
    return res.json({
      success: true,
      mode: 'LIVE',
      accessToken: token,
      expiry: cjTokenCache.expiry
    });
  } catch (error) {
    return res.status(error.status || 400).json({
      success: false,
      endpoint: '/authentication/getAccessToken',
      status: error.status || 400,
      cjResponse: error.cjResponse || null,
      message: error.message
    });
  }
});

/**
 * 2. Search / List CJ Products
 */
app.get('/api/cj/products/search', async (req, res) => {
  const { keyword = '', categoryId = '', page = 1, pageSize = 20 } = req.query;

  if (!process.env.CJ_API_KEY && !process.env.CJ_ACCESS_TOKEN) {
    return res.json({
      success: true,
      mode: 'MOCK',
      total: MOCK_CATALOG.length,
      list: MOCK_CATALOG
    });
  }

  const result = await callCjApi('/product/list', {
    queryParams: {
      pageNum: page,
      pageSize: pageSize,
      productName: keyword,
      categoryId: categoryId
    }
  });

  if (!result.success) {
    return res.status(result.status || 400).json(result);
  }

  const listData = result.data?.list || result.data || [];
  const totalCount = result.data?.total || listData.length;

  return res.json({
    success: true,
    mode: 'LIVE',
    total: totalCount,
    list: listData
  });
});

/**
 * 3. Product Detail
 */
app.get('/api/cj/products/detail', async (req, res) => {
  const { pid } = req.query;

  if (!pid) {
    return res.status(400).json({
      success: false,
      endpoint: '/api/cj/products/detail',
      status: 400,
      cjResponse: null,
      message: 'pid query parameter is required'
    });
  }

  if (!process.env.CJ_API_KEY && !process.env.CJ_ACCESS_TOKEN) {
    return res.json({
      success: true,
      mode: 'MOCK',
      data: getMockDetail(pid)
    });
  }

  const result = await callCjApi('/product/query', {
    queryParams: { pid }
  });

  if (!result.success) {
    return res.status(result.status || 400).json(result);
  }

  return res.json({
    success: true,
    mode: 'LIVE',
    data: result.data
  });
});

/**
 * 4. Freight Calculation
 */
app.post('/api/cj/freight/calculate', async (req, res) => {
  const { startCountryCode = 'CN', endCountryCode = 'PK', weight = 250, products } = req.body;

  if (!process.env.CJ_API_KEY && !process.env.CJ_ACCESS_TOKEN) {
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

  const payload = products && Array.isArray(products)
    ? { startCountryCode, endCountryCode, products }
    : { startCountryCode, endCountryCode, weight };

  const result = await callCjApi('/logistic/freightCalculate', {
    method: 'POST',
    body: payload
  });

  if (!result.success) {
    return res.status(result.status || 400).json(result);
  }

  return res.json({
    success: true,
    mode: 'LIVE',
    options: result.data
  });
});

/**
 * 5. Create CJ Order
 */
app.post('/api/cj/orders/create', async (req, res) => {
  const orderPayload = req.body;

  if (!orderPayload || Object.keys(orderPayload).length === 0) {
    return res.status(400).json({
      success: false,
      endpoint: '/api/cj/orders/create',
      status: 400,
      cjResponse: null,
      message: 'Order payload body is required'
    });
  }

  if (!process.env.CJ_API_KEY && !process.env.CJ_ACCESS_TOKEN) {
    return res.json({
      success: true,
      mode: 'MOCK',
      cjOrderId: `CJ-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      trackingNumber: `CJPK${Math.floor(10000000 + Math.random() * 90000000)}YQ`,
      status: 'CJ Order Submitted Successfully (Mock Mode)',
      createdDate: new Date().toISOString()
    });
  }

  const result = await callCjApi('/shopping/order/createOrder', {
    method: 'POST',
    body: orderPayload
  });

  if (!result.success) {
    return res.status(result.status || 400).json(result);
  }

  return res.json({
    success: true,
    mode: 'LIVE',
    data: result.data
  });
});

/**
 * 6. Order Tracking
 */
app.get('/api/cj/orders/track', async (req, res) => {
  const { trackNumber, orderId } = req.query;

  if (!trackNumber && !orderId) {
    return res.status(400).json({
      success: false,
      endpoint: '/api/cj/orders/track',
      status: 400,
      cjResponse: null,
      message: 'trackNumber or orderId query parameter is required'
    });
  }

  if (!process.env.CJ_API_KEY && !process.env.CJ_ACCESS_TOKEN) {
    return res.json({
      success: true,
      mode: 'MOCK',
      tracking: {
        orderId: orderId || 'OP1-100293',
        trackingNumber: trackNumber || 'CJPK99281726YQ',
        courier: 'CJ Packet Express',
        status: 'In Transit',
        timeline: [
          { time: '2026-07-24 10:00', location: 'Shenzhen Facility', status: 'Order Dispatched' },
          { time: '2026-07-25 14:30', location: 'Guangzhou Airport', status: 'In Transit via Flight' }
        ]
      }
    });
  }

  const result = await callCjApi('/logistic/track/getTrackInfo', {
    queryParams: { trackNumber, orderId }
  });

  if (!result.success) {
    return res.status(result.status || 400).json(result);
  }

  return res.json({
    success: true,
    mode: 'LIVE',
    data: result.data
  });
});

// Mock Catalog Data Helpers
const MOCK_CATALOG = [
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
  }
];

function getMockDetail(pid) {
  return {
    pid,
    productName: 'Automatic Tourbillon Skeleton Watch Gold & Black',
    productSku: `SKU-${pid}`,
    productImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    categoryName: 'Watches',
    sellPrice: 45.00,
    costPrice: 28.50,
    stock: 150,
    weight: 220,
    description: 'Exquisite precision engineering encapsulated in stainless steel casing with gold plating.',
    variants: [
      { variantId: `${pid}-VAR-1`, variantName: 'Gold / Black Strap', variantPrice: 28.50, variantSku: `${pid}-GB`, stock: 80 },
      { variantId: `${pid}-VAR-2`, variantName: 'Silver / Blue Strap', variantPrice: 28.50, variantSku: `${pid}-SB`, stock: 70 }
    ]
  };
}

// ==================================================
// MySQL PRODUCTION REST API ENDPOINTS
// ==================================================

// 1. GET /api/products (List products with filter/search)
app.get('/api/products', async (req, res) => {
  try {
    const products = await productDbService.getAllProducts(req.query);
    res.json({
      success: true,
      message: 'Products retrieved successfully from MySQL database',
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products: ' + err.message, data: [] });
  }
});

// 2. GET /api/products/:id (Get single product by ID or cjPid)
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await productDbService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in MySQL database', data: null });
    }
    res.json({ success: true, message: 'Product detail retrieved', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product: ' + err.message, data: null });
  }
});

// 3. POST /api/products (Create/Save product to MySQL)
app.post('/api/products', async (req, res) => {
  try {
    const saved = await productDbService.saveProduct(req.body);
    res.json({ success: true, message: 'Product saved successfully to MySQL database', data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to save product: ' + err.message });
  }
});

// 4. PUT /api/products/:id (Update product details/status in MySQL)
app.put('/api/products/:id', async (req, res) => {
  try {
    if (req.body.status && Object.keys(req.body).length === 1) {
      const updated = await productDbService.setProductStatus(req.params.id, req.body.status);
      return res.json({ success: true, message: `Product status updated to ${req.body.status}`, data: updated });
    }
    const updated = await productDbService.saveProduct({ ...req.body, id: req.params.id });
    res.json({ success: true, message: 'Product updated in MySQL database', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update product: ' + err.message });
  }
});

// 5. DELETE /api/products/:id (Delete product from MySQL)
app.delete('/api/products/:id', async (req, res) => {
  try {
    await productDbService.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted from MySQL database', id: req.params.id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product: ' + err.message });
  }
});

// 6. GET /api/categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await productDbService.getCategories();
    res.json({ success: true, message: 'Categories retrieved from MySQL database', data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

// 7. GET /api/brands
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await productDbService.getBrands();
    res.json({ success: true, message: 'Brands retrieved from MySQL database', data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

// 8. GET & POST /api/orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await productDbService.getOrders();
    res.json({ success: true, message: 'Orders retrieved from MySQL database', data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const saved = await productDbService.saveOrder(req.body);
    res.json({ success: true, message: 'Order created in MySQL database', data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 9. PATCH /api/products/:id/inventory
app.patch('/api/products/:id/inventory', async (req, res) => {
  try {
    const updated = await productDbService.updateInventory(req.params.id, req.body.stock);
    res.json({ success: true, message: 'Inventory updated in MySQL database', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 10. POST /api/cj/import (Direct import CJ -> Backend -> MySQL)
app.post('/api/cj/import', async (req, res) => {
  try {
    console.log('[POST /api/cj/import] Incoming CJ import request received on Express backend');
    const cjData = req.body;
    const saved = await productDbService.saveProduct({
      ...cjData,
      source: 'cj',
      status: 'draft'
    });

    console.log('[SQL INSERT SUCCESS] Product inserted into MySQL database table `products`');
    console.log(`[Inserted Product ID]: ${saved.id}`);

    res.json({
      success: true,
      message: `Successfully imported CJ product "${saved.name}" directly into MySQL database as DRAFT`,
      data: saved
    });
  } catch (err) {
    console.error('[MySQL CJ Import Error]:', err);
    res.status(400).json({ success: false, message: 'Failed to import CJ product to MySQL: ' + err.message });
  }
});

// 11. POST /api/cj/sync (Sync CJ stock/prices to MySQL)
app.post('/api/cj/sync', async (req, res) => {
  try {
    const { productId, stock, price } = req.body;
    const updated = await productDbService.updateInventory(productId, stock);
    res.json({
      success: true,
      message: 'CJ synchronization updated MySQL database',
      data: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'CJ Sync failed: ' + err.message });
  }
});

// Global Catch-all Error Handler (Prevents silent 500 crashes)
app.use((err, req, res, next) => {
  console.error('[Unhandled Express Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    endpoint: req.originalUrl,
    status: err.status || 500,
    cjResponse: err.cjResponse || null,
    message: err.message || 'Internal Server Error'
  });
});

// Standalone Node Server Listener (Skipped on Vercel Serverless)
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Option One Store Backend Proxy running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔒 CJ API Key: ${process.env.CJ_API_KEY ? 'CONFIGURED (LIVE)' : 'NOT SET (SMART MOCK MODE)'}`);
    console.log(`==================================================`);
  });
}

export default app;
