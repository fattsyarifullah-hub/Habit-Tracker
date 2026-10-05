// LOCAL STORAGE DATA TASK
const STORAGE_TASK = 'LIST_TASK_DATA'

// INPUT NEW TASK
const listTask = document.getElementById('listTask')
const createForm = document.getElementById('createForm')
const inputTitleForm = document.getElementById('createTitleForm')

// GET DATE NOW 
const today = new Date()
const date = String(today.getDate()).padStart(2, '0')
const month = today.toLocaleString('en-US', { month : 'long'})
const year = today.getFullYear()

const dateFormat = `${date} ${month} ${year}`

document.getElementById('new-date').innerText = dateFormat

// HELPER PARSING JSON TO ARRAY
function getTask() {
    const data = localStorage.getItem(STORAGE_TASK)
    return data ? JSON.parse(data) : []
}

// HELPER SET NEW TASK
function saveTask(tasks) {
    localStorage.setItem(STORAGE_TASK, JSON.stringify(tasks))
}

// FUNCTION TODAY FORMAT
function todayFormat(dateObj = new Date()) {
    const y = dateObj.getFullYear()
    const m = String(dateObj.getMonth() + 1).padStart(2, '0')
    const d = String(dateObj.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

// FUNCTION YESTERDAY FORMAT
function yesterdayFormat() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return todayFormat(yesterday)
}

// FUNCTION DAILY RESET TASKS
function checkAndResetDailyTasks() {
    const tasks = getTask()
    const todayStr = todayFormat()
    const yesterdayStr = yesterdayFormat()
    let isUpdated = false

    tasks.forEach(task => {

        if (task.lastCompletedDate !== todayStr) {
            if (task.completedToday) {
                task.completedToday = false
                isUpdated = true
            }

            if (task.lastCompletedDate && task.lastCompletedDate !== yesterdayStr) {
                if (task.streak > 0) {
                    task.streak = 0
                    isUpdated = true
                }
            }
        }
    })

    if (isUpdated) {
        saveTask(tasks)
    }
}

// FUNCTION DONE TASK ( COMPLETED )
function doneTask(id) {
    const tasks = getTask()
    const todayStr = todayFormat()

    const updatedTasks = tasks.map(task => {
        if (task.id === id) {
            const isNowCompleted = !task.completedToday

            if (!task.history) task.history = {}

            if (isNowCompleted) {
                task.completedToday = true
                task.lastCompletedDate = todayStr
                task.history[todayStr] = true
                task.streak += 1
            } else {
                task.completedToday = false
                delete task.history[todayStr]
                task.streak = 0
            }
        }

        return task
    })

    saveTask(updatedTasks)
    readAllTask()
}

// READ ALL TASK
function readAllTask() {
    checkAndResetDailyTasks()
    
    const tasks = getTask()
    const completedTask = tasks.filter(task => task.completedToday).length
    const totalTask = tasks.length

    listTask.innerHTML = `
    <div class="header-list">
            <div class="text-list">
              <h4>LIST YOUR ACTIVITY TODAY</h4>
              <p>Choose Your Task For See The Heatmap</p>
            </div>

            <div class="done-list">
              <h4> ${completedTask} / <span> ${totalTask} </span> </br> Done</h4>
              </div>
              </div>

          <div class="progress-bar">
            <span></span>
          </div>
    `
    
    tasks.forEach((task) => {
        const taskCard = document.createElement('div')
        taskCard.className =`container-task ${task.completedToday ? 'completed' : ''}`

        taskCard.innerHTML = `
        <div class="checkbox-task">
              <input type="checkbox" ${task.completedToday ? 'checked' : ''} onchange="doneTask(${task.id})" />
            </div>

            <div class="text-task">
              <h5>${task.title}</h5>
              <p>${task.streak} streak</p>
            </div>

            <div class="trash-task">
              <button onclick="deleteTask(${task.id})" >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
              </svg>
              </button>
              </div>
              `
              
              listTask.appendChild(taskCard)
            });
            
            countAllTask()
            renderCurrentHeatmapTask()
            
}

// CREATE NEW TASK 
createForm.addEventListener('submit', function (e) {
    e.preventDefault()

    const title = inputTitleForm.value.trim()
    let data = getTask()

    const newTask = {
        id: Date.now(),
        title,
        streak: 0,
        completedToday : false,
        lastCompletedDate: null,
        history: {}
    }

    data.push(newTask)

    saveTask(data)
    createForm.reset()
    readAllTask()
})

// DELETE ONE TASK
function deleteTask(id) {
    let allTask = getTask()
    allTask = allTask.filter((task) => task.id !== id)  

    saveTask(allTask)
    readAllTask()
}

// COUNT TOTAL TASK FOR SUMMARY
function countAllTask() {
    const totalTask = getTask().length
    const allClass = document.querySelectorAll('.total-task')

    allClass.forEach(item => {
        item.innerHTML = `${totalTask}`
    })
}


function renderTaskHeatmap(task) {
    const gridContainer = document.getElementById('heatmapGrid')
    const taskContainer = document.getElementById('heatmapTask')
    const monthContainer = document.getElementById('heatmapMonth')

    taskContainer.innerText = `${task.title}`

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const monthName = now.toLocaleString('en-US', { month: 'long'})

    monthContainer.innerText = `${monthName} ${year}`

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate()

    gridContainer.innerHTML = ''

    
    document.getElementById('currentTask').innerText = `${currentTaskIndex}`

    for ( let day = 1; day <= totalDaysInMonth; day++) {
        const containerDay = document.createElement('div')
        containerDay.className = 'container-day'
        containerDay.innerText = day

        const formattedMonth = String(month + 1).padStart(2, '0')
        const formattedDay = String(day).padStart(2, '0')
        const dateKey = `${year}-${formattedMonth}-${formattedDay}`

        if (task.history && task.history[dateKey]){
            containerDay.classList.add('completed')
        }

        gridContainer.appendChild(containerDay)
    }
}



let currentTaskIndex = 0;


function renderCurrentHeatmapTask() {
    const tasks = getTask()

    if (tasks.length == 0) {
        renderTaskHeatmap(null)
        return
    }

    if (currentTaskIndex < 0) {
        currentTaskIndex = 0
    }

    const activeTask = tasks[currentTaskIndex]

    renderTaskHeatmap(activeTask)

    checkStreak(activeTask)
    
}

function nextTask() {
    const tasks = getTask()

    currentTaskIndex = currentTaskIndex + 1
    renderCurrentHeatmapTask()
}

function prevTask() {
    const tasks = getTask()

    currentTaskIndex = currentTaskIndex - 1

    renderCurrentHeatmapTask()
}

function checkStreak(task) {
    
    const streak = document.getElementById('heatmapStreak')

    streak.innerText = `${task.streak} streak`

}

readAllTask()