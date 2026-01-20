import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/Order";

dotenv.config();

const migrateOrders = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/restaurant-db";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Update all orders to set isCompleted based on their status
    const completedStatuses = ["delivered", "served", "dine-in-completed"];

    // Set isCompleted = true for completed orders
    const result1 = await Order.updateMany(
      {
        orderStatus: { $in: completedStatuses },
        paymentStatus: "paid",
      },
      {
        $set: { isCompleted: true },
      },
    );

    // Set isCompleted = false for non-completed orders
    const result2 = await Order.updateMany(
      {
        orderStatus: { $nin: completedStatuses },
      },
      {
        $set: { isCompleted: false },
      },
    );

    console.log(`✅ Updated ${result1.modifiedCount} orders to completed status`);
    console.log(`✅ Updated ${result2.modifiedCount} orders to non-completed status`);

    // Display statistics
    const stats = {
      total: await Order.countDocuments(),
      completed: await Order.countDocuments({ isCompleted: true }),
      pending: await Order.countDocuments({ isCompleted: false }),
      paid: await Order.countDocuments({ paymentStatus: "paid" }),
    };

    console.log("\n📊 Migration Results:");
    console.log(`   Total Orders: ${stats.total}`);
    console.log(`   Completed Orders: ${stats.completed}`);
    console.log(`   Pending Orders: ${stats.pending}`);
    console.log(`   Paid Orders: ${stats.paid}`);

    console.log("\n✨ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Error during migration:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

migrateOrders();
