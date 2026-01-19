// Customer API Services
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

export interface CreateOrderData {
  items: {
    menuItem: string;
    quantity: number;
  }[];
  deliveryAddress?: {
    street: string;
    city: string;
    postalCode: string;
    phone: string;
    notes?: string;
  };
  orderNotes?: string;
  paymentMethod?: string;
  orderType: "delivery" | "dine-in" | "takeaway";
  tableNumber?: number;
}

// Customer API endpoints
export const customerAPI = {
  // Menu browsing (public endpoints)
  browseMenu: (params?: {
    category?: string;
    search?: string;
    isVegetarian?: boolean;
    isSpicy?: boolean;
  }) => api.get("/customer/menu", { params }),
  getMenuItemDetails: (menuItemId: string) => api.get(`/customer/menu/${menuItemId}`),
  getCategories: () => api.get("/customer/categories"),

  // Order management (requires customer auth)
  createOrder: (orderData: CreateOrderData) => api.post("/customer/orders", orderData),
  getMyOrders: (params?: { status?: string; limit?: number; page?: number }) =>
    api.get("/customer/orders", { params }),
  getOrderDetails: (orderId: string) => api.get(`/customer/orders/${orderId}`),
  cancelOrder: (orderId: string, reason?: string) =>
    api.delete(`/customer/orders/${orderId}`, { data: { reason } }),

  // Future: Reviews
  addMenuItemReview: (menuItemId: string, review: { rating: number; comment: string }) =>
    api.post(`/customer/menu/${menuItemId}/review`, review),
};

// Guest order API (no authentication required)
export const guestOrderAPI = {
  // Create a guest order (dine-in only, no authentication)
  createGuestOrder: (
    orderData: Omit<CreateOrderData, "deliveryAddress"> & { tableNumber: number },
  ) =>
    axios.post(`${API_URL}/customer/orders/guest`, orderData, {
      headers: { "Content-Type": "application/json" },
    }),

  // Get guest order details by ID (no authentication)
  getGuestOrderDetails: (orderId: string) =>
    axios.get(`${API_URL}/customer/orders/guest/${orderId}`, {
      headers: { "Content-Type": "application/json" },
    }),
};

export default customerAPI;
