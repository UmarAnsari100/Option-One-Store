/**
 * BaseRepository - Production Data Access Layer interface for Option One Store.
 * Supports MySQL REST APIs for ProductRepository & OrderRepository
 * while retaining localStorage helpers for SettingsRepository, CustomerRepository,
 * Theme, Wishlist, & Guest Cart state.
 */
export class BaseRepository {
  constructor(endpointOrStorageKey) {
    this.storageKey = endpointOrStorageKey || 'option_one_data';
    this.endpoint =
      typeof endpointOrStorageKey === 'string' && endpointOrStorageKey.startsWith('/')
        ? endpointOrStorageKey
        : '/api/products';
  }

  // ----------------------------------------------------
  // LocalStorage Helpers (Theme, Settings, Cart, Wishlist, Customers)
  // ----------------------------------------------------
  getLocalData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`[BaseRepository Error] Failed to read key ${this.storageKey}:`, e);
      return [];
    }
  }

  setLocalData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error(`[BaseRepository Error] Failed to write key ${this.storageKey}:`, e);
    }
  }

  saveLocalData(data) {
    this.setLocalData(data);
  }

  // ----------------------------------------------------
  // Express MySQL REST API Methods (ProductRepository & OrderRepository)
  // ----------------------------------------------------
  async fetchApi(url, options = {}) {
    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      const json = await res.json();
      return json;
    } catch (e) {
      console.error(`[BaseRepository API Error] ${url}:`, e);
      return { success: false, message: e.message, data: [] };
    }
  }

  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${this.endpoint}?${query}` : this.endpoint;
    const res = await this.fetchApi(url);
    return res.data || [];
  }

  async getById(id) {
    const res = await this.fetchApi(`${this.endpoint}/${id}`);
    return res.data || null;
  }

  async save(data) {
    const res = await this.fetchApi(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data || null;
  }

  async update(id, data) {
    const res = await this.fetchApi(`${this.endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data || null;
  }

  async delete(id) {
    const res = await this.fetchApi(`${this.endpoint}/${id}`, {
      method: 'DELETE'
    });
    return res.success || false;
  }
}
