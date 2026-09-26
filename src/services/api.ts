import axios from 'axios';
import type { AdminProduct, AdminOrder, OrderStatus } from '../types';

const API_BASE = 'http://localhost:4000';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const adminApi = {
  // Products
  async getRawProducts(): Promise<AdminProduct[]> {
    const res = await client.get<AdminProduct[]>('/products/admin/raw');
    return res.data;
  },

  async createProduct(data: any): Promise<AdminProduct> {
    const res = await client.post<AdminProduct>('/products', data);
    return res.data;
  },

  async updateProduct(id: string, data: any): Promise<AdminProduct> {
    const res = await client.put<AdminProduct>(`/products/${id}`, data);
    return res.data;
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    const res = await client.delete(`/products/${id}`);
    return res.data;
  },

  // Orders
  async getOrders(): Promise<AdminOrder[]> {
    const res = await client.get<AdminOrder[]>('/orders');
    return res.data;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
    const res = await client.patch<AdminOrder>(`/orders/${id}/status`, { status });
    return res.data;
  },

  async deleteOrder(id: string): Promise<{ success: boolean }> {
    const res = await client.delete(`/orders/${id}`);
    return res.data;
  },
};
