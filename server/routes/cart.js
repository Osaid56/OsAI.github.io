/**
 * Cart API — per-user persistent cart in PostgreSQL
 * All routes require authentication.
 * GET    /api/cart              — view cart
 * POST   /api/cart              — add item { productId, quantity }
 * PUT    /api/cart/:productId   — update quantity { quantity }
 * DELETE /api/cart/:productId   — remove item
 */
const express = require("express");
const router = express.Router();
const { sql } = require("../db");
const { authRequired } = require("../middleware");

router.use(authRequired);

/* Helper: build enriched cart response */
async function getCartResponse(userId) {
  const items = await sql`
    SELECT ci.product_id, ci.quantity,
           p.name, p.price, p.image_url, p.unit, p.category
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ${userId}
    ORDER BY ci.id`;

  const enriched = items.map((i) => ({
    productId: i.product_id,
    quantity: i.quantity,
    product: {
      id: i.product_id,
      name: i.name,
      price: parseFloat(i.price),
      image_url: i.image_url,
      unit: i.unit,
      category: i.category,
    },
    subtotal: +(parseFloat(i.price) * i.quantity).toFixed(2),
  }));

  return {
    items: enriched,
    totalItems: enriched.reduce((s, i) => s + i.quantity, 0),
    total: +enriched.reduce((s, i) => s + i.subtotal, 0).toFixed(2),
  };
}

/* View cart */
router.get("/", async (req, res) => {
  try {
    res.json(await getCartResponse(req.user.id));
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* Add item */
router.post("/", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: "productId is required" });

    await sql`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (${req.user.id}, ${productId}, ${quantity})
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + ${quantity}`;

    res.json(await getCartResponse(req.user.id));
  } catch (err) {
    console.error("Add cart error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* Update quantity */
router.put("/:productId", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) return res.status(400).json({ error: "quantity is required" });

    if (quantity <= 0) {
      await sql`DELETE FROM cart_items WHERE user_id = ${req.user.id} AND product_id = ${req.params.productId}`;
    } else {
      await sql`
        UPDATE cart_items SET quantity = ${quantity}
        WHERE user_id = ${req.user.id} AND product_id = ${req.params.productId}`;
    }

    res.json(await getCartResponse(req.user.id));
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* Remove item */
router.delete("/:productId", async (req, res) => {
  try {
    await sql`DELETE FROM cart_items WHERE user_id = ${req.user.id} AND product_id = ${req.params.productId}`;
    res.json(await getCartResponse(req.user.id));
  } catch (err) {
    console.error("Remove cart error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
