// Legacy API services - these can be gradually migrated to the new API structure
// This file serves as a bridge between old and new API calls

import axios from 'axios';
import API_URL from '../config/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Legacy endpoints (these should be migrated to new API structure over time)
export const legacyAPI = {
  // These are the old endpoints, use new role-specific APIs instead
  getOrders: () => api.get('/orders'),
  getMenuItems: () => api.get('/menu'),
  getTables: () => api.get('/tables'),
  getCategories: () => api.get('/categories'),
  getInventory: () => api.get('/inventory'),
};

export default legacyAPI;