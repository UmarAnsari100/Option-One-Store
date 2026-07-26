import { BaseRepository } from './BaseRepository';

/**
 * OrderRepository - Order Lifecycle management with statuses:
 * Pending -> Confirmed -> Processing -> Ordered from CJ -> Shipped -> In Transit -> Delivered -> Completed
 */
export class OrderRepository extends BaseRepository {
  constructor() {
    super('option_one_orders_v2');
  }

  getOrders() {
    return this.getLocalData();
  }

  getOrderById(orderId) {
    return this.getOrders().find((o) => o.orderId === orderId);
  }

  saveOrder(orderData) {
    const orders = this.getOrders();
    const now = new Date().toISOString();
    
    const newOrder = {
      ...orderData,
      status: orderData.status || 'Pending',
      createdAt: now,
      activityLog: [
        {
          timestamp: now,
          status: orderData.status || 'Pending',
          note: 'Order placed by customer.'
        }
      ]
    };

    orders.unshift(newOrder);
    this.setLocalData(orders);
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus, note = '', cjDetails = {}) {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.orderId === orderId);

    if (index > -1) {
      const existing = orders[index];
      const now = new Date().toISOString();

      const updatedLog = [
        ...(existing.activityLog || []),
        {
          timestamp: now,
          status: newStatus,
          note: note || `Order status updated to ${newStatus}`
        }
      ];

      orders[index] = {
        ...existing,
        status: newStatus,
        cjOrderId: cjDetails.cjOrderId || existing.cjOrderId,
        trackingNumber: cjDetails.trackingNumber || existing.trackingNumber,
        courier: cjDetails.courier || existing.courier,
        activityLog: updatedLog,
        updatedAt: now
      };

      this.setLocalData(orders);
      return orders[index];
    }
    return null;
  }
}

export const orderRepository = new OrderRepository();
