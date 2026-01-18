import mongoose, { Document, Schema } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId;
  imageUrl: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>({
  name: {
    type: String,
    required: [true, "Menu item name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category is required"],
  },
  imageUrl: {
    type: String,
    default: "",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isVegetarian: {
    type: Boolean,
    default: false,
  },
  isSpicy: {
    type: Boolean,
    default: false,
  },
  preparationTime: {
    type: Number,
    default: 15,
    min: [0, "Preparation time cannot be negative"],
  },
  ingredients: [
    {
      type: String,
    },
  ],
  allergens: [
    {
      type: String,
    },
  ],
  nutritionalInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
menuItemSchema.pre<IMenuItem>("save", function (this: IMenuItem) {
  this.updatedAt = new Date();
});

// Create indexes for better query performance
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ name: "text", description: "text" });

export default mongoose.model<IMenuItem>("MenuItem", menuItemSchema);
