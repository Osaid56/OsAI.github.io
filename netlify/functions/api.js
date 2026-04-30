/**
 * Netlify Serverless Function — wraps the Express API router.
 * All /api/* requests are redirected here via netlify.toml.
 */
const serverless = require("serverless-http");
const express = require("express");
const apiRouter = require("../../server/app");

const app = express();

/* Mount the shared router at the Netlify function path */
app.use("/.netlify/functions/api", apiRouter);

module.exports.handler = serverless(app);
