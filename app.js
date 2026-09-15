// Grab references to the screens and buttons we'll control
const dashboardScreen = document.getElementById('dashboard-screen');
const addExpenseScreen = document.getElementById('add-expense-screen');
const addBtn = document.getElementById('add-btn');
const backBtn = document.getElementById('back-btn');
const expenseForm = document.getElementById('expense-form');

// When the + button is tapped, show Add Expense screen
addBtn.addEventListener('click', function () {
  dashboardScreen.classList.add('hidden');
  addExpenseScreen.classList.remove('hidden');
});

// When the Back button is tapped, go back to Dashboard
backBtn.addEventListener('click', function () {
  addExpenseScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
});

// When the form is submitted (Save Expense tapped)
expenseForm.addEventListener('submit', function (event) {
  event.preventDefault(); // stops the page from refreshing
  alert('Expense saved! (We will actually store this in the next step)');
  expenseForm.reset();
  addExpenseScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
});
