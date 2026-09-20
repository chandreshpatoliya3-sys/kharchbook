
// ===== ELEMENT REFERENCES =====
const dashboardScreen = document.getElementById('dashboard-screen');
const addExpenseScreen = document.getElementById('add-expense-screen');
const listScreen = document.getElementById('list-screen');
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
const navStats = document.getElementById('nav-stats');
const statsScreen = document.getElementById('stats-screen');
const exportBtn = document.getElementById('export-btn'); 
const entryType = document.getElementById('entry-type');

// ===== CATEGORY EMOJIS =====
const CATEGORY_EMOJIS = {
  'Food': '🍕',
  'Travel': '🚗',
  'Shopping': '🛍️',
  'Bills': '🧾',
  'Medical': '💊',
  'Entertainment': '🎬',
  'Other': '📌'
};

// Helper: get the emoji for a category (falls back to a dot if unknown)
function getEmoji(category) {
  return CATEGORY_EMOJIS[category] || '•';
}

// Helper: older saved entries have no "type" — treat them as expenses
function getType(entry) {
  return entry.type || 'expense';
}

// Track which expense we're editing (null = adding a new one)
let editingId = null;

// ===== STORAGE FUNCTIONS =====
function loadExpenses() {
  const data = localStorage.getItem('kharchbook-expenses');
  return data ? JSON.parse(data) : [];
}

function saveExpenses(expenses) {
  try {
    localStorage.setItem('kharchbook-expenses', JSON.stringify(expenses));
  } catch (error) {
    alert('Something went wrong saving your data. Your device storage might be full.');
  }
}


// ===== SCREEN SWITCHING HELPERS =====
function showScreen(screen) {
  dashboardScreen.classList.add('hidden');
  addExpenseScreen.classList.add('hidden');
  listScreen.classList.add('hidden'); 
  statsScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

function setActiveNav(activeBtn) {
  navDashboard.classList.remove('active');
  navList.classList.remove('active');
  navStats.classList.remove('active');
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

navStats.addEventListener('click', function () {
  showScreen(statsScreen);
  setActiveNav(navStats);
  renderStatsChart();
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
  formTitle.textContent = 'Add Entry';
  deleteBtn.classList.add('hidden');
  expenseForm.reset();
  entryType.value = 'expense';
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
    type: entryType.value,
    amount: Number(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value,
    note: document.getElementById('note').value,
    paymentMethod: document.getElementById('payment-method').value
  };

  // ----- VALIDATION -----
  if (!formData.amount || formData.amount <= 0) {
    alert('Please enter a valid amount greater than ₹0.');
    return;
  }
  if (!formData.date) {
    alert('Please select a date.');
    return;
  }

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

// ===== DASHBOARD CALCULATIONS =====
function updateDashboardSummary() {
  const expenses = loadExpenses();
  const today = new Date();

  // Helper: convert a date string like "2026-09-16" into a real Date object
  function toDate(dateStr) {
    return new Date(dateStr + 'T00:00:00');
  }

  // ----- TODAY -----
  const todayStr = today.toISOString().split('T')[0]; // e.g. "2026-09-18"
  const todayTotal = expenses
    .filter(function (exp) { return exp.date === todayStr; })
    .reduce(function (sum, exp) { return sum + exp.amount; }, 0);

  // ----- THIS WEEK (last 7 days including today) -----
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const weekTotal = expenses
    .filter(function (exp) {
      const expDate = toDate(exp.date);
      return expDate >= sevenDaysAgo && expDate <= today;
    })
    .reduce(function (sum, exp) { return sum + exp.amount; }, 0);

  // ----- THIS MONTH -----
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthTotal = expenses
    .filter(function (exp) {
      const expDate = toDate(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    })
    .reduce(function (sum, exp) { return sum + exp.amount; }, 0);

  // ----- UPDATE THE CARDS ON SCREEN -----
  const cardAmounts = document.querySelectorAll('.card-amount');
  cardAmounts[0].textContent = '₹' + todayTotal;
  cardAmounts[1].textContent = '₹' + weekTotal;
  cardAmounts[2].textContent = '₹' + monthTotal;

  renderCategoryBreakdown(expenses);
}

// ===== CATEGORY-WISE BREAKDOWN =====
function renderCategoryBreakdown(expenses) {
  const container = document.getElementById('category-breakdown-container');

  if (expenses.length === 0) {
    container.innerHTML = '<p class="empty-text">No data yet.</p>';
    return;
  }

  // Build a totals object like { Food: 500, Travel: 200 }
  const totals = {};
  expenses.forEach(function (exp) {
    if (!totals[exp.category]) {
      totals[exp.category] = 0;
    }
    totals[exp.category] += exp.amount;
  });

  // Sort categories from highest spending to lowest
  const sortedCategories = Object.keys(totals).sort(function (a, b) {
    return totals[b] - totals[a];
  });

  let html = '';
  sortedCategories.forEach(function (cat) {
    html += `
      <div class="category-row">
        <span class="category-row-name">${getEmoji(cat)} ${cat}</span>
        <span class="category-row-amount">₹${totals[cat]}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ===== RENDER: DASHBOARD RECENT EXPENSES =====
function renderRecentExpenses() {
  updateDashboardSummary();
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

// ===== RENDER: FULL LIST SCREEN (with search + filters) =====
function renderFullList() {
  let expenses = loadExpenses();

  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm !== '') {
    expenses = expenses.filter(function (exp) {
      return exp.note && exp.note.toLowerCase().includes(searchTerm);
    });
  }

  const categoryValue = filterCategory.value;
  if (categoryValue !== '') {
    expenses = expenses.filter(function (exp) { return exp.category === categoryValue; });
  }

  const dateValue = filterDate.value;
  if (dateValue !== '') {
    expenses = expenses.filter(function (exp) { return exp.date === dateValue; });
  }

  if (expenses.length === 0) {
    listContainer.innerHTML = '<p class="empty-text">No matching expenses found.</p>';
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
        <p class="expense-category">${getEmoji(exp.category)} ${exp.category}</p>
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
// ===== STATISTICS BAR CHART =====
function renderStatsChart() {
  const expenses = loadExpenses();
  const container = document.getElementById('stats-chart-container');

  if (expenses.length === 0) {
    container.innerHTML = '<p class="empty-text">No data yet. Add some expenses first.</p>';
    return;
  }

  // Build totals per category, same idea as the dashboard breakdown
  const totals = {};
  expenses.forEach(function (exp) {
    if (!totals[exp.category]) {
      totals[exp.category] = 0;
    }
    totals[exp.category] += exp.amount;
  });

  const sortedCategories = Object.keys(totals).sort(function (a, b) {
    return totals[b] - totals[a];
  });

  // The highest amount becomes our "100% width" reference point
  const maxAmount = totals[sortedCategories[0]];

  let html = '';
  sortedCategories.forEach(function (cat) {
    const amount = totals[cat];
    const widthPercent = (amount / maxAmount) * 100;

    html += `
      <div class="stat-bar-row">
        <div class="stat-bar-label">
          <span class="stat-bar-category">${getEmoji(cat)} ${cat}</span>
          <span class="stat-bar-amount">₹${amount}</span>
        </div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="width: ${widthPercent}%"></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ===== EXPORT TO CSV =====
function exportToCSV() {
  const expenses = loadExpenses();

  if (expenses.length === 0) {
    alert('No expenses to export yet.');
    return;
  }

  // First row = column headers
  let csvContent = 'Date,Category,Amount,Payment Method,Note\n';

  // One row per expense
  expenses.forEach(function (exp) {
    // Wrap the note in quotes in case it contains a comma
    const safeNote = '"' + (exp.note || '').replace(/"/g, '""') + '"';
    csvContent += `${exp.date},${exp.category},${exp.amount},${exp.paymentMethod},${safeNote}\n`;
  });

  // Turn the text into a downloadable file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'kharchbook-export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

exportBtn.addEventListener('click', exportToCSV);

// ===== FILTER EVENT LISTENERS =====
// ===== FILTER EVENT LISTENERS =====
searchInput.addEventListener('input', renderFullList);
filterCategory.addEventListener('change', renderFullList);
filterDate.addEventListener('change', renderFullList);

clearFiltersBtn.addEventListener('click', function () {
  searchInput.value = '';
  filterCategory.value = '';
  filterDate.value = '';
  renderFullList();
});

// ===== INITIAL LOAD =====
renderRecentExpenses();
