import { api } from "../api.js";

export function renderCheckout(container, { navigate, toast, refreshCartBadge }) {
  container.innerHTML = `<div class="page-enter" id="checkout-root"><p style="color:var(--text-muted)">Loading…</p></div>`;

  loadCheckout();

  async function loadCheckout() {
    try {
      const data = await api.getCart();
      if (!data.items || data.items.length === 0) {
        navigate("cart");
        return;
      }
      renderForm(data);
    } catch (e) {
      container.querySelector("#checkout-root").innerHTML = `<p style="color:var(--error)">Failed to load cart.</p>`;
    }
  }

  function renderForm({ items, total }) {
    const root = container.querySelector("#checkout-root");
    root.innerHTML = `
      <div class="checkout-page">
        <h2>Checkout</h2>
        <p class="subtext">Review your order and enter delivery details to place your order.</p>

        <form class="checkout-form" id="checkout-form" autocomplete="on">
          <div class="form-group">
            <label for="checkout-name">Full Name</label>
            <input type="text" id="checkout-name" placeholder="e.g. John Doe" required />
          </div>
          <div class="form-group">
            <label for="checkout-address">Delivery Address</label>
            <textarea id="checkout-address" placeholder="e.g. 123 Main St, Apt 4B, City" required></textarea>
          </div>
          <div class="form-group">
            <label for="checkout-phone">Phone Number</label>
            <input type="tel" id="checkout-phone" placeholder="e.g. +1 555-123-4567" required />
          </div>

          <div class="checkout-order-summary">
            <h4>Order Summary</h4>
            ${items
              .map(
                (i) => `
              <div class="checkout-summary-item">
                <span class="name">${i.product.name}</span>
                <span class="qty">×${i.quantity}</span>
                <span>$${i.subtotal.toFixed(2)}</span>
              </div>
            `
              )
              .join("")}
            <div class="checkout-summary-item" style="font-weight:700;padding-top:12px;border-top:1px solid var(--border-color);margin-top:8px;color:var(--text-primary)">
              <span class="name">Total</span>
              <span></span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>

          <button type="submit" class="place-order-btn" id="place-order-btn">
            🛒 Place Order — $${total.toFixed(2)}
          </button>
        </form>
      </div>
    `;

    root.querySelector("#checkout-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = root.querySelector("#checkout-name").value.trim();
      const address = root.querySelector("#checkout-address").value.trim();
      const phone = root.querySelector("#checkout-phone").value.trim();

      if (!name || !address || !phone) {
        toast("Please fill in all fields", "error");
        return;
      }

      const btn = root.querySelector("#place-order-btn");
      btn.textContent = "Placing Order…";
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.6";

      try {
        const result = await api.placeOrder(name, address, phone);
        refreshCartBadge();
        renderSuccess(result.order);
      } catch (err) {
        toast(err.message, "error");
        btn.textContent = `🛒 Place Order — $${total.toFixed(2)}`;
        btn.style.pointerEvents = "";
        btn.style.opacity = "";
      }
    });
  }

  function renderSuccess(order) {
    const root = container.querySelector("#checkout-root");
    root.innerHTML = `
      <div class="order-success">
        <div class="success-icon">✅</div>
        <h2>Order Placed Successfully!</h2>
        <div class="order-id">${order.id}</div>
        <p>Thank you, ${order.customerName}! Your fresh groceries are on their way.</p>

        <div class="order-details-card">
          <h4>Order Details</h4>
          ${order.items
            .map(
              (i) => `
            <div class="order-detail-row">
              <span>${i.product.name} × ${i.quantity}</span>
              <span>$${i.subtotal.toFixed(2)}</span>
            </div>
          `
            )
            .join("")}
          <div class="order-detail-row" style="font-weight:700;color:var(--primary-400)">
            <span>Total</span>
            <span>$${order.total.toFixed(2)}</span>
          </div>
          <div class="order-detail-row">
            <span class="detail-label">Delivery to</span>
            <span>${order.address}</span>
          </div>
          <div class="order-detail-row">
            <span class="detail-label">Status</span>
            <span style="color:var(--success);font-weight:600;text-transform:capitalize">${order.status}</span>
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn-primary" id="continue-shopping-btn">Continue Shopping</button>
          <button class="btn-secondary" id="view-orders-btn">View Orders</button>
        </div>
      </div>
    `;

    root.querySelector("#continue-shopping-btn").addEventListener("click", () => navigate("home"));
    root.querySelector("#view-orders-btn").addEventListener("click", () => navigate("orders"));
  }
}
