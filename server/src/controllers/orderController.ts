import { Request, Response } from "express";
const Order = require("../models/Order").default || require("../models/Order");
const MenuItem = require("../models/MenuItem").default || require("../models/MenuItem");
const Table = require("../models/Table").default || require("../models/Table");

type AuthRequest = Request & { user?: any };

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
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
        return res.status(400).json({ message: "Table number is required for dine-in orders" });
      }
      // Find the table by tableNumber
      const table = await Table.findOne({ tableNumber });
      if (!table) {
        return res.status(404).json({ message: `Table ${tableNumber} not found` });
      }
    } else {
      // Default to delivery validation
      if (
        !deliveryAddress ||
        !deliveryAddress.street ||
        !deliveryAddress.city ||
        !deliveryAddress.postalCode ||
        !deliveryAddress.phone
      ) {
        return res.status(400).json({ message: "Complete delivery address is required" });
      }
    }

    // Process order items and calculate total
    let orderItems: any[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
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

    // Calculate estimated delivery time (45 minutes from now)
    const estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000);

    // Find table reference if dine-in
    let tableRef: any = null;
    if (orderType === "dine-in" && tableNumber) {
      const table = await Table.findOne({ tableNumber });
      if (table) {
        tableRef = table._id;
      }
    }

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
      tableNumber,
      table: tableRef,
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

// @desc    Get all orders (admin) or user's orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query as any;
    const limit = parseInt((req.query.limit as any) || "50", 10);
    const page = parseInt((req.query.page as any) || "1", 10);

    let query: any = {};

    // Role-based order filtering
    if (req.user?.role === "customer") {
      // Customers only see their own orders
      query.user = req.user._id;
    } else if (req.user?.role === "chef") {
      // Chef sees orders that need preparation: pending, confirmed, preparing
      query.orderStatus = { $in: ["pending", "confirmed", "preparing"] };
    } else if (req.user?.role === "waiter") {
      // Waiter sees all dine-in orders that are active
      query.orderType = "dine-in";
      query.orderStatus = { $nin: ["delivered", "cancelled"] };
    } else if (req.user?.role === "cashier") {
      // Cashier sees orders ready for payment
      query.orderStatus = { $in: ["ready", "delivered"] };
    } else if (["admin", "manager", "owner"].includes(req.user?.role)) {
      // Admin, Manager, Owner see all orders (no filter)
    } else {
      // Default: user sees only their own orders
      query.user = req.user?._id;
    }

    // Filter by status if provided (overrides role-based status filtering)
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.menuItem", "name imageUrl")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.menuItem", "name description imageUrl");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to view this order
    const isAdmin = ["admin", "manager", "owner"].includes(req.user?.role);
    const isOwner = order.user._id.toString() === req.user?._id.toString();
    const isStaff = ["chef", "waiter", "cashier"].includes(req.user?.role);

    if (!isAdmin && !isOwner && !isStaff) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderStatus } = req.body as any;

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "out-for-delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus;

    // Set delivery timestamp if status is delivered
    if (orderStatus === "delivered") {
      order.deliveredAt = new Date();
    }

    // Set cancellation timestamp if status is cancelled
    if (orderStatus === "cancelled") {
      order.cancelledAt = new Date();
      if (req.body.cancellationReason) {
        order.cancellationReason = req.body.cancellationReason;
      }
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.menuItem", "name imageUrl");

    // Emit socket event for real-time update
    const io = req.app.get("socketio");
    if (io) {
      (io as any).emit("orderStatusUpdated", {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        orderStatus: updatedOrder.orderStatus,
        userId: updatedOrder.user._id,
      });
    }

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private (Admin only)
const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentStatus } = req.body as any;

    const validStatuses = ["pending", "paid", "failed", "refunded"];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.menuItem", "name imageUrl");

    // Emit socket event for real-time update
    const io = req.app.get("socketio");
    if (io) {
      (io as any).emit("paymentStatusUpdated", {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        paymentStatus: updatedOrder.paymentStatus,
        userId: updatedOrder.user._id,
      });
    }

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to cancel this order
    if (req.user?.role !== "admin" && order.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    // Only allow cancellation if order is not already delivered or cancelled
    if (order.orderStatus === "delivered" || order.orderStatus === "cancelled") {
      return res.status(400).json({ message: `Cannot cancel ${order.orderStatus} order` });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || "Cancelled by user";

    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/stats
// @access  Private (Admin only)
const getOrderStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      orderStatus: "pending",
    });
    const completedOrders = await Order.countDocuments({
      orderStatus: "delivered",
    });
    const cancelledOrders = await Order.countDocuments({
      orderStatus: "cancelled",
    });

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: "delivered", paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders by table number
// @route   GET /api/orders/by-table/:tableNumber
// @access  Private (Waiter, Cashier, Admin, Manager, Owner)
const getOrdersByTable = async (req: Request, res: Response) => {
  try {
    const { tableNumber } = req.params;
    const { status } = req.query as any;

    let query: any = {
      orderType: "dine-in",
      tableNumber: parseInt(tableNumber as string, 10),
    };

    // Filter by status if provided
    if (status) {
      query.orderStatus = status;
    } else {
      // Default: only show active orders (not delivered or cancelled)
      query.orderStatus = { $nin: ["delivered", "cancelled"] };
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("items.menuItem", "name imageUrl")
      .populate("table", "tableNumber capacity status assignedWaiter")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats,
  getOrdersByTable,
};
