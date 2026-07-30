import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// MySQL Configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'option_one_store',
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0
};

let pool = null;
let isMysqlConnected = false;

// Fallback in-memory DB cache if MySQL server is disconnected/unreachable
let inMemoryStore = {
  products: [],
  categories: [],
  brands: [],
  orders: [],
  cj_import_logs: []
};

// Initial Seed Products
const seedProducts = [
  {
    id: 'prd_1001',
    cjPid: 'CJ-PRD-1001',
    sku: 'MJ-WCH-01',
    supplierSku: 'SUP-WCH-01',
    name: 'Maison Skeleton Automatic Tourbillon Watch',
    brand: 'Maison Selected',
    category: 'watches',
    price: 49500.00,
    comparePrice: 62000.00,
    costPrice: 28000.00,
    freightCost: 800.00,
    handlingFee: 500.00,
    marginPercent: 30.00,
    discount: 20,
    rating: 4.90,
    reviews: 28,
    badge: 'In Stock',
    image1: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
    image2: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop',
    description: 'Precision engineered automatic mechanical timepiece featuring sapphire crystal and 316L stainless steel casing.',
    shortDescription: 'Luxury skeleton automatic timepiece.',
    stock: 45,
    weight: 350,
    dimensions: '15cm x 10cm x 5cm',
    warehouse: 'Shenzhen Global Hub',
    source: 'cj',
    status: 'published',
    isFeatured: 1,
    isBestSeller: 1,
    isNewArrival: 1,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop'
    ],
    variants: [
      { variantId: 'v1', variantName: 'Silver / Black Dial', variantPrice: 49500.00, variantSku: 'MJ-WCH-01-SIL', stock: 25 },
      { variantId: 'v2', variantName: 'Rose Gold / Leather', variantPrice: 52000.00, variantSku: 'MJ-WCH-01-GLD', stock: 20 }
    ]
  },
  {
    id: 'prd_1002',
    cjPid: 'CJ-PRD-1002',
    sku: 'MJ-AUD-02',
    supplierSku: 'SUP-AUD-02',
    name: 'Acoustic Studio Wireless Active Noise Cancelling Headphones',
    brand: 'Acoustics',
    category: 'electronics',
    price: 32000.00,
    comparePrice: 39000.00,
    costPrice: 18000.00,
    freightCost: 600.00,
    handlingFee: 400.00,
    marginPercent: 30.00,
    discount: 18,
    rating: 4.85,
    reviews: 19,
    badge: 'In Stock',
    image1: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    image2: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop',
    description: 'Immersive high-fidelity audio engineering with custom 40mm beryllium drivers and 40-hour continuous battery playback.',
    shortDescription: 'Studio-grade ANC wireless headphones.',
    stock: 60,
    weight: 290,
    dimensions: '20cm x 18cm x 8cm',
    warehouse: 'Hong Kong Logistics Hub',
    source: 'cj',
    status: 'published',
    isFeatured: 1,
    isBestSeller: 0,
    isNewArrival: 1,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop'
    ],
    variants: [
      { variantId: 'v3', variantName: 'Matte Black', variantPrice: 32000.00, variantSku: 'MJ-AUD-02-BLK', stock: 35 },
      { variantId: 'v4', variantName: 'Parchment White', variantPrice: 32000.00, variantSku: 'MJ-AUD-02-WHT', stock: 25 }
    ]
  }
];

inMemoryStore.products = [...seedProducts];

/**
 * Initialize MySQL Connection Pool and Tables
 */
export async function initDb() {
  try {
    // Attempt connecting to MySQL server
    const serverConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    // Create database if not exists
    await serverConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await serverConnection.end();

    // Create Pool
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();

    // Create Normalized MySQL Tables
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        cj_pid VARCHAR(255),
        sku VARCHAR(255) NOT NULL,
        supplier_sku VARCHAR(255),
        name VARCHAR(500) NOT NULL,
        brand VARCHAR(255),
        category VARCHAR(255),
        price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        compare_price DECIMAL(12, 2) DEFAULT 0.00,
        cost_price DECIMAL(12, 2) DEFAULT 0.00,
        freight_cost DECIMAL(12, 2) DEFAULT 0.00,
        handling_fee DECIMAL(12, 2) DEFAULT 0.00,
        margin_percent DECIMAL(5, 2) DEFAULT 30.00,
        discount INT DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 4.80,
        reviews INT DEFAULT 12,
        badge VARCHAR(100) DEFAULT 'In Stock',
        image1 TEXT,
        image2 TEXT,
        description LONGTEXT,
        short_description TEXT,
        stock INT NOT NULL DEFAULT 50,
        weight INT DEFAULT 250,
        dimensions VARCHAR(255) DEFAULT '15cm x 10cm x 5cm',
        warehouse VARCHAR(255) DEFAULT 'Shenzhen Global Hub',
        source VARCHAR(50) DEFAULT 'manual',
        status VARCHAR(50) DEFAULT 'published',
        is_featured TINYINT(1) DEFAULT 0,
        is_best_seller TINYINT(1) DEFAULT 0,
        is_new_arrival TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_sku (sku),
        INDEX idx_cj_pid (cj_pid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        display_order INT DEFAULT 0,
        INDEX idx_prod_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        variant_name VARCHAR(255) NOT NULL,
        variant_price DECIMAL(12, 2),
        variant_sku VARCHAR(255),
        variant_image TEXT,
        stock INT DEFAULT 50,
        INDEX idx_var_prod (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        order_number VARCHAR(100),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(100),
        shipping_address TEXT,
        payment_method VARCHAR(100),
        subtotal DECIMAL(12, 2),
        discount DECIMAL(12, 2),
        total DECIMAL(12, 2),
        status VARCHAR(100) DEFAULT 'Pending',
        cj_order_id VARCHAR(255),
        tracking_number VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(500),
        quantity INT DEFAULT 1,
        price DECIMAL(12, 2)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS cj_import_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cj_pid VARCHAR(255) NOT NULL,
        sku VARCHAR(255),
        product_name VARCHAR(500),
        status VARCHAR(100),
        imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    conn.release();
    isMysqlConnected = true;
    console.log(`✅ [MySQL Pool Connected] Target Database: "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ [MySQL Connection Warning] Could not connect to MySQL server at ${dbConfig.host}:${dbConfig.port}. Using in-memory fallback layer.`);
    console.warn(`Details: ${err.message}`);
    isMysqlConnected = false;
    return false;
  }
}

/**
 * Execute MySQL Query or In-Memory Store Fallback
 */
export async function executeQuery(sql, params = []) {
  if (isMysqlConnected && pool) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error('[MySQL Query Error]:', err);
      throw err;
    }
  }
  return null;
}

export function isDbLive() {
  return isMysqlConnected;
}

export { pool, inMemoryStore };
