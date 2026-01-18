const mongoose = require("mongoose");
const User = require("../src/models/User.ts").default || require("../src/models/User");
require("dotenv").config();

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

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding users...");

    // Clear existing users (optional - comment out to keep existing users)
    // await User.deleteMany({});
    // console.log('Existing users cleared');

    // Check and create users
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`User ${userData.email} already exists - skipping`);
      } else {
        await User.create(userData);
        console.log(`Created user: ${userData.email} (${userData.role})`);
      }
    }

    console.log("\n✅ Demo users seeding completed!");
    console.log("\n📋 Login Credentials:");
    console.log("==========================================");
    demoUsers.forEach((user) => {
      console.log(
        `${user.role.toUpperCase().padEnd(10)} | Email: ${user.email.padEnd(25)} | Password: ${user.password}`,
      );
    });
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
