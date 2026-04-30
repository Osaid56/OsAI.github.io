/**
 * Database seed script — creates tables and inserts 28 products.
 * Run: node server/seed.js
 */
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

const products = [
  // Fruits & Vegetables
  { id:"p001", name:"Organic Bananas",      price:49,  category:"Fruits & Vegetables", unit:"bunch",  rating:4.8, image_url:"https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop", description:"Sweet, ripe organic bananas — perfect for smoothies and snacking." },
  { id:"p002", name:"Fresh Strawberries",   price:199, category:"Fruits & Vegetables", unit:"250g",   rating:4.9, image_url:"https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop", description:"Juicy, farm-fresh strawberries packed with antioxidants." },
  { id:"p003", name:"Avocados",             price:99,  category:"Fruits & Vegetables", unit:"each",   rating:4.7, image_url:"https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop", description:"Creamy Hass avocados, ready to eat in 1-2 days." },
  { id:"p004", name:"Baby Spinach",         price:45,  category:"Fruits & Vegetables", unit:"200g",   rating:4.6, image_url:"https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop", description:"Tender baby spinach leaves, triple-washed and ready to eat." },
  { id:"p005", name:"Red Bell Peppers",     price:35,  category:"Fruits & Vegetables", unit:"each",   rating:4.5, image_url:"https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop", description:"Crisp, sweet red bell peppers — great raw or roasted." },
  { id:"p006", name:"Blueberries",          price:249, category:"Fruits & Vegetables", unit:"125g",   rating:4.9, image_url:"https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=300&fit=crop", description:"Plump, sweet blueberries bursting with flavor." },

  // Dairy & Eggs
  { id:"p007", name:"Full Cream Milk",      price:68,  category:"Dairy & Eggs", unit:"litre",  rating:4.7, image_url:"https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop", description:"Farm-fresh full cream milk, pasteurized and homogenized." },
  { id:"p008", name:"Free-Range Eggs",      price:95,  category:"Dairy & Eggs", unit:"dozen",  rating:4.8, image_url:"https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop", description:"Large free-range eggs from pasture-raised country hens." },
  { id:"p009", name:"Greek Yogurt",         price:120, category:"Dairy & Eggs", unit:"400g",   rating:4.6, image_url:"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop", description:"Thick, creamy plain Greek yogurt with live cultures." },
  { id:"p010", name:"Cheddar Cheese",       price:249, category:"Dairy & Eggs", unit:"200g",   rating:4.7, image_url:"https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=300&fit=crop", description:"Sharp aged cheddar, perfect for sandwiches and snacking." },

  // Bakery
  { id:"p011", name:"Sourdough Bread",      price:149, category:"Bakery", unit:"loaf",   rating:4.9, image_url:"https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&h=300&fit=crop", description:"Artisan sourdough with a crispy crust and tangy flavor." },
  { id:"p012", name:"Croissants",           price:199, category:"Bakery", unit:"4 pack", rating:4.8, image_url:"https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=300&fit=crop", description:"Buttery, flaky French-style croissants baked fresh daily." },
  { id:"p013", name:"Bagels",               price:129, category:"Bakery", unit:"6 pack", rating:4.5, image_url:"https://images.unsplash.com/photo-1585535065945-bfba1e5c2a26?w=400&h=300&fit=crop", description:"Chewy bagels — perfect toasted with cream cheese." },
  { id:"p014", name:"Chocolate Muffins",    price:179, category:"Bakery", unit:"4 pack", rating:4.7, image_url:"https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop", description:"Rich double-chocolate muffins with chocolate chips." },

  // Beverages
  { id:"p015", name:"Orange Juice",         price:149, category:"Beverages", unit:"1 litre", rating:4.6, image_url:"https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop", description:"100% fresh-squeezed orange juice, not from concentrate." },
  { id:"p016", name:"Green Tea",            price:185, category:"Beverages", unit:"25 bags", rating:4.7, image_url:"https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop", description:"Premium green tea bags for a calming, antioxidant-rich brew." },
  { id:"p017", name:"Sparkling Water",      price:99,  category:"Beverages", unit:"6 pack",  rating:4.4, image_url:"https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop", description:"Naturally carbonated mineral water with zero calories." },
  { id:"p018", name:"Cold Brew Coffee",     price:249, category:"Beverages", unit:"500ml",   rating:4.8, image_url:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop", description:"Smooth, bold cold brew concentrate — just add water or milk." },

  // Snacks
  { id:"p019", name:"Mixed Nuts",           price:349, category:"Snacks", unit:"250g",  rating:4.7, image_url:"https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop", description:"Roasted & lightly salted almonds, cashews, and pistachios." },
  { id:"p020", name:"Dark Chocolate Bar",   price:159, category:"Snacks", unit:"100g",  rating:4.9, image_url:"https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&h=300&fit=crop", description:"72% cacao single-origin dark chocolate — rich and smooth." },
  { id:"p021", name:"Tortilla Chips",       price:129, category:"Snacks", unit:"200g",  rating:4.5, image_url:"https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=300&fit=crop", description:"Crunchy corn tortilla chips, lightly salted." },
  { id:"p022", name:"Trail Mix",            price:225, category:"Snacks", unit:"200g",  rating:4.6, image_url:"https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop", description:"Energizing trail mix with nuts, seeds, and dried fruits." },

  // Pantry
  { id:"p023", name:"Extra Virgin Olive Oil", price:599, category:"Pantry", unit:"500ml", rating:4.8, image_url:"https://images.unsplash.com/photo-1474979266404-7eaabdf50494?w=400&h=300&fit=crop", description:"Cold-pressed Italian extra virgin olive oil." },
  { id:"p024", name:"Basmati Rice",         price:185, category:"Pantry", unit:"1 kg",   rating:4.7, image_url:"https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop", description:"Aged premium basmati rice — long grain, aromatic." },
  { id:"p025", name:"Organic Pasta",        price:149, category:"Pantry", unit:"500g",   rating:4.5, image_url:"https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=300&fit=crop", description:"Bronze-cut organic penne made with durum wheat." },
  { id:"p026", name:"Raw Honey",            price:399, category:"Pantry", unit:"350g",   rating:4.9, image_url:"https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop", description:"Unfiltered wildflower honey from Himalayan apiaries." },
  { id:"p027", name:"Canned Tomatoes",      price:89,  category:"Pantry", unit:"400g",   rating:4.6, image_url:"https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=300&fit=crop", description:"Whole peeled tomatoes in juice — perfect for sauces." },
  { id:"p028", name:"Peanut Butter",        price:279, category:"Pantry", unit:"400g",   rating:4.7, image_url:"https://images.unsplash.com/photo-1600850056064-a8b380df8395?w=400&h=300&fit=crop", description:"Creamy natural peanut butter — just peanuts and salt." },
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Drop existing tables
  await sql`DROP TABLE IF EXISTS order_items CASCADE`;
  await sql`DROP TABLE IF EXISTS orders CASCADE`;
  await sql`DROP TABLE IF EXISTS cart_items CASCADE`;
  await sql`DROP TABLE IF EXISTS products CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  console.log("  ✓ Dropped existing tables");

  // Create tables
  await sql`
    CREATE TABLE users (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      email       VARCHAR(255) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE products (
      id          VARCHAR(10) PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      price       DECIMAL(10,2) NOT NULL,
      category    VARCHAR(50) NOT NULL,
      image_url   TEXT NOT NULL,
      unit        VARCHAR(20) NOT NULL,
      description TEXT,
      in_stock    BOOLEAN DEFAULT TRUE,
      rating      DECIMAL(2,1)
    )`;

  await sql`
    CREATE TABLE cart_items (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id  VARCHAR(10) REFERENCES products(id),
      quantity    INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id)
    )`;

  await sql`
    CREATE TABLE orders (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     INTEGER REFERENCES users(id),
      total       DECIMAL(10,2) NOT NULL,
      total_items INTEGER NOT NULL,
      address     TEXT NOT NULL,
      status      VARCHAR(20) DEFAULT 'confirmed',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )`;

  await sql`
    CREATE TABLE order_items (
      id              SERIAL PRIMARY KEY,
      order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
      product_id      VARCHAR(10) REFERENCES products(id),
      product_name    VARCHAR(100) NOT NULL,
      price_at_order  DECIMAL(10,2) NOT NULL,
      quantity        INTEGER NOT NULL,
      subtotal        DECIMAL(10,2) NOT NULL
    )`;

  console.log("  ✓ Created all tables");

  // Seed products
  for (const p of products) {
    await sql`
      INSERT INTO products (id, name, price, category, image_url, unit, description, in_stock, rating)
      VALUES (${p.id}, ${p.name}, ${p.price}, ${p.category}, ${p.image_url}, ${p.unit}, ${p.description}, TRUE, ${p.rating})`;
  }
  console.log(`  ✓ Inserted ${products.length} products`);

  console.log("\n🎉 Database seeded successfully!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
