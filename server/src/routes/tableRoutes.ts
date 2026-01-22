import express from "express";
const router = express.Router();
import {
  getTables,
  createTable,
  updateTableStatus,
  assignWaiter,
  updateTable,
  deleteTable,
} from "../controllers/tableController";
import { protect, authorize } from "../middleware/authMiddleware";

router
  .route("/")
  .get(protect, getTables)
  .post(protect, authorize("admin", "manager"), createTable);

router
  .route("/:id")
  .put(protect, authorize("admin", "manager"), updateTable)
  .delete(protect, authorize("admin", "manager"), deleteTable);

router
  .route("/:id/status")
  .put(
    protect,
    authorize("waiter", "admin", "manager", "owner", "staff"),
    updateTableStatus
  );

router
  .route("/:id/assign")
  .put(protect, authorize("waiter", "admin", "manager", "owner"), assignWaiter);

export default router;
