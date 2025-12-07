// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view');

const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const emptyTasks = document.getElementById('empty-tasks');

const transDesc = document.getElementById('transaction-desc');
const transAmount = document.getElementById('transaction-amount');
const transType = document.getElementById('transaction-type');
const addTransBtn = document.getElementById('add-transaction-btn');
const transList = document.getElementById('transaction-list');
const emptyBudget = document.getElementById('empty-budget');

const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');

// Initialization
function init() {
    renderTasks();
    renderBudget();
    updateSummary();
}

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-view`).classList.add('active');
    });
});

// --- Task Manager Logic ---

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        emptyTasks.classList.remove('hidden');
    } else {
        emptyTasks.classList.add('hidden');
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `list-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <span onclick="toggleTask(${task.id})" style="cursor: pointer; flex: 1;">${task.text}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
            `;
            taskList.appendChild(li);
        });
    }
}

function addTask() {
    const text = taskInput.value.trim();
    if (text) {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };
        tasks.push(newTask);
        taskInput.value = '';
        saveTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
}

function toggleTask(id) {
    tasks = tasks.map(t => {
        if (t.id === id) {
            return { ...t, completed: !t.completed };
        }
        return t;
    });
    saveTasks();
}

// Event Listeners for Tasks
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

// --- Budget Tracker Logic ---

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderBudget();
    updateSummary();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
}

function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
    
    const balance = income - expense;

    totalBalanceEl.textContent = formatCurrency(balance);
    totalIncomeEl.textContent = formatCurrency(income);
    totalExpenseEl.textContent = formatCurrency(expense);
}

function renderBudget() {
    transList.innerHTML = '';
    
    if (transactions.length === 0) {
        emptyBudget.classList.remove('hidden');
    } else {
        emptyBudget.classList.add('hidden');
        transactions.slice().reverse().forEach(t => { // Show newest first
            const li = document.createElement('li');
            li.className = `list-item transaction-item ${t.type}`;
            li.innerHTML = `
                <div class="transaction-info">
                    <span>${t.desc}</span>
                    <small style="color: var(--text-muted); font-size: 0.8rem;">${new Date(t.id).toLocaleDateString('ar-SA')}</small>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="transaction-amount">${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}</span>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
                </div>
            `;
            transList.appendChild(li);
        });
    }
}

function addTransaction() {
    const desc = transDesc.value.trim();
    const amount = parseFloat(transAmount.value);
    const type = transType.value;

    if (desc && amount && amount > 0) {
        const newTrans = {
            id: Date.now(),
            desc: desc,
            amount: amount,
            type: type
        };
        transactions.push(newTrans);
        transDesc.value = '';
        transAmount.value = '';
        saveTransactions();
    } else {
        alert('الرجاء إدخال وصف ومبلغ صحيح');
    }
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
}

// Event Listeners for Budget
addTransBtn.addEventListener('click', addTransaction);

// Expose functions to global scope for HTML onclick attributes
window.deleteTask = deleteTask;
window.toggleTask = toggleTask;
window.deleteTransaction = deleteTransaction;

// Run Init
init();
