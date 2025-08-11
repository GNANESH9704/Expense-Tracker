const API_URL = "https://expense-tracker-mzau.onrender.com";

// Debug log to confirm URL
console.log("Backend API:", `${API_URL}/api/expenses`);

// DOM elements
const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total');
const foodTotal = document.getElementById('food-total');
const shoppingTotal = document.getElementById('shopping-total');
const transportTotal = document.getElementById('transport-total');
const filterCategory = document.getElementById('filter-category');
const currentDate = document.getElementById('current-date');
const notification = document.getElementById('notification');

// Initialize app
window.onload = () => {
  displayCurrentDate();
  fetchExpenses();
};

// Display current date
function displayCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDate.textContent = new Date().toLocaleDateString('en-US', options);
}

// Enhanced fetch wrapper with CORS handling
async function fetchWithCORS(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      // Remove credentials if not using cookies or sessions on backend
      // credentials: 'include',
      headers: {
        ...(options.headers || {}),
        'Content-Type': 'application/json',
      },
      mode: 'cors' // Explicitly request CORS mode
    });

    // Check if CORS headers are present
    const corsHeaders = response.headers.get('Access-Control-Allow-Origin');
    if (!corsHeaders) {
      console.warn('CORS headers missing in response');
    }

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = response;
      throw error;
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    showNotification('Network error occurred', 'error');
    throw error;
  }
}

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;

  if (!title || !amount || !category) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  const data = { title, amount, category };

  try {
    const res = await fetchWithCORS(`${API_URL}/api/expenses`, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const newExpense = await res.json();
    addExpenseToDOM(newExpense);
    updateTotals();
    form.reset();
    showNotification('Expense added successfully', 'success');
  } catch (error) {
    console.error('Error:', error);
    showNotification(error.response?.status === 401 
      ? 'Authentication required' 
      : 'Failed to add expense', 'error');
  }
});

// Fetch expenses
async function fetchExpenses() {
  try {
    const res = await fetchWithCORS(`${API_URL}/api/expenses`);
    const expenses = await res.json();
    renderExpenseList(expenses);
    updateTotals();
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to load expenses', 'error');
  }
}

// Render expense list
function renderExpenseList(expenses) {
  list.innerHTML = '';

  if (expenses.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-receipt"></i>
        <p>No expenses added yet</p>
      </div>
    `;
    return;
  }

  const filteredExpenses = filterExpensesByCategory(expenses);
  filteredExpenses.forEach(addExpenseToDOM);
}

// Filter expenses by category
function filterExpensesByCategory(expenses) {
  const category = filterCategory.value;
  return category === 'all'
    ? expenses
    : expenses.filter(expense => expense.category === category);
}

// Add expense to DOM
function addExpenseToDOM(expense) {
  const emptyState = document.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const card = document.createElement('div');
  card.className = 'expense-card';
  card.innerHTML = `
    <div class="expense-info">
      <div class="expense-title">${expense.title}</div>
      <div class="expense-meta">
        <span class="category-badge category-${expense.category}">${expense.category}</span>
        <span>${new Date(expense.date || Date.now()).toLocaleDateString()}</span>
      </div>
    </div>
    <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
    <button class="delete-btn" onclick="deleteExpense('${expense._id}')">
      <i class="fas fa-trash-alt"></i>
    </button>
  `;
  list.appendChild(card);
}

// Delete expense
async function deleteExpense(id) {
  try {
    const res = await fetchWithCORS(`${API_URL}/api/expenses/${id}`, {
      method: 'DELETE'
    });

    fetchExpenses();
    showNotification('Expense deleted', 'success');
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to delete expense', 'error');
  }
}

// Update totals
async function updateTotals() {
  try {
    const res = await fetchWithCORS(`${API_URL}/api/expenses`);
    const expenses = await res.json();

    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const foodTotalAmount = expenses
      .filter(e => e.category === 'Food')
      .reduce((sum, item) => sum + item.amount, 0);
    const shoppingTotalAmount = expenses
      .filter(e => e.category === 'Shopping')
      .reduce((sum, item) => sum + item.amount, 0);
    const transportTotalAmount = expenses
      .filter(e => e.category === 'Transport')
      .reduce((sum, item) => sum + item.amount, 0);

    totalDisplay.textContent = total.toFixed(2);
    foodTotal.textContent = `₹${foodTotalAmount.toFixed(2)}`;
    shoppingTotal.textContent = `₹${shoppingTotalAmount.toFixed(2)}`;
    transportTotal.textContent = `₹${transportTotalAmount.toFixed(2)}`;

    totalDisplay.parentElement.classList.add('pulse');
    setTimeout(() => {
      totalDisplay.parentElement.classList.remove('pulse');
    }, 500);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Filter category change
filterCategory.addEventListener('change', fetchExpenses);

// Show notification
function showNotification(message, type) {
  notification.textContent = message;
  notification.className = 'notification';

  if (type === 'success') {
    notification.style.backgroundColor = '#4caf50';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#f44336';
  }

  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}
