import { api } from "../api.js";

export function renderHome(container, { navigate, toast, refreshCartBadge }) {
  let activeCategory = null;
  let products = [];
  let categories = [];

  container.innerHTML = `
    <div class="page-enter">
      <!-- Hero -->
      <section class="hero" id="hero">
        <h1>Fresh groceries,<br/><span>delivered fast.</span></h1>
        <p>Shop premium fruits, vegetables, dairy, bakery, and more — all at market-fresh prices.</p>
      </section>

      <!-- Categories -->
      <div class="category-bar" id="category-bar"></div>

      <!-- Products -->
      <div class="section-title">
        <span id="section-label">All Products</span>
        <span class="count" id="product-count">0</span>
      </div>
      <div class="products-grid" id="products-grid">
        ${skeletonHTML()}
      </div>
    </div>
  `;

  const categoryBar = container.querySelector("#category-bar");
  const productsGrid = container.querySelector("#products-grid");
  const sectionLabel = container.querySelector("#section-label");
  const productCount = container.querySelector("#product-count");

  // Load data
  loadCategories();
  loadProducts();

  // ── Categories ──────────────────────────────────
  async function loadCategories() {
    try {
      const data = await api.getCategories();
      categories = data.categories;
      renderCategories();
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  }

  function renderCategories() {
    const allCount = products.length || "…";
    categoryBar.innerHTML = `
      <button class="category-pill ${!activeCategory ? "active" : ""}" data-cat="">
        All <span class="pill-count">${allCount}</span>
      </button>
      ${categories
        .map(
          (c) => `
        <button class="category-pill ${activeCategory === c.name ? "active" : ""}" data-cat="${c.name}">
          ${getCategoryEmoji(c.name)} ${c.name} <span class="pill-count">${c.count}</span>
        </button>
      `
        )
        .join("")}
    `;

    categoryBar.querySelectorAll(".category-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat || null;
        loadProducts();
        renderCategories();
      });
    });
  }

  // ── Products ────────────────────────────────────
  async function loadProducts() {
    try {
      const searchInput = document.querySelector("#search-input");
      const search = searchInput ? searchInput.value.trim() : "";
      const data = await api.getProducts(activeCategory, search);
      products = data.products;
      sectionLabel.textContent = activeCategory || "All Products";
      productCount.textContent = data.count;
      renderProducts();
      // update "All" count
      if (!activeCategory) {
        const allPill = categoryBar.querySelector('[data-cat=""] .pill-count');
        if (allPill) allPill.textContent = data.count;
      }
    } catch (e) {
      productsGrid.innerHTML = `<p style="color:var(--error)">Failed to load products.</p>`;
    }
  }

  function renderProducts() {
    if (products.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">
          <p style="font-size:2rem;margin-bottom:8px">🔍</p>
          <p>No products found.</p>
        </div>`;
      return;
    }

    productsGrid.innerHTML = products.map((p) => productCardHTML(p)).join("");

    // Attach add-to-cart listeners
    productsGrid.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        try {
          await api.addToCart(id);
          toast(`Added to cart!`, "success");
          refreshCartBadge();
        } catch (e) {
          toast(e.message, "error");
        }
      });
    });
  }

  // Wire search
  const searchInput = document.querySelector("#search-input");
  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => loadProducts(), 350);
    });
  }
}

function productCardHTML(p) {
  return `
    <article class="product-card ${!p.inStock ? "out-of-stock" : ""}">
      <div class="product-card-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        <div class="product-rating">⭐ ${p.rating}</div>
      </div>
      <div class="product-card-body">
        <span class="product-category-tag">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-description">${p.description}</p>
      </div>
      <div class="product-card-footer">
        <div class="product-price">$${p.price.toFixed(2)} <span class="unit">/ ${p.unit}</span></div>
        <button class="add-to-cart-btn ${!p.inStock ? "disabled" : ""}" data-id="${p.id}" ${!p.inStock ? "disabled" : ""}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add
        </button>
      </div>
    </article>
  `;
}

function skeletonHTML() {
  return Array(8)
    .fill("")
    .map(
      () => `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line"></div>
      </div>
    </div>
  `
    )
    .join("");
}

function getCategoryEmoji(name) {
  const map = {
    Fruits: "🍎",
    Vegetables: "🥦",
    Dairy: "🥛",
    Bakery: "🥖",
    "Meat & Seafood": "🥩",
    Beverages: "🥤",
    Pantry: "🥫",
  };
  return map[name] || "🛒";
}
