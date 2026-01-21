import mongoose from "mongoose";
import dotenv from "dotenv";
import Inventory from "../src/models/Inventory";

dotenv.config();

const inventoryItems = [
  // Meat
  {
    itemName: "Chicken Breast",
    quantity: 50,
    unit: "kg" as const,
    lowStockThreshold: 10,
    category: "Meat" as const,
  },
  {
    itemName: "Ground Beef",
    quantity: 40,
    unit: "kg" as const,
    lowStockThreshold: 8,
    category: "Meat" as const,
  },
  {
    itemName: "Pork Ribs",
    quantity: 30,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Meat" as const,
  },
  {
    itemName: "Bacon",
    quantity: 15,
    unit: "kg" as const,
    lowStockThreshold: 3,
    category: "Meat" as const,
  },
  {
    itemName: "Chicken Wings",
    quantity: 25,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Meat" as const,
  },

  // Seafood
  {
    itemName: "Salmon Fillet",
    quantity: 20,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Seafood" as const,
  },
  {
    itemName: "Shrimp",
    quantity: 15,
    unit: "kg" as const,
    lowStockThreshold: 3,
    category: "Seafood" as const,
  },
  {
    itemName: "Tuna",
    quantity: 10,
    unit: "kg" as const,
    lowStockThreshold: 3,
    category: "Seafood" as const,
  },

  // Vegetables
  {
    itemName: "Tomatoes",
    quantity: 35,
    unit: "kg" as const,
    lowStockThreshold: 10,
    category: "Vegetables" as const,
  },
  {
    itemName: "Onions",
    quantity: 40,
    unit: "kg" as const,
    lowStockThreshold: 10,
    category: "Vegetables" as const,
  },
  {
    itemName: "Bell Peppers",
    quantity: 20,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Vegetables" as const,
  },
  {
    itemName: "Lettuce",
    quantity: 15,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Vegetables" as const,
  },
  {
    itemName: "Carrots",
    quantity: 25,
    unit: "kg" as const,
    lowStockThreshold: 8,
    category: "Vegetables" as const,
  },
  {
    itemName: "Mushrooms",
    quantity: 12,
    unit: "kg" as const,
    lowStockThreshold: 3,
    category: "Vegetables" as const,
  },
  {
    itemName: "Broccoli",
    quantity: 18,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Vegetables" as const,
  },
  {
    itemName: "Garlic",
    quantity: 8,
    unit: "kg" as const,
    lowStockThreshold: 2,
    category: "Vegetables" as const,
  },
  {
    itemName: "Ginger",
    quantity: 5,
    unit: "kg" as const,
    lowStockThreshold: 1,
    category: "Vegetables" as const,
  },

  // Fruits
  {
    itemName: "Lemons",
    quantity: 10,
    unit: "kg" as const,
    lowStockThreshold: 3,
    category: "Fruits" as const,
  },
  {
    itemName: "Apples",
    quantity: 15,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Fruits" as const,
  },
  {
    itemName: "Strawberries",
    quantity: 8,
    unit: "kg" as const,
    lowStockThreshold: 2,
    category: "Fruits" as const,
  },
  {
    itemName: "Blueberries",
    quantity: 6,
    unit: "kg" as const,
    lowStockThreshold: 2,
    category: "Fruits" as const,
  },

  // Dairy
  {
    itemName: "Whole Milk",
    quantity: 50,
    unit: "l" as const,
    lowStockThreshold: 15,
    category: "Dairy" as const,
  },
  {
    itemName: "Heavy Cream",
    quantity: 20,
    unit: "l" as const,
    lowStockThreshold: 5,
    category: "Dairy" as const,
  },
  {
    itemName: "Mozzarella Cheese",
    quantity: 25,
    unit: "kg" as const,
    lowStockThreshold: 8,
    category: "Dairy" as const,
  },
  {
    itemName: "Parmesan Cheese",
    quantity: 15,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Dairy" as const,
  },
  {
    itemName: "Butter",
    quantity: 20,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Dairy" as const,
  },
  {
    itemName: "Eggs",
    quantity: 200,
    unit: "pcs" as const,
    lowStockThreshold: 50,
    category: "Dairy" as const,
  },
  {
    itemName: "Yogurt",
    quantity: 30,
    unit: "kg" as const,
    lowStockThreshold: 10,
    category: "Dairy" as const,
  },

  // Grains
  {
    itemName: "Rice",
    quantity: 100,
    unit: "kg" as const,
    lowStockThreshold: 25,
    category: "Grains" as const,
  },
  {
    itemName: "Pasta",
    quantity: 50,
    unit: "kg" as const,
    lowStockThreshold: 15,
    category: "Grains" as const,
  },
  {
    itemName: "All-Purpose Flour",
    quantity: 75,
    unit: "kg" as const,
    lowStockThreshold: 20,
    category: "Grains" as const,
  },
  {
    itemName: "Bread Rolls",
    quantity: 100,
    unit: "pcs" as const,
    lowStockThreshold: 30,
    category: "Grains" as const,
  },
  {
    itemName: "Pizza Dough",
    quantity: 30,
    unit: "kg" as const,
    lowStockThreshold: 10,
    category: "Grains" as const,
  },

  // Spices
  {
    itemName: "Salt",
    quantity: 20,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Spices" as const,
  },
  {
    itemName: "Black Pepper",
    quantity: 5,
    unit: "kg" as const,
    lowStockThreshold: 1,
    category: "Spices" as const,
  },
  {
    itemName: "Paprika",
    quantity: 3,
    unit: "kg" as const,
    lowStockThreshold: 0.5,
    category: "Spices" as const,
  },
  {
    itemName: "Cumin",
    quantity: 2,
    unit: "kg" as const,
    lowStockThreshold: 0.5,
    category: "Spices" as const,
  },
  {
    itemName: "Oregano",
    quantity: 2,
    unit: "kg" as const,
    lowStockThreshold: 0.5,
    category: "Spices" as const,
  },
  {
    itemName: "Basil (Dried)",
    quantity: 1.5,
    unit: "kg" as const,
    lowStockThreshold: 0.3,
    category: "Spices" as const,
  },
  {
    itemName: "Chili Powder",
    quantity: 3,
    unit: "kg" as const,
    lowStockThreshold: 0.5,
    category: "Spices" as const,
  },

  // Beverages
  {
    itemName: "Coca Cola",
    quantity: 100,
    unit: "l" as const,
    lowStockThreshold: 30,
    category: "Beverages" as const,
  },
  {
    itemName: "Sprite",
    quantity: 80,
    unit: "l" as const,
    lowStockThreshold: 25,
    category: "Beverages" as const,
  },
  {
    itemName: "Orange Juice",
    quantity: 60,
    unit: "l" as const,
    lowStockThreshold: 20,
    category: "Beverages" as const,
  },
  {
    itemName: "Apple Juice",
    quantity: 50,
    unit: "l" as const,
    lowStockThreshold: 15,
    category: "Beverages" as const,
  },
  {
    itemName: "Coffee Beans",
    quantity: 15,
    unit: "kg" as const,
    lowStockThreshold: 5,
    category: "Beverages" as const,
  },
  {
    itemName: "Tea Bags",
    quantity: 500,
    unit: "pcs" as const,
    lowStockThreshold: 100,
    category: "Beverages" as const,
  },
  {
    itemName: "Bottled Water",
    quantity: 200,
    unit: "l" as const,
    lowStockThreshold: 50,
    category: "Beverages" as const,
  },

  // General/Cooking Essentials
  {
    itemName: "Olive Oil",
    quantity: 30,
    unit: "l" as const,
    lowStockThreshold: 10,
    category: "General" as const,
  },
  {
    itemName: "Vegetable Oil",
    quantity: 40,
    unit: "l" as const,
    lowStockThreshold: 10,
    category: "General" as const,
  },
  {
    itemName: "Soy Sauce",
    quantity: 15,
    unit: "l" as const,
    lowStockThreshold: 5,
    category: "General" as const,
  },
  {
    itemName: "Tomato Sauce",
    quantity: 25,
    unit: "l" as const,
    lowStockThreshold: 8,
    category: "General" as const,
  },
  {
    itemName: "BBQ Sauce",
    quantity: 20,
    unit: "l" as const,
    lowStockThreshold: 5,
    category: "General" as const,
  },
  {
    itemName: "Mayonnaise",
    quantity: 10,
    unit: "kg" as const,
    lowStockThreshold: 3,
    category: "General" as const,
  },
  {
    itemName: "Ketchup",
    quantity: 15,
    unit: "l" as const,
    lowStockThreshold: 5,
    category: "General" as const,
  },
  {
    itemName: "Mustard",
    quantity: 8,
    unit: "kg" as const,
    lowStockThreshold: 2,
    category: "General" as const,
  },
  {
    itemName: "Sugar",
    quantity: 50,
    unit: "kg" as const,
    lowStockThreshold: 15,
    category: "General" as const,
  },
  {
    itemName: "Vinegar",
    quantity: 20,
    unit: "l" as const,
    lowStockThreshold: 5,
    category: "General" as const,
  },
  {
    itemName: "Honey",
    quantity: 10,
    unit: "kg" as const,
    lowStockThreshold: 3,
    category: "General" as const,
  },
  {
    itemName: "Chocolate Chips",
    quantity: 12,
    unit: "kg" as const,
    lowStockThreshold: 3,
    category: "General" as const,
  },
  {
    itemName: "Vanilla Extract",
    quantity: 3,
    unit: "l" as const,
    lowStockThreshold: 0.5,
    category: "General" as const,
  },
];

const seedInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("MongoDB Connected for seeding inventory...");

    console.log("\n📦 Seeding Inventory Items...");
    console.log("═════════════════════════════════════════");

    let created = 0;
    let existing = 0;

    for (const item of inventoryItems) {
      // @ts-ignore
      const existingItem = await Inventory.findOne({ itemName: item.itemName });

      if (existingItem) {
        console.log(`  ⚠️  ${item.itemName.padEnd(30)} - Already exists`);
        existing++;
      } else {
        // @ts-ignore
        await Inventory.create(item);
        const stockStatus =
          item.quantity <= item.lowStockThreshold ? "🔴 LOW" : "✅ OK";
        console.log(
          `  ✅ ${item.itemName.padEnd(30)} ${item.quantity.toString().padStart(6)} ${item.unit.padEnd(5)} [${item.category}] ${stockStatus}`,
        );
        created++;
      }
    }

    console.log("\n═════════════════════════════════════════");
    console.log("     INVENTORY SEEDING COMPLETED! ✨");
    console.log("═════════════════════════════════════════");
    console.log(`\n📊 Summary:`);
    console.log(`  Items Created:  ${created}`);
    console.log(`  Items Existing: ${existing}`);
    console.log(`  Total Items:    ${created + existing}`);

    console.log(`\n📈 Inventory by Category:`);
    const categories = [
      "Meat",
      "Seafood",
      "Vegetables",
      "Fruits",
      "Dairy",
      "Grains",
      "Spices",
      "Beverages",
      "General",
    ];
    for (const category of categories) {
      const count = await Inventory.countDocuments({ category });
      console.log(`  ${category.padEnd(12)}: ${count} items`);
    }

    console.log("\n═════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding inventory:", error);
    process.exit(1);
  }
};

seedInventory();
