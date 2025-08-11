const Expense = require('../models/Expense');

// GET all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('Error getting expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// POST new expense
exports.addExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    if (!title || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense = new Expense({ title, amount, category });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

// DELETE an expense
exports.deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
