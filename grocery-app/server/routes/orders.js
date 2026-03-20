const express = require("express");
const store = require("../models/store");

const router = express.Router();

// POST /api/orders — place an order
router.post("/", (req, res) => {
  const { customerName, address, phone } = req.body;

  if (!customerName || !address || !phone) {
    return res
      .status(400)
      .json({ error: "customerName, address, and phone are required" });
  }

  const result = store.placeOrder(customerName, address, phone);
  if (result.error) return res.status(400).json(result);
  res.status(201).json(result);
});

// GET /api/orders — list all orders
router.get("/", (req, res) => {
  res.json({ orders: store.getAllOrders() });
});

// GET /api/orders/:id — single order
router.get("/:id", (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ order });
});

module.exports = router;
