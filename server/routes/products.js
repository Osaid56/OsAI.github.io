/**
 * Products API — queries Neon PostgreSQL
 * GET /api/products         — list all (optional ?category= & ?search=)
 * GET /api/products/:id     — single product
 */
const express = require("express");
const router = express.Router();
const { sql } = require("../db");

/* List products with optional filters */
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    let rows;

    if (category && category !== "All" && search) {
      const q = `%${search}%`;
      rows = await sql`
        SELECT * FROM products
        WHERE category = ${category}
          AND (name ILIKE ${q} OR description ILIKE ${q})
        ORDER BY name`;
    } else if (category && category !== "All") {
      rows = await sql`SELECT * FROM products WHERE category = ${category} ORDER BY name`;
    } else if (search) {
      const q = `%${search}%`;
      rows = await sql`
        SELECT * FROM products
        WHERE name ILIKE ${q} OR description ILIKE ${q}
        ORDER BY name`;
    } else {
      rows = await sql`SELECT * FROM products ORDER BY id`;
    }

    res.json(rows);
  } catch (err) {
    console.error("Products error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* Single product */
router.get("/:id", async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM products WHERE id = ${req.params.id}`;
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
