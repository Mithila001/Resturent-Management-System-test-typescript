// Waiter API Services
import axios from 'axios';
import API_URL from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Waiter API endpoints
export const waiterAPI = {
  // Table management
  getMyTables: () => api.get('/waiter/tables'),
  assignSelfToTable: (tableId: string) => api.put(`/waiter/tables/${tableId}/assign`),
  updateTableStatus: (tableId: string, status: string) => 
    api.put(`/waiter/tables/${tableId}/status`, { status }),
  
  // Order management
  getMyTableOrders: () => api.get('/waiter/orders'),
  getOrdersByTableNumber: (tableNumber: number) => 
    api.get(`/waiter/orders/table/${tableNumber}`),
  markOrderAsDelivered: (orderId: string) => 
    api.put(`/waiter/orders/${orderId}/deliver`),
};

export default waiterAPI;