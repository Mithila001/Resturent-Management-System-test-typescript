import { Request, Response } from "express";
const Order = require("../models/Order").default || require("../models/Order");
const MenuItem = require("../models/MenuItem").default || require("../models/MenuItem");

type AuthRequest = Request & { user?: any };

// @desc    Get Kitchen Display System (KDS) orders
// @route   GET /api/chef/kds
// @access  Private (Chef)
const getKitchenOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query as any;

    // Chef sees orders that need preparation
    let query: any = {
      orderStatus: { $in: ["pending", "confirmed", "preparing"] },
    };

    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate("user", "name")
      .populate("items.menuItem", "name preparationTime")
      .populate("table", "tableNumber")
      .sort({ createdAt: 1 }); // Oldest first (FIFO)

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order for kitchen
// @route   GET /api/chef/orders/:id
// @access  Private (Chef)
const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name phone")
      .populate("items.menuItem", "name description preparationTime ingredients")
      .populate("table", "tableNumber");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Start preparing an order
// @route   PUT /api/chef/orders/:id/start
// @access  Private (Chef)
const startPreparingOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Can only start if order is pending or confirmed
    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Cannot start preparing order with status: ${order.orderStatus}`,
      });
    }

    order.orderStatus = "preparing";
    await order.save();

    // Emit socket event for real-time update
    const io = req.app.get("socketio");
    if (io) {
      (io as any).emit("orderStatusUpdated", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        userId: order.user,
      });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark order as ready
// @route   PUT /api/chef/orders/:id/ready
// @access  Private (Chef)
const markOrderAsReady = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Can only mark ready if currently preparing
    if (order.orderStatus !== "preparing") {
      return res.status(400).json({
        message: `Cannot mark order as ready. Current status: ${order.orderStatus}`,
      });
    }

    order.orderStatus = "ready";
    await order.save();

    // Emit socket event for real-time notification
    const io = req.app.get("socketio");
    if (io) {
      (io as any).emit("orderReady", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderType: order.orderType,
        tableNumber: order.tableNumber,
        userId: order.user,
      });

      (io as any).emit("orderStatusUpdated", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        userId: order.user,
      });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm order (acknowledge receipt)
// @route   PUT /api/chef/orders/:id/confirm
// @access  Private (Chef)
const confirmOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "pending") {
      return res.status(400).json({
        message: `Order already confirmed. Current status: ${order.orderStatus}`,
      });
    }

    order.orderStatus = "confirmed";
    await order.save();

    // Emit socket event
    const io = req.app.get("socketio");
    if (io) {
      (io as any).emit("orderStatusUpdated", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        userId: order.user,
      });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order statistics for kitchen
// @route   GET /api/chef/stats
// @access  Private (Chef)
const getKitchenStats = async (req: Request, res: Response) => {
  try {
    const pendingOrders = await Order.countDocuments({
      orderStatus: "pending",
    });

    const preparingOrders = await Order.countDocuments({
      orderStatus: "preparing",
    });

    const readyOrders = await Order.countDocuments({
      orderStatus: "ready",
    });

    // Calculate average preparation time (completed today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = await Order.find({
      orderStatus: { $in: ["ready", "delivered"] },
      updatedAt: { $gte: today },
    });

    res.json({
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedToday: completedToday.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update menu item availability
// @route   PUT /api/chef/menu/:id/availability
// @access  Private (Chef)
const updateMenuItemAvailability = async (req: Request, res: Response) => {
  try {
    const { isAvailable } = req.body as any;

    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    menuItem.isAvailable = isAvailable;
    await menuItem.save();

    res.json(menuItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getKitchenOrders,
  getOrderById,
  startPreparingOrder,
  markOrderAsReady,
  confirmOrder,
  getKitchenStats,
  updateMenuItemAvailability,
};
