import { Request, Response } from "express";
const MenuItem = require("../models/MenuItem").default || require("../models/MenuItem");
const Category = require("../models/Category").default || require("../models/Category");

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { category, isAvailable, search } = req.query as any;

    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === "true";
    }

    if (search) {
      query.$text = { $search: search };
    }

    const menuItems = await MenuItem.find(query)
      .populate("category", "name")
      .sort({ "category.order": 1, name: 1 });

    res.json(menuItems);
  } catch (error: any) {
    console.error("MenuController.getMenuItems error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "category",
      "name description",
    );

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable,
      isVegetarian,
      isSpicy,
      preparationTime,
      ingredients,
      allergens,
      nutritionalInfo,
    } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable,
      isVegetarian,
      isSpicy,
      preparationTime,
      ingredients,
      allergens,
      nutritionalInfo,
    });

    const populatedMenuItem = await MenuItem.findById(menuItem._id).populate("category", "name");
    res.status(201).json(populatedMenuItem);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const {
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable,
      isVegetarian,
      isSpicy,
      preparationTime,
      ingredients,
      allergens,
      nutritionalInfo,
    } = req.body;

    // Verify category exists if updating category
    if (category && category !== menuItem.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    menuItem.name = name || menuItem.name;
    menuItem.description = description || menuItem.description;
    menuItem.price = price !== undefined ? price : menuItem.price;
    menuItem.category = category || menuItem.category;
    menuItem.imageUrl = imageUrl !== undefined ? imageUrl : menuItem.imageUrl;
    menuItem.isAvailable = isAvailable !== undefined ? isAvailable : menuItem.isAvailable;
    menuItem.isVegetarian = isVegetarian !== undefined ? isVegetarian : menuItem.isVegetarian;
    menuItem.isSpicy = isSpicy !== undefined ? isSpicy : menuItem.isSpicy;
    menuItem.preparationTime = preparationTime || menuItem.preparationTime;
    menuItem.ingredients = ingredients || menuItem.ingredients;
    menuItem.allergens = allergens || menuItem.allergens;
    menuItem.nutritionalInfo = nutritionalInfo || menuItem.nutritionalInfo;

    const updatedMenuItem = await menuItem.save();
    const populatedMenuItem = await MenuItem.findById(updatedMenuItem._id).populate(
      "category",
      "name",
    );

    res.json(populatedMenuItem);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await menuItem.deleteOne();
    res.json({ message: "Menu item removed successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
