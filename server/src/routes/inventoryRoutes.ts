const express = require('express');
const router = express.Router();
const {
    getInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(authorize('admin', 'manager', 'owner', 'chef'), getInventory)
    .post(authorize('admin', 'manager', 'owner'), addInventoryItem);

router.route('/:id')
    .put(authorize('admin', 'manager', 'owner', 'chef'), updateInventoryItem)
    .delete(authorize('admin', 'manager', 'owner'), deleteInventoryItem);

module.exports = router;
