import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../src/models/Category";
import MenuItem from "../src/models/MenuItem";
import Table from "../src/models/Table";

dotenv.config();

const categories = [
  { name: "Appetizers", description: "Start your meal right", order: 1 },
  { name: "Main Course", description: "Hearty main dishes", order: 2 },
  { name: "Desserts", description: "Sweet endings", order: 3 },
  { name: "Beverages", description: "Refreshing drinks", order: 4 },
  { name: "Salads", description: "Fresh and healthy", order: 5 },
];

const menuItems = [
  {
    name: "Spring Rolls",
    description: "Crispy vegetable spring rolls",
    price: 5.99,
    category: "Appetizers",
    isAvailable: true,
  },
  {
    name: "Chicken Wings",
    description: "Spicy buffalo wings",
    price: 8.99,
    category: "Appetizers",
    isAvailable: true,
  },
  {
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter",
    price: 4.99,
    category: "Appetizers",
    isAvailable: true,
  },
  {
    name: "Mozzarella Sticks",
    description: "Fried cheese sticks",
    price: 6.99,
    category: "Appetizers",
    isAvailable: true,
  },
  {
    name: "Grilled Chicken",
    description: "Herb marinated grilled chicken",
    price: 14.99,
    category: "Main Course",
    isAvailable: true,
  },
  {
    name: "Beef Burger",
    description: "Juicy beef burger with fries",
    price: 12.99,
    category: "Main Course",
    isAvailable: true,
  },
  {
    name: "Pasta Carbonara",
    description: "Creamy pasta with bacon",
    price: 13.99,
    category: "Main Course",
    isAvailable: true,
  },
  {
    name: "Grilled Salmon",
    description: "Fresh salmon with vegetables",
    price: 18.99,
    category: "Main Course",
    isAvailable: true,
  },
  {
    name: "Vegetable Stir Fry",
    description: "Mixed vegetables in sauce",
    price: 11.99,
    category: "Main Course",
    isAvailable: true,
  },
  {
    name: "Pizza Margherita",
    description: "Classic tomato and mozzarella",
    price: 13.99,
    category: "Main Course",
    isAvailable: true,
  },
  {
    name: "Chocolate Cake",
    description: "Rich chocolate layer cake",
    price: 6.99,
    category: "Desserts",
    isAvailable: true,
  },
  {
    name: "Ice Cream Sundae",
    description: "Vanilla ice cream with toppings",
    price: 5.99,
    category: "Desserts",
    isAvailable: true,
  },
  {
    name: "Tiramisu",
    description: "Classic Italian dessert",
    price: 7.99,
    category: "Desserts",
    isAvailable: true,
  },
  {
    name: "Apple Pie",
    description: "Homemade apple pie",
    price: 6.49,
    category: "Desserts",
    isAvailable: true,
  },
  {
    name: "Coca Cola",
    description: "Classic Coke",
    price: 2.99,
    category: "Beverages",
    isAvailable: true,
  },
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed",
    price: 4.99,
    category: "Beverages",
    isAvailable: true,
  },
  {
    name: "Coffee",
    description: "Hot brewed coffee",
    price: 3.49,
    category: "Beverages",
    isAvailable: true,
  },
  {
    name: "Iced Tea",
    description: "Sweet iced tea",
    price: 2.99,
    category: "Beverages",
    isAvailable: true,
  },
  {
    name: "Caesar Salad",
    description: "Romaine with Caesar dressing",
    price: 8.99,
    category: "Salads",
    isAvailable: true,
  },
  {
    name: "Greek Salad",
    description: "Fresh vegetables with feta",
    price: 9.99,
    category: "Salads",
    isAvailable: true,
  },
  {
    name: "Garden Salad",
    description: "Mixed greens",
    price: 7.99,
    category: "Salads",
    isAvailable: true,
  },
];

const tables = [
  { tableNumber: 1, capacity: 2, status: "available" },
  { tableNumber: 2, capacity: 2, status: "available" },
  { tableNumber: 3, capacity: 4, status: "available" },
  { tableNumber: 4, capacity: 4, status: "available" },
  { tableNumber: 5, capacity: 4, status: "available" },
  { tableNumber: 6, capacity: 6, status: "available" },
  { tableNumber: 7, capacity: 6, status: "available" },
  { tableNumber: 8, capacity: 8, status: "available" },
  { tableNumber: 9, capacity: 2, status: "available" },
  { tableNumber: 10, capacity: 4, status: "available" },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("MongoDB Connected for seeding data...\n");

    console.log("📁 Seeding Categories...");
    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        // @ts-ignore
        await Category.create(cat);
        console.log(`  ✓ Created category: ${cat.name}`);
      } else {
        console.log(`  - Category "${cat.name}" already exists`);
      }
    }

    console.log("\n🍽️  Seeding Menu Items...");
    for (const item of menuItems) {
      const category = await Category.findOne({ name: item.category });
      if (category) {
        const existing = await MenuItem.findOne({ name: item.name });
        if (!existing) {
          // @ts-ignore
          await MenuItem.create({
            ...item,
            category: category._id,
          });
          console.log(`  ✓ Created menu item: ${item.name}`);
        } else {
          console.log(`  - Menu item "${item.name}" already exists`);
        }
      }
    }

    console.log("\n🪑 Seeding Tables...");
    for (const table of tables) {
      const existing = await Table.findOne({ tableNumber: table.tableNumber });
      if (!existing) {
        // @ts-ignore
        await Table.create(table);
        console.log(`  ✓ Created table: #${table.tableNumber}`);
      } else {
        console.log(`  - Table #${table.tableNumber} already exists`);
      }
    }

    console.log("\n✅ Database seeding completed!");
    console.log("\n📊 Summary:");
    console.log(`  - Categories: ${await Category.countDocuments()}`);
    console.log(`  - Menu Items: ${await MenuItem.countDocuments()}`);
    console.log(`  - Tables: ${await Table.countDocuments()}`);
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
