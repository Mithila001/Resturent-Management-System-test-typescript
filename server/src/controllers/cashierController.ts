import { Request, Response } from "express";
const Order = require("../models/Order").default || require("../models/Order");

type AuthRequest = Request & { user?: any };

// @desc    Get all orders ready for payment
// @route   GET /api/cashier/orders
// @access  Private (Cashier)
const getOrdersForPayment = async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus } = req.query as any;

    // Cashier sees orders ready for payment (served for dine-in, ready for delivery)
    // Only show orders that require manual payment processing (cash/card)
    let query: any = {
      orderStatus: { $in: ["ready", "served", "delivered", "dine-in-completed"] },
      paymentMethod: { $in: ["cash", "card"] },
    };

    if (status) {
      query.orderStatus = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    } else {
      // Default: show unpaid orders
      query.paymentStatus = "pending";
    }

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("items.menuItem", "name price")
      .populate("table", "tableNumber")
      .sort({ updatedAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order details for POS
// @route   GET /api/cashier/orders/:id
// @access  Private (Cashier)
const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.menuItem", "name price imageUrl")
      .populate("table", "tableNumber capacity");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process payment
// @route   POST /api/cashier/orders/:id/payment
// @access  Private (Cashier)
const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentMethod, amountPaid, transactionId } = req.body as any;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate payment amount
    if (amountPaid < order.totalAmount) {
      return res.status(400).json({
        message: "Payment amount is less than order total",
      });
    }

    // Update payment status
    order.paymentStatus = "paid";
    order.paymentMethod = paymentMethod || order.paymentMethod;

    // Auto-dispatch delivery orders after payment
    const shouldDispatchDelivery =
      order.orderType === "delivery" &&
      ["ready", "confirmed", "preparing"].includes(order.orderStatus);

    if (shouldDispatchDelivery) {
      order.orderStatus = "out-for-delivery";
    }

    // Add payment metadata (can extend Order model to include this)
    // order.paymentDetails = { amountPaid, transactionId, paidAt: new Date() };

    await order.save();

    // Emit socket event for real-time update
    const io = req.app.get("socketio");
    if (io) {
      (io as any).emit("paymentStatusUpdated", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        userId: order.user,
      });

      if (shouldDispatchDelivery) {
        (io as any).emit("orderStatusUpdated", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          userId: order.user,
        });
      }
    }

    res.json({
      message: "Payment processed successfully",
      order,
      change: amountPaid - order.totalAmount,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/cashier/orders/:id/payment-status
// @access  Private (Cashier)
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

    // Emit socket event
    const io = req.app.get("socketio");
    if (io) {
      (io as any).emit("paymentStatusUpdated", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        userId: order.user,
      });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment statistics
// @route   GET /api/cashier/stats
// @access  Private (Cashier)
const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count orders by payment status (both completed and active orders ready for payment)
    const pendingPayments = await Order.countDocuments({
      paymentStatus: "pending",
      orderStatus: { $in: ["ready", "served", "delivered", "dine-in-completed"] },
    });

    const paidOrders = await Order.countDocuments({
      paymentStatus: "paid",
      updatedAt: { $gte: today },
    });

    // Calculate total revenue today
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          updatedAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Revenue by payment method
    const revenueByMethod = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          updatedAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      pendingPayments,
      paidOrdersToday: paidOrders,
      totalRevenueToday: todayRevenue[0]?.total || 0,
      revenueByMethod,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders by table for billing
// @route   GET /api/cashier/tables/:tableNumber/orders
// @access  Private (Cashier)
const getTableOrders = async (req: Request, res: Response) => {
  try {
    const tableNumber = parseInt(req.params.tableNumber as string, 10);

    const orders = await Order.find({
      orderType: "dine-in",
      tableNumber,
      orderStatus: { $nin: ["cancelled"] },
    })
      .populate("user", "name")
      .populate("items.menuItem", "name price")
      .sort({ createdAt: -1 });

    // Calculate total bill for table
    const totalBill = orders.reduce((sum: number, order: any) => {
      if (order.paymentStatus !== "paid") {
        return sum + order.totalAmount;
      }
      return sum;
    }, 0);

    res.json({
      orders,
      totalBill,
      tableNumber,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Issue refund
// @route   POST /api/cashier/orders/:id/refund
// @access  Private (Cashier)
const issueRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body as any;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Can only refund paid orders",
      });
    }

    order.paymentStatus = "refunded";
    order.cancellationReason = reason || "Refund issued by cashier";
    await order.save();

    res.json({
      message: "Refund processed successfully",
      order,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrdersForPayment,
  getOrderDetails,
  processPayment,
  updatePaymentStatus,
  getPaymentStats,
  getTableOrders,
  issueRefund,
};
