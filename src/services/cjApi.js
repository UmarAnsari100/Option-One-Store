/**
 * CJ Dropshipping Client API Service Module
 * Handles client-to-proxy calls (/api/cj/*), caching, exponential backoff retries, and error logging.
 * NEVER exposes API Keys or Secrets to client bundle.
 */

class CjApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Helper fetcher with retry logic (Exponential backoff)
   */
  async fetchWithRetry(url, options = {}, retries = 3, backoff = 500) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429 && retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, backoff));
          return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw error;
    }
  }

  /**
   * Search/List CJ Products via Proxy
   */
  async searchProducts(keyword = '', categoryId = '', page = 1, pageSize = 20) {
    const cacheKey = `search_${keyword}_${categoryId}_${page}_${pageSize}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const query = new URLSearchParams({ keyword, categoryId, page, pageSize }).toString();
      const result = await this.fetchWithRetry(`/api/cj/products/search?${query}`);

      this.cache.set(cacheKey, { timestamp: Date.now(), data: result });
      return result;
    } catch (error) {
      console.error('[CjApiService Error] searchProducts failed:', error);
      // Fallback response so app never crashes
      return { success: false, mode: 'OFFLINE_FALLBACK', list: [] };
    }
  }

  /**
   * Get Product Details by CJ PID
   */
  async getProductDetail(pid) {
    const cacheKey = `detail_${pid}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const result = await this.fetchWithRetry(`/api/cj/products/detail?pid=${pid}`);
      this.cache.set(cacheKey, { timestamp: Date.now(), data: result });
      return result;
    } catch (error) {
      console.error('[CjApiService Error] getProductDetail failed:', error);
      return { success: false, mode: 'OFFLINE_FALLBACK', data: null };
    }
  }

  /**
   * Calculate Shipping Freight
   */
  async calculateFreight(startCountry = 'CN', endCountry = 'PK', weight = 250) {
    try {
      return await this.fetchWithRetry('/api/cj/freight/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startCountryCode: startCountry, endCountryCode: endCountry, weight })
      });
    } catch (error) {
      console.error('[CjApiService Error] calculateFreight failed:', error);
      return {
        success: true,
        mode: 'FALLBACK',
        options: [{ logisticName: 'Standard Express Shipping', logisticPrice: 12.0, logisticTime: '5-9 days' }]
      };
    }
  }

  /**
   * Submit CJ Order
   */
  async createCjOrder(orderPayload) {
    try {
      return await this.fetchWithRetry('/api/cj/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
    } catch (error) {
      console.error('[CjApiService Error] createCjOrder failed:', error);
      return {
        success: false,
        message: error.message || 'Order submission failed'
      };
    }
  }

  /**
   * Track CJ Order Shipment
   */
  async getTrackingInfo(trackNumber, orderId) {
    try {
      const query = new URLSearchParams({ trackNumber, orderId }).toString();
      return await this.fetchWithRetry(`/api/cj/orders/track?${query}`);
    } catch (error) {
      console.error('[CjApiService Error] getTrackingInfo failed:', error);
      return { success: false, message: 'Failed to retrieve tracking info' };
    }
  }
}

export const cjApi = new CjApiService();
