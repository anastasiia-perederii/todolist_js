const input = document.querySelector('#todoInput');
const addBtn = document.querySelector('#addBtn');
const list = document.querySelector('#todoList');
const filters = document.querySelectorAll('.filter');
const counter = document.querySelector('#taskCounter');

let tasks = [];
let currentFilter = 'all';

addBtn.addEventListener('click', handleAddTask);
input.addEventListener('keydown', e => {
  e.key === 'Enter' && handleAddTask();
});
filters.forEach(btn =>
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  }),
);

/**
 * Добавляет новую задачу
 */
function handleAddTask() {
  const text = input.value.trim();
  if (!text) return;

  tasks.push({ text, completed: false });
  input.value = '';
  saveTasks();
  renderTasks();
}

/**
 * Сохраняет список задач в localStorage
 */
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Загружает задачи из localStorage
 */
function loadTasks() {
  const stored = localStorage.getItem('tasks');
  if (stored) {
    tasks = JSON.parse(stored);
    renderTasks();
  }
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

  filtered.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.text;
    if (task.completed) li.classList.add('done');

    // Редактирование по двойному клику
    li.addEventListener('dblclick', () => editTask(index));

    // Переключение выполнено/не выполнено
    li.addEventListener('click', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    const del = document.createElement('button');
    del.textContent = '✖';
    del.className = 'deleteBtn';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(del);
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

/**
 * Позволяет редактировать задачу в инпуте
 */
function editTask(index) {
  const newText = prompt('Edit task:', tasks[index].text);
  if (newText !== null) {
    tasks[index].text = newText.trim();
    saveTasks();
  }
}

loadTasks();