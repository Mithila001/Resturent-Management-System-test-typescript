import express from "express";
const router = express.Router();
import {
  getOrdersForPayment,
  getOrderDetails,
  processPayment,
  updatePaymentStatus,
  getPaymentStats,
  getTableOrders,
  issueRefund,
} from "../controllers/cashierController";
import { protect, authorize } from "../middleware/authMiddleware";

// All routes require cashier authentication
router.use(protect);
router.use(authorize("cashier"));

// Point of Sale (POS) routes
router.get("/orders", getOrdersForPayment);
router.get("/orders/:id", getOrderDetails);
router.post("/orders/:id/payment", processPayment);
router.put("/orders/:id/payment-status", updatePaymentStatus);
router.post("/orders/:id/refund", issueRefund);

// Statistics
router.get("/stats", getPaymentStats);

// Table billing
router.get("/tables/:tableNumber/orders", getTableOrders);

export default router;
