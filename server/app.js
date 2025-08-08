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

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/expenses', expenseRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ DB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
