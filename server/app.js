const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const expenseRoutes = require('./routes/expenses');

// Load environment variables from .env at project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// CORS middleware — MUST be before routes
app.use(cors({
  origin: [
    'https://gnanesh-expense-tracker.netlify.app', // your Netlify frontend URL
    'http://localhost:5000'                         // local dev URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Explicitly handle OPTIONS preflight requests for all routes
app.options('*', cors());

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
