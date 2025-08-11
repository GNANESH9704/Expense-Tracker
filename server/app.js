const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const expenseRoutes = require('./routes/expenses');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Optional: Log every request (can comment out after debugging)
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// CORS middleware — MUST be before routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://gnanesh-expense-tracker.netlify.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Parse incoming JSON bodies
app.use(express.json());

// Mount expense API routes
app.use('/api/expenses', expenseRoutes);

// Global error handler to ensure CORS headers sent on error
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.setHeader('Access-Control-Allow-Origin', 'https://gnanesh-expense-tracker.netlify.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
