import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../src/models/Category";
import MenuItem from "../src/models/MenuItem";
import Table from "../src/models/Table";
import Order from "../src/models/Order";
import Inventory from "../src/models/Inventory";

dotenv.config();

const categories = [
  { name: "Appetizers", description: "Start your meal right", order: 1 },
  { name: "Main Course", description: "Hearty main dishes", order: 2 },
  { name: "Desserts", description: "Sweet endings", order: 3 },
  { name: "Beverages", description: "Refreshing drinks", order: 4 },
  { name: "Salads", description: "Fresh and healthy", order: 5 },
];

const imageUrls = [
  "https://images.pexels.com/photos/4021955/pexels-photo-4021955.jpeg",
  "https://images.pexels.com/photos/4021944/pexels-photo-4021944.jpeg",
  "https://images.pexels.com/photos/11873830/pexels-photo-11873830.jpeg",
  "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg",
  "https://images.pexels.com/photos/3023479/pexels-photo-3023479.jpeg",
  "https://images.pexels.com/photos/34249416/pexels-photo-34249416.jpeg",
  "https://images.pexels.com/photos/3944311/pexels-photo-3944311.jpeg",
];

const menuItems = [
  {
    name: "Spring Rolls",
    description: "Crispy vegetable spring rolls served with sweet chili sauce",
    price: 5.99,
    category: "Appetizers",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 10,
    ingredients: ["Rice paper", "Vegetables", "Noodles", "Herbs"],
    allergens: ["Gluten"],
    nutritionalInfo: { calories: 150, protein: 3, carbs: 25, fat: 5 },
    imageUrl: imageUrls[0],
  },
  {
    name: "Chicken Wings",
    description: "Spicy buffalo wings with ranch dressing",
    price: 8.99,
    category: "Appetizers",
    isAvailable: true,
    isVegetarian: false,
    isSpicy: true,
    preparationTime: 20,
    ingredients: ["Chicken", "Buffalo sauce", "Butter", "Spices"],
    allergens: ["Dairy"],
    nutritionalInfo: { calories: 350, protein: 25, carbs: 5, fat: 28 },
    imageUrl: imageUrls[1],
  },
  {
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter and herbs",
    price: 4.99,
    category: "Appetizers",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 8,
    ingredients: ["Bread", "Garlic", "Butter", "Parsley"],
    allergens: ["Gluten", "Dairy"],
    nutritionalInfo: { calories: 200, protein: 5, carbs: 30, fat: 8 },
    imageUrl: imageUrls[2],
  },
  {
    name: "Mozzarella Sticks",
    description: "Fried cheese sticks with marinara sauce",
    price: 6.99,
    category: "Appetizers",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 12,
    ingredients: ["Mozzarella", "Breadcrumbs", "Eggs", "Marinara"],
    allergens: ["Dairy", "Gluten", "Eggs"],
    nutritionalInfo: { calories: 280, protein: 15, carbs: 20, fat: 18 },
    imageUrl: imageUrls[3],
  },
  {
    name: "Grilled Chicken",
    description: "Herb marinated grilled chicken breast with seasonal vegetables",
    price: 14.99,
    category: "Main Course",
    isAvailable: true,
    isVegetarian: false,
    isSpicy: false,
    preparationTime: 25,
    ingredients: ["Chicken breast", "Herbs", "Olive oil", "Vegetables"],
    allergens: [],
    nutritionalInfo: { calories: 400, protein: 45, carbs: 15, fat: 18 },
    imageUrl: imageUrls[4],
  },
  {
    name: "Beef Burger",
    description: "Juicy beef burger with fries, lettuce, tomato, and special sauce",
    price: 12.99,
    category: "Main Course",
    isAvailable: true,
    isVegetarian: false,
    isSpicy: false,
    preparationTime: 20,
    ingredients: ["Beef patty", "Bun", "Lettuce", "Tomato", "Cheese", "Fries"],
    allergens: ["Gluten", "Dairy"],
    nutritionalInfo: { calories: 650, protein: 35, carbs: 55, fat: 35 },
    imageUrl: imageUrls[5],
  },
  {
    name: "Pasta Carbonara",
    description: "Creamy pasta with bacon, eggs, and parmesan cheese",
    price: 13.99,
    category: "Main Course",
    isAvailable: true,
    isVegetarian: false,
    isSpicy: false,
    preparationTime: 18,
    ingredients: ["Pasta", "Bacon", "Eggs", "Parmesan", "Cream"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    nutritionalInfo: { calories: 550, protein: 25, carbs: 60, fat: 25 },
    imageUrl: imageUrls[6],
  },
  {
    name: "Grilled Salmon",
    description: "Fresh grilled salmon with lemon butter and steamed vegetables",
    price: 18.99,
    category: "Main Course",
    isAvailable: true,
    isVegetarian: false,
    isSpicy: false,
    preparationTime: 22,
    ingredients: ["Salmon", "Lemon", "Butter", "Vegetables"],
    allergens: ["Fish", "Dairy"],
    nutritionalInfo: { calories: 450, protein: 40, carbs: 10, fat: 28 },
    imageUrl: imageUrls[0],
  },
  {
    name: "Vegetable Stir Fry",
    description: "Mixed vegetables in savory sauce with rice",
    price: 11.99,
    category: "Main Course",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 15,
    ingredients: ["Mixed vegetables", "Soy sauce", "Garlic", "Ginger", "Rice"],
    allergens: ["Soy"],
    nutritionalInfo: { calories: 320, protein: 10, carbs: 55, fat: 8 },
    imageUrl: imageUrls[1],
  },
  {
    name: "Pizza Margherita",
    description: "Classic tomato sauce, fresh mozzarella, and basil",
    price: 13.99,
    category: "Main Course",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 20,
    ingredients: ["Pizza dough", "Tomato sauce", "Mozzarella", "Basil"],
    allergens: ["Gluten", "Dairy"],
    nutritionalInfo: { calories: 480, protein: 20, carbs: 60, fat: 18 },
    imageUrl: imageUrls[2],
  },
  {
    name: "BBQ Ribs",
    description: "Tender pork ribs with BBQ sauce and coleslaw",
    price: 19.99,
    category: "Main Course",
    isAvailable: true,
    isVegetarian: false,
    isSpicy: false,
    preparationTime: 35,
    ingredients: ["Pork ribs", "BBQ sauce", "Coleslaw", "Spices"],
    allergens: [],
    nutritionalInfo: { calories: 700, protein: 45, carbs: 35, fat: 45 },
    imageUrl: imageUrls[3],
  },
  {
    name: "Chocolate Cake",
    description: "Rich chocolate layer cake with chocolate ganache",
    price: 6.99,
    category: "Desserts",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 5,
    ingredients: ["Chocolate", "Flour", "Eggs", "Sugar", "Butter"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    nutritionalInfo: { calories: 420, protein: 5, carbs: 55, fat: 22 },
    imageUrl: imageUrls[4],
  },
  {
    name: "Ice Cream Sundae",
    description: "Vanilla ice cream with chocolate sauce, nuts, and cherry",
    price: 5.99,
    category: "Desserts",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 3,
    ingredients: ["Ice cream", "Chocolate sauce", "Nuts", "Cherry"],
    allergens: ["Dairy", "Nuts"],
    nutritionalInfo: { calories: 320, protein: 5, carbs: 45, fat: 15 },
    imageUrl: imageUrls[5],
  },
  {
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee and mascarpone",
    price: 7.99,
    category: "Desserts",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 5,
    ingredients: ["Ladyfingers", "Mascarpone", "Coffee", "Cocoa"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    nutritionalInfo: { calories: 380, protein: 8, carbs: 40, fat: 20 },
    imageUrl: imageUrls[6],
  },
  {
    name: "Apple Pie",
    description: "Homemade apple pie with cinnamon and vanilla ice cream",
    price: 6.49,
    category: "Desserts",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 5,
    ingredients: ["Apples", "Pastry", "Cinnamon", "Sugar", "Ice cream"],
    allergens: ["Gluten", "Dairy"],
    nutritionalInfo: { calories: 350, protein: 4, carbs: 55, fat: 14 },
    imageUrl: imageUrls[0],
  },
  {
    name: "Cheesecake",
    description: "New York style cheesecake with berry compote",
    price: 7.49,
    category: "Desserts",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 5,
    ingredients: ["Cream cheese", "Graham crackers", "Sugar", "Berries"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    nutritionalInfo: { calories: 400, protein: 7, carbs: 45, fat: 22 },
    imageUrl: imageUrls[1],
  },
  {
    name: "Coca Cola",
    description: "Classic Coca-Cola (330ml)",
    price: 2.99,
    category: "Beverages",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 1,
    ingredients: ["Carbonated water", "Sugar", "Flavoring"],
    allergens: [],
    nutritionalInfo: { calories: 140, protein: 0, carbs: 39, fat: 0 },
    imageUrl: imageUrls[2],
  },
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 4.99,
    category: "Beverages",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 3,
    ingredients: ["Fresh oranges"],
    allergens: [],
    nutritionalInfo: { calories: 110, protein: 2, carbs: 26, fat: 0 },
    imageUrl: imageUrls[3],
  },
  {
    name: "Coffee",
    description: "Hot brewed coffee (espresso or americano)",
    price: 3.49,
    category: "Beverages",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 4,
    ingredients: ["Coffee beans", "Water"],
    allergens: [],
    nutritionalInfo: { calories: 5, protein: 0, carbs: 0, fat: 0 },
    imageUrl: imageUrls[4],
  },
  {
    name: "Iced Tea",
    description: "Sweet iced tea with lemon",
    price: 2.99,
    category: "Beverages",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 2,
    ingredients: ["Tea", "Sugar", "Lemon", "Ice"],
    allergens: [],
    nutritionalInfo: { calories: 90, protein: 0, carbs: 24, fat: 0 },
    imageUrl: imageUrls[5],
  },
  {
    name: "Smoothie",
    description: "Mixed berry smoothie with yogurt",
    price: 5.49,
    category: "Beverages",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 4,
    ingredients: ["Berries", "Yogurt", "Honey", "Ice"],
    allergens: ["Dairy"],
    nutritionalInfo: { calories: 180, protein: 6, carbs: 35, fat: 3 },
    imageUrl: imageUrls[6],
  },
  {
    name: "Caesar Salad",
    description: "Romaine lettuce with Caesar dressing, croutons, and parmesan",
    price: 8.99,
    category: "Salads",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 8,
    ingredients: ["Romaine lettuce", "Caesar dressing", "Croutons", "Parmesan"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    nutritionalInfo: { calories: 280, protein: 8, carbs: 18, fat: 20 },
    imageUrl: imageUrls[0],
  },
  {
    name: "Greek Salad",
    description: "Fresh vegetables with feta cheese and olives",
    price: 9.99,
    category: "Salads",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 8,
    ingredients: ["Tomatoes", "Cucumber", "Feta", "Olives", "Onions"],
    allergens: ["Dairy"],
    nutritionalInfo: { calories: 220, protein: 8, carbs: 15, fat: 15 },
    imageUrl: imageUrls[1],
  },
  {
    name: "Garden Salad",
    description: "Mixed greens with seasonal vegetables",
    price: 7.99,
    category: "Salads",
    isAvailable: true,
    isVegetarian: true,
    isSpicy: false,
    preparationTime: 6,
    ingredients: ["Mixed greens", "Tomatoes", "Cucumber", "Carrots"],
    allergens: [],
    nutritionalInfo: { calories: 120, protein: 3, carbs: 18, fat: 4 },
    imageUrl: imageUrls[2],
  },
  {
    name: "Cobb Salad",
    description: "Grilled chicken, bacon, avocado, eggs, and blue cheese",
    price: 11.99,
    category: "Salads",
    isAvailable: true,
    isVegetarian: false,
    isSpicy: false,
    preparationTime: 12,
    ingredients: ["Chicken", "Bacon", "Avocado", "Eggs", "Blue cheese", "Lettuce"],
    allergens: ["Dairy", "Eggs"],
    nutritionalInfo: { calories: 450, protein: 35, carbs: 12, fat: 32 },
    imageUrl: imageUrls[3],
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

const inventoryItems = [
  // Meat
  { itemName: "Chicken Breast", quantity: 50, unit: "kg", lowStockThreshold: 10, category: "Meat" },
  { itemName: "Ground Beef", quantity: 40, unit: "kg", lowStockThreshold: 8, category: "Meat" },
  { itemName: "Pork Ribs", quantity: 30, unit: "kg", lowStockThreshold: 5, category: "Meat" },
  { itemName: "Bacon", quantity: 15, unit: "kg", lowStockThreshold: 3, category: "Meat" },
  { itemName: "Chicken Wings", quantity: 25, unit: "kg", lowStockThreshold: 5, category: "Meat" },
  
  // Seafood
  { itemName: "Salmon Fillet", quantity: 20, unit: "kg", lowStockThreshold: 5, category: "Seafood" },
  { itemName: "Shrimp", quantity: 15, unit: "kg", lowStockThreshold: 3, category: "Seafood" },
  { itemName: "Tuna", quantity: 10, unit: "kg", lowStockThreshold: 3, category: "Seafood" },
  
  // Vegetables
  { itemName: "Tomatoes", quantity: 35, unit: "kg", lowStockThreshold: 10, category: "Vegetables" },
  { itemName: "Onions", quantity: 40, unit: "kg", lowStockThreshold: 10, category: "Vegetables" },
  { itemName: "Bell Peppers", quantity: 20, unit: "kg", lowStockThreshold: 5, category: "Vegetables" },
  { itemName: "Lettuce", quantity: 15, unit: "kg", lowStockThreshold: 5, category: "Vegetables" },
  { itemName: "Carrots", quantity: 25, unit: "kg", lowStockThreshold: 8, category: "Vegetables" },
  { itemName: "Mushrooms", quantity: 12, unit: "kg", lowStockThreshold: 3, category: "Vegetables" },
  { itemName: "Broccoli", quantity: 18, unit: "kg", lowStockThreshold: 5, category: "Vegetables" },
  { itemName: "Garlic", quantity: 8, unit: "kg", lowStockThreshold: 2, category: "Vegetables" },
  
  // Fruits
  { itemName: "Lemons", quantity: 10, unit: "kg", lowStockThreshold: 3, category: "Fruits" },
  { itemName: "Strawberries", quantity: 8, unit: "kg", lowStockThreshold: 2, category: "Fruits" },
  
  // Dairy
  { itemName: "Whole Milk", quantity: 50, unit: "l", lowStockThreshold: 15, category: "Dairy" },
  { itemName: "Heavy Cream", quantity: 20, unit: "l", lowStockThreshold: 5, category: "Dairy" },
  { itemName: "Mozzarella Cheese", quantity: 25, unit: "kg", lowStockThreshold: 8, category: "Dairy" },
  { itemName: "Parmesan Cheese", quantity: 15, unit: "kg", lowStockThreshold: 5, category: "Dairy" },
  { itemName: "Butter", quantity: 20, unit: "kg", lowStockThreshold: 5, category: "Dairy" },
  { itemName: "Eggs", quantity: 200, unit: "pcs", lowStockThreshold: 50, category: "Dairy" },
  
  // Grains
  { itemName: "Rice", quantity: 100, unit: "kg", lowStockThreshold: 25, category: "Grains" },
  { itemName: "Pasta", quantity: 50, unit: "kg", lowStockThreshold: 15, category: "Grains" },
  { itemName: "All-Purpose Flour", quantity: 75, unit: "kg", lowStockThreshold: 20, category: "Grains" },
  { itemName: "Pizza Dough", quantity: 30, unit: "kg", lowStockThreshold: 10, category: "Grains" },
  
  // Spices
  { itemName: "Salt", quantity: 20, unit: "kg", lowStockThreshold: 5, category: "Spices" },
  { itemName: "Black Pepper", quantity: 5, unit: "kg", lowStockThreshold: 1, category: "Spices" },
  { itemName: "Oregano", quantity: 2, unit: "kg", lowStockThreshold: 0.5, category: "Spices" },
  { itemName: "Basil (Dried)", quantity: 1.5, unit: "kg", lowStockThreshold: 0.3, category: "Spices" },
  
  // Beverages
  { itemName: "Coca Cola", quantity: 100, unit: "l", lowStockThreshold: 30, category: "Beverages" },
  { itemName: "Orange Juice", quantity: 60, unit: "l", lowStockThreshold: 20, category: "Beverages" },
  { itemName: "Coffee Beans", quantity: 15, unit: "kg", lowStockThreshold: 5, category: "Beverages" },
  { itemName: "Bottled Water", quantity: 200, unit: "l", lowStockThreshold: 50, category: "Beverages" },
  
  // General
  { itemName: "Olive Oil", quantity: 30, unit: "l", lowStockThreshold: 10, category: "General" },
  { itemName: "Vegetable Oil", quantity: 40, unit: "l", lowStockThreshold: 10, category: "General" },
  { itemName: "Soy Sauce", quantity: 15, unit: "l", lowStockThreshold: 5, category: "General" },
  { itemName: "Tomato Sauce", quantity: 25, unit: "l", lowStockThreshold: 8, category: "General" },
  { itemName: "BBQ Sauce", quantity: 20, unit: "l", lowStockThreshold: 5, category: "General" },
  { itemName: "Sugar", quantity: 50, unit: "kg", lowStockThreshold: 15, category: "General" },
];

const seedReset = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log(
      "Database:",
      process.env.MONGO_URI ? "Using MONGO_URI from .env" : "❌ MONGO_URI not found!",
    );

    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("✅ MongoDB Connected!\n");

    const stats = {
      orders: { deleted: 0 },
      categories: { created: 0, existing: 0 },
      menuItems: { deleted: 0, created: 0 },
      tables: { deleted: 0, created: 0 },
      inventory: { deleted: 0, created: 0 },
    } as any;

    // Reset Orders
    console.log("🗑️  Resetting Orders Collection...");
    console.log("─────────────────────────────────────────");
    const orderDeleteResult = await Order.deleteMany({});
    stats.orders.deleted = orderDeleteResult.deletedCount;
    console.log(`  ✅ Deleted ${stats.orders.deleted} order(s)`);

    // Reset Inventory
    console.log("\n🗑️  Resetting Inventory Collection...");
    console.log("─────────────────────────────────────────");
    const inventoryDeleteResult = await Inventory.deleteMany({});
    stats.inventory.deleted = inventoryDeleteResult.deletedCount;
    console.log(`  ✅ Deleted ${stats.inventory.deleted} inventory item(s)`);

    // Reset Tables
    console.log("\n🗑️  Resetting Tables Collection...");
    console.log("─────────────────────────────────────────");
    const tableDeleteResult = await Table.deleteMany({});
    stats.tables.deleted = tableDeleteResult.deletedCount;
    console.log(`  ✅ Deleted ${stats.tables.deleted} table(s)`);

    // Reset Menu Items
    console.log("\n🗑️  Resetting Menu Items Collection...");
    console.log("─────────────────────────────────────────");
    const menuItemDeleteResult = await MenuItem.deleteMany({});
    stats.menuItems.deleted = menuItemDeleteResult.deletedCount;
    console.log(`  ✅ Deleted ${stats.menuItems.deleted} menu item(s)`);

    // Seed Categories (if not exist)
    console.log("\n📁 Seeding Categories...");
    console.log("─────────────────────────────────────────");
    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        // @ts-ignore
        await Category.create(cat);
        console.log(`  ✅ ${cat.name} - Created`);
        stats.categories.created++;
      } else {
        console.log(`  ⚠️  ${cat.name} - Already exists`);
        stats.categories.existing++;
      }
    }

    // Seed Menu Items with images
    console.log("\n🍽️  Seeding Menu Items with Images...");
    console.log("─────────────────────────────────────────");
    for (const item of menuItems) {
      const category = await Category.findOne({ name: item.category });
      if (category) {
        // @ts-ignore
        await MenuItem.create({ ...item, category: category._id });
        console.log(
          `  ✅ ${item.name.padEnd(25)} ($${item.price}) - ${item.isVegetarian ? "🌱" : "🍖"} - Created`,
        );
        stats.menuItems.created++;
      } else {
        console.log(
          `  ❌ ${item.name.padEnd(25)} - Category '${item.category}' not found!`,
        );
      }
    }

    // Seed Tables
    console.log("\n🪑 Seeding Tables...");
    console.log("─────────────────────────────────────────");
    for (const table of tables) {
      // @ts-ignore
      await Table.create(table);
      console.log(`  ✅ Table #${table.tableNumber} (Capacity: ${table.capacity}) - Created`);
      stats.tables.created++;
    }

    // Seed Inventory
    console.log("\n📦 Seeding Inventory Items...");
    console.log("─────────────────────────────────────────");
    for (const item of inventoryItems) {
      // @ts-ignore
      await Inventory.create(item);
      const stockStatus = item.quantity <= item.lowStockThreshold ? "🔴" : "✅";
      console.log(
        `  ${stockStatus} ${item.itemName.padEnd(25)} ${item.quantity.toString().padStart(6)} ${item.unit.padEnd(5)} [${item.category}]`,
      );
      stats.inventory.created++;
    }

    console.log("\n");
    console.log("═════════════════════════════════════════");
    console.log("       DATABASE RESET COMPLETED! ✨");
    console.log("═════════════════════════════════════════");
    console.log(`\n📊 Summary:`);
    console.log(`  Orders Deleted:     ${stats.orders.deleted}`);
    console.log(`  Inventory Deleted:  ${stats.inventory.deleted}`);
    console.log(
      `  Categories:         ${stats.categories.created} created, ${stats.categories.existing} existing`,
    );
    console.log(
      `  Menu Items:         ${stats.menuItems.deleted} deleted, ${stats.menuItems.created} created`,
    );
    console.log(
      `  Tables:             ${stats.tables.deleted} deleted, ${stats.tables.created} created`,
    );
    console.log(
      `  Inventory:          ${stats.inventory.created} created`,
    );

    console.log(`\n📈 Current Database Status:`);
    console.log(`  Total Categories:  ${await Category.countDocuments()}`);
    console.log(`  Total Menu Items:  ${await MenuItem.countDocuments()}`);
    console.log(`  Total Tables:      ${await Table.countDocuments()}`);
    console.log(`  Total Orders:      ${await Order.countDocuments()}`);
    console.log(`  Total Inventory:   ${await Inventory.countDocuments()}`);

    console.log("\n✅ User collection was preserved!");
    console.log("═════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error resetting database:", error);
    process.exit(1);
  }
};

seedReset();
