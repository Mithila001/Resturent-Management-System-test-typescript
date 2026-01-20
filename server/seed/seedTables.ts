import dotenv from "dotenv";
import mongoose from "mongoose";
import Table from "../src/models/Table";
import connectDB from "../src/config/db";

dotenv.config();

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
