const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const expenseRoutes = require('./routes/expenses');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// ========== ALLOWED ORIGINS ==========
const allowedOrigins = [
  'https://gnanesh-expense-tracker.netlify.app',
  'http://localhost:3000',
  'http://127.0.0.1:5500'
];

// ========== FIXED + CLEAN CORS CONFIGURATION ==========
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ========== ALWAYS APPLY HEADERS (Render cold start fix) ==========
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', allowedOrigins[0]); // Default to Netlify
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Explicit OPTIONS
app.options('*', cors());

// ========== EXISTING MIDDLEWARE ==========
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ========== ROUTES ==========
app.use('/api/expenses', expenseRoutes);

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  res.status(500).json({ error: 'Internal Server Error' });
});

// ========== DATABASE CONNECTION ==========
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ========== SERVER START ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
