// API Configuration
// VITE_API_URL should include /api at the end
// Example: http://localhost:5000/api or https://your-backend.railway.app/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// For socket connections, remove /api suffix
export const SOCKET_URL = API_URL.replace("/api", "");

export default API_URL;
