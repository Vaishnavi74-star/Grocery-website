import { api } from "../api.js";

export function renderCart(container, { navigate, toast, refreshCartBadge }) {
  container.innerHTML = `<div class="page-enter" id="cart-root"><p style="color:var(--text-muted)">Loading cart…</p></div>`;

  loadCart();

  async function loadCart() {
    try {
      const data = await api.getCart();
      render(data);
    } catch (e) {
      container.querySelector("#cart-root").innerHTML = `<p style="color:var(--error)">Failed to load cart.</p>`;
    }
  }

  function render({ items, total }) {
    const root = container.querySelector("#cart-root");

    if (!items || items.length === 0) {
      root.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any groceries yet. Explore our fresh selection!</p>
          <button class="btn-primary" id="shop-now-btn">Start Shopping</button>
        </div>
      `;
      root.querySelector("#shop-now-btn").addEventListener("click", () => navigate("home"));
      return;
    }

    root.innerHTML = `
      <div class="section-title" style="margin-bottom:24px">
        <span>Shopping Cart</span>
        <span class="count">${items.length} item${items.length > 1 ? "s" : ""}</span>
      </div>
      <div class="cart-page">
        <div class="cart-items-list" id="cart-items-list">
          ${items.map((item) => cartItemHTML(item)).join("")}
        </div>
        <div class="cart-summary">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span class="label">Subtotal (${items.length} items)</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span class="label">Delivery</span>
            <span style="color:var(--success)">Free</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          <button class="checkout-btn" id="go-checkout-btn">
            Proceed to Checkout
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button class="clear-cart-btn" id="clear-cart-btn">Clear Cart</button>
        </div>
      </div>
    `;

    // Quantity steppers
    root.querySelectorAll(".qty-stepper button").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const currentQty = parseInt(btn.closest(".qty-stepper").querySelector(".qty-value").textContent);
        const newQty = action === "inc" ? currentQty + 1 : currentQty - 1;

        try {
          if (newQty <= 0) {
            await api.removeFromCart(id);
            toast("Removed from cart", "success");
          } else {
            await api.updateCartItem(id, newQty);
          }
          refreshCartBadge();
          loadCart();
        } catch (e) {
          toast(e.message, "error");
        }
      });
    });

    // Remove buttons
    root.querySelectorAll(".cart-item-remove").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await api.removeFromCart(btn.dataset.id);
          toast("Removed from cart", "success");
          refreshCartBadge();
          loadCart();
        } catch (e) {
          toast(e.message, "error");
        }
      });
    });

    // Checkout
    root.querySelector("#go-checkout-btn").addEventListener("click", () => navigate("checkout"));

    // Clear cart
    root.querySelector("#clear-cart-btn").addEventListener("click", async () => {
      try {
        await api.clearCart();
        toast("Cart cleared", "success");
        refreshCartBadge();
        loadCart();
      } catch (e) {
        toast(e.message, "error");
      }
    });
  }
}

function cartItemHTML(item) {
  const p = item.product;
  if (!p) return "";
  return `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="${p.image}" alt="${p.name}" />
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">$${p.price.toFixed(2)} / ${p.unit}</div>
      </div>
      <div class="qty-stepper">
        <button data-id="${p.id}" data-action="dec">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button data-id="${p.id}" data-action="inc">+</button>
      </div>
      <div class="cart-item-subtotal">$${item.subtotal.toFixed(2)}</div>
      <button class="cart-item-remove" data-id="${p.id}" title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  `;
}
