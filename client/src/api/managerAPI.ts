// Manager API Services
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

// Manager API endpoints
export const managerAPI = {
  // Analytics and reporting
  getAnalytics: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/manager/analytics", { params }),
  getReports: (period?: "daily" | "weekly" | "monthly") =>
    api.get("/manager/reports", { params: { period } }),

  // Staff and performance
  getStaffPerformance: () => api.get("/manager/staff-performance"),

  // Inventory insights
  getInventoryStatus: () => api.get("/manager/inventory-status"),

  // Table management insights
  getTableOccupancy: () => api.get("/manager/table-occupancy"),

  // Customer insights
  getCustomerInsights: () => api.get("/manager/customer-insights"),

  // Menu management
  updateMenuItem: (menuItemId: string, updateData: any) =>
    api.put(`/manager/menu/${menuItemId}`, updateData),
};

export default managerAPI;
