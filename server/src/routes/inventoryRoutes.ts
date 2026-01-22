import express from "express";
const router = express.Router();
import {
    getInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
} from "../controllers/inventoryController";
import { protect, authorize } from "../middleware/authMiddleware";

router.use(protect);

router.route('/')
    .get(authorize('admin', 'manager', 'owner', 'chef'), getInventory)
    .post(authorize('admin', 'manager', 'owner'), addInventoryItem);

router.route('/:id')
    .put(authorize('admin', 'manager', 'owner', 'chef'), updateInventoryItem)
    .delete(authorize('admin', 'manager', 'owner'), deleteInventoryItem);

export default router;
