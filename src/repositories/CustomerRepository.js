import { BaseRepository } from './BaseRepository';

/**
 * CustomerRepository - Manages customer accounts, saved addresses, and profile data.
 */
export class CustomerRepository extends BaseRepository {
  constructor() {
    super('option_one_customers_v2');
  }

  getCustomers() {
    return this.getLocalData();
  }

  findByEmail(email) {
    if (!email) return null;
    return this.getCustomers().find((c) => c.email.toLowerCase() === email.toLowerCase());
  }

  registerCustomer(customerData) {
    const customers = this.getCustomers();
    const existing = this.findByEmail(customerData.email);

    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newCustomer = {
      id: `cust_${Date.now()}`,
      email: customerData.email,
      name: customerData.name || customerData.email.split('@')[0],
      phone: customerData.phone || '',
      addresses: customerData.addresses || [],
      ordersCount: 0,
      createdAt: new Date().toISOString()
    };

    customers.push(newCustomer);
    this.setLocalData(customers);
    return newCustomer;
  }

  updateProfile(email, profileData) {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.email.toLowerCase() === email.toLowerCase());

    if (index > -1) {
      customers[index] = { ...customers[index], ...profileData, updatedAt: new Date().toISOString() };
      this.setLocalData(customers);
      return customers[index];
    }
    return null;
  }
}

export const customerRepository = new CustomerRepository();
