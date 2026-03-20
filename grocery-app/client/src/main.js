// ── FreshCart — Main Application ────────────────────
import { renderHome } from "./pages/home.js";
import { renderCart } from "./pages/cart.js";
import { renderCheckout } from "./pages/checkout.js";
import { renderOrders } from "./pages/orders.js";
import { api } from "./api.js";

const mainContent = document.getElementById("main-content");
const badge = document.getElementById("cart-badge");

// ── Router ─────────────────────────────────────────
let currentPage = "home";

const pages = {
  home: renderHome,
  cart: renderCart,
  checkout: renderCheckout,
  orders: renderOrders,
};

function navigate(page) {
  currentPage = page;
  window.location.hash = page;
  render();
}

function render() {
  // Update active nav
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === currentPage);
  });

  // Hide search on non-home pages
  const searchBar = document.getElementById("search-bar");
  if (searchBar) {
    searchBar.style.display = currentPage === "home" ? "" : "none";
  }

  // Render page
  const renderer = pages[currentPage];
  if (renderer) {
    renderer(mainContent, { navigate, toast, refreshCartBadge });
  }
}

// ── Cart Badge ─────────────────────────────────────
async function refreshCartBadge() {
  try {
    const data = await api.getCart();
    const count = data.items.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = count;
    badge.classList.toggle("visible", count > 0);
    // bump animation
    badge.classList.remove("bump");
    void badge.offsetWidth; // reflow
    badge.classList.add("bump");
  } catch (e) {
    // silent
  }
}

// ── Toast ──────────────────────────────────────────
const toastContainer = document.getElementById("toast-container");

function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${type === "success" ? "✅" : "⚠️"}</span> ${message}`;
  toastContainer.appendChild(el);

  setTimeout(() => {
    el.classList.add("toast-out");
    el.addEventListener("animationend", () => el.remove());
  }, 2800);
}

// ── Event Listeners ────────────────────────────────
// Nav buttons
document.querySelectorAll("[data-page]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    navigate(btn.dataset.page);
  });
});

// Header scroll effect
window.addEventListener("scroll", () => {
  document.getElementById("main-header").classList.toggle("scrolled", window.scrollY > 10);
});

// Hash routing
window.addEventListener("hashchange", () => {
  const hash = window.location.hash.slice(1);
  if (pages[hash] && hash !== currentPage) {
    currentPage = hash;
    render();
  }
});

// ── Init ───────────────────────────────────────────
const initHash = window.location.hash.slice(1);
if (pages[initHash]) currentPage = initHash;

refreshCartBadge();
render();
