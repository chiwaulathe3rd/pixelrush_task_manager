/* -----------------------------------------
   THEME TOGGLE
----------------------------------------- */
const themeBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

// Initialize theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeIcon.className = "fas fa-sun";
    themeText.textContent = "Light Mode";
} else {
    themeIcon.className = "fas fa-moon";
    themeText.textContent = "Dark Mode";
}

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";
    themeText.textContent = isDark ? "Light Mode" : "Dark Mode";
});

/* -----------------------------------------
MA PRO FEATURES
----------------------------------------- */
function setupPremiumPopups() {
    const streakCard = document.getElementById('streakCard');
    const bestDayCard = document.getElementById('bestDayCard');
    const activityCard = document.getElementById('activityCard');
    
    if (streakCard) {
        streakCard.addEventListener('click', () => {
            showPremiumPopup('🔥 Current Streak', 'Track your daily completion streaks! See how many consecutive days you\'ve been productive with detailed analytics and motivational insights.');
        });
    }
    
    if (bestDayCard) {
        bestDayCard.addEventListener('click', () => {
            showPremiumPopup('🏆 Best Day Analytics', 'Discover your most productive days! Get insights into when you work best, with detailed breakdowns of task completion patterns and productivity trends.');
        });
    }
    
    if (activityCard) {
        activityCard.addEventListener('click', () => {
            showPremiumPopup('📝 Activity History', 'Full activity tracking with detailed timestamps! See every action you\'ve taken, filter by date range, and export your productivity data for analysis.');
        });
    }
}

function showPremiumPopup(title, message) {
    const existingPopup = document.getElementById('premiumPopup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'premiumPopup';
    popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    popup.innerHTML = `
        <div style="background: linear-gradient(135deg, #c00 0%, #EC185D 100%); color: white; padding: 30px; border-radius: 15px; max-width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="font-size: 48px; margin-bottom: 20px;">⭐</div>
            <h3 style="color: white; margin-bottom: 15px;">${title}</h3>
            <p style="margin-bottom: 20px; font-size: 16px; opacity: 0.9;">${message}</p>
            <p style="margin-bottom: 25px; font-size: 14px; opacity: 0.8;">Available in Pixelrush Pro</p>
            <button onclick="document.getElementById('premiumPopup').remove()" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                Got it!
            </button>
        </div>
    `;
    
    document.body.appendChild(popup);
}

/* -----------------------------------------
 MA JS ARRAY 4 TASKS
----------------------------------------- */

// DOM Elements
const quickAddBtn = document.getElementById("quickAddBtn");
const taskModal = document.getElementById("taskModal");
const deleteModal = document.getElementById("deleteModal");
const closeModal = document.getElementById("closeModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");
const taskForm = document.getElementById("taskForm");
const taskFilter = document.getElementById("taskFilter");
const tasksList = document.getElementById("tasksList");
const tasksTitle = document.getElementById("tasksTitle");
const trashBin = document.getElementById("trashBin");

// State
let currentFilter = 'all';
let taskToDelete = null;
let editingTaskId = null;
let allTasks = [];
let taskIdCounter = 1;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log("Pixelrush Task Manager (Local Storage) loaded");
    setupPremiumPopups();
    setupEventListeners();
    setupDragAndDrop();
    loadTasksFromStorage();
});

function setupEventListeners() {
    quickAddBtn.addEventListener("click", () => openTaskModal());
    closeModal.addEventListener("click", () => closeTaskModal());
    cancelDelete.addEventListener("click", () => closeDeleteModal());
    confirmDelete.addEventListener("click", () => deleteTask());
    
    taskModal.addEventListener("click", (e) => {
        if (e.target === taskModal) closeTaskModal();
    });
    
    deleteModal.addEventListener("click", (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    taskForm.addEventListener("submit", handleTaskSubmit);
    
    taskFilter.addEventListener("change", (e) => {
        currentFilter = e.target.value;
        updateTasksList();
    });

    document.querySelectorAll('.clickable-card').forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.getAttribute('data-filter');
            taskFilter.value = filter;
            currentFilter = filter;
            updateTasksList();
        });
    });
}

/* -----------------------------------------
LOCAL STORAGE
----------------------------------------- */

function loadTasksFromStorage() {
    try {
        const storedTasks = localStorage.getItem('pixelrush_tasks');
        if (storedTasks) {
            allTasks = JSON.parse(storedTasks);
            // Find highest ID for counter
            if (allTasks.length > 0) {
                taskIdCounter = Math.max(...allTasks.map(t => t.id)) + 1;
            }
        } else {
            allTasks = [];
            // Add sample tasks if empty
            if (allTasks.length === 0) {
                addSampleTasks();
            }
        }
        console.log(`Loaded ${allTasks.length} tasks from localStorage`);
        updateDashboard();
        
    } catch (error) {
        console.error("Error loading tasks:", error);
        showToast("⚠️ Could not load tasks", "danger");
        allTasks = [];
        updateDashboard();
    }
}

function addSampleTasks() {
    const sampleTasks = [
        {
            id: 1,
            title: "Welcome to Pixelrush!",
            description: "This is a sample task. Click the checkbox to mark it complete.",
            type: "personal",
            due_date: new Date().toISOString().slice(0,10),
            priority: "medium",
            completed: 0,
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            title: "Try drag and drop",
            description: "Drag this task to the trash bin to delete it",
            type: "work",
            due_date: new Date().toISOString().slice(0,10),
            priority: "low",
            completed: 0,
            created_at: new Date().toISOString()
        },
        {
            id: 3,
            title: "Explore dark mode",
            description: "Click the theme toggle button in the top right",
            type: "school",
            due_date: new Date().toISOString().slice(0,10),
            priority: "high",
            completed: 1,
            created_at: new Date().toISOString()
        }
    ];
    
    allTasks = sampleTasks;
    taskIdCounter = 4;
    saveTasksToStorage();
}

function saveTasksToStorage() {
    try {
        localStorage.setItem('pixelrush_tasks', JSON.stringify(allTasks));
        console.log(`Saved ${allTasks.length} tasks to localStorage`);
        return true;
    } catch (error) {
        console.error("Error saving tasks:", error);
        showToast("Failed to save tasks", "danger");
        return false;
    }
}

function addTask(task) {
    task.id = taskIdCounter++;
    task.created_at = new Date().toISOString();
    allTasks.push(task);
    const saved = saveTasksToStorage();
    if (saved) {
        updateDashboard();
        return { success: true, task: task };
    }
    return { success: false, error: "Save failed" };
}

function updateTask(updatedTask) {
    const index = allTasks.findIndex(t => t.id == updatedTask.id);
    if (index === -1) {
        return { success: false, error: "Task not found" };
    }
    
    // Preserve creation date
    updatedTask.created_at = allTasks[index].created_at;
    allTasks[index] = updatedTask;
    
    const saved = saveTasksToStorage();
    if (saved) {
        updateDashboard();
        return { success: true, task: updatedTask };
    }
    return { success: false, error: "Update failed" };
}

function deleteTask() {
    if (!taskToDelete) return;
    
    const index = allTasks.findIndex(t => t.id == taskToDelete);
    if (index === -1) {
        showToast("Task not found", "danger");
        return;
    }
    
    // Remove the task
    allTasks.splice(index, 1);
    
    if (saveTasksToStorage()) {
        showToast("Task deleted successfully", "success");
        closeDeleteModal();
        updateDashboard();
    } else {
        showToast("Failed to delete task", "danger");
    }
}

/* -----------------------------------------
  FORM LISTENERS
----------------------------------------- */

function handleTaskSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const type = document.getElementById("taskType").value;
    const dueDate = document.getElementById("taskDueDate").value;
    const priorityInput = document.querySelector('input[name="priority"]:checked');
    
    if (!title) {
        showToast("Task title is required", "warning");
        return;
    }
    
    if (!priorityInput) {
        showToast("Please select a priority", "warning");
        return;
    }

    const priority = priorityInput.value;

    const taskData = {
        title,
        description,
        type,
        due_date: dueDate || new Date().toISOString().slice(0,10),
        priority,
        completed: 0
    };

    let result;
    if (editingTaskId) {
        taskData.id = editingTaskId;
        result = updateTask(taskData);
        if (result?.success) {
            showToast("Task updated successfully", "success");
        }
    } else {
        result = addTask(taskData);
        if (result?.success) {
            showToast("Task added successfully", "success");
        }
    }

    if (result?.success) {
        closeTaskModal();
    } else {
        showToast(result?.error || "Failed to save task", "danger");
    }
}

/* -----------------------------------------
   TASK DISPLAY & FILTERING
----------------------------------------- */

function updateDashboard() {
    const total = allTasks.length;
    const completedCount = allTasks.filter(t => Number(t.completed) === 1).length;
    const pendingCount = total - completedCount;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completedCount;
    document.getElementById("pendingTasks").textContent = pendingCount;

    updateProgressCircle();
    updateTasksList();
}

function updateTasksList() {
    let filteredTasks = [...allTasks];

    switch(currentFilter) {
        case 'completed':
            filteredTasks = allTasks.filter(t => Number(t.completed) === 1);
            tasksTitle.textContent = 'Completed Tasks';
            break;
        case 'pending':
            filteredTasks = allTasks.filter(t => Number(t.completed) === 0);
            tasksTitle.textContent = 'Pending Tasks';
            break;
        case 'work':
        case 'personal':
        case 'school':
            filteredTasks = allTasks.filter(t => t.type === currentFilter);
            tasksTitle.textContent = `${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Tasks`;
            break;
        default:
            tasksTitle.textContent = 'All Tasks';
    }

    if (filteredTasks.length === 0) {
        let message = 'No tasks yet';
        if (currentFilter !== 'all') {
            message = `No ${currentFilter} tasks`;
        }
        tasksList.innerHTML = `
            <div class="muted" style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-tasks" style="font-size: 2rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <h4 style="margin-bottom: 10px;">${message}</h4>
                <p style="opacity: 0.7;">Click "Add Task" to create your first task</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${Number(task.completed) === 1 ? 'completed' : ''}" data-task-id="${task.id}" draggable="true">
            <div class="task-checkbox ${Number(task.completed) === 1 ? 'checked' : ''}" 
                onclick="toggleTaskCompletion(${task.id})">
                ${Number(task.completed) === 1 ? '✓' : ''}
            </div>
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="task-type ${task.type}">${task.type}</span>
                    <span>Due: ${formatDate(task.due_date)}</span>
                    <span class="priority-${task.priority}">${task.priority}</span>
                </div>
                ${task.description ? `<div class="task-description small muted">${escapeHtml(task.description)}</div>` : ''}
            </div>
            <div class="task-actions-buttons">
                <button class="task-action-btn" onclick="editTask(${task.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn" onclick="openDeleteModal(${task.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/* -----------------------------------------
   TASK INTERACTIONS
----------------------------------------- */

function toggleTaskCompletion(id) {
    const task = allTasks.find(t => t.id == id);
    if (!task) {
        showToast('Task not found', 'danger');
        return;
    }
    
    task.completed = Number(task.completed) === 1 ? 0 : 1;
    
    const result = updateTask(task);
    if (result?.success) {
        showToast(`Task marked as ${task.completed ? 'completed' : 'pending'}`, 'success');
    } else {
        showToast("Failed to update task", "danger");
    }
}

function editTask(id) {
    const task = allTasks.find(t => t.id == id);
    if (!task) {
        showToast('Task not found', 'danger');
        return;
    }

    editingTaskId = id;
    document.getElementById("modalTitle").textContent = "Edit Task";
    document.getElementById("taskId").value = id;
    document.getElementById("taskTitle").value = task.title || "";
    document.getElementById("taskDescription").value = task.description || "";
    document.getElementById("taskType").value = task.type || "personal";
    document.getElementById("taskDueDate").value = task.due_date || "";
    const priorityInput = document.querySelector(`input[name="priority"][value="${task.priority}"]`);
    if (priorityInput) priorityInput.checked = true;

    openTaskModal();
}

function openTaskModal() {
    taskModal.style.display = "flex";
    document.body.classList.add("modal-open");
}

function closeTaskModal() {
    taskModal.style.display = "none";
    document.body.classList.remove("modal-open");
    document.getElementById("modalTitle").textContent = "Add New Task";
    taskForm.reset();
    document.querySelector('input[name="priority"][value="low"]').checked = true;
    document.getElementById("taskId").value = "";
    editingTaskId = null;
}

function openDeleteModal(id) {
    taskToDelete = id;
    deleteModal.style.display = "flex";
    document.body.classList.add("modal-open");
}

function closeDeleteModal() {
    taskToDelete = null;
    deleteModal.style.display = "none";
    document.body.classList.remove("modal-open");
}

/* -----------------------------------------
   PROGRESS CIRCLE
----------------------------------------- */
function updateProgressCircle() {
    const today = new Date().toISOString().slice(0,10);
    const todayTasks = allTasks.filter(t => t.due_date === today);
    const completedToday = todayTasks.filter(t => Number(t.completed) === 1).length;
    const percent = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

    const ring = document.querySelector('.ring');
    if (!ring) return;
    
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (percent / 100) * circumference;

    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${offset}`;
    
    document.getElementById('progressPercent').textContent = `${percent}%`;
}

/* -----------------------------------------
   DRAG & DROP TRASH BIN
----------------------------------------- */
function setupDragAndDrop() {
    let draggedTask = null;

    trashBin.addEventListener('dragover', (e) => {
        e.preventDefault();
        trashBin.classList.add('drag-over');
    });

    trashBin.addEventListener('dragenter', (e) => {
        e.preventDefault();
        trashBin.classList.add('drag-over');
    });

    trashBin.addEventListener('dragleave', (e) => {
        if (!trashBin.contains(e.relatedTarget)) {
            trashBin.classList.remove('drag-over');
        }
    });

    trashBin.addEventListener('drop', (e) => {
        e.preventDefault();
        trashBin.classList.remove('drag-over');
        
        if (draggedTask) {
            const taskId = parseInt(draggedTask.getAttribute('data-task-id'));
            if (taskId) {
                draggedTask.classList.add('task-deleting');
                setTimeout(() => {
                    taskToDelete = taskId;
                    deleteTask();
                    draggedTask = null;
                }, 400);
            }
        }
    });

    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task-item')) {
            draggedTask = e.target;
            e.target.classList.add('dragging');
        }
    });

    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task-item')) {
            e.target.classList.remove('dragging');
            trashBin.classList.remove('drag-over');
            draggedTask = null;
        }
    });
}

/* -----------------------------------------
   UTILITY FUNCTIONS
----------------------------------------- */

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(msg, type = "success") {
    const colors = {
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#007bff'
    };
    
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        z-index: 10000;
        font-weight: 600;
        background: ${colors[type] || colors.info};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Add animation styles
    if (!document.querySelector('#toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes toastFadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes toastFadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    toast.style.animation = 'toastFadeIn 0.3s';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2700);
}

// Make functions available globally
window.toggleTaskCompletion = toggleTaskCompletion;
window.editTask = editTask;

window.openDeleteModal = openDeleteModal;
