// Chef API Services
import axios from "axios";
import API_URL from "../config/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Chef API endpoints
export const chefAPI = {
  // Kitchen Display System (KDS)
  getKitchenOrders: (status?: string) => api.get("/chef/kds", { params: { status } }),
  getKitchenStats: () => api.get("/chef/stats"),

  // Order management
  getOrderById: (orderId: string) => api.get(`/chef/orders/${orderId}`),
  confirmOrder: (orderId: string) => api.put(`/chef/orders/${orderId}/confirm`),
  startPreparingOrder: (orderId: string) => api.put(`/chef/orders/${orderId}/start`),
  markOrderAsReady: (orderId: string) => api.put(`/chef/orders/${orderId}/ready`),
  cancelOrder: (orderId: string, reason?: string) =>
    api.put(`/chef/orders/${orderId}/cancel`, { reason }),

  // Menu item availability
  updateMenuItemAvailability: (menuItemId: string, isAvailable: boolean) =>
    api.put(`/chef/menu/${menuItemId}/availability`, { isAvailable }),
};

export default chefAPI;
