// Owner API Services
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

// Owner API endpoints
export const ownerAPI = {
  // Financial overview
  getFinancialOverview: (params?: { year?: number; month?: number }) =>
    api.get("/owner/financial-overview", { params }),
  getProfitAnalysis: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/owner/profit-analysis", { params }),

  // Business metrics
  getBusinessMetrics: () => api.get("/owner/business-metrics"),
  getSystemStats: () => api.get("/owner/system-stats"),

  // Comparative analysis
  getComparativeAnalysis: (period?: "weekly" | "monthly") =>
    api.get("/owner/comparative-analysis", { params: { period } }),

  // Reports
  exportFinancialReport: (params?: {
    startDate?: string;
    endDate?: string;
    format?: "pdf" | "excel";
  }) => api.get("/owner/export-report", { params }),
};

export default ownerAPI;
