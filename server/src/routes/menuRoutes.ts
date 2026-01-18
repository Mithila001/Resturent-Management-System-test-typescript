const express = require("express");
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

// Admin routes
router.post("/", protect, authorize('admin'), createMenuItem);
router.put("/:id", protect, authorize('admin', 'manager', 'owner', 'chef'), updateMenuItem);
router.delete("/:id", protect, authorize('admin', 'owner', 'manager'), deleteMenuItem);

module.exports = router;
