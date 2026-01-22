import express from "express";
const router = express.Router();
import {
  getFinancialOverview,
  getProfitAnalysis,
  getBusinessMetrics,
  getSystemStats,
  getComparativeAnalysis,
  exportFinancialReport,
  getDashboardStats,
} from "../controllers/ownerController";
import { protect, authorize } from "../middleware/authMiddleware";

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

export default router;
