const storageKey = "flowhabit-data";
const defaultData = {
  tasks: [],
  habits: [],
  studies: [],
  finances: [],
  gymDone: 0,
  theme: "dark"
};

const data = loadData();
let currentMonth = new Date();

const menus = [...document.querySelectorAll(".menu-item")];
const views = [...document.querySelectorAll(".view")];
const currentView = document.getElementById("currentView");
const todayLabel = document.getElementById("todayLabel");

menus.forEach((btn) => {
  btn.addEventListener("click", () => {
    menus.forEach((m) => m.classList.remove("active"));
    btn.classList.add("active");
    views.forEach((view) => view.classList.toggle("active", view.id === btn.dataset.tab));
    currentView.textContent = capitalize(btn.dataset.tab);
  });
});

document.getElementById("todayLabel").textContent = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric"
});

document.getElementById("taskForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  data.tasks.push({
    id: crypto.randomUUID(),
    title: form.title.value,
    due: form.due.value,
    category: form.category.value,
    done: false
  });
  form.reset();
  persistAndRender();
});

document.getElementById("habitForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  data.habits.push({
    id: crypto.randomUUID(),
    name: form.name.value,
    frequency: form.frequency.value,
    checked: false
  });
  form.reset();
  persistAndRender();
});

document.getElementById("studyForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  data.studies.push({
    id: crypto.randomUUID(),
    subject: form.subject.value,
    hours: Number(form.hours.value)
  });
  form.reset();
  persistAndRender();
});

document.getElementById("financeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  data.finances.push({
    id: crypto.randomUUID(),
    desc: form.desc.value,
    amount: Number(form.amount.value),
    type: form.type.value
  });
  form.reset();
  persistAndRender();
});

document.getElementById("themeToggle").addEventListener("change", (event) => {
  data.theme = event.target.checked ? "light" : "dark";
  persistAndRender();
});

document.getElementById("resetData").addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  window.location.reload();
});

const gymDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const gymPlan = document.getElementById("gymPlan");
gymDays.forEach((day, index) => {
  const chip = document.createElement("button");
  chip.className = "chip";
  chip.textContent = `${day} • Treino ${index + 1}`;
  chip.addEventListener("click", () => {
    data.gymDone = Math.min(4, data.gymDone + 1);
    persistAndRender();
  });
  gymPlan.appendChild(chip);
});

document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
});

function persistAndRender() {
  localStorage.setItem(storageKey, JSON.stringify(data));
  render();
}

function loadData() {
  try {
    return { ...defaultData, ...(JSON.parse(localStorage.getItem(storageKey)) || {}) };
  } catch {
    return { ...defaultData };
  }
}

function createListItem(content, actions = []) {
  const li = document.createElement("li");
  li.className = "item";

  const body = document.createElement("div");
  body.innerHTML = content;

  const actionWrap = document.createElement("div");
  actionWrap.className = "actions";
  actions.forEach((button) => actionWrap.appendChild(button));

  li.append(body, actionWrap);
  return li;
}

function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  data.tasks.forEach((task) => {
    const doneBtn = document.createElement("button");
    doneBtn.textContent = task.done ? "Desfazer" : "Concluir";
    doneBtn.addEventListener("click", () => {
      task.done = !task.done;
      persistAndRender();
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Excluir";
    delBtn.className = "danger";
    delBtn.addEventListener("click", () => {
      data.tasks = data.tasks.filter((item) => item.id !== task.id);
      persistAndRender();
    });

    taskList.appendChild(
      createListItem(
        `<strong>${task.title}</strong><br><small>${task.category} • ${formatDate(task.due)} ${task.done ? "• ✅" : ""}</small>`,
        [doneBtn, delBtn]
      )
    );
  });
}

function renderHabits() {
  const habitList = document.getElementById("habitList");
  habitList.innerHTML = "";

  data.habits.forEach((habit) => {
    const checkBtn = document.createElement("button");
    checkBtn.textContent = habit.checked ? "Desmarcar" : "Marcar";
    checkBtn.addEventListener("click", () => {
      habit.checked = !habit.checked;
      persistAndRender();
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Excluir";
    delBtn.className = "danger";
    delBtn.addEventListener("click", () => {
      data.habits = data.habits.filter((item) => item.id !== habit.id);
      persistAndRender();
    });

    habitList.appendChild(
      createListItem(`<strong>${habit.name}</strong><br><small>${habit.frequency} ${habit.checked ? "• ✅" : ""}</small>`, [
        checkBtn,
        delBtn
      ])
    );
  });
}

function renderStudies() {
  const studyList = document.getElementById("studyList");
  studyList.innerHTML = "";

  data.studies.forEach((study) => {
    const delBtn = document.createElement("button");
    delBtn.textContent = "Excluir";
    delBtn.className = "danger";
    delBtn.addEventListener("click", () => {
      data.studies = data.studies.filter((item) => item.id !== study.id);
      persistAndRender();
    });

    studyList.appendChild(createListItem(`<strong>${study.subject}</strong><br><small>${study.hours}h registradas</small>`, [delBtn]));
  });
}

function renderFinances() {
  const financeList = document.getElementById("financeList");
  financeList.innerHTML = "";

  data.finances.forEach((item) => {
    const delBtn = document.createElement("button");
    delBtn.textContent = "Excluir";
    delBtn.className = "danger";
    delBtn.addEventListener("click", () => {
      data.finances = data.finances.filter((entry) => entry.id !== item.id);
      persistAndRender();
    });

    const signal = item.type === "entrada" ? "+" : "-";
    financeList.appendChild(
      createListItem(`<strong>${item.desc}</strong><br><small>${item.type} • ${signal} R$ ${item.amount.toFixed(2)}</small>`, [delBtn])
    );
  });
}

function renderDashboard() {
  const doneTasks = data.tasks.filter((task) => task.done).length;
  const taskRate = data.tasks.length ? Math.round((doneTasks / data.tasks.length) * 100) : 0;
  const doneHabits = data.habits.filter((habit) => habit.checked).length;
  const hours = data.studies.reduce((sum, item) => sum + item.hours, 0);
  const balance = data.finances.reduce(
    (sum, entry) => sum + (entry.type === "entrada" ? entry.amount : -entry.amount),
    0
  );

  document.getElementById("metricTasks").textContent = `${taskRate}%`;
  document.getElementById("metricHabits").textContent = `${doneHabits}/${data.habits.length}`;
  document.getElementById("metricStudy").textContent = `${hours.toFixed(1)}h`;
  document.getElementById("metricBalance").textContent = balance.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
  document.getElementById("streakBadge").textContent = `🔥 Sequência: ${doneHabits} dias`;

  const dashboardTasks = document.getElementById("dashboardTasks");
  dashboardTasks.innerHTML = "";
  data.tasks.slice(0, 4).forEach((task) => {
    const item = document.createElement("li");
    item.textContent = `${task.done ? "✅" : "🕒"} ${task.title}`;
    dashboardTasks.appendChild(item);
  });

  const dashboardHabits = document.getElementById("dashboardHabits");
  dashboardHabits.innerHTML = "";
  data.habits.slice(0, 4).forEach((habit) => {
    const item = document.createElement("li");
    item.textContent = `${habit.checked ? "✅" : "⭕"} ${habit.name}`;
    dashboardHabits.appendChild(item);
  });
}

function renderCategories() {
  const tags = new Set([
    ...data.tasks.map((task) => task.category),
    "Estudos",
    "Financeiro",
    "Academia",
    "Saúde",
    "Pessoal"
  ]);

  const categoryTags = document.getElementById("categoryTags");
  categoryTags.innerHTML = "";
  [...tags].forEach((tag) => {
    if (!tag) return;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = tag;
    categoryTags.appendChild(chip);
  });
}

function renderGym() {
  const progress = Math.min((data.gymDone / 4) * 100, 100);
  document.getElementById("gymProgress").style.width = `${progress}%`;
  document.getElementById("gymProgressLabel").textContent = `${Math.min(data.gymDone, 4)}/4 treinos`;
}

function renderCalendar() {
  const title = document.getElementById("calendarTitle");
  const grid = document.getElementById("calendarGrid");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  title.textContent = firstDay.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  grid.innerHTML = "";

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  weekDays.forEach((name) => {
    const el = document.createElement("div");
    el.innerHTML = `<strong>${name}</strong>`;
    grid.appendChild(el);
  });

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const empty = document.createElement("div");
    grid.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const cellDate = new Date(year, month, day);
    const dayCell = document.createElement("div");
    dayCell.className = "day";
    dayCell.textContent = String(day);

    if (isSameDate(cellDate, new Date())) {
      dayCell.classList.add("today");
    }

    const hasTask = data.tasks.some((task) => task.due === toInputDate(cellDate));
    if (hasTask) {
      const tag = document.createElement("small");
      tag.textContent = "• tarefas";
      dayCell.appendChild(document.createElement("br"));
      dayCell.appendChild(tag);
    }

    grid.appendChild(dayCell);
  }
}

function applyTheme() {
  document.documentElement.classList.toggle("light", data.theme === "light");
  document.getElementById("themeToggle").checked = data.theme === "light";
}

function render() {
  renderTasks();
  renderHabits();
  renderStudies();
  renderFinances();
  renderDashboard();
  renderCategories();
  renderGym();
  renderCalendar();
  applyTheme();
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR");
}

function toInputDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isSameDate(a, b) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

render();
