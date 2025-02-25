// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const companyRoutes = require("./routes/companyRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "*", // Allow all domains in development
      "http://localhost:5173", // Local development
      "https://inty-frontend.vercel.app/*", 
      "https://inty-frontend-seven.vercel.app"
      // Add any other domains you're using
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve uploaded files (for backward compatibility)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);

// Create uploads directory if it doesn't exist (for backward compatibility)
const fs = require("fs");
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development" ? err.message : "Server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available routes:");
  console.log("- GET /api/companies");
  console.log("- POST /api/companies");
  console.log("- PUT /api/companies/:id");
  console.log("- DELETE /api/companies/:id");
  console.log("- GET /api/test");
});
