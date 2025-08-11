const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const expenseRoutes = require('./routes/expenses');

// Load environment variables from .env at project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Manual CORS headers middleware — MUST be before routes
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

// Remove this line because you have manual CORS handling above
// app.options('*', cors());

// Parse incoming JSON bodies
app.use(express.json());

// Mount expense API routes
app.use('/api/expenses', expenseRoutes);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
