const API_URL = "https://expense-tracker-mzau.onrender.com"; // Backend URL

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

// ========== ENHANCED FETCH WRAPPER WITH CORS FIXES ==========
async function fetchWithCORS(url, options = {}) {
  // Add cache-busting parameter to prevent Cloudflare caching issues
  const cacheBuster = `t=${Date.now()}`;
  const separator = url.includes('?') ? '&' : '?';
  const fullUrl = `${API_URL}${url}${separator}${cacheBuster}`;

  try {
    console.log('Attempting request to:', fullUrl); // Debug log
    
    const response = await fetch(fullUrl, {
      ...options,
      credentials: 'include', // Required for CORS with credentials
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    });

    console.log('Response status:', response.status); // Debug log
    
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.response = response;
      throw error;
    }
    return response;
  } catch (error) {
    console.error('Fetch error details:', {
      url: fullUrl,
      error: error.toString(),
      stack: error.stack
    });
    showNotification('Network error occurred. Please try again.', 'error');
    throw error;
  }
}

// ========== APPLICATION INITIALIZATION ==========
window.onload = () => {
  displayCurrentDate();
  fetchExpenses();
};

function displayCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDate.textContent = new Date().toLocaleDateString('en-US', options);
}

// ========== FORM HANDLING ==========
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;

  // Validation
  if (!title || isNaN(amount)) {
    showNotification('Please enter valid title and amount', 'error');
    return;
  }

  try {
    const res = await fetchWithCORS('/api/expenses', {
      method: 'POST',
      body: JSON.stringify({ title, amount, category })
    });

    const newExpense = await res.json();
    addExpenseToDOM(newExpense);
    updateTotals();
    form.reset();
    showNotification('Expense added successfully!', 'success');
  } catch (error) {
    console.error('Submission error:', error);
  }
});

// ========== EXPENSE MANAGEMENT ==========
async function fetchExpenses() {
  try {
    const res = await fetchWithCORS('/api/expenses');
    const expenses = await res.json();
    renderExpenseList(expenses);
    updateTotals();
  } catch (error) {
    console.error('Loading error:', error);
    showNotification('Failed to load expenses', 'error');
  }
}

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

function filterExpensesByCategory(expenses) {
  const category = filterCategory.value;
  return category === 'all' 
    ? expenses 
    : expenses.filter(expense => expense.category === category);
}

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

async function deleteExpense(id) {
  try {
    await fetchWithCORS(`/api/expenses/${id}`, {
      method: 'DELETE'
    });
    fetchExpenses();
    showNotification('Expense deleted', 'success');
  } catch (error) {
    console.error('Deletion error:', error);
    showNotification('Failed to delete expense', 'error');
  }
}

// ========== TOTALS CALCULATION ==========
async function updateTotals() {
  try {
    const res = await fetchWithCORS('/api/expenses');
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

    // Animation
    totalDisplay.parentElement.classList.add('pulse');
    setTimeout(() => {
      totalDisplay.parentElement.classList.remove('pulse');
    }, 500);
  } catch (error) {
    console.error('Totals calculation error:', error);
  }
}

// ========== UI HELPERS ==========
function showNotification(message, type) {
  notification.textContent = message;
  notification.className = 'notification';
  notification.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Event listeners
filterCategory.addEventListener('change', fetchExpenses);

// Initial test connection
fetchWithCORS('/api/expenses')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => console.log('Initial connection successful', data))
  .catch(err => console.error('Initial connection failed:', err));