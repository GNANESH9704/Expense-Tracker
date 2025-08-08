// server/models/Expense.js
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    default: 'Miscellaneous',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
