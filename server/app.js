const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const expenseRoutes = require('./routes/expenses');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
console.log("Environment:", process.env.NODE_ENV);

const app = express();

// ✅ Apply CORS for all routes & methods
app.use(cors({
  origin: 'https://gnanesh-expense-tracker.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ Parse JSON before routes
app.use(express.json());

// ✅ API routes
app.use('/api/expenses', expenseRoutes);

// ✅ Fallback CORS for errors and unknown routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://gnanesh-expense-tracker.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ✅ Serve frontend if in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, '../client');
  app.use(express.static(clientBuildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ DB Connection Error:', err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
