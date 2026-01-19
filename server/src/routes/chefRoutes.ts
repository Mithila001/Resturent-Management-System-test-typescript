const express = require("express");
const router = express.Router();
const {
  getKitchenOrders,
  getOrderById,
  startPreparingOrder,
  markOrderAsReady,
  confirmOrder,
  getKitchenStats,
  updateMenuItemAvailability,
  cancelOrder,
} = require("../controllers/chefController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes require chef authentication
router.use(protect);
router.use(authorize("chef"));

// Kitchen Display System (KDS)
router.get("/kds", getKitchenOrders);
router.get("/stats", getKitchenStats);

// Order management
router.get("/orders/:id", getOrderById);
router.put("/orders/:id/confirm", confirmOrder);
router.put("/orders/:id/start", startPreparingOrder);
router.put("/orders/:id/ready", markOrderAsReady);
router.put("/orders/:id/cancel", cancelOrder);

// Menu item availability
router.put("/menu/:id/availability", updateMenuItemAvailability);

module.exports = router;
