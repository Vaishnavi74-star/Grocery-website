const express = require("express");
const store = require("../models/store");

const router = express.Router();

// GET /api/cart — get current cart
router.get("/", (req, res) => {
  res.json({ items: store.getCart(), total: store.getCartTotal() });
});

// POST /api/cart — add item { productId, quantity }
router.post("/", (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) return res.status(400).json({ error: "productId required" });

  const result = store.addToCart(productId, quantity || 1);
  if (result.error) return res.status(400).json(result);
  res.status(201).json(result);
});

// PUT /api/cart/:productId — update quantity
router.put("/:productId", (req, res) => {
  const { quantity } = req.body;
  if (quantity === undefined)
    return res.status(400).json({ error: "quantity required" });

  const result = store.updateCartItem(req.params.productId, quantity);
  if (result.error) return res.status(404).json(result);
  res.json(result);
});

// DELETE /api/cart/:productId — remove item
router.delete("/:productId", (req, res) => {
  const result = store.removeFromCart(req.params.productId);
  if (result.error) return res.status(404).json(result);
  res.json(result);
});

// DELETE /api/cart — clear entire cart
router.delete("/", (req, res) => {
  res.json(store.clearCart());
});

module.exports = router;
