import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

const app = express();

// CORS MUST be first - allow all origins
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middleware
app.use(express.json());

// Serve static files for images
app.use("/images", express.static(path.join(__dirname, "../public/images")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const tableRoutes = require("./routes/tableRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

// Role-specific routes
const waiterRoutes = require("./routes/waiterRoutes");
const customerRoutes = require("./routes/customerRoutes");
const chefRoutes = require("./routes/chefRoutes");
const cashierRoutes = require("./routes/cashierRoutes");
const managerRoutes = require("./routes/managerRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

// Core routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/inventory", inventoryRoutes);

// Role-specific routes
app.use("/api/waiter", waiterRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/chef", chefRoutes);
app.use("/api/cashier", cashierRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/owner", ownerRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Restaurant Ordering System API is running...");
});

// Error Handling Middleware
// 404 Handler - MUST be before error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

export default app;
