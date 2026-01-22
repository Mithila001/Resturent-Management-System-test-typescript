import express from "express";
const router = express.Router();
import {
  browseMenu,
  getMenuItemDetails,
  getCategories,
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  addMenuItemReview,
  createGuestOrder,
  getGuestOrderById,
} from "../controllers/customerController";
import { protect, authorize } from "../middleware/authMiddleware";

// Public routes - menu browsing
router.get("/menu", browseMenu);
router.get("/menu/:id", getMenuItemDetails);
router.get("/categories", getCategories);

// Public routes - guest orders (dine-in only)
router.post("/orders/guest", createGuestOrder);
router.get("/orders/guest/:id", getGuestOrderById);

// Protected customer routes
router.post("/orders", protect, authorize("customer"), createOrder);
router.get("/orders", protect, authorize("customer"), getMyOrders);
router.get("/orders/:id", protect, authorize("customer"), getOrderDetails);
router.delete("/orders/:id", protect, authorize("customer"), cancelOrder);

// Review feature (placeholder)
router.post("/menu/:id/review", protect, authorize("customer"), addMenuItemReview);

export default router;
