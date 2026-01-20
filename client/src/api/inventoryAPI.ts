// Inventory API Services
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

export interface InventoryItem {
  _id?: string;
  itemName: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  category: string;
  lastUpdated?: Date;
}

// Inventory API endpoints
export const inventoryAPI = {
  getInventory: () => api.get("/inventory"),
  addInventoryItem: (item: Omit<InventoryItem, "_id" | "lastUpdated">) =>
    api.post("/inventory", item),
  updateInventoryItem: (itemId: string, updateData: Partial<InventoryItem>) =>
    api.put(`/inventory/${itemId}`, updateData),
  deleteInventoryItem: (itemId: string) => api.delete(`/inventory/${itemId}`),
};

export default inventoryAPI;
