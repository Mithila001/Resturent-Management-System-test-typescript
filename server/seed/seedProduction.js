const mongoose = require("mongoose");
const User = require("./models/User");
const Category = require("./models/Category");
const MenuItem = require("./models/MenuItem");
const Table = require("./models/Table");
require("dotenv").config();

// Demo Users
const demoUsers = [
  {
    name: "Admin User",
    email: "admin@resto.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Owner User",
    email: "owner@resto.com",
    password: "owner123",
    role: "owner",
  },
  {
    name: "Manager User",
    email: "manager@resto.com",
    password: "manager123",
    role: "manager",
  },
  {
    name: "Chef User",
    email: "chef@resto.com",
    password: "chef123",
    role: "chef",
  },
  {
    name: "Waiter User",
    email: "waiter@resto.com",
    password: "waiter123",
    role: "waiter",
  },
  {
    name: "Cashier User",
    email: "cashier@resto.com",
    password: "cashier123",
    role: "cashier",
  },
  {
    name: "Customer User",
    email: "customer@resto.com",
    password: "customer123",
    role: "customer",
  },
];

// Categories
const categories = [
  { name: "Appetizers", description: "Start your meal right", order: 1 },
  { name: "Main Course", description: "Hearty main dishes", order: 2 },
  { name: "Desserts", description: "Sweet endings", order: 3 },
  { name: "Beverages", description: "Refreshing drinks", order: 4 },
  { name: "Salads", description: "Fresh and healthy", order: 5 },
];

// Menu Items
const menuItems = [
  // Appetizers
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

  // Main Course
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

  // Desserts
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

  // Beverages
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

  // Salads
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

// Tables
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

const seedProduction = async () => {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    console.log(
      "Database:",
      process.env.MONGO_URI
        ? "Using MONGO_URI from .env"
        : "❌ MONGO_URI not found!"
    );

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected!\n");

    let stats = {
      users: { created: 0, existing: 0 },
      categories: { created: 0, existing: 0 },
      menuItems: { created: 0, existing: 0 },
      tables: { created: 0, existing: 0 },
    };

    // Seed Users
    console.log("👥 Seeding Users...");
    console.log("─────────────────────────────────────────");
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(
          `  ⚠️  ${userData.role.padEnd(10)} | ${userData.email.padEnd(
            25
          )} - Already exists`
        );
        stats.users.existing++;
      } else {
        await User.create(userData);
        console.log(
          `  ✅ ${userData.role.padEnd(10)} | ${userData.email.padEnd(
            25
          )} - Created`
        );
        stats.users.created++;
      }
    }

    // Seed Categories
    console.log("\n📁 Seeding Categories...");
    console.log("─────────────────────────────────────────");
    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        await Category.create(cat);
        console.log(`  ✅ ${cat.name} - Created`);
        stats.categories.created++;
      } else {
        console.log(`  ⚠️  ${cat.name} - Already exists`);
        stats.categories.existing++;
      }
    }

    // Seed Menu Items
    console.log("\n🍽️  Seeding Menu Items...");
    console.log("─────────────────────────────────────────");
    for (const item of menuItems) {
      const category = await Category.findOne({ name: item.category });
      if (category) {
        const existing = await MenuItem.findOne({ name: item.name });
        if (!existing) {
          await MenuItem.create({
            ...item,
            category: category._id,
          });
          console.log(
            `  ✅ ${item.name.padEnd(25)} ($${item.price}) - Created`
          );
          stats.menuItems.created++;
        } else {
          console.log(
            `  ⚠️  ${item.name.padEnd(25)} ($${item.price}) - Already exists`
          );
          stats.menuItems.existing++;
        }
      }
    }

    // Seed Tables
    console.log("\n🪑 Seeding Tables...");
    console.log("─────────────────────────────────────────");
    for (const table of tables) {
      const existing = await Table.findOne({ tableNumber: table.tableNumber });
      if (!existing) {
        await Table.create(table);
        console.log(
          `  ✅ Table #${table.tableNumber} (Capacity: ${table.capacity}) - Created`
        );
        stats.tables.created++;
      } else {
        console.log(
          `  ⚠️  Table #${table.tableNumber} (Capacity: ${table.capacity}) - Already exists`
        );
        stats.tables.existing++;
      }
    }

    // Final Summary
    console.log("\n");
    console.log("═════════════════════════════════════════");
    console.log("          SEEDING COMPLETED! ✨");
    console.log("═════════════════════════════════════════");
    console.log(`\n📊 Summary:`);
    console.log(
      `  Users:       ${stats.users.created} created, ${stats.users.existing} existing`
    );
    console.log(
      `  Categories:  ${stats.categories.created} created, ${stats.categories.existing} existing`
    );
    console.log(
      `  Menu Items:  ${stats.menuItems.created} created, ${stats.menuItems.existing} existing`
    );
    console.log(
      `  Tables:      ${stats.tables.created} created, ${stats.tables.existing} existing`
    );

    console.log(`\n📈 Database Status:`);
    console.log(`  Total Users:       ${await User.countDocuments()}`);
    console.log(`  Total Categories:  ${await Category.countDocuments()}`);
    console.log(`  Total Menu Items:  ${await MenuItem.countDocuments()}`);
    console.log(`  Total Tables:      ${await Table.countDocuments()}`);

    console.log("\n🔐 Login Credentials:");
    console.log("═════════════════════════════════════════");
    demoUsers.forEach((user) => {
      console.log(
        `  ${user.role.toUpperCase().padEnd(10)} → ${user.email.padEnd(
          25
        )} | Password: ${user.password}`
      );
    });
    console.log("═════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding production data:", error);
    process.exit(1);
  }
};

seedProduction();
