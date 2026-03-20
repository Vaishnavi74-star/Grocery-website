// In-memory data store for cart and orders
const seedProducts = require("../data/products");

class Store {
  constructor() {
    this.products = [...seedProducts];
    this.cart = [];
    this.orders = [];
    this.orderCounter = 1000;
  }

  // ── Products ──────────────────────────────────
  getAllProducts(category) {
    if (category) {
      return this.products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    return this.products;
  }

  getProductById(id) {
    return this.products.find((p) => p.id === id) || null;
  }

  getCategories() {
    const cats = [...new Set(this.products.map((p) => p.category))];
    return cats.map((name) => ({
      name,
      count: this.products.filter((p) => p.category === name).length,
    }));
  }

  // ── Cart ──────────────────────────────────────
  getCart() {
    return this.cart.map((item) => {
      const product = this.getProductById(item.productId);
      return {
        ...item,
        product,
        subtotal: product ? +(product.price * item.quantity).toFixed(2) : 0,
      };
    });
  }

  getCartTotal() {
    const items = this.getCart();
    return +items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);
  }

  addToCart(productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product) return { error: "Product not found" };
    if (!product.inStock) return { error: "Product is out of stock" };

    const existing = this.cart.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        productId,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }
    return { success: true, cart: this.getCart(), total: this.getCartTotal() };
  }

  updateCartItem(productId, quantity) {
    const idx = this.cart.findIndex((i) => i.productId === productId);
    if (idx === -1) return { error: "Item not in cart" };

    if (quantity <= 0) {
      this.cart.splice(idx, 1);
    } else {
      this.cart[idx].quantity = quantity;
    }
    return { success: true, cart: this.getCart(), total: this.getCartTotal() };
  }

  removeFromCart(productId) {
    const idx = this.cart.findIndex((i) => i.productId === productId);
    if (idx === -1) return { error: "Item not in cart" };
    this.cart.splice(idx, 1);
    return { success: true, cart: this.getCart(), total: this.getCartTotal() };
  }

  clearCart() {
    this.cart = [];
    return { success: true, cart: [], total: 0 };
  }

  // ── Orders ────────────────────────────────────
  placeOrder(customerName, address, phone) {
    if (this.cart.length === 0) return { error: "Cart is empty" };

    const order = {
      id: `ORD-${++this.orderCounter}`,
      items: this.getCart(),
      customerName,
      address,
      phone,
      total: this.getCartTotal(),
      status: "placed",
      createdAt: new Date().toISOString(),
    };

    this.orders.push(order);
    this.cart = [];
    return { success: true, order };
  }

  getAllOrders() {
    return this.orders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  getOrderById(id) {
    return this.orders.find((o) => o.id === id) || null;
  }
}

// Singleton
module.exports = new Store();
