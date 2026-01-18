const express = require("express");
const router = express.Router();
const {
  browseMenu,
  getMenuItemDetails,
  getCategories,
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  addMenuItemReview,
} = require("../controllers/customerController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes - menu browsing
router.get("/menu", browseMenu);
router.get("/menu/:id", getMenuItemDetails);
router.get("/categories", getCategories);

// Protected customer routes
router.post("/orders", protect, authorize("customer"), createOrder);
router.get("/orders", protect, authorize("customer"), getMyOrders);
router.get("/orders/:id", protect, authorize("customer"), getOrderDetails);
router.delete("/orders/:id", protect, authorize("customer"), cancelOrder);

// Review feature (placeholder)
router.post("/menu/:id/review", protect, authorize("customer"), addMenuItemReview);

module.exports = router;
