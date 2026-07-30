import { BaseRepository } from './BaseRepository';

/**
 * OrderRepository - Order Lifecycle management connecting directly to MySQL.
 * Zero localStorage usage.
 */
export class OrderRepository extends BaseRepository {
  constructor() {
    super('/api/orders');
  }

  async getOrders() {
    return await this.getAll();
  }

  async saveOrder(orderData) {
    const res = await this.fetchApi('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    return res.data || null;
  }
}

export const orderRepository = new OrderRepository();
