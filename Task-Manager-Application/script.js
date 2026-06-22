const htmlElement = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const taskForm = document.getElementById("taskForm");
const taskTitleInput = document.getElementById("taskTitle");
const taskCategoryInput = document.getElementById("taskCategory");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const clearAllBtn = document.getElementById("clearAllBtn");
const propertyValue = document.getElementById("propertyValue");
const attributeValue = document.getElementById("attributeValue");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const editModal = document.getElementById("editModal");
const editTaskForm = document.getElementById("editTaskForm");
const editTaskId = document.getElementById("editTaskId");
const editTaskTitle = document.getElementById("editTaskTitle");
const editError = document.getElementById("editError");
const closeEditModalBtn = document.getElementById("closeEditModal");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTheme = localStorage.getItem("theme") || "light";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveTheme() {
  localStorage.setItem("theme", currentTheme);
}

function updateThemeUI() {
  // ? Stores current theme inside a custom data attribute: data-theme="dark/light"
  htmlElement.setAttribute("data-theme", currentTheme);

  // ? classList is used here as required in the assignment.
  htmlElement.classList.toggle("light-mode", currentTheme === "light");
  themeToggle.innerHTML = currentTheme === "dark"
    ? '<i class="ri-moon-clear-line"></i><span>Dark</span>'
    : '<i class="ri-sun-line"></i><span>Light</span>';
}

function updateAttributePropertyDemo() {
  // ? Property: current live value of input. It changes when the user types.
  propertyValue.textContent = taskTitleInput.value || "(empty)";

  // ? Attribute: original value written in HTML or last value set using setAttribute().
  attributeValue.textContent = taskTitleInput.getAttribute("value") || "(no value attribute)";
}

function updateCounters() {
  const completed = tasks.filter((task) => task.status === "completed").length;
  const pending = tasks.filter((task) => task.status === "pending").length;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  pendingCount.textContent = pending;
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  if (task.status === "completed") {
    card.classList.add("completed");
  }

  // ? Required custom data attributes.
  card.setAttribute("data-id", task.id);
  card.setAttribute("data-status", task.status);
  card.setAttribute("data-category", task.category);

  // ? Practice: hasAttribute() and removeAttribute().
  if (!card.hasAttribute("data-temp")) {
    card.setAttribute("data-temp", "created");
    card.removeAttribute("data-temp");
  }

  const content = document.createElement("div");
  content.className = "task-content";

  const title = document.createElement("h3");
  title.className = "task-title";

  // ? Required createTextNode().
  const titleText = document.createTextNode(task.title);
  title.appendChild(titleText);

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = `${task.category} • ${task.status}`;

  content.append(title, badge);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const completeBtn = document.createElement("button");
  completeBtn.className = "action-btn complete-btn";
  completeBtn.type = "button";
  completeBtn.dataset.action = "complete";
  completeBtn.innerHTML = task.status === "completed"
    ? '<i class="ri-arrow-go-back-line"></i> Undo'
    : '<i class="ri-checkbox-circle-line"></i> Complete';

  const editBtn = document.createElement("button");
  editBtn.className = "action-btn edit-btn";
  editBtn.type = "button";
  editBtn.dataset.action = "edit";
  editBtn.innerHTML = '<i class="ri-edit-line"></i> Edit';

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "action-btn delete-btn";
  deleteBtn.type = "button";
  deleteBtn.dataset.action = "delete";
  deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i> Delete';

  actions.append(completeBtn, editBtn, deleteBtn);
  card.append(content, actions);

  return card;
}

function getFilteredTasks() {
  const searchText = searchInput.value.trim().toLowerCase();
  const selectedCategory = filterCategory.value;

  return tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchText);
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.innerHTML = '<i class="ri-inbox-line"></i><br>No tasks found. Add a new task or change your filters.';
    taskList.append(empty);
    updateCounters();
    return;
  }

  //  ? Bonus feature: DocumentFragment improves performance while appending multiple nodes.
  const fragment = document.createDocumentFragment();

  filteredTasks.forEach((task, index) => {
    const card = createTaskCard(task);

    if (index === 0) {
      // ? Required prepend() usage. First item is prepended into the fragment.
      fragment.prepend(card);
    } else {
      fragment.append(card);
    }
  });

  taskList.appendChild(fragment);
  updateCounters();
}

function addTask(title, category) {
  const newTask = {
    id: crypto.randomUUID(),
    title,
    category,
    status: "pending"
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
}

function completeTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return {
        ...task,
        status: task.status === "completed" ? "pending" : "completed"
      };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

function openEditModal(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  editTaskId.value = task.id;
  editTaskTitle.value = task.title;
  editError.textContent = "";

  editModal.classList.add("show");
  editModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  setTimeout(() => {
    editTaskTitle.focus();
    editTaskTitle.select();
  }, 50);
}

function closeEditModal() {
  editModal.classList.remove("show");
  editModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  editTaskForm.reset();
  editTaskId.value = "";
  editError.textContent = "";
}

function updateTaskTitle(id, newTitle) {
  tasks = tasks.map((item) => {
    if (item.id === id) {
      return { ...item, title: newTitle.trim() };
    }

    return item;
  });

  saveTasks();
  renderTasks();
}

function deleteTask(id, card) {
  // ? Required before() and after() usage: temporary visual messages around the card.
  const beforeMessage = document.createElement("small");
  beforeMessage.textContent = "Deleting this task...";
  beforeMessage.style.color = "var(--danger)";
  card.before(beforeMessage);

  const afterMessage = document.createElement("small");
  afterMessage.textContent = "Task removed from DOM using remove().";
  afterMessage.style.color = "var(--muted)";
  card.after(afterMessage);

  setTimeout(() => {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();

    // ? Required remove() usage.
    beforeMessage.remove();
    afterMessage.remove();
    renderTasks();
  }, 350);
}

function replaceFirstTaskDemo() {
  const firstCard = taskList.querySelector(".task-card");
  if (!firstCard) return;

  const clone = firstCard.cloneNode(true);
  clone.setAttribute("title", "This card was refreshed using replaceWith().");

  // ? Required replaceWith() usage. This replaces a card with its updated clone.
  firstCard.replaceWith(clone);
}

// ? Event Handling: form submit listener.
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskTitleInput.value.trim();
  const category = taskCategoryInput.value;

  if (title === "") {
    alert("Please enter a task title.");
    return;
  }

  addTask(title, category);

  // ? setAttribute() changes the HTML attribute value.
  taskTitleInput.setAttribute("value", title);
  taskTitleInput.value = "";
  updateAttributePropertyDemo();
});

// ! Event Delegation: one listener on parent container handles all task buttons.
taskList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const card = button.closest(".task-card");
  if (!card) return;

  // ? dataset reads data-id from the custom attribute.
  const taskId = card.dataset.id;
  const action = button.dataset.action;

  // ? getAttribute() reads custom attributes directly.
  console.log("Task category from getAttribute:", card.getAttribute("data-category"));
  console.log("Task status from dataset:", card.dataset.status);

  if (action === "complete") completeTask(taskId);
  if (action === "edit") openEditModal(taskId);
  if (action === "delete") deleteTask(taskId, card);
});

editTaskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = editTaskId.value;
  const newTitle = editTaskTitle.value.trim();

  if (newTitle === "") {
    editError.textContent = "Task title cannot be empty.";
    editTaskTitle.focus();
    return;
  }

  updateTaskTitle(id, newTitle);
  closeEditModal();
});

closeEditModalBtn.addEventListener("click", closeEditModal);
cancelEditBtn.addEventListener("click", closeEditModal);

editModal.addEventListener("click", (event) => {
  if (event.target === editModal) {
    closeEditModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && editModal.classList.contains("show")) {
    closeEditModal();
  }
});

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  updateThemeUI();
  saveTheme();
});

taskTitleInput.addEventListener("input", updateAttributePropertyDemo);
searchInput.addEventListener("input", renderTasks);
filterCategory.addEventListener("change", renderTasks);

clearAllBtn.addEventListener("click", () => {
  if (!confirm("Are you sure you want to clear all tasks?")) return;
  tasks = [];
  saveTasks();
  renderTasks();
});

// ! Event Propagation Demonstration.
const grandparent = document.getElementById("grandparent");
const parentBox = document.getElementById("parent");
const childBtn = document.getElementById("childBtn");

// ! Capturing phase: third argument true.
// ! Order: Grandparent -> Parent -> Child
grandparent.addEventListener("click", () => console.log("Capturing: Grandparent"), true);
parentBox.addEventListener("click", () => console.log("Capturing: Parent"), true);
childBtn.addEventListener("click", () => console.log("Capturing: Child"), true);

// ! Bubbling phase: default false.
// ! Order: Child -> Parent -> Grandparent
childBtn.addEventListener("click", () => console.log("Bubbling: Child"));
parentBox.addEventListener("click", () => console.log("Bubbling: Parent"));
grandparent.addEventListener("click", () => console.log("Bubbling: Grandparent"));

updateThemeUI();
updateAttributePropertyDemo();
renderTasks();
setTimeout(replaceFirstTaskDemo, 1000);
