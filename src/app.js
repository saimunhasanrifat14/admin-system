const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { GlobalErrorHandler } = require("./utilities/GlobalErrorHandler");

const app = express();
const apiVersion = process.env.BASE_URL;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.use(apiVersion, require("./routes/index"));


// Global Error Handler
app.use(GlobalErrorHandler);

module.exports = app;
