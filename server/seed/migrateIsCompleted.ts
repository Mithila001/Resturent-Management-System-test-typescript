import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/Order";

dotenv.config();

/**
 * Migration script to add isCompleted field to existing orders
 * Run this once after adding the isCompleted field to the Order model
 */
const migrateOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("MongoDB Connected for migration...");

    // Define completed statuses
    const completedStatuses = ["delivered", "cancelled", "dine-in-completed"];

    // Update all orders to set isCompleted based on their current status
    const result = await Order.updateMany({}, [
      {
        $set: {
          isCompleted: {
            $in: ["$orderStatus", completedStatuses],
          },
        },
      },
    ]);

    console.log(`\n✅ Migration completed!`);
    console.log(`Updated ${result.modifiedCount} orders`);
    console.log(`Matched ${result.matchedCount} orders`);

    // Verify the migration
    const completedCount = await Order.countDocuments({ isCompleted: true });
    const activeCount = await Order.countDocuments({ isCompleted: false });

    console.log(`\n📊 Current status:`);
    console.log(`Completed orders: ${completedCount}`);
    console.log(`Active orders: ${activeCount}`);
    console.log(`Total orders: ${completedCount + activeCount}\n`);

    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrateOrders();
