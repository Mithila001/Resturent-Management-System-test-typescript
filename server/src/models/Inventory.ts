import mongoose, { Document, Schema } from "mongoose";

export interface IInventory extends Document {
  itemName: string;
  quantity: number;
  unit: "kg" | "g" | "l" | "ml" | "pcs" | "packs";
  lowStockThreshold: number;
  category:
    | "Meat"
    | "Vegetables"
    | "Dairy"
    | "Beverages"
    | "Spices"
    | "Grains"
    | "Seafood"
    | "Fruits"
    | "General";
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      max: [1000000, "Quantity cannot exceed 1,000,000 units"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"], // e.g., kg, liters, pcs
      enum: ["kg", "g", "l", "ml", "pcs", "packs"],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, "Low stock threshold cannot be negative"],
      max: [10000, "Low stock threshold cannot exceed 10,000 units"],
    },
    category: {
      type: String,
      enum: [
        "Meat",
        "Vegetables",
        "Dairy",
        "Beverages",
        "Spices",
        "Grains",
        "Seafood",
        "Fruits",
        "General",
      ],
      default: "General",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IInventory>("Inventory", inventorySchema);
