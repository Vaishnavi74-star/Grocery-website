const express = require("express");
const store = require("../models/store");

const router = express.Router();

// GET /api/products — list all products, optional ?category= filter
router.get("/", (req, res) => {
  const { category, search } = req.query;
  let products = store.getAllProducts(category);

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  res.json({ products, count: products.length });
});

// GET /api/products/:id — single product
router.get("/:id", (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ product });
});

module.exports = router;
