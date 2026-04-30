/**
 * Orders API — user-linked orders with full tracking
 * POST /api/orders       — place order (requires auth)
 * GET  /api/orders       — user's own orders
 * GET  /api/orders/:id   — single order with items
 * GET  /api/admin/orders — ALL orders with user details (admin view)
 */
const express = require("express");
const router = express.Router();
const { sql } = require("../db");
const { authRequired } = require("../middleware");

/* Place order */
router.post("/", authRequired, async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: "Delivery address is required" });

    // Get user's cart
    const cartItems = await sql`
      SELECT ci.product_id, ci.quantity, p.name, p.price
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ${req.user.id}`;

    if (cartItems.length === 0) return res.status(400).json({ error: "Cart is empty" });

    const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
    const total = cartItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

    // Create order
    const orderRows = await sql`
      INSERT INTO orders (user_id, total, total_items, address)
      VALUES (${req.user.id}, ${total.toFixed(2)}, ${totalItems}, ${address})
      RETURNING *`;
    const order = orderRows[0];

    // Insert order items
    for (const item of cartItems) {
      const subtotal = (parseFloat(item.price) * item.quantity).toFixed(2);
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, price_at_order, quantity, subtotal)
        VALUES (${order.id}, ${item.product_id}, ${item.name}, ${item.price}, ${item.quantity}, ${subtotal})`;
    }

    // Clear cart
    await sql`DELETE FROM cart_items WHERE user_id = ${req.user.id}`;

    // Return full order
    const items = await sql`SELECT * FROM order_items WHERE order_id = ${order.id}`;
    res.status(201).json({
      ...order,
      total: parseFloat(order.total),
      items: items.map((i) => ({ ...i, price_at_order: parseFloat(i.price_at_order), subtotal: parseFloat(i.subtotal) })),
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* User's orders */
router.get("/", authRequired, async (req, res) => {
  try {
    const orders = await sql`
      SELECT * FROM orders WHERE user_id = ${req.user.id} ORDER BY created_at DESC`;

    const result = [];
    for (const order of orders) {
      const items = await sql`SELECT * FROM order_items WHERE order_id = ${order.id}`;
      result.push({
        ...order,
        total: parseFloat(order.total),
        items: items.map((i) => ({ ...i, price_at_order: parseFloat(i.price_at_order), subtotal: parseFloat(i.subtotal) })),
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* Single order */
router.get("/:id", authRequired, async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM orders WHERE id = ${req.params.id} AND user_id = ${req.user.id}`;
    if (rows.length === 0) return res.status(404).json({ error: "Order not found" });
    const items = await sql`SELECT * FROM order_items WHERE order_id = ${rows[0].id}`;
    res.json({
      ...rows[0],
      total: parseFloat(rows[0].total),
      items: items.map((i) => ({ ...i, price_at_order: parseFloat(i.price_at_order), subtotal: parseFloat(i.subtotal) })),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
