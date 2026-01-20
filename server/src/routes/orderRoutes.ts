const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats,
  getOrdersByTable,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// Get order statistics (admin, manager, owner)
router.get("/stats", authorize("admin", "manager", "owner"), getOrderStats);

// Get orders by table number (waiter, cashier, admin, manager, owner)
router.get(
  "/by-table/:tableNumber",
  authorize("waiter", "cashier", "admin", "manager", "owner"),
  getOrdersByTable
);

// Create new order (customers only) and get all orders
router.route("/").post(authorize("customer"), createOrder).get(getOrders);

// Get, update, cancel specific order
router.route("/:id").get(getOrderById).delete(cancelOrder);

// Update order status (waiter, chef, cashier, admin, manager, owner)
router.put(
  "/:id/status",
  authorize("admin", "manager", "owner", "chef", "waiter", "cashier"),
  updateOrderStatus
);

// Update payment status (cashier, admin, manager, owner)
router.put(
  "/:id/payment",
  authorize("admin", "manager", "owner", "cashier"),
  updatePaymentStatus
);

module.exports = router;
