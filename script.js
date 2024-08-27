document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.task-form');
    const taskInput = document.getElementById('new-task');
    const taskDesc = document.getElementById('task-desc');
    const taskDate = document.getElementById('task-date');
    const taskPriority = document.getElementById('task-priority');
    const todoList = document.getElementById('todo-list');
    const filters = document.querySelectorAll('.filter');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const statsSection = document.getElementById('stats');
    let darkMode = JSON.parse(localStorage.getItem('darkMode')) || false;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Apply dark mode if previously enabled
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }

    function renderTasks(filter = 'all') {
        todoList.innerHTML = '';
        tasks.forEach((task, index) => {
            if (filter === 'all' || task.status === filter) {
                const li = document.createElement('li');
                li.className = `card ${task.priority} ${task.status} ${darkMode ? 'dark-mode' : ''}`;
                li.draggable = true;
                li.dataset.index = index;
                li.innerHTML = `
                    <div class="card-header">
                        <span>${task.title} (Due: ${task.dueDate || 'No date'})</span>
                        <div>
                            <button onclick="toggleComplete(${index})">${task.status === 'completed' ? 'Uncomplete' : 'Complete'}</button>
                            <button onclick="deleteTask(${index})">Delete</button>
                        </div>
                    </div>
                    ${task.description ? `<p>${task.description}</p>` : ''}
                `;
                todoList.appendChild(li);
            }
        });
        calculateStats();
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const newTask = {
            title: taskInput.value.trim(),
            description: taskDesc.value.trim(),
            dueDate: taskDate.value,
            priority: taskPriority.value,
            status: 'active'
        };

        if (newTask.title !== "") {
            tasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
            updateCalendar();  // Update calendar after adding a task
            form.reset();  // Reset the form after adding a task
        } else {
            alert("Task title is required!");
        }
    });

    window.toggleComplete = function(index) {
        tasks[index].status = tasks[index].status === 'active' ? 'completed' : 'active';
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateCalendar();  // Update calendar after toggling task completion
    };

    window.deleteTask = function(index) {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateCalendar();  // Update calendar after deleting a task
    };

    function calculateStats() {
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const activeTasks = tasks.filter(task => task.status === 'active').length;
        const totalTasks = tasks.length;
        const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('active-tasks').textContent = activeTasks;
        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completion-rate-percentage').textContent = `${completionRate}%`;

        // Update CSS variable for circle chart
        document.documentElement.style.setProperty('--completion-rate', `${completionRate * 3.6}deg`);
    }

    function updateCalendar() {
        const calendarEl = document.getElementById('calendar');
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: tasks.filter(task => task.dueDate).map(task => ({
                title: task.title,
                start: task.dueDate,
                description: task.description,
                backgroundColor: task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'
            }))
        });
        calendar.render();
    }

    filters.forEach(filter => {
        filter.addEventListener('click', function() {
            filters.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderTasks(this.dataset.filter);
        });
    });

    darkModeToggle.addEventListener('click', function() {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        document.body.classList.toggle('dark-mode');
        renderTasks();
    });

    renderTasks();  // Initial render of tasks
    updateCalendar();  // Initial render of the calendar
    calculateStats();  // Initial calculation of stats
});
