const express = require("express");
const router = express.Router();
const {
  getMyTables,
  assignSelfToTable,
  updateTableStatus,
  getMyTableOrders,
  markOrderAsDelivered,
  getOrdersByTableNumber,
} = require("../controllers/waiterController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require waiter authentication
router.use(protect);
router.use(authorize("waiter"));

// Table management
router.get("/tables", getMyTables);
router.put("/tables/:id/assign", assignSelfToTable);
router.put("/tables/:id/status", updateTableStatus);

// Order tracking and delivery
router.get("/orders", getMyTableOrders);
router.get("/orders/table/:tableNumber", getOrdersByTableNumber);
router.put("/orders/:id/deliver", markOrderAsDelivered);

module.exports = router;
