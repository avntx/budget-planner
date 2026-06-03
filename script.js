const defaultCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Driving",
  "Beauty & Wellness",
  "Insurance",
  "Outings",
  "Travel"
];

let categories = JSON.parse(localStorage.getItem("categories")) || defaultCategories;

let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;
let savingsGoal = Number(localStorage.getItem("savingsGoal")) || 0;
let categoryBudgets = JSON.parse(localStorage.getItem("categoryBudgets")) || {};
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

const monthlyBudgetInput = document.getElementById("monthlyBudget");
const savingsGoalInput = document.getElementById("savingsGoal");
const newCategoryInput = document.getElementById("newCategoryInput");

const budgetDisplay = document.getElementById("budgetDisplay");
const spentDisplay = document.getElementById("spentDisplay");
const leftDisplay = document.getElementById("leftDisplay");
const safeSpendDisplay = document.getElementById("safeSpendDisplay");

const categoryBudgetInputs = document.getElementById("categoryBudgetInputs");
const expenseCategory = document.getElementById("expenseCategory");
const categoryTracker = document.getElementById("categoryTracker");
const expenseList = document.getElementById("expenseList");
const categoryList = document.getElementById("categoryList");

function initialiseApp() {
  monthlyBudgetInput.value = monthlyBudget || "";
  savingsGoalInput.value = savingsGoal || "";

  renderCategories();
  updateDashboard();
}

function renderCategories() {
  categoryBudgetInputs.innerHTML = "";
  expenseCategory.innerHTML = "";
  categoryList.innerHTML = "";

  categories.forEach(category => {
    categoryBudgetInputs.innerHTML += `
      <div class="category-box">
        <label>${category}</label>
        <input 
          type="number" 
          id="budget-${category}" 
          placeholder="Budget for ${category}"
          value="${categoryBudgets[category] || ""}"
        />
      </div>
    `;

    expenseCategory.innerHTML += `
      <option value="${category}">${category}</option>
    `;

    categoryList.innerHTML += `
      <div class="category-pill">
        <span>${category}</span>
        <button class="remove-category-btn" onclick="removeCategory('${category}')">x</button>
      </div>
    `;
  });
}

function addCategory() {
  const newCategory = newCategoryInput.value.trim();

  if (newCategory === "") {
    alert("Please enter a category name.");
    return;
  }

  const alreadyExists = categories.some(
    category => category.toLowerCase() === newCategory.toLowerCase()
  );

  if (alreadyExists) {
    alert("This category already exists.");
    return;
  }

  categories.push(newCategory);
  localStorage.setItem("categories", JSON.stringify(categories));

  newCategoryInput.value = "";
  renderCategories();
  updateDashboard();
}

function removeCategory(categoryToRemove) {
  const hasExpenses = expenses.some(expense => expense.category === categoryToRemove);

  if (hasExpenses) {
    const confirmRemove = confirm(
      `This category has expenses. Removing it will delete those expenses too. Continue?`
    );

    if (!confirmRemove) return;

    expenses = expenses.filter(expense => expense.category !== categoryToRemove);
  }

  categories = categories.filter(category => category !== categoryToRemove);

  delete categoryBudgets[categoryToRemove];

  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("categoryBudgets", JSON.stringify(categoryBudgets));
  localStorage.setItem("expenses", JSON.stringify(expenses));

  renderCategories();
  updateDashboard();
}

function saveMonthlyBudget() {
  monthlyBudget = Number(monthlyBudgetInput.value);

  if (monthlyBudget <= 0) {
    alert("Please enter a valid monthly budget.");
    return;
  }

  localStorage.setItem("monthlyBudget", monthlyBudget);
  updateDashboard();
}

function saveSavingsGoal() {
  savingsGoal = Number(savingsGoalInput.value);

  if (savingsGoal < 0) {
    alert("Please enter a valid savings goal.");
    return;
  }

  localStorage.setItem("savingsGoal", savingsGoal);
  updateDashboard();
}

function saveCategoryBudgets() {
  categories.forEach(category => {
    const input = document.getElementById(`budget-${category}`);
    categoryBudgets[category] = Number(input.value) || 0;
  });

  localStorage.setItem("categoryBudgets", JSON.stringify(categoryBudgets));
  updateDashboard();
}

function addExpense() {
  const category = document.getElementById("expenseCategory").value;
  const amount = Number(document.getElementById("expenseAmount").value);
  const note = document.getElementById("expenseNote").value;

  if (categories.length === 0) {
    alert("Please add at least one category first.");
    return;
  }

  if (amount <= 0) {
    alert("Please enter a valid spending amount.");
    return;
  }

  const expense = {
    category: category,
    amount: amount,
    note: note || "No note",
    date: new Date().toLocaleDateString()
  };

  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  document.getElementById("expenseAmount").value = "";
  document.getElementById("expenseNote").value = "";

  updateDashboard();
}

function updateDashboard() {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const moneyLeft = monthlyBudget - totalSpent;
  const safeToSpend = monthlyBudget - savingsGoal - totalSpent;

  budgetDisplay.textContent = monthlyBudget.toFixed(2);
  spentDisplay.textContent = totalSpent.toFixed(2);
  leftDisplay.textContent = moneyLeft.toFixed(2);
  safeSpendDisplay.textContent = safeToSpend.toFixed(2);

  if (safeToSpend < 0) {
    safeSpendDisplay.classList.add("warning");
  } else {
    safeSpendDisplay.classList.remove("warning");
  }

  displayCategoryTracker();
  displayExpenses();
}

function displayCategoryTracker() {
  categoryTracker.innerHTML = "";

  if (categories.length === 0) {
    categoryTracker.innerHTML = "<p>No categories yet. Add one above 🦋</p>";
    return;
  }

  categories.forEach(category => {
    const budget = categoryBudgets[category] || 0;

    const spent = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const left = budget - spent;
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

    categoryTracker.innerHTML += `
      <div class="tracker-item">
        <div class="tracker-top">
          <strong>${category}</strong>
          <span class="${left < 0 ? "warning" : ""}">
            $${spent.toFixed(2)} spent / $${budget.toFixed(2)}
          </span>
        </div>

        <div class="progress">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>

        <small class="${left < 0 ? "warning" : ""}">
          ${left >= 0 
            ? `$${left.toFixed(2)} left` 
            : `Overspent by $${Math.abs(left).toFixed(2)}`}
        </small>
      </div>
    `;
  });
}

function displayExpenses() {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    expenseList.innerHTML = "<p>No expenses added yet 🌱</p>";
    return;
  }

  expenses.forEach((expense, index) => {
    expenseList.innerHTML += `
      <div class="expense-item">
        <div>
          <strong>${expense.category}</strong><br>
          <small>${expense.note} • ${expense.date}</small>
        </div>

        <div>
          <strong>$${expense.amount.toFixed(2)}</strong>
          <button class="delete-btn" onclick="deleteExpense(${index})">x</button>
        </div>
      </div>
    `;
  });
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateDashboard();
}

function clearAll() {
  if (confirm("Clear this month's budget and expenses?")) {
    localStorage.clear();
    location.reload();
  }
}

initialiseApp();