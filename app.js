document.addEventListener("DOMContentLoaded", () => {
  updateGreeting();
  highlightActiveNavLink();
  loadDashboardData();
});

/**
 * 1. DYNAMIC GREETING BASED ON TIME
 */
function updateGreeting() {
  const greetingEl = document.getElementById("greeting");
  if (!greetingEl) return;

  const currentHour = new Date().getHours();
  let text = "Good evening.";

  if (currentHour >= 5 && currentHour < 12) {
    text = "Good morning.";
  } else if (currentHour >= 12 && currentHour < 18) {
    text = "Good afternoon.";
  }

  greetingEl.textContent = text;
}

/**
 * 2. HIGHLIGHT CURRENT ACTIVE PAGE IN NAVBAR
 */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    const linkPath = link.getAttribute("href");
    if (linkPath === currentPath) {
      link.classList.add("active"); // Style this with .nav-links a.active in CSS
    }
  });
}

/**
 * 3. LOAD DYNAMIC STATS FROM STORAGE
 */
function loadDashboardData() {
  // Read tasks saved in LocalStorage (or fallback to defaults if empty)
  const savedTasks = JSON.parse(localStorage.getItem("nexus_tasks")) || [];
  const savedGoals = JSON.parse(localStorage.getItem("nexus_goals")) || [];
  const savedFocus = JSON.parse(localStorage.getItem("nexus_focus_count")) || 0;

  // Calculate task percentage
  const totalTasks = savedTasks.length;
  const completedTasks = savedTasks.filter((t) => t.completed).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Render to DOM
  const percentEl = document.getElementById("task-percent");
  const goalsEl = document.getElementById("goals-count");
  const focusEl = document.getElementById("focus-count");

  if (percentEl) percentEl.textContent = `${percentage}%`;
  if (goalsEl) goalsEl.textContent = savedGoals.length;
  if (focusEl) focusEl.textContent = savedFocus;
}

// State array stored in memory
let tasks = JSON.parse(localStorage.getItem("nexus_tasks")) || [];

document.addEventListener("DOMContentLoaded", () => {
  // Check if we are on the tasks page
  const tasksContainer = document.getElementById("tasks-container");
  if (tasksContainer) {
    renderTasks();
    setupTaskForm();
  }
});

/**
 * 1. HANDLE FORM SUBMISSION TO ADD NEW TASK
 */
function setupTaskForm() {
  const form = document.getElementById("task-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const titleInput = document.getElementById("task-title");
    const descInput = document.getElementById("task-desc");
    const priorityInput = document.getElementById("task-priority");

    const newTask = {
      id: Date.now(), // Unique ID using timestamp
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      priority: priorityInput.value,
      completed: false
    };

    tasks.push(newTask);
    saveAndRender();

    // Reset inputs
    titleInput.value = "";
    descInput.value = "";
  });
}

/**
 * 2. RENDER TASKS TO THE DOM
 */
function renderTasks() {
  const container = document.getElementById("tasks-container");
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1;" class="muted">No tasks found. Create one above!</p>`;
    return;
  }

  // Priority badge styling mapping
  const badgeMap = {
    High: "danger",
    Medium: "warning",
    Low: "success"
  };

  container.innerHTML = tasks.map((task) => `
    <article class="card" style="${task.completed ? 'opacity: 0.6; text-decoration: line-through;' : ''}">
      <div class="card-title">
        <h3>${escapeHtml(task.title)}</h3>
        <span class="badge ${badgeMap[task.priority]}">${task.priority}</span>
      </div>
      <p>${escapeHtml(task.description || "No description provided.")}</p>
      <div class="actions" style="margin-top:18px">
        <button class="btn" onclick="toggleTask(${task.id})">
          ${task.completed ? 'Undo' : 'Complete'}
        </button>
        <button class="btn danger" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    </article>
  `).join("");
}

/**
 * 3. TASK ACTIONS (TOGGLE & DELETE)
 */
function toggleTask(id) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveAndRender();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveAndRender();
}

/**
 * 4. HELPER FUNCTIONS
 */
function saveAndRender() {
  localStorage.setItem("nexus_tasks", JSON.stringify(tasks));
  renderTasks();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

// State array stored in memory for goals
let goals = JSON.parse(localStorage.getItem("nexus_goals")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const goalsContainer = document.getElementById("goals-container");
  if (goalsContainer) {
    renderGoals();
    setupGoalForm();
  }
});

/**
 * 1. HANDLE FORM SUBMISSION TO ADD NEW GOAL
 */
function setupGoalForm() {
  const form = document.getElementById("goal-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("goal-name");
    const deadlineInput = document.getElementById("goal-deadline");
    const descInput = document.getElementById("goal-description");

    const newGoal = {
      id: Date.now(),
      name: nameInput.value.trim(),
      deadline: deadlineInput.value,
      description: descInput.value.trim(),
      milestones: [] // Array of { id, text, completed }
    };

    goals.push(newGoal);
    saveAndRenderGoals();

    form.reset();
  });
}

/**
 * 2. RENDER GOALS & CALCULATE PROGRESS AUTOMATICALLY
 */
function renderGoals() {
  const container = document.getElementById("goals-container");
  if (!container) return;

  if (goals.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1;" class="muted">No goals created yet. Use the form below to set your first goal!</p>`;
    return;
  }

  container.innerHTML = goals.map((goal) => {
    // Calculate progress based on milestones
    const totalMs = goal.milestones.length;
    const completedMs = goal.milestones.filter(m => m.completed).length;
    const progress = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;

    // Badge styling logic
    let badgeClass = "warning";
    if (progress >= 75) badgeClass = "success";
    else if (progress === 0) badgeClass = "";

    return `
      <article class="card">
        <div class="card-title">
          <h2>${escapeHtml(goal.name)}</h2>
          <span class="badge ${badgeClass}">${progress}%</span>
        </div>
        <div class="progress">
          <span style="width: ${progress}%"></span>
        </div>
        <p class="muted">${escapeHtml(goal.description || "No description provided.")}</p>
        
        <!-- Milestone List -->
        <ul class="list" style="margin-top: 12px;">
          ${goal.milestones.map(m => `
            <li class="list-item" style="cursor: pointer;" onclick="toggleMilestone(${goal.id}, ${m.id})">
              <span>${escapeHtml(m.text)}</span>
              <span>${m.completed ? '✓' : '○'}</span>
            </li>
          `).join("")}
        </ul>

        <!-- Add Milestone Input -->
        <div class="actions" style="margin-top:18px; flex-direction: column; align-items: stretch; gap: 8px;">
          <div style="display: flex; gap: 6px;">
            <input type="text" id="ms-input-${goal.id}" placeholder="New milestone..." style="flex: 1; padding: 6px;">
            <button class="btn primary" onclick="addMilestone(${goal.id})">+</button>
          </div>
          <button class="btn danger" onclick="deleteGoal(${goal.id})" style="align-self: flex-start;">Delete Goal</button>
        </div>
      </article>
    `;
  }).join("");
}

/**
 * 3. MILESTONE & GOAL ACTIONS
 */
function addMilestone(goalId) {
  const input = document.getElementById(`ms-input-${goalId}`);
  if (!input || !input.value.trim()) return;

  const goal = goals.find(g => g.id === goalId);
  if (goal) {
    goal.milestones.push({
      id: Date.now(),
      text: input.value.trim(),
      completed: false
    });
    saveAndRenderGoals();
  }
}

function toggleMilestone(goalId, milestoneId) {
  const goal = goals.find(g => g.id === goalId);
  if (goal) {
    const milestone = goal.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.completed = !milestone.completed;
      saveAndRenderGoals();
    }
  }
}

function deleteGoal(goalId) {
  goals = goals.filter(g => g.id !== goalId);
  saveAndRenderGoals();
}

/**
 * 4. SAVE & SYNC
 */
function saveAndRenderGoals() {
  localStorage.setItem("nexus_goals", JSON.stringify(goals));
  renderGoals();
}

// State array for notes
let notes = JSON.parse(localStorage.getItem("nexus_notes")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const notesList = document.querySelector("#note-search")?.closest("section")?.querySelector(".list");
  if (notesList) {
    renderNotesList(notes);
    setupNoteForm();
    setupNoteSearch();
  }
});

/**
 * 1. HANDLE FORM SUBMISSION TO SAVE NOTE
 */
function setupNoteForm() {
  const form = document.getElementById("note-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const titleInput = document.getElementById("note-title");
    const contentInput = document.getElementById("note-content");

    const newNote = {
      id: Date.now(),
      title: titleInput.value.trim(),
      content: contentInput.value.trim()
    };

    notes.unshift(newNote); // Put newest note first
    saveAndRenderNotes();

    form.reset();
  });
}

/**
 * 2. RENDER NOTES TO THE EXISTING LIST STRUCTURE
 */
function renderNotesList(notesToRender) {
  // Select the list container inside the first card section
  const searchInput = document.getElementById("note-search");
  if (!searchInput) return;

  const listContainer = searchInput.closest("section").querySelector(".list");
  if (!listContainer) return;

  if (notesToRender.length === 0) {
    listContainer.innerHTML = `<li class="list-item"><span class="muted">No notes found. Save one on the right!</span></li>`;
    return;
  }

  listContainer.innerHTML = notesToRender.map((note) => `
    <li class="list-item">
      <span>
        <strong>${escapeHtml(note.title)}</strong><br>
        <span class="muted">${escapeHtml(note.content.substring(0, 40))}${note.content.length > 40 ? "..." : ""}</span>
      </span>
      <div style="display: flex; gap: 6px;">
        <button class="btn" onclick="openNote(${note.id})">Open</button>
        <button class="btn danger" onclick="deleteNote(${note.id})">Delete</button>
      </div>
    </li>
  `).join("");
}

/**
 * 3. REAL-TIME SEARCH FILTER
 */
function setupNoteSearch() {
  const searchInput = document.getElementById("note-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filteredNotes = notes.filter((note) => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    );
    renderNotesList(filteredNotes);
  });
}

/**
 * 4. NOTE ACTIONS (OPEN & DELETE)
 */
function openNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  // Populates the right-side form with the selected note's data for viewing/editing
  document.getElementById("note-title").value = note.title;
  document.getElementById("note-content").value = note.content;
}

function deleteNote(id) {
  notes = notes.filter((n) => n.id !== id);
  saveAndRenderNotes();
}

/**
 * 5. SAVE HELPER
 */
function saveAndRenderNotes() {
  localStorage.setItem("nexus_notes", JSON.stringify(notes));
  renderNotesList(notes);
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("timer")) {
    initActivityTracker();
  }
});

function initActivityTracker() {
  let secondsElapsed = 0;
  let timerInterval = null;
  let isRunning = false;

  const timerDisplay = document.getElementById("timer");
  const activitySelect = document.getElementById("activity-type-select");
  const taskInput = document.getElementById("focus-task-input");
  const titleDisplay = document.getElementById("focus-title-display");
  const currentTaskLabel = document.getElementById("focus-current-task");

  const startBtn = document.getElementById("btn-start");
  const pauseBtn = document.getElementById("btn-pause");
  const finishBtn = document.getElementById("btn-finish");
  const resetBtn = document.getElementById("btn-reset");

  // Sync Category Select & Input Display
  function updateTaskLabel() {
    const category = activitySelect.value;
    const detail = taskInput.value.trim();
    
    titleDisplay.textContent = category === "Custom" ? (detail || "Custom Task") : category;
    
    if (detail) {
      currentTaskLabel.textContent = `${category} (${detail})`;
    } else {
      currentTaskLabel.textContent = category;
    }
  }

  activitySelect.addEventListener("change", updateTaskLabel);
  taskInput.addEventListener("input", updateTaskLabel);

  // Time Formatter (HH:MM:SS)
  function formatTime(totalSecs) {
    const h = Math.floor(totalSecs / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSecs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  // Stopwatch Logic
  function startTimer() {
    if (isRunning) return;
    isRunning = true;

    timerInterval = setInterval(() => {
      secondsElapsed++;
      timerDisplay.textContent = formatTime(secondsElapsed);
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
  }

  function resetTimer() {
    pauseTimer();
    secondsElapsed = 0;
    timerDisplay.textContent = "00:00:00";
  }

  // Finish & Instantly Record to Storage
  function finishAndRecord() {
    if (secondsElapsed < 5) {
      alert("Session too short to record.");
      return;
    }

    pauseTimer();

    const category = activitySelect.value;
    const detail = taskInput.value.trim();
    const finalTaskName = detail ? `${category}: ${detail}` : category;
    
    // Convert duration into rounded minutes for stats
    const minutesSpent = Math.max(1, Math.round(secondsElapsed / 60));

    // 1. Update Global Focus Stats
    const stats = JSON.parse(localStorage.getItem("nexus_focus_stats")) || { count: 0, totalMinutes: 0 };
    stats.count += 1;
    stats.totalMinutes += minutesSpent;
    localStorage.setItem("nexus_focus_stats", JSON.stringify(stats));

    // 2. Append Activity Entry
    const logs = JSON.parse(localStorage.getItem("nexus_focus_logs")) || [];
    logs.unshift({
      category: category,
      details: detail || "-",
      timeFormatted: formatTime(secondsElapsed),
      minutes: minutesSpent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem("nexus_focus_logs", JSON.stringify(logs));

    // 3. Reset Timer & Refresh Table/Stats
    resetTimer();
    taskInput.value = "";
    updateTaskLabel();
    renderActivityUI();
  }

  // Render Table & Summary Cards
  function renderActivityUI() {
    const stats = JSON.parse(localStorage.getItem("nexus_focus_stats")) || { count: 0, totalMinutes: 0 };
    const logs = JSON.parse(localStorage.getItem("nexus_focus_logs")) || [];

    const hours = Math.floor(stats.totalMinutes / 60);
    const mins = stats.totalMinutes % 60;

    document.getElementById("focus-today-time").textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    document.getElementById("focus-today-sessions").textContent = stats.count || 0;

    // Render Table Body
    const tableBody = document.getElementById("focus-logs-body");
    tableBody.innerHTML = "";

    if (logs.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="muted" style="text-align:center; padding: 15px;">No activities recorded today yet.</td></tr>`;
    } else {
      logs.forEach(log => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><strong>${log.category}</strong></td>
          <td>${log.details}</td>
          <td><span class="badge success">${log.timeFormatted}</span></td>
          <td class="muted">${log.timestamp}</td>
        `;
        tableBody.appendChild(row);
      });
    }
  }

  // Event Listeners
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  finishBtn.addEventListener("click", finishAndRecord);
  resetBtn.addEventListener("click", resetTimer);

  // Initial Load
  renderActivityUI();
  updateTaskLabel();
}

document.addEventListener("DOMContentLoaded", () => {
  // Check if we are on the Analytics page by detecting unique elements
  const fourGridStats = document.querySelectorAll(".four-grid .stat-number");
  if (fourGridStats.length === 4) {
    renderAnalytics();
  }
});

/**
 * COMPUTE AND RENDER ANALYTICS FROM LOCALSTORAGE
 */
function renderAnalytics() {
  // 1. Fetch live data arrays from local storage
  const tasks = JSON.parse(localStorage.getItem("nexus_tasks")) || [];
  const focusStats = JSON.parse(localStorage.getItem("nexus_focus_stats")) || {
    sessionsCompleted: 0,
    totalMinutes: 0,
    streak: 1
  };

  // 2. Compute metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const focusHours = Math.floor(focusStats.totalMinutes / 60);
  const focusMins = focusStats.totalMinutes % 60;
  const focusTimeDisplay = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  // 3. Update top 4 summary cards
  const summaryStatEls = document.querySelectorAll(".four-grid .stat-number");
  if (summaryStatEls.length === 4) {
    summaryStatEls[0].textContent = completedTasks;
    summaryStatEls[1].textContent = focusTimeDisplay;
    summaryStatEls[2].textContent = `${focusStats.streak}d`;
    summaryStatEls[3].textContent = `${completionRate}%`;
  }

  // 4. Update the Weekly Activity badge and placeholder message
  const weeklyBadge = document.querySelector(".card-title .badge");
  if (weeklyBadge) {
    weeklyBadge.textContent = "Live Summary";
    weeklyBadge.className = "badge success";
  }

  // 5. Update Activity History table "Today" row
  const todayRowCells = document.querySelectorAll(".table-wrap tbody tr:first-child td");
  if (todayRowCells.length === 4) {
    todayRowCells[1].textContent = completedTasks;
    todayRowCells[2].textContent = focusTimeDisplay;
    todayRowCells[3].textContent = `${completionRate}%`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("analytics-tasks-completed")) {
    renderAnalytics();
  }
});

function renderAnalytics() {
  const tasks = JSON.parse(localStorage.getItem("nexus_tasks")) || [];
  const focusStats = JSON.parse(localStorage.getItem("nexus_focus_stats")) || { count: 0, totalMinutes: 0 };
  const history = JSON.parse(localStorage.getItem("nexus_history")) || [];

  // 1. Overall Calculations
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const focusHours = Math.floor(focusStats.totalMinutes / 60);
  const focusMins = focusStats.totalMinutes % 60;
  const formattedFocus = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  document.getElementById("analytics-tasks-completed").textContent = completedTasks;
  document.getElementById("analytics-focus-time").textContent = formattedFocus;
  document.getElementById("analytics-completion-rate").textContent = `${completionRate}%`;

  // Streak logic (Calculated from activity history array)
  const streak = calculateStreak(history);
  document.getElementById("analytics-streak").textContent = `${streak}d`;

  // 2. Render Activity History Table
  const historyTableBody = document.getElementById("activity-history-body");
  historyTableBody.innerHTML = "";

  if (history.length === 0) {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="muted" style="text-align:center; padding: 20px;">
          No recorded activity yet. Complete tasks or focus sessions to log history.
        </td>
      </tr>`;
  } else {
    history.forEach(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.tasksCompleted}</td>
        <td>${entry.focusTime}</td>
        <td>${entry.completionRate}%</td>
      `;
      historyTableBody.appendChild(row);
    });
  }
}

function calculateStreak(history) {
  if (!history.length) return 0;
  let streak = 0;
  for (let entry of history) {
    if (entry.tasksCompleted > 0 || entry.focusMinutes > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Global State Default Settings
let nexusSettings = JSON.parse(localStorage.getItem("nexus_settings")) || {
  theme: "dark",
  accent: "purple",
  timeFormat24: false,
  reduceMotion: false,
  showCompleted: true
};

document.addEventListener("DOMContentLoaded", () => {
  // Apply saved global settings across all pages on load
  applyGlobalSettings();

  // If on settings.html, initialize interactive controls
  if (document.getElementById("theme")) {
    initSettingsControls();
  }
});

/**
 * 1. INITIALIZE CONTROLS & LISTENERS
 */
function initSettingsControls() {
  const themeSelect = document.getElementById("theme");
  const accentSelect = document.getElementById("accent");
  const timeFormatCheckbox = document.getElementById("time-format");
  const reduceMotionCheckbox = document.getElementById("reduce-motion");
  const showCompletedCheckbox = document.getElementById("show-completed");

  const exportBtn = document.querySelector('[data-action="export-data"]');
  const importBtn = document.querySelector('[data-action="import-data"]');
  const clearBtn = document.querySelector('[data-action="clear-data"]');

  // Populate UI elements with current stored settings
  if (themeSelect) themeSelect.value = nexusSettings.theme;
  if (accentSelect) accentSelect.value = nexusSettings.accent;
  if (timeFormatCheckbox) timeFormatCheckbox.checked = nexusSettings.timeFormat24;
  if (reduceMotionCheckbox) reduceMotionCheckbox.checked = nexusSettings.reduceMotion;
  if (showCompletedCheckbox) showCompletedCheckbox.checked = nexusSettings.showCompleted;

  // Real-time Event Listeners for Live Preview
  themeSelect?.addEventListener("change", (e) => {
    nexusSettings.theme = e.target.value;
    saveAndApplySettings();
  });

  accentSelect?.addEventListener("change", (e) => {
    nexusSettings.accent = e.target.value;
    saveAndApplySettings();
  });

  timeFormatCheckbox?.addEventListener("change", (e) => {
    nexusSettings.timeFormat24 = e.target.checked;
    saveAndApplySettings();
  });

  reduceMotionCheckbox?.addEventListener("change", (e) => {
    nexusSettings.reduceMotion = e.target.checked;
    saveAndApplySettings();
  });

  showCompletedCheckbox?.addEventListener("change", (e) => {
    nexusSettings.showCompleted = e.target.checked;
    saveAndApplySettings();
  });

  // Attach Action Button Handlers
  exportBtn?.addEventListener("click", exportDataJSON);
  importBtn?.addEventListener("click", importDataJSON);
  clearBtn?.addEventListener("click", clearLocalData);
}

/**
 * 2. PERSISTENCE & GLOBAL DOM UPDATES
 */
function saveAndApplySettings() {
  localStorage.setItem("nexus_settings", JSON.stringify(nexusSettings));
  applyGlobalSettings();
}

function applyGlobalSettings() {
  const root = document.documentElement;

  // Apply root attributes for theme and accent colors
  root.setAttribute("data-theme", nexusSettings.theme);
  root.setAttribute("data-accent", nexusSettings.accent);

  // Toggle reduce motion on the body tag
  if (nexusSettings.reduceMotion) {
    document.body.classList.add("reduce-motion");
  } else {
    document.body.classList.remove("reduce-motion");
  }
}

/**
 * 3. BACKUP, RESTORE & DATA RESET HANDLERS
 */
function exportDataJSON() {
  const fullBackup = {
    settings: nexusSettings,
    tasks: JSON.parse(localStorage.getItem("nexus_tasks")) || [],
    goals: JSON.parse(localStorage.getItem("nexus_goals")) || [],
    notes: JSON.parse(localStorage.getItem("nexus_notes")) || [],
    focusStats: JSON.parse(localStorage.getItem("nexus_focus_stats")) || {},
    plannerEvents: JSON.parse(localStorage.getItem("nexus_planner_events")) || []
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `nexus_workspace_backup_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importDataJSON() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/json";

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        if (importedData.settings) localStorage.setItem("nexus_settings", JSON.stringify(importedData.settings));
        if (importedData.tasks) localStorage.setItem("nexus_tasks", JSON.stringify(importedData.tasks));
        if (importedData.goals) localStorage.setItem("nexus_goals", JSON.stringify(importedData.goals));
        if (importedData.notes) localStorage.setItem("nexus_notes", JSON.stringify(importedData.notes));
        if (importedData.focusStats) localStorage.setItem("nexus_focus_stats", JSON.stringify(importedData.focusStats));
        if (importedData.plannerEvents) localStorage.setItem("nexus_planner_events", JSON.stringify(importedData.plannerEvents));

        alert("Workspace backup successfully restored!");
        window.location.reload();
      } catch (err) {
        alert("Error: Invalid JSON configuration file provided.");
      }
    };
    reader.readAsText(file);
  };

  fileInput.click();
}

function clearLocalData() {
  const confirmClear = confirm("Are you sure you want to delete all NEXUS data? This will clear all tasks, goals, notes, and preferences.");
  if (confirmClear) {
    localStorage.clear();
    alert("Workspace data has been reset.");
    window.location.reload();
  }
}



// Planner State
let currentDate = new Date();
let selectedDateStr = new Date().toISOString().split("T")[0];
let plannerEvents = JSON.parse(localStorage.getItem("nexus_planner_events")) || [
  {
    id: 1,
    title: "JavaScript study",
    type: "event",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    completed: false
  },
  {
    id: 2,
    title: "Project submission",
    type: "deadline",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    completed: false
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const calendarGrid = document.getElementById("calendar-grid");
  if (calendarGrid) {
    initPlannerModule();
  }
});

function initPlannerModule() {
  // Event listeners for month controls
  document.querySelector('[data-action="prev-month"]')?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  document.querySelector('[data-action="next-month"]')?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  document.querySelector('[data-action="today"]')?.addEventListener("click", () => {
    currentDate = new Date();
    selectedDateStr = new Date().toISOString().split("T")[0];
    renderCalendar();
    renderPlannerList();
  });

  // Event listener for adding items
  document.getElementById("planner-form")?.addEventListener("submit", handleAddPlannerItem);

  // Filter dropdown listener
  document.getElementById("planner-filter")?.addEventListener("change", renderPlannerList);

  renderCalendar();
  renderPlannerList();
}

/**
 * 1. DYNAMIC CALENDAR GENERATION
 */
function renderCalendar() {
  const calendarGrid = document.getElementById("calendar-grid");
  const monthYearHeader = document.getElementById("calendar-month-year");
  if (!calendarGrid || !monthYearHeader) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  monthYearHeader.textContent = `${monthNames[month]} ${year}`;

  // First day of month & total days
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Align Monday as index 0
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  let gridHTML = `
    <div class="day-name">Mon</div><div class="day-name">Tue</div><div class="day-name">Wed</div>
    <div class="day-name">Thu</div><div class="day-name">Fri</div><div class="day-name">Sat</div><div class="day-name">Sun</div>
  `;

  // Previous month filler days
  for (let i = firstDayIndex; i > 0; i--) {
    gridHTML += `<div class="day-muted">${prevMonthTotalDays - i + 1}</div>`;
  }

  // Current month days
  const todayStr = new Date().toISOString().split("T")[0];

  for (let day = 1; day <= totalDays; day++) {
    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(month + 1).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const isToday = dateStr === todayStr ? "today" : "";
    const isSelected = dateStr === selectedDateStr ? "selected" : "";

    gridHTML += `<div class="calendar-day ${isToday} ${isSelected}" onclick="selectPlannerDate('${dateStr}')">${day}</div>`;
  }

  calendarGrid.innerHTML = gridHTML;
}

function selectPlannerDate(dateStr) {
  selectedDateStr = dateStr;
  
  const titleEl = document.getElementById("selected-date-title");
  if (titleEl) {
    const todayStr = new Date().toISOString().split("T")[0];
    titleEl.textContent = dateStr === todayStr ? "Today's Schedule" : `Schedule for ${dateStr}`;
  }

  renderCalendar();
  renderPlannerList();
}

/**
 * 2. SCHEDULE LIST MANAGEMENT
 */
function handleAddPlannerItem(e) {
  e.preventDefault();

  const titleInput = document.getElementById("planner-title");
  const typeSelect = document.getElementById("planner-type");
  const timeInput = document.getElementById("planner-time");

  const title = titleInput?.value.trim();
  if (!title) return;

  const newItem = {
    id: Date.now(),
    title: title,
    type: typeSelect ? typeSelect.value : "event",
    date: selectedDateStr,
    time: timeInput?.value || "09:00",
    completed: false
  };

  plannerEvents.push(newItem);
  localStorage.setItem("nexus_planner_events", JSON.stringify(plannerEvents));

  titleInput.value = "";
  renderPlannerList();
}

function renderPlannerList() {
  const listEl = document.getElementById("planner-list");
  const filterSelect = document.getElementById("planner-filter");
  if (!listEl) return;

  const filter = filterSelect ? filterSelect.value : "all";

  // Filter items for the selected date
  const itemsForDate = plannerEvents.filter((item) => {
    const matchesDate = item.date === selectedDateStr;
    const matchesFilter = filter === "all" || item.type === filter;
    return matchesDate && matchesFilter;
  });

  // Sort items chronologically
  itemsForDate.sort((a, b) => a.time.localeCompare(b.time));

  if (itemsForDate.length === 0) {
    listEl.innerHTML = `<li class="list-item"><span class="muted">No scheduled activities for this date.</span></li>`;
    return;
  }

  listEl.innerHTML = itemsForDate
    .map(
      (item) => `
    <li class="list-item">
      <span><strong>${item.time}</strong> — ${escapeHTML(item.title)}</span>
      <div>
        <span class="badge ${item.type === "deadline" ? "danger" : "success"}">${item.type.toUpperCase()}</span>
        <button class="btn icon-only" onclick="deletePlannerItem(${item.id})" aria-label="Delete item" style="margin-left: 8px;">&times;</button>
      </div>
    </li>
  `
    )
    .join("");
}

function deletePlannerItem(id) {
  plannerEvents = plannerEvents.filter((item) => item.id !== id);
  localStorage.setItem("nexus_planner_events", JSON.stringify(plannerEvents));
  renderPlannerList();
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag] || tag));
}

//Dashboard render

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dash-task-percent")) {
    renderDashboard();
  }
});

function renderDashboard() {
  // Fetch user data or fallback to clean empty arrays/objects
  const tasks = JSON.parse(localStorage.getItem("nexus_tasks")) || [];
  const goals = JSON.parse(localStorage.getItem("nexus_goals")) || [];
  const focusStats = JSON.parse(localStorage.getItem("nexus_focus_stats")) || { count: 0, totalMinutes: 0 };
  const plannerEvents = JSON.parse(localStorage.getItem("nexus_planner_events")) || [];

  // 1. Task Progress Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  document.getElementById("dash-task-badge").textContent = `${totalTasks} tasks`;
  document.getElementById("dash-task-percent").textContent = `${taskPercent}%`;
  document.getElementById("dash-task-bar").style.width = `${taskPercent}%`;
  document.getElementById("dash-tasks-remaining").textContent = remainingTasks;

  // 2. Goals Calculations
  const activeGoals = goals.filter(g => !g.completed).length;
  const completedGoals = goals.filter(g => g.completed).length;
  const goalPercent = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  document.getElementById("dash-active-goals").textContent = activeGoals;
  document.getElementById("dash-goals-completed").textContent = `${goalPercent}%`;

  // 3. Upcoming Deadlines (Today)
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDeadlines = plannerEvents.filter(e => e.date === todayStr && e.type === "deadline").length;

  document.getElementById("dash-deadline-badge").textContent = `${todayDeadlines} today`;
  document.getElementById("dash-deadline-count").textContent = todayDeadlines;

  // 4. Focus Statistics
  const focusHours = Math.floor(focusStats.totalMinutes / 60);
  const focusMins = focusStats.totalMinutes % 60;
  const timeFormatted = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  document.getElementById("dash-focus-count").textContent = focusStats.count || 0;
  document.getElementById("dash-focus-time").textContent = timeFormatted;
}
