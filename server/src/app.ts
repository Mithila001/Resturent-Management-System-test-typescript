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

import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import menuRoutes from "./routes/menuRoutes";
import orderRoutes from "./routes/orderRoutes";
import tableRoutes from "./routes/tableRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import waiterRoutes from "./routes/waiterRoutes";
import customerRoutes from "./routes/customerRoutes";
import chefRoutes from "./routes/chefRoutes";
import cashierRoutes from "./routes/cashierRoutes";
import managerRoutes from "./routes/managerRoutes";
import ownerRoutes from "./routes/ownerRoutes";

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
