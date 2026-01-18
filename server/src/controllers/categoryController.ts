import { Request, Response } from "express";
const Category = require("../models/Category").default || require("../models/Category");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      order: 1,
      name: 1,
    });
    res.json(categories);
  } catch (error: any) {
    console.error("CategoryController.getCategories error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl, isActive, order } = req.body;

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      description,
      imageUrl,
      isActive,
      order,
    });

    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name, description, imageUrl, isActive, order } = req.body;

    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.imageUrl = imageUrl !== undefined ? imageUrl : category.imageUrl;
    category.isActive = isActive !== undefined ? isActive : category.isActive;
    category.order = order !== undefined ? order : category.order;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.deleteOne();
    res.json({ message: "Category removed successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
