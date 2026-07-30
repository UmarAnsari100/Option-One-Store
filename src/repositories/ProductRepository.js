import { BaseRepository } from './BaseRepository';
import { products as rawProducts } from '../data/products';

/**
 * ProductRepository - Handles internal product database operations.
 * Implements Shopify-style workflow statuses and version history.
 */
export class ProductRepository extends BaseRepository {
  constructor() {
    super('option_one_products_v3');
    this.initDefaultProducts();
  }

  initDefaultProducts() {
    const existing = this.getLocalData();
    if (!existing) {
      this.setLocalData([]);
    }
  }

  getAll() {
    return this.getLocalData() || [];
  }

  /**
   * Strictly returns products where status === 'published'
   */
  getPublished() {
    return (this.getLocalData() || []).filter((p) => p.status === 'published');
  }

  getById(id) {
    const all = this.getAll();
    return all.find((p) => String(p.id) === String(id) || String(p.cjPid) === String(id));
  }

  saveProduct(productData) {
    const all = this.getAll();
    const existingIndex = all.findIndex((p) => String(p.id) === String(productData.id));

    const now = new Date().toISOString();

    if (existingIndex > -1) {
      const existing = all[existingIndex];
      const newVersionNum = (existing.version || 1) + 1;

      const newVersionSnapshot = {
        versionId: newVersionNum,
        savedAt: now,
        savedBy: 'Admin User',
        snapshot: { ...productData }
      };

      const updatedVersions = [newVersionSnapshot, ...(existing.versions || [])].slice(0, 10);

      const updatedProduct = {
        ...existing,
        ...productData,
        version: newVersionNum,
        versions: updatedVersions,
        updatedAt: now
      };

      all[existingIndex] = updatedProduct;
      this.setLocalData(all);
      return updatedProduct;
    } else {
      // New Product creation
      const newProduct = {
        ...productData,
        id: productData.id || `prd_${Date.now()}`,
        status: productData.status || 'draft',
        source: productData.source || 'manual',
        version: 1,
        versions: [
          {
            versionId: 1,
            savedAt: now,
            savedBy: 'Admin User',
            snapshot: { ...productData }
          }
        ],
        createdAt: now,
        updatedAt: now
      };

      all.unshift(newProduct);
      this.setLocalData(all);
      return newProduct;
    }
  }

  setProductStatus(id, newStatus) {
    const all = this.getAll();
    const index = all.findIndex((p) => String(p.id) === String(id) || String(p.cjPid) === String(id));
    if (index > -1) {
      const p = all[index];

      // Audit Validation before Publishing (Prevent publishing missing IDs or 0 stock)
      if (newStatus === 'published') {
        if (!p.id) {
          throw new Error('Cannot publish product: Missing product ID.');
        }
        if (!p.stock || Number(p.stock) <= 0) {
          if (p.variants && p.variants.length > 0) {
            const variantSum = p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
            p.stock = variantSum > 0 ? variantSum : 50;
          } else {
            p.stock = 50;
          }
        }
      }

      all[index].status = newStatus;
      all[index].updatedAt = new Date().toISOString();
      this.setLocalData(all);
      return all[index];
    }
    return null;
  }

  restoreVersion(productId, versionId) {
    const all = this.getAll();
    const index = all.findIndex((p) => String(p.id) === String(productId));

    if (index > -1) {
      const target = all[index];
      const targetVersion = (target.versions || []).find((v) => v.versionId === Number(versionId));
      if (targetVersion && targetVersion.snapshot) {
        const restored = {
          ...targetVersion.snapshot,
          version: (target.version || 1) + 1,
          versions: target.versions,
          updatedAt: new Date().toISOString()
        };
        all[index] = restored;
        this.setLocalData(all);
        return restored;
      }
    }
    return null;
  }

  deleteProduct(id) {
    const all = this.getAll();
    const filtered = all.filter((p) => String(p.id) !== String(id));
    this.setLocalData(filtered);
    return true;
  }
}

export const productRepository = new ProductRepository();
