import { Request, Response } from "express";
const Order = require("../models/Order").default || require("../models/Order");
const MenuItem = require("../models/MenuItem").default || require("../models/MenuItem");
const User = require("../models/User").default || require("../models/User");
const Table = require("../models/Table").default || require("../models/Table");
const Inventory = require("../models/Inventory").default || require("../models/Inventory");

type AuthRequest = Request & { user?: any };

// @desc    Get comprehensive analytics dashboard
// @route   GET /api/manager/analytics
// @access  Private (Manager)
const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as any;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Order statistics
    const totalOrders = await Order.countDocuments(query);
    const pendingOrders = await Order.countDocuments({
      ...query,
      orderStatus: "pending",
    });
    const completedOrders = await Order.countDocuments({
      ...query,
      orderStatus: "delivered",
    });
    const cancelledOrders = await Order.countDocuments({
      ...query,
      orderStatus: "cancelled",
    });

    // Revenue analytics
    const revenueData = await Order.aggregate([
      {
        $match: {
          ...query,
          paymentStatus: "paid",
          orderStatus: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Revenue by order type
    const revenueByType = await Order.aggregate([
      {
        $match: {
          ...query,
          paymentStatus: "paid",
          orderStatus: "delivered",
        },
      },
      {
        $group: {
          _id: "$orderType",
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Popular menu items
    const popularItems = await Order.aggregate([
      {
        $match: {
          ...query,
          orderStatus: "delivered",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItem",
          totalOrdered: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 10 },
    ]);

    // Populate menu item details
    const populatedItems = await MenuItem.populate(popularItems, {
      path: "_id",
      select: "name price category",
    });

    res.json({
      orderStats: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0,
      },
      revenue: {
        total: revenueData[0]?.totalRevenue || 0,
        average: revenueData[0]?.averageOrderValue || 0,
        byType: revenueByType,
      },
      popularItems: populatedItems,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get staff performance metrics
// @route   GET /api/manager/staff-performance
// @access  Private (Manager)
const getStaffPerformance = async (req: Request, res: Response) => {
  try {
    // Waiter performance
    const waiterStats = await Table.aggregate([
      {
        $match: {
          assignedWaiter: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$assignedWaiter",
          tablesAssigned: { $sum: 1 },
        },
      },
    ]);

    // Populate waiter details
    const populatedWaiters = await User.populate(waiterStats, {
      path: "_id",
      select: "name email role",
    });

    // Chef efficiency (orders prepared)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    const completedToday = await Order.countDocuments({
      createdAt: { $gte: today },
      orderStatus: { $in: ["ready", "delivered"] },
    });

    res.json({
      waiters: populatedWaiters,
      kitchen: {
        ordersToday,
        completedToday,
        efficiency: ordersToday > 0 ? ((completedToday / ordersToday) * 100).toFixed(2) : 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get inventory status
// @route   GET /api/manager/inventory-status
// @access  Private (Manager)
const getInventoryStatus = async (req: Request, res: Response) => {
  try {
    const allItems = await Inventory.find().sort({ itemName: 1 });

    const lowStock = allItems.filter((item: any) => item.quantity <= item.lowStockThreshold);

    const outOfStock = allItems.filter((item: any) => item.quantity === 0);

    res.json({
      totalItems: allItems.length,
      lowStockItems: lowStock,
      outOfStockItems: outOfStock,
      allItems,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get table occupancy statistics
// @route   GET /api/manager/table-occupancy
// @access  Private (Manager)
const getTableOccupancy = async (req: Request, res: Response) => {
  try {
    const tables = await Table.find().populate("assignedWaiter", "name");

    const totalTables = tables.length;
    const availableTables = tables.filter((t: any) => t.status === "available").length;
    const occupiedTables = tables.filter((t: any) => t.status === "occupied").length;
    const reservedTables = tables.filter((t: any) => t.status === "reserved").length;

    const occupancyRate = totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(2) : 0;

    res.json({
      totalTables,
      availableTables,
      occupiedTables,
      reservedTables,
      occupancyRate: `${occupancyRate}%`,
      tables,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily/weekly/monthly reports
// @route   GET /api/manager/reports
// @access  Private (Manager)
const getReports = async (req: Request, res: Response) => {
  try {
    const { period = "daily" } = req.query as any;

    let startDate = new Date();

    if (period === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate },
    });

    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({
      period,
      startDate,
      orderCount: orders.length,
      totalRevenue: revenue[0]?.total || 0,
      averageOrderValue: orders.length > 0 ? (revenue[0]?.total || 0) / orders.length : 0,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer insights
// @route   GET /api/manager/customer-insights
// @access  Private (Manager)
const getCustomerInsights = async (req: Request, res: Response) => {
  try {
    // Total customers
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // Active customers (placed orders in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeCustomers = await Order.distinct("user", {
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Top customers by order count
    const topCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
    ]);

    const populatedCustomers = await User.populate(topCustomers, {
      path: "_id",
      select: "name email",
    });

    res.json({
      totalCustomers,
      activeCustomers: activeCustomers.length,
      topCustomers: populatedCustomers,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manage menu items (update, create via menu controller)
// @route   PUT /api/manager/menu/:id
// @access  Private (Manager)
const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    res.json(updatedItem);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalytics,
  getStaffPerformance,
  getInventoryStatus,
  getTableOccupancy,
  getReports,
  getCustomerInsights,
  updateMenuItem,
};
