/**
 * Netlify Serverless Function — wraps the Express API router.
 * Redirects from /api/* arrive here as /.netlify/functions/api/*
 */
const serverless = require("serverless-http");
const express = require("express");
const apiRouter = require("../../server/app");

const app = express();

/* Mount at both paths to handle direct calls and redirects */
app.use("/.netlify/functions/api", apiRouter);
app.use("/api", apiRouter);
app.use("/", apiRouter);

module.exports.handler = serverless(app);
