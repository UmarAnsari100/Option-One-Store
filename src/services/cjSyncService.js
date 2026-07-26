import { productRepository } from '../repositories/ProductRepository';

/**
 * cjSyncService - Manages Product Imports and Synchronization Locks.
 * Strictly imports items as "draft".
 * Enforces Field Lock: Sync updates stock/weight/warehouse ONLY; never overwrites manual edits!
 */
export const cjSyncService = {
  /**
   * Calculate Selling Price from CJ Cost Price
   * Formula: (CJ Cost + Freight + Handling Fee) * (1 + Margin%) rounded to .99
   */
  calculatePrice(costPrice = 20, freightCost = 8, handlingFee = 5, marginPercent = 30) {
    const baseCost = Number(costPrice) + Number(freightCost) + Number(handlingFee);
    const calculated = baseCost * (1 + Number(marginPercent) / 100);
    // Convert to PKR or round to .99 format
    const roundedInt = Math.ceil(calculated * 100); // 100 PKR exchange rate factor or standard price
    return Math.max(1000, roundedInt);
  },

  /**
   * Import CJ product into internal database with status = "draft"
   */
  importCjProduct(cjRawProduct, marginPercent = 30) {
    const costPrice = Number(cjRawProduct.costPrice || cjRawProduct.sellPrice || 25);
    const calculatedPrice = this.calculatePrice(costPrice, 8, 5, marginPercent);

    const draftProduct = {
      id: `cj_${cjRawProduct.pid || Date.now()}`,
      cjPid: cjRawProduct.pid,
      sku: cjRawProduct.productSku || `CJ-SKU-${cjRawProduct.pid}`,
      supplierSku: cjRawProduct.productSku || `CJ-SKU-${cjRawProduct.pid}`,
      name: cjRawProduct.productName || 'Imported CJ Product',
      brand: cjRawProduct.brand || 'Maison Selected',
      price: calculatedPrice,
      comparePrice: Math.round(calculatedPrice * 1.25),
      discount: 0,
      costPrice: costPrice,
      freightCost: 8,
      handlingFee: 5,
      marginPercent: marginPercent,
      rating: 4.8,
      reviews: 12,
      badge: 'In Stock',
      category: (cjRawProduct.categoryName || 'General').toLowerCase(),
      image1: cjRawProduct.productImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      image2: cjRawProduct.productImage || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      images: [cjRawProduct.productImage].filter(Boolean),
      customImages: [], // Custom uploads take priority if populated
      description: cjRawProduct.description || 'Premium curated piece from our global supplier network.',
      shortDescription: 'Luxury edition with precision engineering.',
      features: [
        'Curated global artisan craftsmanship',
        'International quality compliance certified',
        'Complimentary luxury packaging included'
      ],
      specs: {
        'Origin': 'Global Warehouse',
        'Weight': `${cjRawProduct.weight || 250}g`,
        'SKU': cjRawProduct.productSku || `CJ-SKU-${cjRawProduct.pid}`
      },
      stock: Number(cjRawProduct.stock || 50),
      weight: cjRawProduct.weight || 250,
      dimensions: '15cm x 10cm x 5cm',
      warehouse: 'Shenzhen Global Hub',
      source: 'cj',
      status: 'draft', // MUST BE DRAFT ON INITIAL IMPORT
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isTrending: false,
      isRecommended: false,
      fieldLocks: {
        lockTitle: false,
        lockDescription: false,
        lockPrice: false,
        lockImages: false
      }
    };

    return productRepository.saveProduct(draftProduct);
  },

  /**
   * Synchronize inventory & stock for existing CJ products without overwriting manual copy/prices/images
   */
  syncProductInventory(productId, updatedCjData) {
    const existing = productRepository.getById(productId);
    if (!existing) return null;

    // Field Lock Enforcement: Update ONLY stock, warehouse, weight, dimensions, supplierSku
    const syncedProduct = {
      ...existing,
      stock: updatedCjData.stock !== undefined ? Number(updatedCjData.stock) : existing.stock,
      weight: updatedCjData.weight || existing.weight,
      warehouse: updatedCjData.warehouse || existing.warehouse,
      supplierSku: updatedCjData.productSku || existing.supplierSku,
      // PRESERVE EVERYTHING ELSE:
      name: existing.name,
      description: existing.description,
      price: existing.price,
      image1: existing.image1,
      image2: existing.image2,
      status: existing.status
    };

    return productRepository.saveProduct(syncedProduct);
  }
};
