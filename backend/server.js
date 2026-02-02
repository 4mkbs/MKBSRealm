const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const connectDB = require("./config/db");
const { initializeSocket } = require("./config/socket");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { generalLimiter, authLimiter } = require("./middleware/rateLimiter");
const { applySecurity } = require("./middleware/security");

const app = express();

// Detect if running on Vercel
const isVercel = process.env.VERCEL === "1";
const server = !isVercel ? http.createServer(app) : null;
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Socket.io (only on local development)
let io = null;
if (!isVercel) {
  io = initializeSocket(server);
  app.set("io", io);
}

// Apply security middleware
applySecurity(app);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      /\.vercel\.app$/,
      process.env.CLIENT_URL
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "MKBS Realm API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      posts: "/api/posts",
      messages: "/api/messages",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Export for Vercel or start server locally
if (isVercel) {
  module.exports = app;
} else {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Socket.io is ready for connections");
  });
}
