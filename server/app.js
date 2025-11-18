// server/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const expenseRoutes = require("./routes/expenses");

const app = express();

// ======================
// STRICT CORS CONFIG
// ======================
const allowedOrigins = [
  "https://gnanesh-expense-tracker.netlify.app",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
];

// FIX 1: CORS MUST RUN BEFORE ANY ROUTE
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// FIX 2: FORCE CORS HEADERS (Render sometimes removes them)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Body Parser
app.use(express.json());

// ======================
// ROUTES
// ======================
app.use("/api/expenses", expenseRoutes);

app.get("/", (req, res) => {
  res.send("Expense Tracker Backend Running");
});

// ======================
// DATABASE CONNECTION
// ======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✔"))
  .catch((err) => console.error("MongoDB Error ❌", err));

// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running ✔ on port ${PORT}`);
  console.log("Allowed Origins:", allowedOrigins.join(", "));
});
