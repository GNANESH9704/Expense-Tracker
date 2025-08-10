const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const expenseRoutes = require('./routes/expenses');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// ✅ Enhanced CORS configuration
const corsOptions = {
  origin: 'https://gnanesh-expense-tracker.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// ✅ Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Explicit OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// ✅ Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API routes
app.use('/api/expenses', expenseRoutes);

// ✅ Error handling middleware with CORS headers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.header('Access-Control-Allow-Origin', 'https://gnanesh-expense-tracker.netlify.app');
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ 404 handler with CORS headers
app.use((req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://gnanesh-expense-tracker.netlify.app');
  res.status(404).json({ error: 'Not found' });
});

// ✅ MongoDB connection with improved configuration
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// ✅ Server startup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') throw error;
  console.error('❌ Server Error:', error);
});