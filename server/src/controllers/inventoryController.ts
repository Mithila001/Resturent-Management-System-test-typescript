import { Request, Response } from "express";
const Inventory = require("../models/Inventory").default || require("../models/Inventory");

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (Manager, Owner, Chef, Admin)
const getInventory = async (req: Request, res: Response) => {
  try {
    const items = await Inventory.find().sort({ itemName: 1 });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new inventory item
// @route   POST /api/inventory
// @access  Private (Manager, Owner, Admin)
const addInventoryItem = async (req: Request, res: Response) => {
  try {
    const { itemName, quantity, unit, lowStockThreshold, category } = req.body;

    const existingItem = await Inventory.findOne({ itemName });
    if (existingItem) {
      return res.status(400).json({ message: "Item already exists" });
    }

    const item = await Inventory.create({
      itemName,
      quantity,
      unit,
      lowStockThreshold,
      category,
    });

    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private (Manager, Owner, Admin, Chef - for usage)
const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { quantity, lowStockThreshold } = req.body;
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (quantity !== undefined) item.quantity = quantity;
    if (lowStockThreshold !== undefined) item.lowStockThreshold = lowStockThreshold;

    item.lastUpdated = new Date();
    await item.save();

    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Manager, Owner, Admin)
const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.deleteOne();
    res.json({ message: "Item removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
