
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
const editBudgetBtn = document.getElementById('edit-budget-btn');

const menuBtn = document.getElementById('menu-btn');
const sideMenu = document.getElementById('side-menu');
const sideMenuOverlay = document.getElementById('side-menu-overlay');
const sideMenuProfile = document.getElementById('side-menu-profile');
const sideMenuName = document.getElementById('side-menu-name');
const sideMenuEmail = document.getElementById('side-menu-email');
const menuShareBtn = document.getElementById('menu-share-btn');
const menuRateBtn = document.getElementById('menu-rate-btn');
const menuLogoutBtn = document.getElementById('menu-logout-btn');
const menuExitBtn = document.getElementById('menu-exit-btn');
const menuDarkModeBtn = document.getElementById('menu-darkmode-btn');
const menuPinBtn = document.getElementById('menu-pin-btn');
const pinLockScreen = document.getElementById('pin-lock-screen');
const pinInput = document.getElementById('pin-input');
const pinUnlockBtn = document.getElementById('pin-unlock-btn');
const pinError = document.getElementById('pin-error');

// ===== CATEGORIES =====
const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Medical', 'Entertainment', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Sell', 'Other'];

const CATEGORY_EMOJIS = {
  'Food': '🍕',
  'Travel': '🚗',
  'Shopping': '🛍️',
  'Bills': '🧾',
  'Medical': '💊',
  'Entertainment': '🎬',
  'Salary': '💵',
  'Sell': '🏷️',
  'Other': '📌'
};

function getEmoji(category) {
  return CATEGORY_EMOJIS[category] || '•';
}

function getType(entry) {
  return entry.type || 'expense';
}

// Swap the category dropdown's options based on selected Type
function updateCategoryOptions() {
  const categorySelect = document.getElementById('category');
  const list = entryType.value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  categorySelect.innerHTML = list.map(function (cat) {
    return '<option value="' + cat + '">' + getEmoji(cat) + ' ' + cat + '</option>';
  }).join('');
}

entryType.addEventListener('change', updateCategoryOptions);

// ===== CATEGORY COLORS (for pie chart) =====
const CATEGORY_COLORS = {
  'Food': '#ff7043',
  'Travel': '#29b6f6',
  'Shopping': '#ab47bc',
  'Bills': '#ffa726',
  'Medical': '#ef5350',
  'Entertainment': '#66bb6a',
  'Other': '#78909c'
};

// ===== PIE CHART =====
function renderPieChart(expenses) {
  const container = document.getElementById('pie-chart-container');
  if (expenses.length === 0) {
    container.innerHTML = '';
    return;
  }

  const totals = {};
  expenses.forEach(function (exp) {
    if (!totals[exp.category]) totals[exp.category] = 0;
    totals[exp.category] += exp.amount;
  });

  const grandTotal = Object.values(totals).reduce(function (s, v) { return s + v; }, 0);
  const sortedCategories = Object.keys(totals).sort(function (a, b) { return totals[b] - totals[a]; });

  let cumulative = 0;
  const gradientParts = [];
  sortedCategories.forEach(function (cat) {
    const percent = (totals[cat] / grandTotal) * 100;
    const color = CATEGORY_COLORS[cat] || '#999';
    gradientParts.push(color + ' ' + cumulative + '% ' + (cumulative + percent) + '%');
    cumulative += percent;
  });
  const gradientCSS = 'conic-gradient(' + gradientParts.join(', ') + ')';

  let legendHTML = '';
  sortedCategories.forEach(function (cat) {
    const percent = ((totals[cat] / grandTotal) * 100).toFixed(1);
    const color = CATEGORY_COLORS[cat] || '#999';
    legendHTML += `
      <div class="pie-legend-row">
        <span class="pie-legend-dot" style="background:${color}"></span>
        <span class="pie-legend-label">${getEmoji(cat)} ${cat}</span>
        <span class="pie-legend-percent">${percent}%</span>
      </div>
    `;
  });

  container.innerHTML = '<div class="pie-chart" style="background:' + gradientCSS + '"></div><div class="pie-legend">' + legendHTML + '</div>';
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
  updateCategoryOptions();
  showScreen(addExpenseScreen);
  setActiveNav(null);
}

// ===== OPEN FORM FOR EDITING =====
function openEditForm(expense) {
  editingId = expense.id;
  formTitle.textContent = 'Edit Entry';
  deleteBtn.classList.remove('hidden');

  entryType.value = getType(expense);
  updateCategoryOptions();
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
  const allEntries = loadExpenses();
  const expenses = allEntries.filter(function (e) { return getType(e) === 'expense'; });
  const incomes = allEntries.filter(function (e) { return getType(e) === 'income'; });
  const today = new Date();

  // ----- BALANCE -----
  const totalIncome = incomes.reduce(function (sum, e) { return sum + e.amount; }, 0);
  const totalSpent = expenses.reduce(function (sum, e) { return sum + e.amount; }, 0);
  const balance = totalIncome - totalSpent;

  document.getElementById('balance-amount').textContent = '₹' + balance;
  document.getElementById('balance-sub').textContent =
    'Income ₹' + totalIncome + ' − Spent ₹' + totalSpent;

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

      const monthExpenses = expenses.filter(function (exp) {
    const expDate = toDate(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });
  const monthTotal = monthExpenses.reduce(function (sum, exp) { return sum + exp.amount; }, 0);

  // ----- UPDATE THE CARDS ON SCREEN -----
  const cardAmounts = document.querySelectorAll('.card-amount');
  cardAmounts[0].textContent = '₹' + todayTotal;
  cardAmounts[1].textContent = '₹' + weekTotal;
  cardAmounts[2].textContent = '₹' + monthTotal;

  renderCategoryBreakdown(expenses);
  renderBudgetTracker(monthExpenses);
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
  const isIncome = getType(exp) === 'income';
  const sign = isIncome ? '+' : '−';
  const incomeClass = isIncome ? ' income' : '';
  const label = isIncome ? '💰 Income' : getEmoji(exp.category) + ' ' + exp.category;

  return `
    <div class="expense-item" data-id="${exp.id}">
      <div>
        <p class="expense-category">${label}</p>
        <p class="expense-note">${exp.note || ''} • ${exp.date}</p>
      </div>
      <p class="expense-amount${incomeClass}">${sign}₹${exp.amount}</p>
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
  const expenses = loadExpenses().filter(function (e) { return getType(e) === 'expense'; });
  renderPieChart(expenses);
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
    let csvContent = 'Date,Type,Category,Amount,Payment Method,Note\n';

  expenses.forEach(function (exp) {
    const safeNote = '"' + (exp.note || '').replace(/"/g, '""') + '"';
    csvContent += `${exp.date},${getType(exp)},${exp.category},${exp.amount},${exp.paymentMethod},${safeNote}\n`;
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

// ===== SIDE MENU =====

// Load/save a simple local profile (name + email only, no password)
function loadProfile() {
  const data = localStorage.getItem('kharchbook-profile');
  return data ? JSON.parse(data) : { name: '', email: '' };
}

function saveProfile(profile) {
  localStorage.setItem('kharchbook-profile', JSON.stringify(profile));
}

function renderProfile() {
  const profile = loadProfile();
  sideMenuName.textContent = profile.name ? profile.name : 'Tap to set your name';
  sideMenuEmail.textContent = profile.email ? profile.email : 'Tap to add email';
}

function openSideMenu() {
  renderProfile();
  sideMenu.classList.remove('hidden');
  sideMenuOverlay.classList.remove('hidden');
}

function closeSideMenu() {
  sideMenu.classList.add('hidden');
  sideMenuOverlay.classList.add('hidden');
}

menuBtn.addEventListener('click', openSideMenu);
sideMenuOverlay.addEventListener('click', closeSideMenu);

// Tap the profile area to edit name/email
sideMenuProfile.addEventListener('click', function () {
  const profile = loadProfile();
  const newName = prompt('Your name:', profile.name);
  if (newName === null) return; // user cancelled
  const newEmail = prompt('Your email (optional):', profile.email);

  saveProfile({ name: newName.trim(), email: (newEmail || '').trim() });
  renderProfile();
});

// Share the app link
menuShareBtn.addEventListener('click', function () {
  const appUrl = window.location.href;
  if (navigator.share) {
    navigator.share({ title: 'KharchBook', text: 'Track your expenses with KharchBook!', url: appUrl });
  } else {
    navigator.clipboard.writeText(appUrl);
    alert('App link copied! Share it with anyone.');
  }
});

// Rate the app (placeholder until published on Play Store)
menuRateBtn.addEventListener('click', function () {
  alert('Thanks for wanting to rate KharchBook! Once it\'s on the Play Store, this button will take you there.');
});

// Reset local profile (our version of "logout" since there's no real account)
menuLogoutBtn.addEventListener('click', function () {
  const confirmed = confirm('Reset your profile name and email? (Your expenses will NOT be deleted.)');
  if (!confirmed) return;
  saveProfile({ name: '', email: '' });
  renderProfile();
  closeSideMenu();
});

// Exit the app
menuExitBtn.addEventListener('click', function () {
  window.close();
  setTimeout(function () {
    alert('Your browser doesn\'t allow apps to close themselves. You can close this tab manually.');
  }, 300);
});

// ===== DARK MODE =====
function loadDarkModePref() {
  return localStorage.getItem('kharchbook-darkmode') === 'true';
}

function applyDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    menuDarkModeBtn.textContent = '☀️ Light Mode';
  } else {
    document.body.classList.remove('dark-mode');
    menuDarkModeBtn.textContent = '🌙 Dark Mode';
  }
}

menuDarkModeBtn.addEventListener('click', function () {
  const isDark = !document.body.classList.contains('dark-mode');
  localStorage.setItem('kharchbook-darkmode', isDark);
  applyDarkMode(isDark);
});

// ===== PIN LOCK =====
function loadPin() {
  return localStorage.getItem('kharchbook-pin');
}

function savePin(pin) {
  localStorage.setItem('kharchbook-pin', pin);
}

function removePin() {
  localStorage.removeItem('kharchbook-pin');
}

function checkPinLock() {
  if (loadPin()) {
    pinLockScreen.classList.remove('hidden');
  } else {
    pinLockScreen.classList.add('hidden');
  }
}

pinUnlockBtn.addEventListener('click', function () {
  if (pinInput.value === loadPin()) {
    pinLockScreen.classList.add('hidden');
    pinInput.value = '';
    pinError.classList.add('hidden');
  } else {
    pinError.classList.remove('hidden');
  }
});

menuPinBtn.addEventListener('click', function () {
  const savedPin = loadPin();
  if (savedPin) {
    const entered = prompt('Enter current PIN to remove lock:');
    if (entered === savedPin) {
      removePin();
      alert('PIN lock removed.');
      menuPinBtn.textContent = '🔒 Set PIN Lock';
    } else if (entered !== null) {
      alert('Incorrect PIN.');
    }
  } else {
    const newPin = prompt('Set a 4-digit PIN:');
    if (newPin === null) return;
    if (!/^\d{4}$/.test(newPin)) {
      alert('PIN must be exactly 4 digits.');
      return;
    }
    savePin(newPin);
    alert('PIN lock enabled!');
    menuPinBtn.textContent = '🔓 Remove PIN Lock';
    closeSideMenu();
  }
});

// ===== FILTER EVENT LISTENERS =====

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
applyDarkMode(loadDarkModePref());
if (loadPin()) { menuPinBtn.textContent = '🔓 Remove PIN Lock'; }
checkPinLock();
renderRecentExpenses();
