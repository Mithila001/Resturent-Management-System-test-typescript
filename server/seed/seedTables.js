require("dotenv").config();
const mongoose = require("mongoose");
const Table = require("../src/models/Table").default || require("../src/models/Table");
const connectDB = require("../src/config/db");

connectDB();

const seedTables = async () => {
  try {
    await Table.deleteMany();

    const tables = [
      { tableNumber: 1, capacity: 2, status: "available" },
      { tableNumber: 2, capacity: 2, status: "available" },
      { tableNumber: 3, capacity: 4, status: "available" },
      { tableNumber: 4, capacity: 4, status: "available" },
      { tableNumber: 5, capacity: 6, status: "available" },
      { tableNumber: 6, capacity: 8, status: "reserved" },
    ];

    await Table.insertMany(tables);
    console.log("Tables seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding tables:", error);
    process.exit(1);
  }
};

seedTables();
