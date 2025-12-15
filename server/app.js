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
// Properly handle preflight with CORS headers via cors middleware
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "1mb" }));

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
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Server error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
