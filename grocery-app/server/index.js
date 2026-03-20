const express = require("express");
const cors = require("cors");
const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");
const store = require("./models/store");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().slice(11, 19);
  console.log(`  [${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);

// GET /api/categories
app.get("/api/categories", (req, res) => {
  res.json({ categories: store.getCategories() });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// 404 fallback for API
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🛒  FreshCart API Server                ║
  ║   Running on http://localhost:${PORT}        ║
  ╚═══════════════════════════════════════════╝
  `);
});
