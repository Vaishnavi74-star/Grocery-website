import { api } from "../api.js";

export function renderOrders(container, { navigate, toast }) {
  container.innerHTML = `<div class="page-enter orders-page" id="orders-root"><p style="color:var(--text-muted)">Loading orders…</p></div>`;

  loadOrders();

  async function loadOrders() {
    try {
      const data = await api.getOrders();
      render(data.orders);
    } catch (e) {
      container.querySelector("#orders-root").innerHTML = `<p style="color:var(--error)">Failed to load orders.</p>`;
    }
  }

  function render(orders) {
    const root = container.querySelector("#orders-root");

    if (!orders || orders.length === 0) {
      root.innerHTML = `
        <h2>My Orders</h2>
        <div class="no-orders">
          <div class="no-orders-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Once you place an order, it will appear here.</p>
          <button class="btn-primary" id="go-shop" style="margin-top:20px">Start Shopping</button>
        </div>
      `;
      root.querySelector("#go-shop").addEventListener("click", () => navigate("home"));
      return;
    }

    root.innerHTML = `
      <h2>My Orders</h2>
      <div class="orders-list">
        ${orders.map((o) => orderCardHTML(o)).join("")}
      </div>
    `;
  }
}

function orderCardHTML(order) {
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemNames = order.items
    .slice(0, 3)
    .map((i) => i.product?.name || "Item")
    .join(", ");
  const extra = order.items.length > 3 ? ` + ${order.items.length - 3} more` : "";

  return `
    <div class="order-card">
      <div class="order-card-header">
        <span class="order-card-id">${order.id}</span>
        <span class="order-card-status">${order.status}</span>
      </div>
      <div class="order-card-items">${itemNames}${extra}</div>
      <div class="order-card-footer">
        <span class="order-card-total">$${order.total.toFixed(2)}</span>
        <span class="order-card-date">${date}</span>
      </div>
    </div>
  `;
}
