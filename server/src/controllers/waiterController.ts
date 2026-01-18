import { Request, Response } from "express";
const Table = require("../models/Table").default || require("../models/Table");
const Order = require("../models/Order").default || require("../models/Order");

type AuthRequest = Request & { user?: any };

// @desc    Get tables assigned to waiter
// @route   GET /api/waiter/tables
// @access  Private (Waiter)
const getMyTables = async (req: AuthRequest, res: Response) => {
  try {
    const tables = await Table.find({ assignedWaiter: req.user?._id }).populate(
      "assignedWaiter",
      "name email",
    );

    res.json(tables);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign self to table
// @route   PUT /api/waiter/tables/:id/assign
// @access  Private (Waiter)
const assignSelfToTable = async (req: AuthRequest, res: Response) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    table.assignedWaiter = req.user?._id;
    await table.save();

    const updatedTable = await Table.findById(table._id).populate("assignedWaiter", "name email");

    res.json(updatedTable);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update table status (available, occupied, reserved)
// @route   PUT /api/waiter/tables/:id/status
// @access  Private (Waiter)
const updateTableStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body as any;
    const validStatuses = ["available", "occupied", "reserved"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    // Waiter can only update tables assigned to them
    if (table.assignedWaiter?.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        message: "You can only update status of tables assigned to you",
      });
    }

    table.status = status;
    await table.save();

    res.json(table);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for assigned tables
// @route   GET /api/waiter/orders
// @access  Private (Waiter)
const getMyTableOrders = async (req: AuthRequest, res: Response) => {
  try {
    // Get all tables assigned to this waiter
    const myTables = await Table.find({ assignedWaiter: req.user?._id });
    const tableNumbers = myTables.map((t: any) => t.tableNumber);

    // Get orders for those tables
    const orders = await Order.find({
      orderType: "dine-in",
      tableNumber: { $in: tableNumbers },
      orderStatus: { $nin: ["delivered", "cancelled"] },
    })
      .populate("user", "name email phone")
      .populate("items.menuItem", "name imageUrl")
      .populate("table", "tableNumber capacity")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track order delivery
// @route   PUT /api/waiter/orders/:id/deliver
// @access  Private (Waiter)
const markOrderAsDelivered = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify the order is for a table assigned to this waiter
    const table = await Table.findOne({
      tableNumber: order.tableNumber,
      assignedWaiter: req.user?._id,
    });

    if (!table) {
      return res.status(403).json({
        message: "You can only deliver orders for your assigned tables",
      });
    }

    // Only mark as delivered if order is ready
    if (order.orderStatus !== "ready") {
      return res.status(400).json({
        message: `Order must be ready before delivery. Current status: ${order.orderStatus}`,
      });
    }

    order.orderStatus = "delivered";
    order.deliveredAt = new Date();
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

// @desc    Get order tracking info for a specific table
// @route   GET /api/waiter/orders/table/:tableNumber
// @access  Private (Waiter)
const getOrdersByTableNumber = async (req: AuthRequest, res: Response) => {
  try {
    const tableNumber = parseInt(req.params.tableNumber as string, 10);

    // Verify this table is assigned to the waiter
    const table = await Table.findOne({
      tableNumber,
      assignedWaiter: req.user?._id,
    });

    if (!table) {
      return res.status(403).json({
        message: "This table is not assigned to you",
      });
    }

    const orders = await Order.find({
      orderType: "dine-in",
      tableNumber,
      orderStatus: { $nin: ["delivered", "cancelled"] },
    })
      .populate("user", "name email")
      .populate("items.menuItem", "name imageUrl price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyTables,
  assignSelfToTable,
  updateTableStatus,
  getMyTableOrders,
  markOrderAsDelivered,
  getOrdersByTableNumber,
};
