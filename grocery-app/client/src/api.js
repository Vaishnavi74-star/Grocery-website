// ── API Client ─────────────────────────────────────
const BASE = "/api";

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  // Products
  getProducts: (category, search) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const qs = params.toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getCategories: () => request("/categories"),

  // Cart
  getCart: () => request("/cart"),
  addToCart: (productId, quantity = 1) =>
    request("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),
  updateCartItem: (productId, quantity) =>
    request(`/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
  removeFromCart: (productId) =>
    request(`/cart/${productId}`, { method: "DELETE" }),
  clearCart: () => request("/cart", { method: "DELETE" }),

  // Orders
  placeOrder: (customerName, address, phone) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify({ customerName, address, phone }),
    }),
  getOrders: () => request("/orders"),
};
