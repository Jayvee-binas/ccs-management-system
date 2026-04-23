const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const teacherRoutes = require("./routes/teachers");
const adminRoutes = require("./routes/admin");
const violationRoutes = require("./routes/violations");
const certificateRoutes = require("./routes/certificates");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// Enhanced CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://ccs-management-system-tau.vercel.app/"] // Add your production domain
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/violations", violationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "CCS Management System API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error("Error details:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle specific error types
  let statusCode = 500;
  let message = "Something went wrong!";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized access";
  } else if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "File too large";
  } else if (err.code === "ER_NO_SUCH_TABLE") {
    statusCode = 500;
    message = "Database table not found. Please run database migrations.";
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error:
      process.env.NODE_ENV === "development"
        ? {
            message: err.message,
            stack: err.stack,
            code: err.code,
          }
        : undefined,
  });
});

// Start server
const PORT = process.env.PORT || process.env.MYSQLPORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("📊 Health check: http://localhost:5000/api/health");
});

module.exports = app;
