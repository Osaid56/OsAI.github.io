/**
 * Local development server — imports the shared router and serves static files.
 */
require("dotenv").config();
const express = require("express");
const path = require("path");
const apiRouter = require("./app");

const app = express();
const PORT = process.env.PORT || 3000;

/* Static files */
app.use(express.static(path.join(__dirname, "..", "public")));

/* Mount API at /api */
app.use("/api", apiRouter);

/* SPA fallback */
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n  🛒  Osaid Mart is running at  http://localhost:${PORT}\n`);
});
