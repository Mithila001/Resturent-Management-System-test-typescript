import { Request, Response } from "express";
const MenuItem = require("../models/MenuItem").default || require("../models/MenuItem");
const Category = require("../models/Category").default || require("../models/Category");
const Order = require("../models/Order").default || require("../models/Order");

type AuthRequest = Request & { user?: any };

// @desc    Browse menu items (with filters)
// @route   GET /api/customer/menu
// @access  Public
const browseMenu = async (req: Request, res: Response) => {
  try {
    const { category, isAvailable, search, isVegetarian, isSpicy } = req.query as any;

    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === "true";
    } else {
      // Default: only show available items
      query.isAvailable = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (isVegetarian === "true") {
      query.isVegetarian = true;
    }

    if (isSpicy === "true") {
      query.isSpicy = true;
    }

    const menuItems = await MenuItem.find(query)
      .populate("category", "name description")
      .sort({ "category.order": 1, name: 1 });

    res.json(menuItems);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get menu item details
// @route   GET /api/customer/menu/:id
// @access  Public
const getMenuItemDetails = async (req: Request, res: Response) => {
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

// @desc    Get all categories
// @route   GET /api/customer/categories
// @access  Public
const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new order (checkout)
// @route   POST /api/customer/orders
// @access  Private (Customer)
const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, deliveryAddress, orderNotes, paymentMethod, orderType, tableNumber } =
      req.body as any;

    // Validate items array
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    // Validate based on order type
    if (orderType === "dine-in") {
      if (!tableNumber) {
        return res.status(400).json({
          message: "Table number is required for dine-in orders",
        });
      }
    } else if (orderType === "delivery") {
      if (
        !deliveryAddress ||
        !deliveryAddress.street ||
        !deliveryAddress.city ||
        !deliveryAddress.postalCode ||
        !deliveryAddress.phone
      ) {
        return res.status(400).json({
          message: "Complete delivery address is required",
        });
      }
    }

    // Process order items and calculate total
    let orderItems: any[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        return res.status(404).json({
          message: `Menu item not found: ${item.menuItem}`,
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          message: `${menuItem.name} is currently unavailable`,
        });
      }

      const subtotal = menuItem.price * item.quantity;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        subtotal: subtotal,
      });

      totalAmount += subtotal;
    }

    // Calculate estimated delivery time
    const estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000);

    // Create order
    const order = await Order.create({
      user: req.user?._id,
      items: orderItems,
      totalAmount,
      deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
      orderNotes,
      paymentMethod: paymentMethod || "cash",
      estimatedDeliveryTime,
      orderType: orderType || "delivery",
      tableNumber: orderType === "dine-in" ? tableNumber : undefined,
    });

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.menuItem", "name imageUrl");

    res.status(201).json(populatedOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get customer's orders
// @route   GET /api/customer/orders
// @access  Private (Customer)
const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = 20, page = 1 } = req.query as any;

    let query: any = { user: req.user?._id };

    if (status) {
      query.orderStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate("items.menuItem", "name imageUrl")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalOrders: total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order details
// @route   GET /api/customer/orders/:id
// @access  Private (Customer)
const getOrderDetails = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.menuItem", "name description imageUrl");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify this order belongs to the customer
    if (order.user._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to view this order",
      });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an order
// @route   DELETE /api/customer/orders/:id
// @access  Private (Customer)
const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify ownership
    if (order.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to cancel this order",
      });
    }

    // Only allow cancellation if order is not already delivered or cancelled
    if (order.orderStatus === "delivered" || order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: `Cannot cancel ${order.orderStatus} order`,
      });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || "Cancelled by customer";

    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review/rating to a menu item (future feature placeholder)
// @route   POST /api/customer/menu/:id/review
// @access  Private (Customer)
const addMenuItemReview = async (req: AuthRequest, res: Response) => {
  try {
    // Placeholder for future implementation
    res.status(501).json({
      message: "Review feature coming soon",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  browseMenu,
  getMenuItemDetails,
  getCategories,
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  addMenuItemReview,
};
