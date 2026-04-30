/**
 * Osaid Mart — Express server
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { sql } = require("./db");
const authRouter = require("./routes/auth");
const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ───────────────────────────────────────────── */
app.use(cors());
app.use(express.json());

/* ── Static files (frontend) ─────────────────────────────── */
app.use(express.static(path.join(__dirname, "..", "public")));

/* ── API Routes ──────────────────────────────────────────── */
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);

/* Categories endpoint */
app.get("/api/categories", async (_req, res) => {
  try {
    const rows = await sql`SELECT DISTINCT category FROM products ORDER BY category`;
    res.json(rows.map((r) => r.category));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ── Admin: ALL orders with user details ─────────────────── */
app.get("/api/admin/orders", async (_req, res) => {
  try {
    const orders = await sql`
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC`;

    const result = [];
    for (const order of orders) {
      const items = await sql`SELECT * FROM order_items WHERE order_id = ${order.id}`;
      result.push({
        ...order,
        total: parseFloat(order.total),
        items: items.map((i) => ({
          ...i,
          price_at_order: parseFloat(i.price_at_order),
          subtotal: parseFloat(i.subtotal),
        })),
      });
    }
    res.json(result);
  } catch (err) {
    console.error("Admin orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ── SPA fallback ────────────────────────────────────────── */
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

/* ── Start ───────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  🛒  Osaid Mart is running at  http://localhost:${PORT}\n`);
});
