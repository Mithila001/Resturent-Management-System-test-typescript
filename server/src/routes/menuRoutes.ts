import express from "express";
const router = express.Router();
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController";
import { protect, authorize } from "../middleware/authMiddleware";

// Public routes
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

// Admin routes
router.post("/", protect, authorize('admin'), createMenuItem);
router.put("/:id", protect, authorize('admin', 'manager', 'owner', 'chef'), updateMenuItem);
router.delete("/:id", protect, authorize('admin', 'owner', 'manager'), deleteMenuItem);

export default router;
