import { BaseRepository } from './BaseRepository';

/**
 * ProductRepository - Production Database Operations via Express REST APIs.
 * Connects directly to MySQL. Zero localStorage usage for products/catalog.
 */
export class ProductRepository extends BaseRepository {
  constructor() {
    super('/api/products');
  }

  async getAllProducts(filters = {}) {
    return await this.getAll(filters);
  }

  async getPublished() {
    return await this.getAll({ status: 'published' });
  }

  async getById(id) {
    const res = await this.fetchApi(`/api/products/${id}`);
    return res.data || null;
  }

  async saveProduct(productData) {
    const res = await this.fetchApi('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    return res.data || null;
  }

  async setProductStatus(id, newStatus) {
    const res = await this.fetchApi(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    return res.data || null;
  }

  async deleteProduct(id) {
    const res = await this.fetchApi(`/api/products/${id}`, {
      method: 'DELETE'
    });
    return res.success || false;
  }

  async importCjProduct(cjPayload) {
    console.log('[POST /api/cj/import] Sending CJ import payload to Express backend');
    const res = await this.fetchApi('/api/cj/import', {
      method: 'POST',
      body: JSON.stringify(cjPayload)
    });
    return res.data || null;
  }
}

export const productRepository = new ProductRepository();
