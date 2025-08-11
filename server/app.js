const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const expenseRoutes = require('./routes/expenses');
const cors = require('cors'); // ONLY NEW ADDITION

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// ONLY CORS CHANGES BELOW (replace your existing CORS middleware)
const corsOptions = {
  origin: 'https://gnanesh-expense-tracker.netlify.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight support

// KEEP EVERYTHING ELSE EXACTLY AS YOU HAD IT BELOW
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use('/api/expenses', expenseRoutes);

// Keep your existing error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});