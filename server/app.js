const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const expenseRoutes = require('./routes/expenses');

// ✅ Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ✅ Debug log
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
console.log("Environment:", process.env.NODE_ENV);

const app = express();

const cors = require("cors");

app.use(cors({
  origin: "https://gnanesh-expense-tracker.netlify.app", // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ Parse incoming JSON
app.use(express.json());

// ✅ API routes
app.use('/api/expenses', expenseRoutes);

// ✅ Serve frontend if in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, '../client');
  app.use(express.static(clientBuildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// ✅ Connect to MongoDB
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
