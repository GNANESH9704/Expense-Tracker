const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const expenseRoutes = require('./routes/expenses');
const cors = require('cors'); // Add this line at the top

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Optional request logger (can comment out after debugging)
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// CORS configuration - simpler and more reliable using the cors package
const corsOptions = {
  origin: 'https://gnanesh-expense-tracker.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Use cors middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// JSON body parser
app.use(express.json());

// Mount expense routes
app.use('/api/expenses', expenseRoutes);

// Global error handler (CORS headers will be automatically added by the cors middleware)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    // Include CORS headers in the response
    headers: {
      'Access-Control-Allow-Origin': 'https://gnanesh-expense-tracker.netlify.app',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});