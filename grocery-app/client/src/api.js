// ── API Client ─────────────────────────────────────
const BASE = "https://grocery-website-1-75e6.onrender.com";

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

    return request(`/api/products${qs ? `?${qs}` : ""}`);
  },

  getCategories: () => request("/api/categories"),

  // Cart
  getCart: () => request("/api/cart"),

  addToCart: (productId, quantity = 1) =>
    request("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),

  updateCartItem: (productId, quantity) =>
    request(`/api/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (productId) =>
    request(`/api/cart/${productId}`, {
      method: "DELETE",
    }),

  clearCart: () =>
    request("/api/cart", {
      method: "DELETE",
    }),

  // Orders
  placeOrder: (customerName, address, phone) =>
    request("/api/orders", {
      method: "POST",
      body: JSON.stringify({ customerName, address, phone }),
    }),

  getOrders: () => request("/api/orders"),
};
