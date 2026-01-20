const express = require("express");
const router = express.Router();
const {
  getFinancialOverview,
  getProfitAnalysis,
  getBusinessMetrics,
  getSystemStats,
  getComparativeAnalysis,
  exportFinancialReport,
  getDashboardStats,
} = require("../controllers/ownerController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require owner or admin authentication
router.use(protect);
router.use(authorize("owner", "admin"));

// Dashboard statistics
router.get("/dashboard-stats", getDashboardStats);

// Financial dashboards and reports
router.get("/financial-overview", getFinancialOverview);
router.get("/profit-analysis", getProfitAnalysis);
router.get("/business-metrics", getBusinessMetrics);
router.get("/system-stats", getSystemStats);

// Comparative analysis
router.get("/comparative-analysis", getComparativeAnalysis);

// Export reports
router.get("/export-report", exportFinancialReport);

module.exports = router;
