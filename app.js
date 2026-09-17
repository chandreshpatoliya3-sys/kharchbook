// ===== ELEMENT REFERENCES =====
const dashboardScreen = document.getElementById('dashboard-screen');
const addExpenseScreen = document.getElementById('add-expense-screen');
const listContainer = document.getElementById('expense-list-container');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');
const filterDate = document.getElementById('filter-date');
const clearFiltersBtn = document.getElementById('clear-filters-btn');

const addBtn = document.getElementById('add-btn');
const backBtn = document.getElementById('back-btn');
const expenseForm = document.getElementById('expense-form');
const formTitle = document.getElementById('form-title');
const deleteBtn = document.getElementById('delete-btn');

const navDashboard = document.getElementById('nav-dashboard');
const navList = document.getElementById('nav-list');

const listContainer = document.getElementById('expense-list-container');

// Track which expense we're editing (null = adding a new one)
let editingId = null;

// ===== STORAGE FUNCTIONS =====
function loadExpenses() {
  const data = localStorage.getItem('kharchbook-expenses');
  return data ? JSON.parse(data) : [];
}

function saveExpenses(expenses) {
  localStorage.setItem('kharchbook-expenses', JSON.stringify(expenses));
}

// ===== SCREEN SWITCHING HELPERS =====
function showScreen(screen) {
  dashboardScreen.classList.add('hidden');
  addExpenseScreen.classList.add('hidden');
  listScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

function setActiveNav(activeBtn) {
  navDashboard.classList.remove('active');
  navList.classList.remove('active');
  if (activeBtn) activeBtn.classList.add('active');
}

// ===== NAVIGATION =====
navDashboard.addEventListener('click', function () {
  showScreen(dashboardScreen);
  setActiveNav(navDashboard);
});

navList.addEventListener('click', function () {
  showScreen(listScreen);
  setActiveNav(navList);
  renderFullList();
});

addBtn.addEventListener('click', function () {
  openAddForm();
});

backBtn.addEventListener('click', function () {
  showScreen(dashboardScreen);
  setActiveNav(navDashboard);
});

// ===== OPEN FORM FOR ADDING =====
function openAddForm() {
  editingId = null;
  formTitle.textContent = 'Add Expense';
  deleteBtn.classList.add('hidden');
  expenseForm.reset();
  showScreen(addExpenseScreen);
  setActiveNav(null);
}

// ===== OPEN FORM FOR EDITING =====
function openEditForm(expense) {
  editingId = expense.id;
  formTitle.textContent = 'Edit Expense';
  deleteBtn.classList.remove('hidden');

  document.getElementById('amount').value = expense.amount;
  document.getElementById('category').value = expense.category;
  document.getElementById('date').value = expense.date;
  document.getElementById('note').value = expense.note;
  document.getElementById('payment-method').value = expense.paymentMethod;

  showScreen(addExpenseScreen);
  setActiveNav(null);
}

// ===== SAVE (ADD OR UPDATE) =====
expenseForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const expenses = loadExpenses();

  const formData = {
    amount: Number(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value,
    note: document.getElementById('note').value,
    paymentMethod: document.getElementById('payment-method').value
  };

  if (editingId === null) {
    formData.id = Date.now();
    expenses.push(formData);
  } else {
    const index = expenses.findIndex(function (exp) { return exp.id === editingId; });
    if (index !== -1) {
      formData.id = editingId;
      expenses[index] = formData;
    }
  }

  saveExpenses(expenses);
  alert('Expense saved!');
  expenseForm.reset();

  showScreen(dashboardScreen);
  setActiveNav(navDashboard);
  renderRecentExpenses();
});

// ===== DELETE =====
deleteBtn.addEventListener('click', function () {
  if (editingId === null) return;
  const confirmed = confirm('Delete this expense?');
  if (!confirmed) return;

  let expenses = loadExpenses();
  expenses = expenses.filter(function (exp) { return exp.id !== editingId; });
  saveExpenses(expenses);

  showScreen(dashboardScreen);
  setActiveNav(navDashboard);
  renderRecentExpenses();
});

// ===== RENDER: DASHBOARD RECENT EXPENSES =====
function renderRecentExpenses() {
  const expenses = loadExpenses();
  const container = document.querySelector('.recent-expenses');

  if (expenses.length === 0) {
    container.innerHTML = '<h2>Recent Expenses</h2><p class="empty-text">No expenses yet. Tap + to add one.</p>';
    return;
  }

  const recent = expenses.slice().reverse().slice(0, 5);
  let html = '<h2>Recent Expenses</h2>';
  recent.forEach(function (exp) { html += buildExpenseItemHTML(exp); });

  container.innerHTML = html;
  attachExpenseClickHandlers(container, expenses);
}

// ===== RENDER: FULL LIST SCREEN =====
function renderFullList() {
  const expenses = loadExpenses();

  if (expenses.length === 0) {
    listContainer.innerHTML = '<p class="empty-text">No expenses yet. Tap + to add one.</p>';
    return;
  }

  const sorted = expenses.slice().reverse();
  let html = '';
  sorted.forEach(function (exp) { html += buildExpenseItemHTML(exp); });

  listContainer.innerHTML = html;
  attachExpenseClickHandlers(listContainer, expenses);
}

// ===== SHARED HELPERS =====
function buildExpenseItemHTML(exp) {
  return `
    <div class="expense-item" data-id="${exp.id}">
      <div>
        <p class="expense-category">${exp.category}</p>
        <p class="expense-note">${exp.note || ''} • ${exp.date}</p>
      </div>
      <p class="expense-amount">₹${exp.amount}</p>
    </div>
  `;
}

function attachExpenseClickHandlers(container, expenses) {
  const items = container.querySelectorAll('.expense-item');
  items.forEach(function (item) {
    item.addEventListener('click', function () {
      const id = Number(item.getAttribute('data-id'));
      const expense = expenses.find(function (exp) { return exp.id === id; });
      if (expense) openEditForm(expense);
    });
  });
}

// ===== INITIAL LOAD =====
renderRecentExpenses();