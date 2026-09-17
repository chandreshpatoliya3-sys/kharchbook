// Grab references to the screens and buttons we'll control
const dashboardScreen = document.getElementById('dashboard-screen');
const addExpenseScreen = document.getElementById('add-expense-screen');
const addBtn = document.getElementById('add-btn');
const backBtn = document.getElementById('back-btn');
const expenseForm = document.getElementById('expense-form');

// ===== STORAGE FUNCTIONS =====

// Load the saved list of expenses from localStorage
// If nothing is saved yet, return an empty list
function loadExpenses() {
  const data = localStorage.getItem('kharchbook-expenses');
  if (data) {
    return JSON.parse(data); // turn the saved text back into a real list
  }
  return [];
}

// Save the current list of expenses into localStorage
function saveExpenses(expenses) {
  localStorage.setItem('kharchbook-expenses', JSON.stringify(expenses));
  // JSON.stringify turns our list into text, so localStorage can store it
}

// ===== SCREEN NAVIGATION =====

addBtn.addEventListener('click', function () {
  dashboardScreen.classList.add('hidden');
  addExpenseScreen.classList.remove('hidden');
});

backBtn.addEventListener('click', function () {
  addExpenseScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
});

// ===== SAVING A NEW EXPENSE =====

expenseForm.addEventListener('submit', function (event) {
  event.preventDefault(); // stop page from refreshing

  // Build one expense "box" from the form values
  const newExpense = {
    id: Date.now(), // a unique ID based on current time
    amount: Number(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value,
    note: document.getElementById('note').value,
    paymentMethod: document.getElementById('payment-method').value
  };

  // Load existing expenses, add the new one, save the whole list back
  const expenses = loadExpenses();
  expenses.push(newExpense);
  saveExpenses(expenses);

  alert('Expense saved!');
  expenseForm.reset();
  addExpenseScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');

  renderRecentExpenses(); // update the dashboard to show it
});

// ===== SHOWING RECENT EXPENSES ON DASHBOARD =====

function renderRecentExpenses() {
  const expenses = loadExpenses();
  const container = document.querySelector('.recent-expenses');

  if (expenses.length === 0) {
    container.innerHTML = '<h2>Recent Expenses</h2><p class="empty-text">No expenses yet. Tap + to add one.</p>';
    return;
  }

  // Show the most recent 5 expenses (newest first)
  const recent = expenses.slice().reverse().slice(0, 5);

  let html = '<h2>Recent Expenses</h2>';
  recent.forEach(function (exp) {
    html += `
      <div class="expense-item">
        <div>
          <p class="expense-category">${exp.category}</p>
          <p class="expense-note">${exp.note || ''}</p>
        </div>
        <p class="expense-amount">₹${exp.amount}</p>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Run this once when the app first loads, so saved expenses show up right away
renderRecentExpenses();