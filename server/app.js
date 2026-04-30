/**
 * Shared Express router — all API routes.
 * Used by both local server (server.js) and Netlify function (api.js).
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { sql } = require("./db");
const authRouter = require("./routes/auth");
const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");

const router = express.Router();

router.use(cors());
router.use(express.json());

/* ── API Routes ──────────────────────────────────────────── */
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/cart", cartRouter);
router.use("/orders", ordersRouter);

/* Categories */
router.get("/categories", async (_req, res) => {
  try {
    const rows = await sql`SELECT DISTINCT category FROM products ORDER BY category`;
    res.json(rows.map((r) => r.category));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* Admin: ALL orders with user details */
router.get("/admin/orders", async (_req, res) => {
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

module.exports = router;
