// Cashier API Services
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

export interface PaymentData {
  paymentMethod: "cash" | "card" | "online";
  amountPaid: number;
  transactionId?: string;
}

// Cashier API endpoints
export const cashierAPI = {
  // Point of Sale (POS)
  getOrdersForPayment: (params?: { status?: string; paymentStatus?: string }) =>
    api.get("/cashier/orders", { params }),
  getOrderDetails: (orderId: string) => api.get(`/cashier/orders/${orderId}`),
  processPayment: (orderId: string, paymentData: PaymentData) =>
    api.post(`/cashier/orders/${orderId}/payment`, paymentData),
  updatePaymentStatus: (
    orderId: string,
    paymentStatus: "pending" | "paid" | "failed" | "refunded",
  ) => api.put(`/cashier/orders/${orderId}/payment-status`, { paymentStatus }),
  issueRefund: (orderId: string, reason: string) =>
    api.post(`/cashier/orders/${orderId}/refund`, { reason }),

  // Statistics and reporting
  getPaymentStats: () => api.get("/cashier/stats"),

  // Table billing
  getTableOrders: (tableNumber: number) => api.get(`/cashier/tables/${tableNumber}/orders`),
};

export default cashierAPI;
