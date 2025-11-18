require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const expenseRoutes = require("./routes/expenses");

const app = express();

// ======================
// MIDDLEWARE
// ======================

// Allowed frontend URLs
const allowedOrigins = [
  "https://gnanesh-expense-tracker.netlify.app",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000"
];

// CORS OPTIONS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true
};

app.use(cors(corsOptions)); // MAIN CORS FIX

// Extra CORS headers (Render sometimes strips CORS)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://gnanesh-expense-tracker.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Body Parser
app.use(express.json());

// Routes
app.use("/api/expenses", expenseRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Expense Tracker Backend Works!");
});

// ============================
// DATABASE CONNECTION
// ============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ============================
// SERVER
// ============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed origins:", allowedOrigins.join(", "));
});
