const STORAGE_KEY = "fintrack-pro-state-v1";

const currencies = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  INR: { symbol: "₹", rate: 83.3 },
  JPY: { symbol: "¥", rate: 151.5 }
};

const defaultState = {
  profile: {
    name: "Guest",
    preferredCurrency: "INR"
  },
  theme: "light",
  activeFilter: "all",
  search: "",
  transactions: []
};

let state = loadState();

const elements = {
  body: document.body,
  themeToggle: document.querySelector("#themeToggle"),
  themeIcon: document.querySelector("#themeIcon"),
  themeText: document.querySelector("#themeText"),
  transactionForm: document.querySelector("#transactionForm"),
  profileForm: document.querySelector("#profileForm"),
  titleInput: document.querySelector("#titleInput"),
  amountInput: document.querySelector("#amountInput"),
  typeInput: document.querySelector("#typeInput"),
  currencyInput: document.querySelector("#currencyInput"),
  dateInput: document.querySelector("#dateInput"),
  categoryInput: document.querySelector("#categoryInput"),
  nameInput: document.querySelector("#nameInput"),
  preferredCurrencyInput: document.querySelector("#preferredCurrencyInput"),
  preferredCurrencyBadge: document.querySelector("#preferredCurrencyBadge"),
  chartCurrencyLabel: document.querySelector("#chartCurrencyLabel"),
  balanceAmount: document.querySelector("#balanceAmount"),
  incomeAmount: document.querySelector("#incomeAmount"),
  expenseAmount: document.querySelector("#expenseAmount"),
  incomeCount: document.querySelector("#incomeCount"),
  expenseCount: document.querySelector("#expenseCount"),
  recordCount: document.querySelector("#recordCount"),
  welcomeLine: document.querySelector("#welcomeLine"),
  transactionList: document.querySelector("#transactionList"),
  emptyState: document.querySelector("#emptyState"),
  filterButtons: document.querySelectorAll(".filter-btn"),
  searchInput: document.querySelector("#searchInput"),
  resetButton: document.querySelector("#resetButton"),
  chart: document.querySelector("#cashflowChart"),
  chartEmpty: document.querySelector("#chartEmpty"),
  toast: document.querySelector("#toast")
};

initialize();

function initialize() {
  populateCurrencySelects();
  setTodayDate();
  bindEvents();
  render();
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved, profile: { ...defaultState.profile, ...saved.profile } } : structuredClone(defaultState);
  } catch (error) {
    console.warn("Unable to load saved finance data", error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function populateCurrencySelects() {
  const options = Object.keys(currencies)
    .map(code => `<option value="${code}">${code} (${currencies[code].symbol})</option>`)
    .join("");

  elements.currencyInput.innerHTML = options;
  elements.preferredCurrencyInput.innerHTML = options;
}

function setTodayDate() {
  elements.dateInput.value = new Date().toISOString().slice(0, 10);
}

function bindEvents() {
  elements.themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    renderTheme();
    showToast(`${capitalize(state.theme)} mode enabled`);
  });

  document.querySelectorAll("[data-jump]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelector(`#${button.dataset.jump}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  elements.transactionForm.addEventListener("submit", event => {
    event.preventDefault();
    addTransaction();
  });

  elements.profileForm.addEventListener("submit", event => {
    event.preventDefault();
    updateProfile();
  });

  elements.filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      saveState();
      renderTransactions();
      renderFilterButtons();
    });
  });

  elements.searchInput.addEventListener("input", event => {
    state.search = event.target.value.trim().toLowerCase();
    saveState();
    renderTransactions();
  });

  elements.transactionList.addEventListener("click", event => {
    const deleteButton = event.target.closest("[data-delete-id]");
    if (!deleteButton) return;

    const id = deleteButton.dataset.deleteId;
    state.transactions = state.transactions.filter(transaction => transaction.id !== id);
    saveState();
    render();
    showToast("Transaction deleted");
  });

  elements.resetButton.addEventListener("click", () => {
    const confirmed = confirm("This will delete all transactions and reset your profile on this browser. Continue?");
    if (!confirmed) return;

    state = structuredClone(defaultState);
    saveState();
    setTodayDate();
    render();
    showToast("All saved data reset");
  });

  window.addEventListener("resize", () => drawChart());
}

function addTransaction() {
  const title = elements.titleInput.value.trim();
  const amount = Number(elements.amountInput.value);
  const type = elements.typeInput.value;
  const currency = elements.currencyInput.value;
  const date = elements.dateInput.value;
  const category = elements.categoryInput.value.trim() || "General";

  if (!title || !amount || amount <= 0 || !date) {
    showToast("Please add a valid transaction");
    return;
  }

  state.transactions.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    title,
    amount,
    type,
    currency,
    date,
    category,
    createdAt: new Date().toISOString()
  });

  saveState();
  elements.transactionForm.reset();
  elements.currencyInput.value = state.profile.preferredCurrency;
  setTodayDate();
  render();
  showToast("Transaction saved");
}

function updateProfile() {
  const name = elements.nameInput.value.trim() || "Guest";
  const preferredCurrency = elements.preferredCurrencyInput.value;

  state.profile = { name, preferredCurrency };
  saveState();
  render();
  showToast("Profile updated");
}

function render() {
  renderTheme();
  renderProfile();
  renderSummary();
  renderFilterButtons();
  renderTransactions();
  drawChart();
}

function renderTheme() {
  document.documentElement.dataset.theme = state.theme;
  elements.themeIcon.textContent = state.theme === "dark" ? "☀" : "☾";
  elements.themeText.textContent = state.theme === "dark" ? "Light" : "Dark";
}

function renderProfile() {
  const { name, preferredCurrency } = state.profile;
  elements.nameInput.value = name === "Guest" ? "" : name;
  elements.preferredCurrencyInput.value = preferredCurrency;
  elements.currencyInput.value = preferredCurrency;
  elements.preferredCurrencyBadge.textContent = preferredCurrency;
  elements.chartCurrencyLabel.textContent = preferredCurrency;
  elements.welcomeLine.textContent = `Welcome back, ${name}`;
}

function renderSummary() {
  const preferredCurrency = state.profile.preferredCurrency;
  const totals = state.transactions.reduce(
    (acc, transaction) => {
      const converted = convertAmount(transaction.amount, transaction.currency, preferredCurrency);
      if (transaction.type === "income") acc.income += converted;
      if (transaction.type === "expense") acc.expense += converted;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = totals.income - totals.expense;
  const incomeCount = state.transactions.filter(transaction => transaction.type === "income").length;
  const expenseCount = state.transactions.filter(transaction => transaction.type === "expense").length;

  elements.balanceAmount.textContent = formatMoney(balance, preferredCurrency);
  elements.incomeAmount.textContent = formatMoney(totals.income, preferredCurrency);
  elements.expenseAmount.textContent = formatMoney(totals.expense, preferredCurrency);
  elements.incomeCount.textContent = incomeCount;
  elements.expenseCount.textContent = expenseCount;
  elements.recordCount.textContent = state.transactions.length;
}

function renderFilterButtons() {
  elements.filterButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.filter === state.activeFilter);
  });
  elements.searchInput.value = state.search;
}

function getFilteredTransactions() {
  return state.transactions.filter(transaction => {
    const matchesFilter = state.activeFilter === "all" || transaction.type === state.activeFilter;
    const haystack = `${transaction.title} ${transaction.category} ${transaction.currency} ${transaction.type}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    return matchesFilter && matchesSearch;
  });
}

function renderTransactions() {
  const transactions = getFilteredTransactions();
  elements.transactionList.innerHTML = "";

  if (!transactions.length) {
    elements.emptyState.classList.add("visible");
    return;
  }

  elements.emptyState.classList.remove("visible");

  const fragment = document.createDocumentFragment();
  transactions.forEach(transaction => {
    const item = document.createElement("article");
    item.className = "transaction-item";
    item.innerHTML = `
      <div class="transaction-main">
        <strong>${escapeHTML(transaction.title)}</strong>
        <span>${escapeHTML(transaction.category)} · ${transaction.type}</span>
      </div>
      <span class="transaction-date">${formatDate(transaction.date)}</span>
      <strong class="transaction-amount ${transaction.type}">
        ${transaction.type === "income" ? "+" : "-"}${formatMoney(transaction.amount, transaction.currency)}
      </strong>
      <button class="delete-btn" type="button" data-delete-id="${transaction.id}" aria-label="Delete ${escapeHTML(transaction.title)}">×</button>
    `;
    fragment.appendChild(item);
  });

  elements.transactionList.appendChild(fragment);
}

function drawChart() {
  const canvas = elements.chart;
  const ctx = canvas.getContext("2d");
  const preferredCurrency = state.profile.preferredCurrency;
  const rows = [...state.transactions].reverse().slice(-8).map(transaction => ({
    label: transaction.title.length > 10 ? `${transaction.title.slice(0, 10)}…` : transaction.title,
    value: convertAmount(transaction.amount, transaction.currency, preferredCurrency) * (transaction.type === "income" ? 1 : -1),
    type: transaction.type
  }));

  elements.chartEmpty.classList.toggle("visible", rows.length === 0);

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, rect.height);

  if (!rows.length) return;

  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue("--muted").trim();
  const lineColor = styles.getPropertyValue("--line").trim();
  const incomeColor = styles.getPropertyValue("--income").trim();
  const expenseColor = styles.getPropertyValue("--expense").trim();

  const padding = { top: 26, right: 20, bottom: 54, left: 48 };
  const width = rect.width - padding.left - padding.right;
  const height = rect.height - padding.top - padding.bottom;
  const maxAbs = Math.max(...rows.map(row => Math.abs(row.value)), 1);
  const zeroY = padding.top + height / 2;
  const barGap = 14;
  const barWidth = Math.max(18, (width - barGap * (rows.length - 1)) / rows.length);

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, zeroY);
  ctx.lineTo(rect.width - padding.right, zeroY);
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = "12px Manrope, Segoe UI, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(formatCompact(maxAbs, preferredCurrency), padding.left - 8, padding.top + 4);
  ctx.fillText("0", padding.left - 8, zeroY + 4);
  ctx.fillText(formatCompact(-maxAbs, preferredCurrency), padding.left - 8, padding.top + height);

  rows.forEach((row, index) => {
    const x = padding.left + index * (barWidth + barGap);
    const barHeight = Math.max(4, Math.abs(row.value) / maxAbs * (height / 2 - 12));
    const y = row.value >= 0 ? zeroY - barHeight : zeroY;

    ctx.fillStyle = row.type === "income" ? incomeColor : expenseColor;
    roundRect(ctx, x, y, barWidth, barHeight, 9);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(x + barWidth / 2, rect.height - 18);
    ctx.rotate(-Math.PI / 8);
    ctx.fillText(row.label, 0, 0);
    ctx.restore();
  });
}

function convertAmount(amount, fromCurrency, toCurrency) {
  const amountInUsd = amount / currencies[fromCurrency].rate;
  return amountInUsd * currencies[toCurrency].rate;
}

function formatMoney(amount, currency) {
  const value = Math.abs(amount) >= 100000 ? Math.round(amount) : Number(amount.toFixed(currency === "JPY" ? 0 : 2));
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2
  }).format(value);
}

function formatCompact(amount, currency) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1
  }).format(amount);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;"
  }[char]));
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function roundRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

let toastTimer;
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2200);
}
