const express = require("express");
const router = express.Router();
const {
  getAnalytics,
  getStaffPerformance,
  getInventoryStatus,
  getTableOccupancy,
  getReports,
  getCustomerInsights,
  updateMenuItem,
} = require("../controllers/managerController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require manager authentication
router.use(protect);
router.use(authorize("manager"));

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

module.exports = router;
