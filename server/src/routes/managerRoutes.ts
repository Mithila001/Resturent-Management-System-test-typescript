import express from "express";
const router = express.Router();
import {
  getAnalytics,
  getStaffPerformance,
  getInventoryStatus,
  getTableOccupancy,
  getReports,
  getCustomerInsights,
  updateMenuItem,
  getDashboardStats,
} from "../controllers/managerController";
import { protect, authorize } from "../middleware/authMiddleware";

// All routes require manager authentication
router.use(protect);
router.use(authorize("manager"));

// Dashboard statistics
router.get("/dashboard-stats", getDashboardStats);

// Analytics and reporting
router.get("/analytics", getAnalytics);
router.get("/reports", getReports);

// Staff and performance
router.get("/staff-performance", getStaffPerformance);

// Inventory insights
router.get("/inventory-status", getInventoryStatus);

// Table management insights
router.get("/table-occupancy", getTableOccupancy);

// Customer insights
router.get("/customer-insights", getCustomerInsights);

// Menu management
router.put("/menu/:id", updateMenuItem);

export default router;
