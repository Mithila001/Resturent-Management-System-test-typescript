import "dotenv/config";

// Default to development mode when not explicitly set (safe for local dev).
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

// Provide a safe development fallback for JWT_SECRET when .env is missing.
// This ensures tokens signed/verified during local development don't fail
// due to an unset environment variable. Do NOT use this in production.
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not set. Using development fallback JWT_SECRET=dev_secret");
  process.env.JWT_SECRET = "dev_secret";
}

// Dev-only: show whether JWT_SECRET is set (masked) to assist debugging
if (process.env.NODE_ENV === "development") {
  const masked = process.env.JWT_SECRET
    ? `${process.env.JWT_SECRET.slice(0, 4)}...${process.env.JWT_SECRET.slice(-4)}`
    : "(none)";
  console.log(`DEV: NODE_ENV=${process.env.NODE_ENV}, JWT_SECRET=${masked}`);
}
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import connectDB from "./config/db";

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: any) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible to our routes
app.set("socketio", io);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
