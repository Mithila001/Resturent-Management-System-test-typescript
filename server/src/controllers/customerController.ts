import { Request, Response } from "express";
import MenuItem from "../models/MenuItem";
import Category from "../models/Category";
import Order from "../models/Order";

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

    // Check if user already has an active order
    const activeUserOrder = await Order.findOne({
      user: req.user?._id,
      isCompleted: false,
    });

    if (activeUserOrder) {
      return res.status(400).json({
        message:
          "You already have an active order. Please wait until it is completed before placing a new one.",
        existingOrder: {
          orderNumber: activeUserOrder.orderNumber,
          orderStatus: activeUserOrder.orderStatus,
        },
      });
    }

    // Validate based on order type
    if (orderType === "dine-in") {
      if (!tableNumber) {
        return res.status(400).json({
          message: "Table number is required for dine-in orders",
        });
      }

      // Check if table already has an active order
      const activeTableOrder = await Order.findOne({
        orderType: "dine-in",
        tableNumber,
        isCompleted: false,
      });

      if (activeTableOrder) {
        return res.status(400).json({
          message: `Table ${tableNumber} is currently occupied with an active order. Please choose another table.`,
          existingOrder: {
            orderNumber: activeTableOrder.orderNumber,
            orderStatus: activeTableOrder.orderStatus,
          },
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
      paymentStatus: paymentMethod === "online" ? "paid" : "pending", // Online payments are considered paid immediately
      estimatedDeliveryTime,
      orderType: orderType || "delivery",
      tableNumber: orderType === "dine-in" ? tableNumber : undefined,
      orderStatus: orderType === "delivery" ? "confirmed" : "pending", // Auto-confirm delivery orders
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
    const isOwner = order.user && order.user._id.toString() === req.user?._id?.toString();
    if (!isOwner) {
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
    if (!order.user || order.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to cancel this order",
      });
    }

    // Prevent customers from cancelling dine-in orders
    if (order.orderType === "dine-in") {
      return res.status(403).json({
        message: "Dine-in orders cannot be cancelled online. Please speak to your waiter.",
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

// @desc    Create a guest order (dine-in only, no authentication required)
// @route   POST /api/customer/orders/guest
// @access  Public
const createGuestOrder = async (req: Request, res: Response) => {
  try {
    const { items, orderNotes, paymentMethod, orderType, tableNumber } = req.body as any;

    // Only allow dine-in orders for guests
    if (orderType !== "dine-in") {
      return res.status(400).json({
        message: "Guest orders are only allowed for dine-in. Please login for delivery orders.",
      });
    }

    // Validate items array
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    // Validate table number
    if (!tableNumber) {
      return res.status(400).json({
        message: "Table number is required for dine-in orders",
      });
    }

    // Check if table already has an active order
    const activeTableOrder = await Order.findOne({
      orderType: "dine-in",
      tableNumber,
      isCompleted: false,
    });

    if (activeTableOrder) {
      return res.status(400).json({
        message: `Table ${tableNumber} is currently occupied with an active order. Please choose another table.`,
        existingOrder: {
          orderNumber: activeTableOrder.orderNumber,
          orderStatus: activeTableOrder.orderStatus,
        },
      });
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

    // Calculate estimated delivery time (for dine-in, this is prep time)
    const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);

    // Create order without user (guest order)
    const order = await Order.create({
      user: null, // Guest order
      items: orderItems,
      totalAmount,
      orderNotes,
      paymentMethod: paymentMethod || "cash",
      paymentStatus: paymentMethod === "online" ? "paid" : "pending", // Online payments are considered paid immediately
      estimatedDeliveryTime,
      orderType: "dine-in",
      tableNumber,
    });

    // Populate order details (without user)
    const populatedOrder = await Order.findById(order._id).populate(
      "items.menuItem",
      "name imageUrl",
    );

    res.status(201).json(populatedOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get guest order details by ID (public endpoint)
// @route   GET /api/customer/orders/guest/:id
// @access  Public
const getGuestOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.menuItem",
      "name description imageUrl",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only return orders that don't have a user (guest orders)
    if (order.user) {
      return res.status(403).json({
        message: "This is not a guest order. Please login to view your orders.",
      });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export {
  browseMenu,
  getMenuItemDetails,
  getCategories,
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  addMenuItemReview,
  createGuestOrder,
  getGuestOrderById,
};
