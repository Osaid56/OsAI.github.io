/**
 * Osaid Mart — Frontend Application Logic
 * Auth, products, cart, checkout — all with ₹ INR pricing.
 */
const API = "/api";

/* ── State ─────────────────────────────────────────────── */
let products = [];
let cart = { items: [], totalItems: 0, total: 0 };
let activeCategory = "All";
let searchQuery = "";
let currentUser = null;
let authToken = localStorage.getItem("token");
let authMode = "login"; // "login" or "register"

/* ── DOM helpers ───────────────────────────────────────── */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ── Init ──────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
  if (authToken) {
    try {
      const data = await api("/auth/me");
      currentUser = data.user;
    } catch { authToken = null; localStorage.removeItem("token"); }
  }
  updateAuthUI();
  await loadProducts();
  if (currentUser) await loadCart();
  renderCategories();
  renderProducts();
  bindEvents();
});

/* ── API Helper ────────────────────────────────────────── */
async function api(path, opts = {}) {
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(API + path, {
    headers,
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function loadProducts() {
  products = await api("/products");
}

async function loadCart() {
  try {
    cart = await api("/cart");
    updateCartBadge();
  } catch {
    cart = { items: [], totalItems: 0, total: 0 };
    updateCartBadge();
  }
}

/* ── Format Price ──────────────────────────────────────── */
function formatPrice(amount) {
  return `₹${parseFloat(amount).toFixed(0)}`;
}

/* ── Auth UI ───────────────────────────────────────────── */
function updateAuthUI() {
  const authBtns = $("#auth-buttons");
  const userMenu = $("#user-menu");
  if (currentUser) {
    authBtns.classList.add("hidden");
    userMenu.classList.remove("hidden");
    $("#user-name").textContent = currentUser.name;
    $("#user-avatar").textContent = currentUser.name.charAt(0).toUpperCase();
  } else {
    authBtns.classList.remove("hidden");
    userMenu.classList.add("hidden");
  }
}

function openAuthModal(mode) {
  authMode = mode;
  const modal = $("#auth-modal");
  const title = $("#auth-modal-title");
  const submit = $("#auth-submit");
  const switchText = $("#auth-switch");
  const body = $("#auth-modal-body");
  $("#auth-error").classList.add("hidden");

  if (mode === "login") {
    title.textContent = "Login";
    submit.textContent = "Login";
    switchText.innerHTML = `Don't have an account? <a href="#" id="auth-switch-link">Sign Up</a>`;
    body.innerHTML = `
      <div class="form-group"><label for="auth-email">Email Address</label><input type="email" id="auth-email" placeholder="you@example.com"></div>
      <div class="form-group"><label for="auth-password">Password</label><input type="password" id="auth-password" placeholder="••••••••"></div>
      <div class="auth-error hidden" id="auth-error"></div>`;
  } else {
    title.textContent = "Create Account";
    submit.textContent = "Sign Up";
    switchText.innerHTML = `Already have an account? <a href="#" id="auth-switch-link">Login</a>`;
    body.innerHTML = `
      <div class="form-group"><label for="auth-name">Full Name</label><input type="text" id="auth-name" placeholder="Your name"></div>
      <div class="form-group"><label for="auth-email">Email Address</label><input type="email" id="auth-email" placeholder="you@example.com"></div>
      <div class="form-group"><label for="auth-password">Password</label><input type="password" id="auth-password" placeholder="Min 6 characters"></div>
      <div class="auth-error hidden" id="auth-error"></div>`;
  }

  // Rebind switch link
  document.getElementById("auth-switch-link").addEventListener("click", (e) => {
    e.preventDefault();
    openAuthModal(mode === "login" ? "register" : "login");
  });

  modal.classList.add("open");
}

function closeAuthModal() {
  $("#auth-modal").classList.remove("open");
}

function showAuthError(msg) {
  const el = $("#auth-error");
  el.textContent = msg;
  el.classList.remove("hidden");
}

async function handleAuth() {
  const email = $("#auth-email")?.value.trim();
  const password = $("#auth-password")?.value.trim();
  const name = $("#auth-name")?.value.trim();

  if (!email || !password) { showAuthError("Please fill in all fields"); return; }
  if (authMode === "register" && !name) { showAuthError("Please enter your name"); return; }

  try {
    let data;
    if (authMode === "login") {
      data = await api("/auth/login", { method: "POST", body: { email, password } });
    } else {
      data = await api("/auth/register", { method: "POST", body: { name, email, password } });
    }
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem("token", authToken);
    updateAuthUI();
    closeAuthModal();
    await loadCart();
    renderCart();
    showToast(`Welcome${authMode === "login" ? " back" : ""}, ${currentUser.name}!`);
  } catch (err) {
    showAuthError(err.error || "Something went wrong");
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem("token");
  cart = { items: [], totalItems: 0, total: 0 };
  updateCartBadge();
  updateAuthUI();
  showToast("Logged out successfully");
}

/* ── Render: Categories ────────────────────────────────── */
function renderCategories() {
  const cats = [...new Set(products.map((p) => p.category))];
  const container = $("#categories");
  container.innerHTML =
    `<button class="cat-btn active" data-cat="All">All</button>` +
    cats.map((c) => `<button class="cat-btn" data-cat="${c}">${c}</button>`).join("");

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-btn");
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    $$(".cat-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts();
  });
}

/* ── Render: Products ──────────────────────────────────── */
function renderProducts() {
  let filtered = products;
  if (activeCategory !== "All") filtered = filtered.filter((p) => p.category === activeCategory);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  $("#product-count").textContent = `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`;
  const grid = $("#product-grid");

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">
      <div style="font-size:3rem;margin-bottom:.5rem">🔍</div>
      <p>No products found. Try a different search or category.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map((p) => `
    <div class="product-card" data-id="${p.id}">
      <div class="card-image">
        <img src="${p.image_url}" alt="${p.name}" loading="lazy">
        <div class="card-rating">⭐ ${p.rating}</div>
      </div>
      <div class="card-body">
        <div class="card-category">${p.category}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.description}</div>
        <div class="card-footer">
          <div>
            <span class="card-price">${formatPrice(p.price)}</span>
            <span class="card-unit">/ ${p.unit}</span>
          </div>
          <button class="add-btn" data-id="${p.id}" aria-label="Add ${p.name} to cart">+</button>
        </div>
      </div>
    </div>`).join("");
}

/* ── Render: Cart Sidebar ──────────────────────────────── */
function renderCart() {
  const container = $("#cart-items");
  if (cart.items.length === 0) {
    container.innerHTML = `<div class="cart-empty">
      <div class="empty-icon">🛒</div>
      <p>Your cart is empty</p>
      <p style="font-size:.8rem;margin-top:.25rem">Browse products and add items to get started!</p>
    </div>`;
    $("#cart-total-amount").textContent = "₹0";
    $(".checkout-btn").disabled = true;
    return;
  }

  container.innerHTML = cart.items.map((item) => `
    <div class="cart-item" data-id="${item.productId}">
      <div class="cart-item-img"><img src="${item.product.image_url}" alt="${item.product.name}"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.product.name}</div>
        <div class="cart-item-price">${formatPrice(item.subtotal)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="dec" data-id="${item.productId}">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.productId}">+</button>
          <button class="remove-btn" data-id="${item.productId}">Remove</button>
        </div>
      </div>
    </div>`).join("");

  $("#cart-total-amount").textContent = formatPrice(cart.total);
  $(".checkout-btn").disabled = false;
}

/* ── Cart Badge ────────────────────────────────────────── */
function updateCartBadge() {
  const badge = $(".badge");
  badge.textContent = cart.totalItems;
  badge.classList.toggle("show", cart.totalItems > 0);
}

/* ── Cart Operations ───────────────────────────────────── */
async function addToCart(productId) {
  if (!currentUser) { openAuthModal("login"); showToast("Please login to add items"); return; }
  try {
    cart = await api("/cart", { method: "POST", body: { productId, quantity: 1 } });
    updateCartBadge();
    renderCart();
    const btn = document.querySelector(`.add-btn[data-id="${productId}"]`);
    if (btn) {
      btn.classList.add("added"); btn.textContent = "✓";
      setTimeout(() => { btn.classList.remove("added"); btn.textContent = "+"; }, 600);
    }
    showToast("Item added to cart!");
  } catch (err) { showToast(err.error || "Failed to add"); }
}

async function updateQuantity(productId, delta) {
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) return;
  const newQty = item.quantity + delta;
  try {
    if (newQty <= 0) {
      cart = await api(`/cart/${productId}`, { method: "DELETE" });
    } else {
      cart = await api(`/cart/${productId}`, { method: "PUT", body: { quantity: newQty } });
    }
    updateCartBadge(); renderCart();
  } catch (err) { showToast(err.error || "Failed"); }
}

async function removeItem(productId) {
  try {
    cart = await api(`/cart/${productId}`, { method: "DELETE" });
    updateCartBadge(); renderCart();
    showToast("Item removed");
  } catch (err) { showToast(err.error || "Failed"); }
}

/* ── Cart Sidebar Toggle ───────────────────────────────── */
function openCart() {
  if (!currentUser) { openAuthModal("login"); showToast("Please login to view cart"); return; }
  $(".cart-overlay").classList.add("open");
  $(".cart-sidebar").classList.add("open");
  renderCart();
}
function closeCart() {
  $(".cart-overlay").classList.remove("open");
  $(".cart-sidebar").classList.remove("open");
}

/* ── Checkout ──────────────────────────────────────────── */
function openCheckout() {
  closeCart();
  setTimeout(() => {
    $("#checkout-summary").innerHTML = `<span class="cs-label">${cart.totalItems} item${cart.totalItems !== 1 ? "s" : ""}</span><span class="cs-total">${formatPrice(cart.total)}</span>`;
    $("#checkout-body").innerHTML = `
      <div class="checkout-summary"><span class="cs-label">${cart.totalItems} item${cart.totalItems !== 1 ? "s" : ""}</span><span class="cs-total">${formatPrice(cart.total)}</span></div>
      <div class="form-group"><label for="input-address">Delivery Address</label><textarea id="input-address" placeholder="123 Main St, Apt 4..."></textarea></div>`;
    $("#checkout-footer").style.display = "flex";
    $("#checkout-modal").classList.add("open");
  }, 200);
}

function closeCheckoutModal() {
  $("#checkout-modal").classList.remove("open");
}

async function placeOrder() {
  const address = $("#input-address")?.value.trim();
  if (!address) { showToast("Please enter a delivery address"); return; }

  try {
    const order = await api("/orders", { method: "POST", body: { address } });

    $("#checkout-body").innerHTML = `
      <div class="order-success">
        <div class="check-icon">✅</div>
        <h3>Order Confirmed!</h3>
        <p>Thank you, ${currentUser.name}!</p>
        <p>Your order of ${order.total_items} item${order.total_items !== 1 ? "s" : ""} totalling <strong>${formatPrice(order.total)}</strong> has been placed.</p>
        <div class="order-id">Order #${order.id.slice(0, 8).toUpperCase()}</div>
        <button class="btn-continue" id="continue-shopping-btn">Continue Shopping</button>
      </div>`;
    $("#checkout-footer").style.display = "none";

    document.getElementById("continue-shopping-btn").addEventListener("click", () => {
      closeCheckoutModal(); loadCart();
    });

    cart = { items: [], totalItems: 0, total: 0 };
    updateCartBadge();
  } catch (err) { showToast(err.error || "Order failed"); }
}

/* ── Toast ─────────────────────────────────────────────── */
function showToast(msg) {
  const toast = $("#toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ── Event Bindings ────────────────────────────────────── */
function bindEvents() {
  // Product grid — add to cart
  $("#product-grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".add-btn");
    if (btn) addToCart(btn.dataset.id);
  });

  // Cart sidebar
  $(".cart-btn").addEventListener("click", openCart);
  $(".close-cart").addEventListener("click", closeCart);
  $(".cart-overlay").addEventListener("click", closeCart);

  // Cart controls
  $("#cart-items").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (btn) { updateQuantity(btn.dataset.id, btn.dataset.action === "inc" ? 1 : -1); return; }
    const rm = e.target.closest(".remove-btn");
    if (rm) removeItem(rm.dataset.id);
  });

  // Checkout
  $(".checkout-btn").addEventListener("click", openCheckout);
  $("#place-order-btn").addEventListener("click", placeOrder);

  // Auth
  $("#login-btn").addEventListener("click", () => openAuthModal("login"));
  $("#register-btn").addEventListener("click", () => openAuthModal("register"));
  $("#auth-submit").addEventListener("click", handleAuth);
  $("#logout-btn").addEventListener("click", logout);

  // Search
  let searchTimeout;
  $("#search-input").addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { searchQuery = e.target.value.trim(); renderProducts(); }, 250);
  });

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeCart(); closeAuthModal(); closeCheckoutModal(); }
  });

  // Enter key in auth form
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && $("#auth-modal").classList.contains("open")) handleAuth();
  });
}
