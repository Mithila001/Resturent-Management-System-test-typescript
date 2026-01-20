import { Request, Response } from "express";
const Order = require("../models/Order").default || require("../models/Order");
const User = require("../models/User").default || require("../models/User");
const MenuItem = require("../models/MenuItem").default || require("../models/MenuItem");
const Inventory = require("../models/Inventory").default || require("../models/Inventory");

type AuthRequest = Request & { user?: any };

// @desc    Get high-level financial overview
// @route   GET /api/owner/financial-overview
// @access  Private (Owner, Admin)
const getFinancialOverview = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query as any;

    // Build date filter
    const currentDate = new Date();
    let startDate = new Date(year || currentDate.getFullYear(), 0, 1);
    let endDate = new Date(year || currentDate.getFullYear(), 11, 31, 23, 59, 59);

    if (month) {
      startDate = new Date(year || currentDate.getFullYear(), parseInt(month) - 1, 1);
      endDate = new Date(year || currentDate.getFullYear(), parseInt(month), 0, 23, 59, 59);
    }

    // Total revenue
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: "paid",
          orderStatus: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Revenue by month (for yearly view)
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: "paid",
          orderStatus: "delivered",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Revenue by payment method
    const revenueByPaymentMethod = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Refunds and cancellations
    const refundData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          $or: [{ paymentStatus: "refunded" }, { orderStatus: "cancelled" }],
        },
      },
      {
        $group: {
          _id: null,
          totalRefunds: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "refunded"] }, "$totalAmount", 0],
            },
          },
          refundCount: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "refunded"] }, 1, 0],
            },
          },
          cancelledCount: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({
      period: { startDate, endDate },
      revenue: {
        total: revenueData[0]?.totalRevenue || 0,
        orderCount: revenueData[0]?.orderCount || 0,
        averageOrderValue: revenueData[0]?.averageOrderValue || 0,
      },
      monthlyBreakdown: monthlyRevenue,
      paymentMethods: revenueByPaymentMethod,
      refunds: {
        totalRefunded: refundData[0]?.totalRefunds || 0,
        refundCount: refundData[0]?.refundCount || 0,
        cancelledOrders: refundData[0]?.cancelledCount || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get profit analysis
// @route   GET /api/owner/profit-analysis
// @access  Private (Owner, Admin)
const getProfitAnalysis = async (req: Request, res: Response) => {
  try {
    // This is a simplified version. In real world, you'd track costs, expenses, etc.
    const { startDate, endDate } = req.query as any;

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const totalRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          paymentStatus: "paid",
          orderStatus: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // In a real system, you'd calculate actual costs
    // For now, we'll estimate operational costs as 40% of revenue
    const revenue = totalRevenue[0]?.total || 0;
    const estimatedCosts = revenue * 0.4;
    const estimatedProfit = revenue - estimatedCosts;

    res.json({
      period: { start, end },
      revenue,
      estimatedCosts,
      estimatedProfit,
      profitMargin: revenue > 0 ? ((estimatedProfit / revenue) * 100).toFixed(2) + "%" : "0%",
      note: "Cost estimation is simplified. Integrate with accounting system for accurate data.",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get business metrics and KPIs
// @route   GET /api/owner/business-metrics
// @access  Private (Owner, Admin)
const getBusinessMetrics = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Total customers
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // Active customers (last 30 days)
    const activeCustomers = await Order.distinct("user", {
      createdAt: { $gte: lastMonth },
    });

    // Today's metrics
    const todayMetrics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
            },
          },
        },
      },
    ]);

    // Total employees
    const employees = await User.countDocuments({
      role: { $in: ["waiter", "chef", "cashier", "manager"] },
    });

    // Menu items count
    const totalMenuItems = await MenuItem.countDocuments();
    const availableMenuItems = await MenuItem.countDocuments({ isAvailable: true });

    // Inventory value (simplified)
    const inventoryItems = await Inventory.find();
    const totalInventoryValue = inventoryItems.reduce((sum: number, item: any) => {
      // Assuming average cost per unit is $5 (this should come from actual cost data)
      return sum + item.quantity * 5;
    }, 0);

    res.json({
      customers: {
        total: totalCustomers,
        active: activeCustomers.length,
        retention:
          totalCustomers > 0
            ? ((activeCustomers.length / totalCustomers) * 100).toFixed(2) + "%"
            : "0%",
      },
      todayMetrics: {
        orders: todayMetrics[0]?.totalOrders || 0,
        revenue: todayMetrics[0]?.revenue || 0,
      },
      workforce: {
        totalEmployees: employees,
      },
      menu: {
        totalItems: totalMenuItems,
        availableItems: availableMenuItems,
      },
      inventory: {
        totalItems: inventoryItems.length,
        estimatedValue: totalInventoryValue,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get system-wide statistics
// @route   GET /api/owner/system-stats
// @access  Private (Owner, Admin)
const getSystemStats = async (req: Request, res: Response) => {
  try {
    const allTimeOrders = await Order.countDocuments();
    const allTimeRevenue = await Order.aggregate([
      {
        $match: { paymentStatus: "paid", orderStatus: "delivered" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const ordersByType = await Order.aggregate([
      {
        $group: {
          _id: "$orderType",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      allTime: {
        totalOrders: allTimeOrders,
        totalRevenue: allTimeRevenue[0]?.total || 0,
      },
      usersByRole,
      ordersByType,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comparative analysis (current vs previous period)
// @route   GET /api/owner/comparative-analysis
// @access  Private (Owner, Admin)
const getComparativeAnalysis = async (req: Request, res: Response) => {
  try {
    const { period = "monthly" } = req.query as any;

    const now = new Date();
    let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

    if (period === "weekly") {
      currentEnd = now;
      currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousEnd = new Date(currentStart.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      // Monthly
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = now;
      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }

    const currentPeriod = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentStart, $lte: currentEnd },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
    ]);

    const previousPeriod = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStart, $lte: previousEnd },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
    ]);

    const currentRevenue = currentPeriod[0]?.revenue || 0;
    const previousRevenue = previousPeriod[0]?.revenue || 0;
    const revenueGrowth =
      previousRevenue > 0
        ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(2)
        : "N/A";

    const currentOrders = currentPeriod[0]?.orders || 0;
    const previousOrders = previousPeriod[0]?.orders || 0;
    const orderGrowth =
      previousOrders > 0
        ? (((currentOrders - previousOrders) / previousOrders) * 100).toFixed(2)
        : "N/A";

    res.json({
      period,
      current: {
        period: { start: currentStart, end: currentEnd },
        revenue: currentRevenue,
        orders: currentOrders,
      },
      previous: {
        period: { start: previousStart, end: previousEnd },
        revenue: previousRevenue,
        orders: previousOrders,
      },
      growth: {
        revenue: `${revenueGrowth}%`,
        orders: `${orderGrowth}%`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export financial report
// @route   GET /api/owner/export-report
// @access  Private (Owner, Admin)
const exportFinancialReport = async (req: Request, res: Response) => {
  try {
    // Placeholder for export functionality
    // In production, you'd generate CSV/PDF/Excel files here
    res.status(501).json({
      message: "Report export feature coming soon",
      note: "Integrate with reporting libraries like pdf-lib or excel4node",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comprehensive dashboard statistics for owner
// @route   GET /api/owner/dashboard-stats
// @access  Private (Owner, Admin)
const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();

    // Calculate date ranges
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59);

    // All-time revenue and orders
    const allTimeStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          orderStatus: { $in: ["delivered", "served", "dine-in-completed"] },
          isCompleted: true,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]).catch(() => []);

    // Monthly revenue
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          paymentStatus: "paid",
          orderStatus: { $in: ["delivered", "served", "dine-in-completed"] },
          isCompleted: true,
        },
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: "$totalAmount" },
        },
      },
    ]).catch(() => []);

    // Yearly revenue
    const yearlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
          paymentStatus: "paid",
          orderStatus: { $in: ["delivered", "served", "dine-in-completed"] },
          isCompleted: true,
        },
      },
      {
        $group: {
          _id: null,
          yearlyRevenue: { $sum: "$totalAmount" },
        },
      },
    ]).catch(() => []);

    // Customer metrics
    const [totalCustomers, activeCustomers] = await Promise.all([
      User.countDocuments({ role: "customer" }).catch(() => -1),
      Order.distinct("user", {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        paymentStatus: "paid",
        isCompleted: true,
      })
        .then((ids: any) => ids.length)
        .catch(() => -1),
    ]);

    // Calculate customer retention rate
    const customerRetentionRate =
      totalCustomers > 0 && activeCustomers >= 0
        ? ((activeCustomers / totalCustomers) * 100).toFixed(1)
        : 0;

    // Staff count
    const staffCount = await User.countDocuments({
      role: { $in: ["chef", "waiter", "cashier", "manager"] },
    }).catch(() => -1);

    // Inventory value
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ["$quantity", "$pricePerUnit"] },
          },
        },
      },
    ]).catch(() => []);

    // Profit analysis (basic calculation: assuming 30% cost)
    const totalRevenue = allTimeStats.length > 0 ? allTimeStats[0].totalRevenue : 0;
    const estimatedCost = totalRevenue * 0.3;
    const estimatedProfit = totalRevenue - estimatedCost;
    const profitMargin = totalRevenue > 0 ? ((estimatedProfit / totalRevenue) * 100).toFixed(1) : 0;

    const responseData = {
      totalRevenue: allTimeStats.length > 0 ? allTimeStats[0].totalRevenue : 0,
      monthlyRevenue: monthlyStats.length > 0 ? monthlyStats[0].monthlyRevenue : 0,
      yearlyRevenue: yearlyStats.length > 0 ? yearlyStats[0].yearlyRevenue : 0,
      totalOrders: allTimeStats.length > 0 ? allTimeStats[0].totalOrders : 0,
      totalCustomers,
      averageOrderValue: allTimeStats.length > 0 ? allTimeStats[0].averageOrderValue : 0,
      customerRetentionRate: parseFloat(customerRetentionRate as string),
      profitMargin: parseFloat(profitMargin as string),
      staffCount,
      inventoryValue: inventoryStats.length > 0 ? inventoryStats[0].totalValue : 0,
    };

    console.log("Owner Dashboard Stats Response:", responseData);
    res.json(responseData);
  } catch (error: any) {
    console.error("Error fetching owner dashboard stats:", error);
    res.status(500).json({
      message: error.message,
      totalRevenue: -1,
      monthlyRevenue: -1,
      yearlyRevenue: -1,
      totalOrders: -1,
      totalCustomers: -1,
      averageOrderValue: -1,
      customerRetentionRate: -1,
      profitMargin: -1,
      staffCount: -1,
      inventoryValue: -1,
    });
  }
};

module.exports = {
  getFinancialOverview,
  getProfitAnalysis,
  getBusinessMetrics,
  getSystemStats,
  getComparativeAnalysis,
  exportFinancialReport,
  getDashboardStats,
};
