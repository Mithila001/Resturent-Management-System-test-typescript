import express from "express";
const router = express.Router();
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { protect, authorize } from "../middleware/authMiddleware";

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin routes
router.post("/", protect, authorize('admin'), createCategory);
router.put("/:id", protect, authorize('admin'), updateCategory);
router.delete("/:id", protect, authorize('admin'), deleteCategory);

export default router;
