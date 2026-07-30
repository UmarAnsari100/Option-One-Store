import { executeQuery, isDbLive, inMemoryStore } from './db.js';

/**
 * Service to execute MySQL database operations for Products, Categories, Brands & Orders
 */
export const productDbService = {
  // 1. Get All Products
  async getAllProducts(filters = {}) {
    if (!isDbLive()) {
      let result = [...inMemoryStore.products];
      if (filters.status) result = result.filter(p => p.status === filters.status);
      if (filters.category && filters.category !== 'all') result = result.filter(p => p.category === filters.category);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      }
      return result;
    }

    let sql = `SELECT * FROM products WHERE 1=1`;
    const params = [];

    if (filters.status) {
      sql += ` AND status = ?`;
      params.push(filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      sql += ` AND LOWER(category) = LOWER(?)`;
      params.push(filters.category);
    }
    if (filters.search) {
      sql += ` AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ? OR LOWER(sku) LIKE ?)`;
      const term = `%${filters.search.toLowerCase()}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY created_at DESC`;

    const rows = await executeQuery(sql, params);
    if (!rows) return [];

    // Fetch images and variants for each product
    const products = await Promise.all(rows.map(async (p) => {
      const imagesRows = await executeQuery(`SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC`, [p.id]);
      const variantsRows = await executeQuery(`SELECT id as variantId, variant_name as variantName, variant_price as variantPrice, variant_sku as variantSku, variant_image as variantImage, stock FROM product_variants WHERE product_id = ?`, [p.id]);

      const images = imagesRows && imagesRows.length > 0 ? imagesRows.map(r => r.image_url) : [p.image1].filter(Boolean);
      const variants = variantsRows || [];

      return {
        id: p.id,
        cjPid: p.cj_pid,
        sku: p.sku,
        supplierSku: p.supplier_sku,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: Number(p.price),
        comparePrice: Number(p.compare_price),
        costPrice: Number(p.cost_price),
        freightCost: Number(p.freight_cost),
        handlingFee: Number(p.handling_fee),
        marginPercent: Number(p.margin_percent),
        discount: p.discount,
        rating: Number(p.rating),
        reviews: p.reviews,
        badge: p.badge,
        image1: p.image1,
        image2: p.image2,
        images,
        description: p.description,
        shortDescription: p.short_description,
        stock: p.stock,
        weight: p.weight,
        dimensions: p.dimensions,
        warehouse: p.warehouse,
        source: p.source,
        status: p.status,
        isFeatured: Boolean(p.is_featured),
        isBestSeller: Boolean(p.is_best_seller),
        isNewArrival: Boolean(p.is_new_arrival),
        variants,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      };
    }));

    return products;
  },

  // 2. Get Product By ID or cjPid
  async getProductById(id) {
    if (!isDbLive()) {
      return inMemoryStore.products.find(p => String(p.id) === String(id) || String(p.cjPid) === String(id)) || null;
    }

    const rows = await executeQuery(`SELECT * FROM products WHERE id = ? OR cj_pid = ? LIMIT 1`, [id, id]);
    if (!rows || rows.length === 0) return null;

    const p = rows[0];
    const imagesRows = await executeQuery(`SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC`, [p.id]);
    const variantsRows = await executeQuery(`SELECT id as variantId, variant_name as variantName, variant_price as variantPrice, variant_sku as variantSku, variant_image as variantImage, stock FROM product_variants WHERE product_id = ?`, [p.id]);

    const images = imagesRows && imagesRows.length > 0 ? imagesRows.map(r => r.image_url) : [p.image1].filter(Boolean);
    const variants = variantsRows || [];

    return {
      id: p.id,
      cjPid: p.cj_pid,
      sku: p.sku,
      supplierSku: p.supplier_sku,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: Number(p.price),
      comparePrice: Number(p.compare_price),
      costPrice: Number(p.cost_price),
      freightCost: Number(p.freight_cost),
      handlingFee: Number(p.handling_fee),
      marginPercent: Number(p.margin_percent),
      discount: p.discount,
      rating: Number(p.rating),
      reviews: p.reviews,
      badge: p.badge,
      image1: p.image1,
      image2: p.image2,
      images,
      description: p.description,
      shortDescription: p.short_description,
      stock: p.stock,
      weight: p.weight,
      dimensions: p.dimensions,
      warehouse: p.warehouse,
      source: p.source,
      status: p.status,
      isFeatured: Boolean(p.is_featured),
      isBestSeller: Boolean(p.is_best_seller),
      isNewArrival: Boolean(p.is_new_arrival),
      variants,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    };
  },

  // 3. Create or Save Product to MySQL
  async saveProduct(pData) {
    if (!pData) throw new Error('Product payload is empty.');

    const id = pData.id || `prd_${Date.now()}`;
    const cjPid = pData.cjPid || null;
    const sku = pData.sku || `SKU-${Date.now()}`;
    const supplierSku = pData.supplierSku || sku;
    const name = pData.name || 'Untitled Product';
    const brand = pData.brand || 'Maison Selected';
    const category = (pData.category || 'general').toLowerCase();
    const price = Number(pData.price || 0);
    const comparePrice = Number(pData.comparePrice || Math.round(price * 1.25));
    const costPrice = Number(pData.costPrice || 0);
    const freightCost = Number(pData.freightCost || 8);
    const handlingFee = Number(pData.handlingFee || 5);
    const marginPercent = Number(pData.marginPercent || 30);
    const discount = Number(pData.discount || 0);
    const rating = Number(pData.rating || 4.8);
    const reviews = Number(pData.reviews || 12);
    const badge = pData.badge || 'In Stock';
    const image1 = pData.image1 || pData.images?.[0] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop';
    const image2 = pData.image2 || pData.images?.[1] || image1;
    const description = pData.description || 'Premium curated piece.';
    const shortDescription = pData.shortDescription || 'Luxury edition.';
    const stock = Number(pData.stock || 50);
    const weight = Number(pData.weight || 250);
    const dimensions = pData.dimensions || '15cm x 10cm x 5cm';
    const warehouse = pData.warehouse || 'Shenzhen Global Hub';
    const source = pData.source || 'cj';
    const status = pData.status || 'draft';
    const isFeatured = pData.isFeatured ? 1 : 0;
    const isBestSeller = pData.isBestSeller ? 1 : 0;
    const isNewArrival = pData.isNewArrival ? 1 : 0;

    if (!isDbLive()) {
      const idx = inMemoryStore.products.findIndex(x => String(x.id) === String(id));
      const saved = { ...pData, id, cjPid, sku, name, brand, category, price, stock, status };
      if (idx > -1) {
        inMemoryStore.products[idx] = saved;
      } else {
        inMemoryStore.products.unshift(saved);
      }
      return saved;
    }

    const sql = `
      INSERT INTO products (
        id, cj_pid, sku, supplier_sku, name, brand, category, price, compare_price, cost_price,
        freight_cost, handling_fee, margin_percent, discount, rating, reviews, badge, image1, image2,
        description, short_description, stock, weight, dimensions, warehouse, source, status,
        is_featured, is_best_seller, is_new_arrival
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        cj_pid = VALUES(cj_pid), sku = VALUES(sku), supplier_sku = VALUES(supplier_sku), name = VALUES(name),
        brand = VALUES(brand), category = VALUES(category), price = VALUES(price), compare_price = VALUES(compare_price),
        cost_price = VALUES(cost_price), freight_cost = VALUES(freight_cost), handling_fee = VALUES(handling_fee),
        margin_percent = VALUES(margin_percent), discount = VALUES(discount), badge = VALUES(badge),
        image1 = VALUES(image1), image2 = VALUES(image2), description = VALUES(description),
        stock = VALUES(stock), weight = VALUES(weight), status = VALUES(status), updated_at = NOW();
    `;

    await executeQuery(sql, [
      id, cjPid, sku, supplierSku, name, brand, category, price, comparePrice, costPrice,
      freightCost, handlingFee, marginPercent, discount, rating, reviews, badge, image1, image2,
      description, shortDescription, stock, weight, dimensions, warehouse, source, status,
      isFeatured, isBestSeller, isNewArrival
    ]);

    // Save Images
    const imagesList = Array.isArray(pData.images) && pData.images.length > 0 ? pData.images : [image1];
    await executeQuery(`DELETE FROM product_images WHERE product_id = ?`, [id]);
    for (let i = 0; i < imagesList.length; i++) {
      await executeQuery(`INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)`, [id, imagesList[i], i]);
    }

    // Save Variants
    if (Array.isArray(pData.variants) && pData.variants.length > 0) {
      await executeQuery(`DELETE FROM product_variants WHERE product_id = ?`, [id]);
      for (const v of pData.variants) {
        const vId = v.variantId || `${id}-v-${Math.random().toString(36).substr(2, 5)}`;
        await executeQuery(
          `INSERT INTO product_variants (id, product_id, variant_name, variant_price, variant_sku, variant_image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [vId, id, v.variantName || 'Default', v.variantPrice || price, v.variantSku || sku, v.variantImage || image1, v.stock || stock]
        );
      }
    }

    return this.getProductById(id);
  },

  // 4. Update Product Status (Publish / Draft)
  async setProductStatus(id, newStatus) {
    if (!isDbLive()) {
      const p = inMemoryStore.products.find(x => String(x.id) === String(id) || String(x.cjPid) === String(id));
      if (p) {
        p.status = newStatus;
        return p;
      }
      return null;
    }

    await executeQuery(`UPDATE products SET status = ?, updated_at = NOW() WHERE id = ? OR cj_pid = ?`, [newStatus, id, id]);
    return this.getProductById(id);
  },

  // 5. Update Inventory
  async updateInventory(id, stockQuantity) {
    if (!isDbLive()) {
      const p = inMemoryStore.products.find(x => String(x.id) === String(id) || String(x.cjPid) === String(id));
      if (p) {
        p.stock = Number(stockQuantity);
        return p;
      }
      return null;
    }

    await executeQuery(`UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ? OR cj_pid = ?`, [stockQuantity, id, id]);
    return this.getProductById(id);
  },

  // 6. Delete Product
  async deleteProduct(id) {
    if (!isDbLive()) {
      inMemoryStore.products = inMemoryStore.products.filter(p => String(p.id) !== String(id));
      return true;
    }

    await executeQuery(`DELETE FROM product_variants WHERE product_id = ?`, [id]);
    await executeQuery(`DELETE FROM product_images WHERE product_id = ?`, [id]);
    await executeQuery(`DELETE FROM products WHERE id = ? OR cj_pid = ?`, [id, id]);
    return true;
  },

  // 7. Get Categories
  async getCategories() {
    if (!isDbLive()) {
      const cats = Array.from(new Set(inMemoryStore.products.map(p => p.category)));
      return cats.map(c => ({ id: c, name: c.charAt(0).toUpperCase() + c.slice(1), slug: c }));
    }

    const rows = await executeQuery(`SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ''`);
    if (!rows) return [];
    return rows.map(r => ({ id: r.category, name: r.category.charAt(0).toUpperCase() + r.category.slice(1), slug: r.category }));
  },

  // 8. Get Brands
  async getBrands() {
    if (!isDbLive()) {
      const bList = Array.from(new Set(inMemoryStore.products.map(p => p.brand)));
      return bList.map(b => ({ id: b, name: b, slug: b.toLowerCase().replace(/\s+/g, '-') }));
    }

    const rows = await executeQuery(`SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != ''`);
    if (!rows) return [];
    return rows.map(r => ({ id: r.brand, name: r.brand, slug: r.brand.toLowerCase().replace(/\s+/g, '-') }));
  },

  // 9. Save & Get Orders
  async saveOrder(orderData) {
    const id = orderData.id || orderData.orderId || `ORD-${Date.now()}`;
    const orderNumber = orderData.orderNumber || id;

    if (!isDbLive()) {
      inMemoryStore.orders.unshift({ ...orderData, id, orderNumber });
      return { ...orderData, id, orderNumber };
    }

    const sql = `
      INSERT INTO orders (id, order_number, customer_name, customer_email, customer_phone, shipping_address, payment_method, subtotal, discount, total, status, cj_order_id, tracking_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(sql, [
      id,
      orderNumber,
      orderData.customerName || 'Customer',
      orderData.customerEmail || 'customer@example.com',
      orderData.customerPhone || '',
      JSON.stringify(orderData.shippingAddress || {}),
      orderData.paymentMethod || 'COD',
      Number(orderData.subtotal || 0),
      Number(orderData.discount || 0),
      Number(orderData.total || 0),
      orderData.status || 'Pending',
      orderData.cjOrderId || null,
      orderData.trackingNumber || null
    ]);

    if (Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        await executeQuery(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)`,
          [id, item.product?.id || item.productId, item.product?.name || item.name, item.quantity || 1, item.price || 0]
        );
      }
    }

    return { ...orderData, id, orderNumber };
  },

  async getOrders() {
    if (!isDbLive()) {
      return inMemoryStore.orders;
    }

    const rows = await executeQuery(`SELECT * FROM orders ORDER BY created_at DESC`);
    if (!rows) return [];
    return rows.map(r => ({
      id: r.id,
      orderId: r.id,
      orderNumber: r.order_number,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      customerPhone: r.customer_phone,
      shippingAddress: JSON.parse(r.shipping_address || '{}'),
      paymentMethod: r.payment_method,
      subtotal: Number(r.subtotal),
      discount: Number(r.discount),
      total: Number(r.total),
      status: r.status,
      cjOrderId: r.cj_order_id,
      trackingNumber: r.tracking_number,
      createdAt: r.created_at
    }));
  }
};
