const STORAGE_KEY = "islensk-mynstraleidangur-v1";

const steps = Array.from(document.querySelectorAll(".step"));
const navButtons = Array.from(document.querySelectorAll(".sidebar__link"));
const checkboxes = Array.from(document.querySelectorAll(".step__checkbox"));
const toggleButtons = Array.from(document.querySelectorAll(".step__toggle"));
const progressCount = document.getElementById("progressCount");
const progressBar = document.getElementById("progressBar");

const state = {
  completed: new Set(),
  openId: steps[0] ? steps[0].id : null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.completed)) {
      state.completed = new Set(saved.completed);
    }
    if (typeof saved.openId === "string") {
      state.openId = saved.openId;
    }
  } catch (error) {
    console.warn("Gat ekki lesið vistað ástand", error);
  }
}

function saveState() {
  try {
    const payload = {
      completed: Array.from(state.completed),
      openId: state.openId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Gat ekki vistað ástand", error);
  }
}

function setActiveNavButton(id) {
  navButtons.forEach((btn) => {
    const matches = btn.dataset.target === id;
    btn.classList.toggle("active", matches);
  });
}

function updateProgress() {
  const done = state.completed.size;
  progressCount.textContent = `${done}`;
  const percent = (done / steps.length) * 100;
  progressBar.style.width = `${percent}%`;

  steps.forEach((step) => {
    const isDone = state.completed.has(step.id);
    step.classList.toggle("step--done", isDone);
  });

  navButtons.forEach((btn) => {
    const isDone = state.completed.has(btn.dataset.target);
    btn.classList.toggle("completed", isDone);
  });
}

function openStep(id, { scroll = false } = {}) {
  const targetStep = steps.find((step) => step.id === id);
  if (!targetStep) return;

  steps.forEach((step) => {
    const isTarget = step === targetStep;
    step.classList.toggle("step--open", isTarget);
    step.classList.toggle("step--collapsed", !isTarget);
    const toggle = step.querySelector(".step__toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", isTarget ? "true" : "false");
    }
  });

  state.openId = id;
  setActiveNavButton(id);
  saveState();

  if (scroll) {
    const offset = 24;
    const top = targetStep.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

function collapseStep(id) {
  const targetStep = steps.find((step) => step.id === id);
  if (!targetStep) return;
  targetStep.classList.remove("step--open");
  targetStep.classList.add("step--collapsed");
  const toggle = targetStep.querySelector(".step__toggle");
  if (toggle) {
    toggle.setAttribute("aria-expanded", "false");
  }
  if (state.openId === id) {
    state.openId = null;
    saveState();
    setActiveNavButton("");
  }
}

function handleToggleClick(event) {
  const step = event.currentTarget.closest(".step");
  if (!step) return;
  const id = step.id;
  const isOpen = step.classList.contains("step--open");
  if (isOpen) {
    collapseStep(id);
  } else {
    openStep(id);
  }
}

function handleCheckboxChange(event) {
  const checkbox = event.currentTarget;
  const step = checkbox.closest(".step");
  if (!step) return;
  if (checkbox.checked) {
    state.completed.add(step.id);
  } else {
    state.completed.delete(step.id);
  }
  updateProgress();
  saveState();
}

function handleNavClick(event) {
  const id = event.currentTarget.dataset.target;
  openStep(id, { scroll: true });
}

function restoreState() {
  steps.forEach((step) => {
    const checkbox = step.querySelector(".step__checkbox");
    const isDone = state.completed.has(step.id);
    if (checkbox) {
      checkbox.checked = isDone;
    }
    step.classList.toggle("step--done", isDone);
  });
  updateProgress();

  if (state.openId && steps.some((step) => step.id === state.openId)) {
    openStep(state.openId);
  } else if (steps[0]) {
    openStep(steps[0].id);
  }
}

loadState();
restoreState();

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", handleCheckboxChange);
});

toggleButtons.forEach((button) => {
  button.addEventListener("click", handleToggleClick);
});

navButtons.forEach((button) => {
  button.addEventListener("click", handleNavClick);
});

const hintToggle = document.querySelector(".hint__toggle");
const hintPanel = document.getElementById("hero-hint");

if (hintToggle && hintPanel) {
  hintToggle.addEventListener("click", () => {
    const isExpanded = hintToggle.getAttribute("aria-expanded") === "true";
    hintToggle.setAttribute("aria-expanded", String(!isExpanded));
    if (isExpanded) {
      hintPanel.setAttribute("hidden", "");
    } else {
      hintPanel.removeAttribute("hidden");
    }
  });
}
