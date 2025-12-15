const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const meRoutes = require("./routes/me");
const categoriesRoutes = require("./routes/categories");
const usersRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");

const app = express();

// Basic security/CORS
const rawOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (rawOrigins.includes("*") || rawOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// Handle preflight for all routes on Express v5 (no "*" path support)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "10mb" }));

// Ensure DB connection for each invocation (cached across warm lambdas)
app.use(async (req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    next(e);
  }
});

// Static uploads (note: Vercel is read-only; this is for reads only)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the MERN E-commerce API",
    status: "running",
    documentation: "/api/health",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/me", meRoutes);
app.use("/api/profile", meRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/cart", cartRoutes);

// Not found
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `The requested URL ${req.originalUrl} was not found on this server.`,
  });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Server error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
