const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const expenseRoutes = require('./routes/expenses');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// ✅ Global CORS middleware - must be FIRST
app.use(cors({
  origin: 'https://gnanesh-expense-tracker.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// ✅ Handle OPTIONS (preflight) for all routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://gnanesh-expense-tracker.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

// ✅ Parse JSON
app.use(express.json());

// ✅ API routes
app.use('/api/expenses', expenseRoutes);

// ✅ Fallback CORS for any unmatched routes or errors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://gnanesh-expense-tracker.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ DB Connection Error:', err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
