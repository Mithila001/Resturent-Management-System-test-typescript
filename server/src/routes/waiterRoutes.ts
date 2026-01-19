const express = require("express");
const router = express.Router();
const {
  getMyTables,
  assignSelfToTable,
  updateTableStatus,
  getMyTableOrders,
  markOrderAsDelivered,
  getOrdersByTableNumber,
  getAllTablesWithOrders,
  verifyOrder,
  resetTable,
  markOrderAsServed,
} = require("../controllers/waiterController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require waiter authentication
router.use(protect);
router.use(authorize("waiter"));

// Table management
router.get("/tables", getMyTables);
router.get("/tables/all", getAllTablesWithOrders); // Get all tables with order status
router.put("/tables/:id/assign", assignSelfToTable);
router.put("/tables/:id/status", updateTableStatus);
router.put("/tables/:id/reset", resetTable); // Reset table after customer leaves

// Order tracking and delivery
router.get("/orders", getMyTableOrders);
router.get("/orders/table/:tableNumber", getOrdersByTableNumber);
router.put("/orders/:id/verify", verifyOrder); // Verify order (pending → confirmed)
router.put("/orders/:id/serve", markOrderAsServed); // Mark order as served
router.put("/orders/:id/deliver", markOrderAsDelivered);

module.exports = router;
