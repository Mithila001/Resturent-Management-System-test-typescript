import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/Order";
import User from "../src/models/User";
import MenuItem from "../src/models/MenuItem";

dotenv.config();

const seedOrders = async () => {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant-db";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get customers and menu items
    const customers = await User.find({ role: "customer" }).limit(5);
    const menuItems = await MenuItem.find({ isAvailable: true });

    if (customers.length === 0) {
      console.log("⚠️  No customers found. Please run seed:users first.");
      return;
    }

    if (menuItems.length === 0) {
      console.log("⚠️  No menu items found. Please run seed:data first.");
      return;
    }

    console.log(`Found ${customers.length} customers and ${menuItems.length} menu items`);

    // Clear existing orders
    await Order.deleteMany({});
    console.log("🗑️  Cleared existing orders");

    // Create sample orders with various dates and statuses
    const orders = [];
    const now = new Date();

    // Create 50 sample orders spanning last 3 months (with more recent orders)
    for (let i = 0; i < 50; i++) {
      // Weight towards recent orders: 40% today, 30% last week, 30% last 3 months
      let daysAgo;
      const rand = Math.random();
      if (rand < 0.4) {
        daysAgo = 0; // Today - 40% of orders
      } else if (rand < 0.7) {
        daysAgo = Math.floor(Math.random() * 7); // Last 7 days - 30%
      } else {
        daysAgo = Math.floor(Math.random() * 90); // Last 90 days - 30%
      }
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - daysAgo);

      // Random customer
      const customer = customers[Math.floor(Math.random() * customers.length)]!;

      // Random 1-4 items from menu
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < itemCount; j++) {
        const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)]!;
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemTotal = randomItem.price * quantity;

        orderItems.push({
          menuItem: randomItem._id,
          name: randomItem.name,
          quantity: quantity,
          price: randomItem.price,
          subtotal: itemTotal,
        });

        totalAmount += itemTotal;
      }

      // Determine order status based on how old it is
      let orderStatus;
      let paymentStatus;
      let isCompleted = false;
      let orderType =
        Math.random() > 0.5 ? "dine-in" : Math.random() > 0.5 ? "takeaway" : "delivery";

      if (daysAgo > 7) {
        // Older orders are mostly delivered/completed
        const rand = Math.random();
        if (rand < 0.85) {
          // Assign status based on order type
          if (orderType === "dine-in") {
            orderStatus = "dine-in-completed";
          } else if (orderType === "delivery") {
            orderStatus = "delivered";
          } else {
            orderStatus = "served";
          }
          paymentStatus = "paid";
          isCompleted = true;
        } else if (rand < 0.95) {
          orderStatus = "cancelled";
          paymentStatus = "pending";
          isCompleted = false;
        } else {
          if (orderType === "dine-in") {
            orderStatus = "dine-in-completed";
          } else if (orderType === "delivery") {
            orderStatus = "delivered";
          } else {
            orderStatus = "served";
          }
          paymentStatus = "paid";
          isCompleted = true;
        }
      } else if (daysAgo > 1) {
        // Recent orders have mixed status
        const rand = Math.random();
        if (rand < 0.6) {
          if (orderType === "dine-in") {
            orderStatus = "dine-in-completed";
          } else if (orderType === "delivery") {
            orderStatus = "delivered";
          } else {
            orderStatus = "served";
          }
          paymentStatus = "paid";
          isCompleted = true;
        } else if (rand < 0.75) {
          orderStatus = "ready";
          paymentStatus = "paid";
          isCompleted = false;
        } else if (rand < 0.85) {
          orderStatus = "preparing";
          paymentStatus = "pending";
          isCompleted = false;
        } else {
          orderStatus = "pending";
          paymentStatus = "pending";
          isCompleted = false;
        }
      } else {
        // Today's orders
        const rand = Math.random();
        if (rand < 0.3) {
          if (orderType === "dine-in") {
            orderStatus = "dine-in-completed";
          } else if (orderType === "delivery") {
            orderStatus = "delivered";
          } else {
            orderStatus = "served";
          }
          paymentStatus = "paid";
          isCompleted = true;
        } else if (rand < 0.5) {
          orderStatus = "ready";
          paymentStatus = "paid";
          isCompleted = false;
        } else if (rand < 0.7) {
          orderStatus = "preparing";
          paymentStatus = "pending";
          isCompleted = false;
        } else {
          orderStatus = "pending";
          paymentStatus = "pending";
          isCompleted = false;
        }
      }

      orders.push({
        user: customer._id,
        items: orderItems,
        totalAmount: totalAmount,
        orderStatus: orderStatus,
        paymentStatus: paymentStatus,
        paymentMethod: Math.random() > 0.5 ? "cash" : "card",
        orderType: orderType,
        specialInstructions: i % 3 === 0 ? "Extra spicy please" : "",
        tableNumber: orderType === "dine-in" ? Math.floor(Math.random() * 20) + 1 : undefined,
        deliveryAddress:
          orderType === "delivery"
            ? {
                street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
                city: "New York",
                postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
                phone: `555${Math.floor(Math.random() * 9000000) + 1000000}`,
                notes: "Please call upon arrival",
              }
            : undefined,
        isCompleted: isCompleted,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
    }

    // Insert all orders
    // Use create instead of insertMany to trigger pre-save hooks
    const insertedOrders = [];
    for (const orderData of orders) {
      // @ts-ignore
      const order = await Order.create(orderData);
      insertedOrders.push(order);
    }
    console.log(`✅ Successfully seeded ${insertedOrders.length} orders`);

    // Calculate and display statistics
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          orderStatus: { $in: ["delivered", "served", "dine-in-completed"] },
          isCompleted: true,
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const orderStats = {
      total: await Order.countDocuments(),
      pending: await Order.countDocuments({ orderStatus: "pending" }),
      preparing: await Order.countDocuments({ orderStatus: "preparing" }),
      ready: await Order.countDocuments({ orderStatus: "ready" }),
      delivered: await Order.countDocuments({ orderStatus: "delivered" }),
      served: await Order.countDocuments({ orderStatus: "served" }),
      dineInCompleted: await Order.countDocuments({ orderStatus: "dine-in-completed" }),
      cancelled: await Order.countDocuments({ orderStatus: "cancelled" }),
      paid: await Order.countDocuments({ paymentStatus: "paid" }),
      completed: await Order.countDocuments({ isCompleted: true }),
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    };

    console.log("\n📊 Order Statistics:");
    console.log(`   Total Orders: ${orderStats.total}`);
    console.log(`   Pending: ${orderStats.pending}`);
    console.log(`   Preparing: ${orderStats.preparing}`);
    console.log(`   Ready: ${orderStats.ready}`);
    console.log(`   Delivered: ${orderStats.delivered}`);
    console.log(`   Served: ${orderStats.served}`);
    console.log(`   Dine-in Completed: ${orderStats.dineInCompleted}`);
    console.log(`   Cancelled: ${orderStats.cancelled}`);
    console.log(`   Paid Orders: ${orderStats.paid}`);
    console.log(`   Completed Orders: ${orderStats.completed}`);
    console.log(`   Total Revenue: $${orderStats.totalRevenue.toFixed(2)}`);

    console.log("\n✨ Order seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding orders:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

seedOrders();
