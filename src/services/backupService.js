import { productRepository } from '../repositories/ProductRepository';
import { orderRepository } from '../repositories/OrderRepository';
import { settingsRepository } from '../repositories/SettingsRepository';

/**
 * backupService - Handles exporting catalog (JSON), orders (CSV), pricing rules (JSON), and restoring catalog from JSON file.
 */
export const backupService = {
  exportCatalogJson() {
    const products = productRepository.getAll();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `option_one_catalog_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  exportOrdersCsv() {
    const orders = orderRepository.getOrders();
    if (orders.length === 0) {
      alert('No orders available to export.');
      return;
    }

    const headers = ['OrderId', 'Date', 'Customer', 'Email', 'TotalAmount', 'Status', 'CJOrderId', 'TrackingNumber'];
    const rows = orders.map((o) => [
      o.orderId,
      o.orderDate || o.createdAt,
      `"${o.customerName}"`,
      o.customerEmail,
      o.totalAmount,
      o.status,
      o.cjOrderId || 'N/A',
      o.trackingNumber || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `option_one_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  restoreCatalogFromJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        productRepository.setLocalData(parsed);
        return { success: true, count: parsed.length };
      }
      return { success: false, message: 'Invalid JSON format. Expected array of products.' };
    } catch (e) {
      return { success: false, message: 'JSON syntax error: ' + e.message };
    }
  }
};
