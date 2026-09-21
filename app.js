
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
const pinForgotBtn = document.getElementById('pin-forgot-btn');

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

// Convert stored "2026-09-21" into display "21-09-2026"
function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return parts[2] + '-' + parts[1] + '-' + parts[0];
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

// Tracks whether we've told the browser "we left Dashboard"
let hasPushedState = false;

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

  if (screen !== dashboardScreen) {
    if (!hasPushedState) {
      history.pushState({ kbScreen: true }, '');
      hasPushedState = true;
    }
  } else {
    hasPushedState = false;
  }
}

// Catches the phone's back button / back-swipe and keeps it inside
// the app (returns to Dashboard) instead of exiting.
window.addEventListener('popstate', function () {
  dashboardScreen.classList.remove('hidden');
  addExpenseScreen.classList.add('hidden');
  listScreen.classList.add('hidden');
  statsScreen.classList.add('hidden');
  setActiveNav(navDashboard);
  hasPushedState = false;
});

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
    const isDuplicate = expenses.some(function (exp) {
      return exp.date === formData.date &&
             exp.amount === formData.amount &&
             exp.category === formData.category &&
             getType(exp) === formData.type;
    });
    if (isDuplicate) {
      const proceed = confirm('This looks like a duplicate (same date, amount, category). Add anyway?');
      if (!proceed) return;
    }
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
  const label = getEmoji(exp.category) + ' ' + exp.category;

  return `
    <div class="expense-item-wrapper" data-id="${exp.id}">
      <div class="expense-item-delete-bg">🗑️ Delete</div>
      <div class="expense-item" data-id="${exp.id}">
        <div>
          <p class="expense-category">${label}</p>
                    <p class="expense-note">${exp.note || ''} • ${formatDate(exp.date)}</p>
        </div>
        <p class="expense-amount${incomeClass}">${sign}₹${exp.amount}</p>
      </div>
    </div>
  `;
}

function attachExpenseClickHandlers(container, expenses) {
  const wrappers = container.querySelectorAll('.expense-item-wrapper');
  wrappers.forEach(function (wrapper) {
    const item = wrapper.querySelector('.expense-item');
    const deleteBg = wrapper.querySelector('.expense-item-delete-bg');
    const id = Number(wrapper.getAttribute('data-id'));
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;

    item.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      isSwiping = false;
    });

    item.addEventListener('touchmove', function (e) {
      currentX = e.touches[0].clientX - startX;
      if (currentX < 0 && currentX > -90) {
        item.style.transform = 'translateX(' + currentX + 'px)';
        isSwiping = true;
      }
    });

    item.addEventListener('touchend', function () {
      item.style.transform = (currentX < -50) ? 'translateX(-80px)' : 'translateX(0)';
      currentX = 0;
    });

    deleteBg.addEventListener('click', function () {
      const confirmed = confirm('Delete this entry?');
      if (!confirmed) return;
      let allExpenses = loadExpenses();
      allExpenses = allExpenses.filter(function (exp) { return exp.id !== id; });
      saveExpenses(allExpenses);
      renderRecentExpenses();
      renderFullList();
    });

    item.addEventListener('click', function () {
      if (isSwiping) { isSwiping = false; return; }
      const expense = expenses.find(function (exp) { return exp.id === id; });
      if (expense) openEditForm(expense);
    });
  });
}
// ===== STATISTICS BAR CHART =====
function renderStatsChart() {
  renderTrendChart();
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

pinForgotBtn.addEventListener('click', function () {
  const confirmed = confirm('This removes the PIN lock. Your expenses are safe. Continue?');
  if (!confirmed) return;
  removePin();
  pinLockScreen.classList.add('hidden');
  pinInput.value = '';
  pinError.classList.add('hidden');
  if (typeof menuPinBtn !== 'undefined' && menuPinBtn) {
    menuPinBtn.textContent = '🔒 Set PIN Lock';
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

// ===== EXPORT STATS AS PDF (SVG-based so it prints reliably) =====
function exportStatsPDF() {
  const all = loadExpenses();
  const expenses = all.filter(function (e) { return getType(e) === 'expense'; });
  const incomes = all.filter(function (e) { return getType(e) === 'income'; });

  if (expenses.length === 0) {
    alert('No expense data to export yet.');
    return;
  }

  const today = new Date();
  function toDate(d) { return new Date(d + 'T00:00:00'); }
  function money(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

  const totalIncome = incomes.reduce(function (s, e) { return s + e.amount; }, 0);
  const totalSpent = expenses.reduce(function (s, e) { return s + e.amount; }, 0);
  const balance = totalIncome - totalSpent;

  // ---- Monthly comparison ----
  const thisM = today.getMonth(), thisY = today.getFullYear();
  let lastM = thisM - 1, lastY = thisY;
  if (lastM < 0) { lastM = 11; lastY = thisY - 1; }
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function monthTotal(m, y) {
    return expenses.filter(function (e) {
      const d = toDate(e.date);
      return d.getMonth() === m && d.getFullYear() === y;
    }).reduce(function (s, e) { return s + e.amount; }, 0);
  }
  const thisMonthTotal = monthTotal(thisM, thisY);
  const lastMonthTotal = monthTotal(lastM, lastY);
  const monthDiff = thisMonthTotal - lastMonthTotal;

  // ---- Category totals ----
  const totals = {};
  expenses.forEach(function (e) {
    if (!totals[e.category]) totals[e.category] = 0;
    totals[e.category] += e.amount;
  });
  const sortedCats = Object.keys(totals).sort(function (a, b) { return totals[b] - totals[a]; });

  // ---- Payment methods ----
  const payTotals = {};
  expenses.forEach(function (e) {
    const p = e.paymentMethod || 'Other';
    if (!payTotals[p]) payTotals[p] = 0;
    payTotals[p] += e.amount;
  });
  const sortedPays = Object.keys(payTotals).sort(function (a, b) { return payTotals[b] - payTotals[a]; });

  // ---- DONUT CHART as SVG (prints correctly, unlike conic-gradient) ----
  const R = 70, CX = 100, CY = 100, SW = 36;
  const CIRC = 2 * Math.PI * R;
  let offset = 0;
  let donutSegments = '';
  sortedCats.forEach(function (cat) {
    const frac = totals[cat] / totalSpent;
    const len = frac * CIRC;
    const color = CATEGORY_COLORS[cat] || '#9e9e9e';
    donutSegments += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${color}"
      stroke-width="${SW}" stroke-dasharray="${len} ${CIRC - len}"
      stroke-dashoffset="${-offset}" transform="rotate(-90 ${CX} ${CY})"></circle>`;
    offset += len;
  });

  const donutSVG = `
    <svg viewBox="0 0 200 200" width="190" height="190" xmlns="http://www.w3.org/2000/svg">
      ${donutSegments}
      <circle cx="${CX}" cy="${CY}" r="${R - SW / 2}" fill="#ffffff"></circle>
      <text x="${CX}" y="${CY - 4}" text-anchor="middle" font-size="11" fill="#8a8f98" font-family="Arial">TOTAL SPENT</text>
      <text x="${CX}" y="${CY + 16}" text-anchor="middle" font-size="19" font-weight="bold" fill="#1b5e20" font-family="Arial">${money(totalSpent)}</text>
    </svg>`;

  // ---- Category bars as SVG ----
  const maxCat = totals[sortedCats[0]] || 1;
  const ROW_H = 30;
  let catBars = '';
  sortedCats.forEach(function (cat, i) {
    const y = i * ROW_H;
    const w = (totals[cat] / maxCat) * 300;
    const color = CATEGORY_COLORS[cat] || '#9e9e9e';
    const pct = ((totals[cat] / totalSpent) * 100).toFixed(1);
    catBars += `
      <text x="0" y="${y + 13}" font-size="11" fill="#3c4149" font-family="Arial">${cat}</text>
      <rect x="0" y="${y + 18}" width="300" height="7" rx="3.5" fill="#eef0f3"></rect>
      <rect x="0" y="${y + 18}" width="${w}" height="7" rx="3.5" fill="${color}"></rect>
      <text x="420" y="${y + 13}" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="end" font-family="Arial">${money(totals[cat])}</text>
      <text x="420" y="${y + 26}" font-size="9" fill="#9aa0a8" text-anchor="end" font-family="Arial">${pct}%</text>`;
  });
  const catBarsSVG = `<svg viewBox="0 0 430 ${sortedCats.length * ROW_H}" width="100%" xmlns="http://www.w3.org/2000/svg">${catBars}</svg>`;

  // ---- Monthly comparison bars as SVG ----
  const maxM = Math.max(thisMonthTotal, lastMonthTotal, 1);
  const monthSVG = `
    <svg viewBox="0 0 430 78" width="100%" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="13" font-size="11" fill="#3c4149" font-family="Arial">${MONTH_NAMES[lastM]} ${lastY}</text>
      <rect x="0" y="19" width="300" height="12" rx="6" fill="#eef0f3"></rect>
      <rect x="0" y="19" width="${(lastMonthTotal / maxM) * 300}" height="12" rx="6" fill="#b0bec5"></rect>
      <text x="420" y="30" font-size="12" font-weight="bold" fill="#607d8b" text-anchor="end" font-family="Arial">${money(lastMonthTotal)}</text>

      <text x="0" y="57" font-size="11" fill="#3c4149" font-family="Arial">${MONTH_NAMES[thisM]} ${thisY}</text>
      <rect x="0" y="63" width="300" height="12" rx="6" fill="#eef0f3"></rect>
      <rect x="0" y="63" width="${(thisMonthTotal / maxM) * 300}" height="12" rx="6" fill="#2e7d32"></rect>
      <text x="420" y="74" font-size="12" font-weight="bold" fill="#1b5e20" text-anchor="end" font-family="Arial">${money(thisMonthTotal)}</text>
    </svg>`;

  // ---- Payment method bars ----
  const maxPay = payTotals[sortedPays[0]] || 1;
  const PAY_COLORS = { 'Cash': '#43a047', 'UPI': '#1e88e5', 'Card': '#8e24aa', 'Bank': '#fb8c00', 'Other': '#78909c' };
  let payBars = '';
  sortedPays.forEach(function (p, i) {
    const y = i * ROW_H;
    payBars += `
      <text x="0" y="${y + 13}" font-size="11" fill="#3c4149" font-family="Arial">${p}</text>
      <rect x="0" y="${y + 18}" width="300" height="7" rx="3.5" fill="#eef0f3"></rect>
      <rect x="0" y="${y + 18}" width="${(payTotals[p] / maxPay) * 300}" height="7" rx="3.5" fill="${PAY_COLORS[p] || '#78909c'}"></rect>
      <text x="420" y="${y + 16}" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="end" font-family="Arial">${money(payTotals[p])}</text>`;
  });
  const paySVG = `<svg viewBox="0 0 430 ${sortedPays.length * ROW_H}" width="100%" xmlns="http://www.w3.org/2000/svg">${payBars}</svg>`;

  // ---- Legend ----
  let legend = '';
  sortedCats.forEach(function (cat) {
    const color = CATEGORY_COLORS[cat] || '#9e9e9e';
    const pct = ((totals[cat] / totalSpent) * 100).toFixed(1);
    legend += `
      <div class="pdf-legend-item">
        <svg width="10" height="10"><circle cx="5" cy="5" r="5" fill="${color}"></circle></svg>
        <span>${cat}</span><b>${pct}%</b>
      </div>`;
  });

  const trendText = monthDiff === 0 ? 'Same as last month'
    : (monthDiff > 0 ? '▲ ' + money(Math.abs(monthDiff)) + ' more than last month'
                     : '▼ ' + money(Math.abs(monthDiff)) + ' less than last month');
  const trendClass = monthDiff > 0 ? 'pdf-trend-up' : 'pdf-trend-down';

  let area = document.getElementById('print-area');
  if (!area) {
    area = document.createElement('div');
    area.id = 'print-area';
    document.body.appendChild(area);
  }

  area.innerHTML = `
    <div class="pdf-report">
      <div class="pdf-hero">
        <svg class="pdf-hero-bg" viewBox="0 0 600 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="600" height="120" fill="#1b5e20"></rect>
          <circle cx="530" cy="20" r="80" fill="#2e7d32" opacity="0.55"></circle>
          <circle cx="590" cy="105" r="55" fill="#43a047" opacity="0.4"></circle>
        </svg>
        <div class="pdf-hero-text">
          <p class="pdf-hero-eyebrow">KHARCHBOOK</p>
          <h1 class="pdf-hero-title">Spending Report</h1>
          <p class="pdf-hero-date">Generated ${formatDate(today.toISOString().split('T')[0])}</p>
        </div>
      </div>

      <div class="pdf-kpis">
        <div class="pdf-kpi pdf-kpi-in">
          <span>Total Income</span><strong>${money(totalIncome)}</strong>
        </div>
        <div class="pdf-kpi pdf-kpi-out">
          <span>Total Spent</span><strong>${money(totalSpent)}</strong>
        </div>
        <div class="pdf-kpi ${balance >= 0 ? 'pdf-kpi-bal' : 'pdf-kpi-neg'}">
          <span>Balance</span><strong>${money(balance)}</strong>
        </div>
      </div>

      <div class="pdf-section">
        <h2 class="pdf-h2">Where Your Money Went</h2>
        <div class="pdf-donut-row">
          <div class="pdf-donut">${donutSVG}</div>
          <div class="pdf-legend">${legend}</div>
        </div>
      </div>

      <div class="pdf-section">
        <h2 class="pdf-h2">Category Breakdown</h2>
        ${catBarsSVG}
      </div>

      <div class="pdf-section pdf-avoid-break">
        <h2 class="pdf-h2">Month Comparison</h2>
        ${monthSVG}
        <p class="pdf-trend ${trendClass}">${trendText}</p>
      </div>

      <div class="pdf-section pdf-avoid-break">
        <h2 class="pdf-h2">Payment Methods</h2>
        ${paySVG}
      </div>

      <div class="pdf-meta">
        <div><span>Entries</span><b>${expenses.length}</b></div>
        <div><span>Categories</span><b>${sortedCats.length}</b></div>
        <div><span>Top Spend</span><b>${sortedCats[0]}</b></div>
        <div><span>Avg / Entry</span><b>${money(Math.round(totalSpent / expenses.length))}</b></div>
      </div>

      <p class="pdf-footer">Generated by KharchBook • Personal Expense Tracker</p>
    </div>
  `;

  document.body.classList.add('printing');
  setTimeout(function () {
    window.print();
    setTimeout(function () { document.body.classList.remove('printing'); }, 600);
  }, 150);
}

const exportPdfBtn = document.getElementById('export-pdf-btn');
if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportStatsPDF);

// ===== PERIOD SUMMARY (tap Today/Week/Month cards) =====

// Build the popup in JS so it can never be missing from the HTML
(function createPeriodModal() {
  const overlay = document.createElement('div');
  overlay.id = 'period-summary-overlay';
  overlay.className = 'period-overlay hidden';

  const modal = document.createElement('div');
  modal.id = 'period-summary-modal';
  modal.className = 'period-summary-modal hidden';
  modal.innerHTML = `
    <div class="period-summary-header">
      <h2 id="period-summary-title">Today</h2>
      <button id="period-summary-close" class="text-btn">✕</button>
    </div>
    <p class="period-summary-total" id="period-summary-total">₹0</p>
    <div id="period-summary-list"></div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  overlay.addEventListener('click', closePeriodSummary);
  modal.querySelector('#period-summary-close').addEventListener('click', closePeriodSummary);
})();

function openPeriodSummary(period) {
  const expenses = loadExpenses().filter(function (e) { return getType(e) === 'expense'; });
  const today = new Date();
  function toDate(dateStr) { return new Date(dateStr + 'T00:00:00'); }

  let filtered = [];
  let title = '';

  if (period === 'week') {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    filtered = expenses.filter(function (exp) {
      const d = toDate(exp.date);
      return d >= sevenDaysAgo && d <= today;
    });
    title = 'This Week';
  } else if (period === 'month') {
    const m = today.getMonth();
    const y = today.getFullYear();
    filtered = expenses.filter(function (exp) {
      const d = toDate(exp.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    title = 'This Month';
  } else {
    const todayStr = today.toISOString().split('T')[0];
    filtered = expenses.filter(function (exp) { return exp.date === todayStr; });
    title = 'Today';
  }

  const total = filtered.reduce(function (s, e) { return s + e.amount; }, 0);
  document.getElementById('period-summary-title').textContent = title;
  document.getElementById('period-summary-total').textContent = '₹' + total;

  const listEl = document.getElementById('period-summary-list');
  if (filtered.length === 0) {
    listEl.innerHTML = '<p class="empty-text">No expenses in this period.</p>';
  } else {
    let html = '';
    filtered.slice().reverse().forEach(function (exp) {
      html += `
        <div class="period-summary-row">
          <span>${getEmoji(exp.category)} ${exp.category}<br><small class="period-row-note">${exp.note || ''} ${formatDate(exp.date)}</small></span>
          <span class="period-row-amt">₹${exp.amount}</span>
        </div>
      `;
    });
    listEl.innerHTML = html;
  }

  document.getElementById('period-summary-overlay').classList.remove('hidden');
  document.getElementById('period-summary-modal').classList.remove('hidden');
}

function closePeriodSummary() {
  document.getElementById('period-summary-overlay').classList.add('hidden');
  document.getElementById('period-summary-modal').classList.add('hidden');
}

// Event delegation: works even if cards are re-rendered later
document.addEventListener('click', function (e) {
  const card = e.target.closest ? e.target.closest('.card') : null;
  if (card) {
    openPeriodSummary(card.getAttribute('data-period') || 'today');
  }
});

// ===== BUDGET TRACKER =====
function loadBudgets() {
  const data = localStorage.getItem('kharchbook-budgets');
  return data ? JSON.parse(data) : {};
}

function saveBudgets(budgets) {
  localStorage.setItem('kharchbook-budgets', JSON.stringify(budgets));
}

function renderBudgetTracker(monthExpenses) {
  const container = document.getElementById('budget-container');
  const budgets = loadBudgets();
  const budgetCats = Object.keys(budgets);

  if (budgetCats.length === 0) {
    container.innerHTML = '<p class="empty-text">No budgets set yet. Tap Edit to set one.</p>';
    return;
  }

  const monthTotals = {};
  monthExpenses.forEach(function (exp) {
    if (!monthTotals[exp.category]) monthTotals[exp.category] = 0;
    monthTotals[exp.category] += exp.amount;
  });

  let html = '';
  budgetCats.forEach(function (cat) {
    const limit = budgets[cat];
    const spent = monthTotals[cat] || 0;
    const percent = Math.min((spent / limit) * 100, 100);
    let barColor = '#2e7d32';
    if (percent >= 100) barColor = '#d32f2f';
    else if (percent >= 80) barColor = '#f9a825';

    html += `
      <div class="budget-row">
        <div class="budget-row-label">
          <span>${getEmoji(cat)} ${cat}</span>
          <span>₹${spent} / ₹${limit}</span>
        </div>
        <div class="budget-bar-track">
          <div class="budget-bar-fill" style="width:${percent}%; background:${barColor}"></div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

editBudgetBtn.addEventListener('click', function () {
  const budgets = loadBudgets();
  for (const cat of EXPENSE_CATEGORIES) {
    const current = budgets[cat] || '';
    const input = prompt('Monthly budget for ' + getEmoji(cat) + ' ' + cat + ' (₹, blank = no limit):', current);
    if (input === null) break;
    if (input.trim() === '') {
      delete budgets[cat];
    } else {
      const num = Number(input);
      if (!isNaN(num) && num > 0) budgets[cat] = num;
    }
  }
  saveBudgets(budgets);
  updateDashboardSummary();
});

// ===== SPENDING TREND =====
function renderTrendChart() {
  const expenses = loadExpenses().filter(function (e) { return getType(e) === 'expense'; });
  const container = document.getElementById('trend-chart-container');
  if (!container) return;

  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  let lastMonth = thisMonth - 1;
  let lastMonthYear = thisYear;
  if (lastMonth < 0) { lastMonth = 11; lastMonthYear = thisYear - 1; }

  function toDate(dateStr) { return new Date(dateStr + 'T00:00:00'); }

  const thisMonthTotal = expenses.filter(function (exp) {
    const d = toDate(exp.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).reduce(function (s, e) { return s + e.amount; }, 0);

  const lastMonthTotal = expenses.filter(function (exp) {
    const d = toDate(exp.date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  }).reduce(function (s, e) { return s + e.amount; }, 0);

  const maxVal = Math.max(thisMonthTotal, lastMonthTotal, 1);

  container.innerHTML = `
    <div class="trend-row">
      <div class="trend-label">Last Month</div>
      <div class="trend-bar-track"><div class="trend-bar-fill" style="width:${(lastMonthTotal / maxVal) * 100}%"></div></div>
      <div class="trend-amount">₹${lastMonthTotal}</div>
    </div>
    <div class="trend-row">
      <div class="trend-label">This Month</div>
      <div class="trend-bar-track"><div class="trend-bar-fill current" style="width:${(thisMonthTotal / maxVal) * 100}%"></div></div>
      <div class="trend-amount">₹${thisMonthTotal}</div>
    </div>
  `;
}

// ===== QUICK ADD =====
function renderQuickAddButtons() {
  const container = document.getElementById('quick-add-row');
  if (!container) return;

  let html = '';
  EXPENSE_CATEGORIES.forEach(function (cat) {
    html += `<button class="quick-add-btn" data-cat="${cat}">${getEmoji(cat)}<br>${cat}</button>`;
  });
  container.innerHTML = html;

  container.querySelectorAll('.quick-add-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const cat = btn.getAttribute('data-cat');
      const amountStr = prompt('Amount for ' + getEmoji(cat) + ' ' + cat + ' (₹):');
      if (amountStr === null) return;
      const amount = Number(amountStr);
      if (!amount || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      const newEntry = {
        type: 'expense', amount: amount, category: cat,
        date: today, note: '', paymentMethod: 'Cash', id: Date.now()
      };
      const allExpenses = loadExpenses();
      allExpenses.push(newEntry);
      saveExpenses(allExpenses);
      renderRecentExpenses();
    });
  });
}


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
renderQuickAddButtons();
renderRecentExpenses();
