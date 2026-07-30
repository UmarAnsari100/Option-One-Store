import { productRepository } from '../repositories/ProductRepository';

/**
 * Universal CJ Field Normalizer
 * Extracts and cleans all properties from CJ Dropshipping API v2 JSON payloads
 */
export function normalizeCjItem(cjItem) {
  if (!cjItem) return null;

  // 1. Extract Title (Prefer English title, handle array / stringified JSON array)
  let title = cjItem.productNameEn || cjItem.productName || cjItem.nameEn || cjItem.title || cjItem.name || '';
  if (Array.isArray(title)) {
    title = title.join(' ').trim();
  } else if (typeof title === 'string') {
    title = title.trim();
    if (title.startsWith('[') && title.endsWith(']')) {
      try {
        const parsed = JSON.parse(title);
        if (Array.isArray(parsed)) {
          title = parsed.join(' ').trim();
        }
      } catch (e) {
        // preserve original string
      }
    }
  }
  if (!title) title = 'Imported CJ Product';

  // 2. Extract Images (Handle string, array, comma-separated set, protocol relative //)
  let images = [];

  if (Array.isArray(cjItem.productImageSet)) {
    images = cjItem.productImageSet;
  } else if (typeof cjItem.productImageSet === 'string' && cjItem.productImageSet.trim()) {
    images = cjItem.productImageSet.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (images.length === 0) {
    if (Array.isArray(cjItem.productImage)) {
      images = cjItem.productImage;
    } else if (typeof cjItem.productImage === 'string' && cjItem.productImage.trim()) {
      images = [cjItem.productImage.trim()];
    }
  }

  // Prepend https: to protocol-relative URLs
  images = images
    .map((img) => {
      if (typeof img === 'string') {
        const clean = img.trim();
        if (clean.startsWith('//')) return 'https:' + clean;
        return clean;
      }
      return '';
    })
    .filter(Boolean);

  const mainImage = images[0] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop';
  const secondaryImage = images[1] || mainImage;

  // 3. Extract Cost / Price
  const rawCost = cjItem.costPrice ?? cjItem.sellPrice ?? cjItem.nowPrice ?? cjItem.variantSellPrice ?? cjItem.price ?? 0;
  const costPrice = isNaN(parseFloat(rawCost)) ? 0 : parseFloat(rawCost);

  // 4. Extract Variants & Variant Inventory
  let variants = [];
  let variantStockSum = 0;
  const pid = cjItem.pid || cjItem.id || cjItem.productId || '';
  const sku = cjItem.productSku || cjItem.sku || (pid ? `CJ-SKU-${pid}` : 'N/A');

  const rawVariants = cjItem.variants || cjItem.variantList || cjItem.productVariants || [];
  if (Array.isArray(rawVariants) && rawVariants.length > 0) {
    variants = rawVariants.map((v, idx) => {
      const vStock = isNaN(parseInt(v.stock ?? v.inventory ?? v.quantity ?? v.subNum, 10)) ? 50 : parseInt(v.stock ?? v.inventory ?? v.quantity ?? v.subNum, 10);
      variantStockSum += vStock;

      let vImg = v.variantImage || v.image || mainImage;
      if (typeof vImg === 'string' && vImg.startsWith('//')) vImg = 'https:' + vImg;

      return {
        variantId: v.variantId || v.vid || `${pid}-VAR-${idx + 1}`,
        variantName: v.variantName || v.variantKey || v.property || `Variant ${idx + 1}`,
        variantPrice: isNaN(parseFloat(v.variantPrice || v.variantSellPrice || v.price || costPrice)) ? costPrice : parseFloat(v.variantPrice || v.variantSellPrice || v.price || costPrice),
        variantSku: v.variantSku || v.sku || `${sku}-${idx + 1}`,
        variantImage: vImg,
        stock: vStock
      };
    });
  }

  // 5. Extract Stock / Inventory (Calculate from variant sum if top-level stock missing)
  const rawStock = cjItem.stock ?? cjItem.inventory ?? cjItem.quantity ?? cjItem.productStock ?? cjItem.subNum ?? cjItem.totalStock;
  let stock = 0;

  if (rawStock !== undefined && rawStock !== null && !isNaN(parseInt(rawStock, 10)) && parseInt(rawStock, 10) > 0) {
    stock = parseInt(rawStock, 10);
  } else if (variantStockSum > 0) {
    stock = variantStockSum;
  } else {
    // Fallback: Avoid hardcoded 0 stock on fresh import
    stock = 50;
  }

  // 6. Extract Category
  const category = cjItem.categoryName || cjItem.threeCategoryName || cjItem.twoCategoryName || cjItem.category || 'General';

  // 7. Extract Description
  let description = cjItem.description || cjItem.descriptionEn || cjItem.productDescription || cjItem.remark || '';
  if (typeof description === 'string') {
    description = description.replace(/<[^>]*>?/gm, '').trim();
  }
  if (!description) {
    description = 'Premium curated piece from our global supplier network.';
  }

  return {
    pid,
    title,
    sku,
    costPrice,
    stock,
    category,
    mainImage,
    secondaryImage,
    images: images.length > 0 ? images : [mainImage],
    description,
    variants,
    raw: cjItem
  };
}

/**
 * cjSyncService - Manages Product Imports and Synchronization Locks.
 * Strictly imports items as "draft".
 */
export const cjSyncService = {
  calculatePrice(costPrice = 20, freightCost = 8, handlingFee = 5, marginPercent = 30) {
    const baseCost = Number(costPrice) + Number(freightCost) + Number(handlingFee);
    const calculated = baseCost * (1 + Number(marginPercent) / 100);
    const roundedInt = Math.ceil(calculated * 100);
    return Math.max(1000, roundedInt);
  },

  importCjProduct(cjRawProduct, marginPercent = 30) {
    const norm = normalizeCjItem(cjRawProduct);
    if (!norm) return null;

    const costPrice = norm.costPrice > 0 ? norm.costPrice : 25;
    const calculatedPrice = this.calculatePrice(costPrice, 8, 5, marginPercent);

    const draftProduct = {
      id: `cj_${norm.pid || Date.now()}`,
      cjPid: norm.pid,
      sku: norm.sku,
      supplierSku: norm.sku,
      name: norm.title,
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
      badge: norm.stock > 0 ? 'In Stock' : 'Low Stock',
      category: norm.category.toLowerCase(),
      image1: norm.mainImage,
      image2: norm.secondaryImage,
      images: norm.images,
      customImages: [],
      description: norm.description,
      shortDescription: `Luxury ${norm.category} edition with precision engineering.`,
      features: [
        'Curated global artisan craftsmanship',
        'International quality compliance certified',
        'Complimentary luxury packaging included'
      ],
      specs: {
        'Origin': 'Global Warehouse',
        'Weight': `${cjRawProduct.weight || 250}g`,
        'SKU': norm.sku
      },
      variants: norm.variants,
      stock: norm.stock,
      weight: cjRawProduct.weight || 250,
      dimensions: '15cm x 10cm x 5cm',
      warehouse: 'Shenzhen Global Hub',
      source: 'cj',
      status: 'draft',
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

    // Structured Audit Log for Import
    console.log('==================================================');
    console.log('📦 [CJ IMPORT AUDIT LOG]');
    console.log(`• CJ Product ID:   ${norm.pid || 'N/A'}`);
    console.log(`• SKU:             ${norm.sku}`);
    console.log(`• Stock Quantity:  ${draftProduct.stock}`);
    console.log(`• Variant Count:   ${draftProduct.variants.length}`);
    console.log(`• Images Imported: ${draftProduct.images.length}`);
    console.log(`• Description Len: ${draftProduct.description.length} chars`);
    console.log('==================================================');

    return productRepository.saveProduct(draftProduct);
  },

  syncProductInventory(productId, updatedCjData) {
    const existing = productRepository.getById(productId);
    if (!existing) return null;

    const norm = normalizeCjItem(updatedCjData);

    const syncedProduct = {
      ...existing,
      stock: norm && norm.stock > 0 ? norm.stock : existing.stock,
      weight: updatedCjData.weight || existing.weight,
      warehouse: updatedCjData.warehouse || existing.warehouse,
      supplierSku: norm ? norm.sku : existing.supplierSku,
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
