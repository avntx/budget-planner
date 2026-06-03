const defaultCategories = [
  "🍔 Food",
  "🚇 Transport",
  "🚗 Driving",
  "🛍️ Shopping",
  "💄 Beauty",
  "🛡️ Insurance",
  "🎉 Outings",
  "✈️ Travel"
];

let categories = JSON.parse(localStorage.getItem("categories")) || defaultCategories;
let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;
let savingsGoal = Number(localStorage.getItem("savingsGoal")) || 0;
let categoryBudgets = JSON.parse(localStorage.getItem("categoryBudgets")) || {};
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let bills = JSON.parse(localStorage.getItem("bills")) || [];
let travelGoal = JSON.parse(localStorage.getItem("travelGoal")) || {
  name: "",
  goal: 0,
  saved: 0
};

let spendingChart;

const monthlyBudgetInput = document.getElementById("monthlyBudget");
const savingsGoalInput = document.getElementById("savingsGoal");
const budgetDisplay = document.getElementById("budgetDisplay");
const spentDisplay = document.getElementById("spentDisplay");
const leftDisplay = document.getElementById("leftDisplay");
const safeSpendDisplay = document.getElementById("safeSpendDisplay");

const newCategoryInput = document.getElementById("newCategoryInput");
const categoryList = document.getElementById("categoryList");
const categoryBudgetInputs = document.getElementById("categoryBudgetInputs");
const expenseCategory = document.getElementById("expenseCategory");
const categoryTracker = document.getElementById("categoryTracker");
const expenseList = document.getElementById("expenseList");

const travelNameInput = document.getElementById("travelName");
const travelGoalInput = document.getElementById("travelGoal");
const travelSavedInput = document.getElementById("travelSaved");
const travelProgress = document.getElementById("travelProgress");

const billNameInput = document.getElementById("billName");
const billAmountInput = document.getElementById("billAmount");
const billList = document.getElementById("billList");

function init() {
  monthlyBudgetInput.value = monthlyBudget || "";
  savingsGoalInput.value = savingsGoal || "";

  travelNameInput.value = travelGoal.name || "";
  travelGoalInput.value = travelGoal.goal || "";
  travelSavedInput.value = travelGoal.saved || "";

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  renderCategories();
  updateDashboard();
}

function saveSetup() {
  monthlyBudget = Number(monthlyBudgetInput.value) || 0;
  savingsGoal = Number(savingsGoalInput.value) || 0;

  localStorage.setItem("monthlyBudget", monthlyBudget);
  localStorage.setItem("savingsGoal", savingsGoal);

  updateDashboard();
}

function saveTravelGoal() {
  travelGoal = {
    name: travelNameInput.value || "Travel Fund",
    goal: Number(travelGoalInput.value) || 0,
    saved: Number(travelSavedInput.value) || 0
  };

  localStorage.setItem("travelGoal", JSON.stringify(travelGoal));
  renderTravelGoal();
}

function renderTravelGoal() {
  const goal = travelGoal.goal || 0;
  const saved = travelGoal.saved || 0;
  const percentage = goal > 0 ? Math.min((saved / goal) * 100, 100) : 0;
  const left = goal - saved;

  travelProgress.innerHTML = `
    <div class="goal-box">
      <strong>${travelGoal.name || "Travel Fund"}</strong>
      <div class="progress">
        <div class="progress-fill" style="width:${percentage}%"></div>
      </div>
      <small>
        Saved $${saved.toFixed(2)} / $${goal.toFixed(2)}
        ${left > 0 ? `• $${left.toFixed(2)} left` : "• Goal reached 🎉"}
      </small>
    </div>
  `;
}

function renderCategories() {
  categoryList.innerHTML = "";
  categoryBudgetInputs.innerHTML = "";
  expenseCategory.innerHTML = "";

  categories.forEach(category => {
    categoryList.innerHTML += `
      <div class="category-pill">
        <span>${category}</span>
        <span class="remove-category-btn" onclick="removeCategory('${category}')">×</span>
      </div>
    `;

    categoryBudgetInputs.innerHTML += `
      <div>
        <label>${category}</label>
        <input 
          type="number"
          id="budget-${category}"
          value="${categoryBudgets[category] || ""}"
          placeholder="Budget amount"
        />
      </div>
    `;

    expenseCategory.innerHTML += `
      <option value="${category}">${category}</option>
    `;
  });
}

function addCategory() {
  const newCategory = newCategoryInput.value.trim();

  if (!newCategory) {
    alert("Please enter a category.");
    return;
  }

  if (categories.some(cat => cat.toLowerCase() === newCategory.toLowerCase())) {
    alert("This category already exists.");
    return;
  }

  categories.push(newCategory);
  localStorage.setItem("categories", JSON.stringify(categories));

  newCategoryInput.value = "";
  renderCategories();
  updateDashboard();
}

function removeCategory(category) {
  const hasExpenses = expenses.some(expense => expense.category === category);

  if (hasExpenses) {
    const confirmDelete = confirm("This category has expenses. Remove category and delete its expenses?");
    if (!confirmDelete) return;

    expenses = expenses.filter(expense => expense.category !== category);
  }

  categories = categories.filter(cat => cat !== category);
  delete categoryBudgets[category];

  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("categoryBudgets", JSON.stringify(categoryBudgets));
  localStorage.setItem("expenses", JSON.stringify(expenses));

  renderCategories();
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
  const category = expenseCategory.value;
  const amount = Number(document.getElementById("expenseAmount").value);
  const note = document.getElementById("expenseNote").value;

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  expenses.push({
    category,
    amount,
    note: note || "No note",
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem("expenses", JSON.stringify(expenses));

  document.getElementById("expenseAmount").value = "";
  document.getElementById("expenseNote").value = "";

  updateDashboard();
}

function addBill() {
  const name = billNameInput.value.trim();
  const amount = Number(billAmountInput.value);

  if (!name || !amount || amount <= 0) {
    alert("Please enter bill name and amount.");
    return;
  }

  bills.push({ name, amount });
  localStorage.setItem("bills", JSON.stringify(bills));

  billNameInput.value = "";
  billAmountInput.value = "";

  renderBills();
}

function renderBills() {
  billList.innerHTML = "";

  if (bills.length === 0) {
    billList.innerHTML = "<p>No recurring bills added yet.</p>";
    return;
  }

  bills.forEach((bill, index) => {
    billList.innerHTML += `
      <div class="bill-item">
        <div>
          <strong>${bill.name}</strong><br>
          <small>Recurring monthly bill</small>
        </div>
        <div>
          <strong>$${bill.amount.toFixed(2)}</strong>
          <button class="delete-btn" onclick="deleteBill(${index})">x</button>
        </div>
      </div>
    `;
  });
}

function deleteBill(index) {
  bills.splice(index, 1);
  localStorage.setItem("bills", JSON.stringify(bills));
  renderBills();
}

function updateDashboard() {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const moneyLeft = monthlyBudget - totalSpent - totalBills;
  const safeToSpend = monthlyBudget - savingsGoal - totalSpent - totalBills;

  budgetDisplay.textContent = monthlyBudget.toFixed(2);
  spentDisplay.textContent = (totalSpent + totalBills).toFixed(2);
  leftDisplay.textContent = moneyLeft.toFixed(2);
  safeSpendDisplay.textContent = safeToSpend.toFixed(2);

  safeSpendDisplay.classList.toggle("warning", safeToSpend < 0);
  leftDisplay.classList.toggle("warning", moneyLeft < 0);

  renderTracker();
  renderExpenses();
  renderBills();
  renderTravelGoal();
  renderChart();
}

function renderTracker() {
  categoryTracker.innerHTML = "";

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
          <span>${category}</span>
          <span class="${left < 0 ? "warning" : ""}">
            $${spent.toFixed(2)} / $${budget.toFixed(2)}
          </span>
        </div>
        <div class="progress">
          <div class="progress-fill" style="width:${percentage}%"></div>
        </div>
        <small class="${left < 0 ? "warning" : ""}">
          ${left >= 0 ? `$${left.toFixed(2)} left` : `Overspent by $${Math.abs(left).toFixed(2)}`}
        </small>
      </div>
    `;
  });
}

function renderExpenses() {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    expenseList.innerHTML = "<p>No expenses added yet.</p>";
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

function renderChart() {
  const ctx = document.getElementById("spendingChart");

  const data = categories.map(category => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  });

  if (spendingChart) {
    spendingChart.destroy();
  }

  spendingChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [{
        data,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function exportCSV() {
  let csv = "Category,Amount,Note,Date\n";

  expenses.forEach(expense => {
    csv += `"${expense.category}",${expense.amount},"${expense.note}","${expense.date}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "budget-bloom-expenses.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

function clearAll() {
  if (confirm("Clear all budget data?")) {
    localStorage.clear();
    location.reload();
  }
}

init();