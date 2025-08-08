// server/controllers/expenseController.js
const Expense = require('../models/Expense');

// GET all expenses
exports.getExpenses = async (req, res) => {
  const expenses = await Expense.find().sort({ date: -1 });
  res.json(expenses);
};

// POST new expense
exports.addExpense = async (req, res) => {
  const { title, amount, category } = req.body;
  const expense = new Expense({ title, amount, category });
  await expense.save();
  res.json(expense);
};

// DELETE an expense
exports.deleteExpense = async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: 'Expense deleted' });
};
