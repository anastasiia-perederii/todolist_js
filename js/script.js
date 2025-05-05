const API_URL = 'https://jsonplaceholder.typicode.com/todos';

const input = document.querySelector('#todoInput');
const addBtn = document.querySelector('#addBtn');
const list = document.querySelector('#todoList');
const filters = document.querySelectorAll('.filter');
const counter = document.querySelector('#taskCounter');

let tasks = [];
let currentFilter = 'all';

// Загрузка задач при запуске
window.addEventListener('DOMContentLoaded', loadTasks);

// Добавление задачи
addBtn.addEventListener('click', handleAddTask);
input.addEventListener('keydown', e => {
  e.key === 'Enter' && handleAddTask();
});

// Фильтрация задач
filters.forEach(btn =>
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  }),
);

function loadTasks() {
  fetch(`${API_URL}?_limit=10`)
    .then(res => res.json())
    .then(data => {
      tasks = data.map(t => ({ id: t.id, text: t.title, completed: t.completed }));
      renderTasks();
    });
}

/**
 * Добавляет новую задачу
 */
function handleAddTask() {
  const text = input.value.trim();
  if (!text) return;

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ title: text, completed: false }),
    headers: { 'Content-type': 'application/json; charset=utf-8' },
  })
    .then(res => res.json())
    .then(newTask => {
      tasks.unshift({ id: newTask.id, text: newTask.title, completed: newTask.completed });
      input.value = '';
      renderTasks();
    });
}

/**
 * Обновляет DOM с учётом фильтра
 */
function renderTasks() {
  list.innerHTML = '';

  const filtered = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('done');

    const span = document.createElement('span');
    span.className = 'text';
    span.textContent = task.text;

    // Редактирование по двойному клику
    span.addEventListener('dblclick', () => editTask(task.id));

    // Переключение выполнено/не выполнено
    li.addEventListener('click', () => toggleComplete(task.id));

    const delBtn = document.createElement('button');
    delBtn.textContent = '✖';
    delBtn.className = 'deleteBtn';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });

  updateCounter();
}

/**
 * Подсчёт оставшихся задач
 */
function updateCounter() {
  const count = tasks.filter(t => !t.completed).length;
  counter.textContent = `Remaining tasks: ${count}`;
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;

  fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed: task.completed }),
    headers: { 'Content-type': 'application/json; charset=utf-8' },
  }).then(() => renderTasks());
}

function deleteTask(id) {
  fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(() => {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
  });
}

/**
 * Позволяет редактировать задачу в инпуте
 */
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  const newText = prompt('Edit task:', task.text);
  if (newText === null || !newText.trim()) return;

  fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title: newText }),
    headers: { 'Content-type': 'application/json; charset=utf-8' },
  }).then(() => {
    task.text = newText.trim();
    renderTasks();
  });
}
