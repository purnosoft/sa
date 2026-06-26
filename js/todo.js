const subjectSelect = document.getElementById('subjectSelect');
const subtopicInput = document.getElementById('subtopicInput');
const btnAdd = document.getElementById('btnAdd');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const emptyState = document.getElementById('emptyState');

const tagClassMap = {
    hmath: 'tag-hmath',
    physics: 'tag-physics',
    chemistry: 'tag-chemistry',
    biology: 'tag-biology',
    ict: 'tag-ict',
    bangla: 'tag-bangla',
    english: 'tag-english'
};

const subjectLabelMap = {
    hmath: 'Higher Math',
    physics: 'Physics',
    chemistry: 'Chem',
    biology: 'Bio',
    ict: 'ICT',
    bangla: 'Bangla',
    english: 'English'
};

let currentSelectedWrapper = null;

////// To Do List Initialize
  
let todoListArray = getLocalStorage('todoListArray');
  
if (!todoListArray) {
    todoListArray = [];
    setLocalStorage('todoListArray', todoListArray);
}

// ── Rebuild entire list from array ─────────────────
function rebuildListFromStorage() {
    todoListArray = getLocalStorage('todoListArray');

    const existingWrappers = todoList.querySelectorAll('.todo-wrapper');
    existingWrappers.forEach(w => w.remove());

    const sw = getLocalStorage('stopwatch');

    todoListArray.forEach((todoObj, index) => {
        const wrapper = createTodoElement(todoObj, index);

        if (
            sw &&
            sw.isRunning &&
            sw.linkedTodoId &&
            todoObj.id === sw.linkedTodoId &&
            !todoObj.done
        ) {
            const startBtn = wrapper.querySelector('.btn-start');
            if (startBtn) {
                startBtn.textContent = '⏳ Pending...';
                startBtn.classList.add('btn-start--pending');
            }
            wrapper.classList.add('pending');
        }
    });

    updateCount();
}

// ── Create a single todo element ──────────────────
function createTodoElement(todoObj, index) {
    const { subTag, subLabel, subTopic, done } = todoObj;

    const wrapper = document.createElement('li');
    wrapper.className = 'todo-wrapper';
    wrapper.dataset.index = index;
    wrapper.dataset.id = todoObj.id;

    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'item-actions';

    const startBtn = document.createElement('button');
    startBtn.className = 'btn-start';
    startBtn.textContent = '▶ Start Studying';

    if (done) {
        wrapper.classList.add('done');
        startBtn.style.display = 'none';
    }

    todoItem.innerHTML = `
        <span class="todo-checkbox" ${done ? 'data-done="true"' : ''}></span>
        <span class="todo-subject-tag ${subTag}">${subLabel}</span>
        <span class="todo-text">${escapeHTML(subTopic)}</span>
        <span class="todo-delete-hint" title="Remove">✕</span>
    `;

    actionsDiv.appendChild(startBtn);

    wrapper.append(
        todoItem,
        actionsDiv
    );

    todoItem.addEventListener('click', (e) => {
        if (e.target.closest('.todo-delete-hint')) return;
        selectWrapper(wrapper);
    });

    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (!taskIsRunning()) {
            return
        }
        const idx = Number(wrapper.dataset.index);
        if (Number.isNaN(idx)) return;

        const todo = todoListArray[idx];
        if (!todo || todo.done) return;

        wrapper.classList.add('pending');
        startBtn.textContent = '⏳ Pending...';
        startBtn.classList.add('btn-start--pending');
        
        runStopwatch({
            fromTodoList: true,
            todo
        });
        
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.click();
            goToSWTab();
        };
        
    });

    const deleteHint = todoItem.querySelector('.todo-delete-hint');
    deleteHint.addEventListener('click', (e) => {
        e.stopPropagation();

        if (currentSelectedWrapper === wrapper) {
            deselectCurrent();
        }

        const idx = Number(wrapper.dataset.index);
        if (!Number.isNaN(idx) && todoListArray[idx]) {
            todoListArray.splice(idx, 1);
            setLocalStorage('todoListArray', todoListArray);
        }

        wrapper.style.transform = 'translateX(40px)';
        wrapper.style.opacity = '0';
        wrapper.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            wrapper.remove();
            rebuildListFromStorage();
        }, 300);
    });

    todoList.insertBefore(wrapper, emptyState);
    return wrapper;
}

// ── Add a new todo ────────────────────────────────
function addTodo() {
    const subjectValue = subjectSelect.value;
    const subtopicText = subtopicInput.value.trim();

    if (!subjectValue) {
        subjectSelect.style.borderColor = '#ff3d71';
        subjectSelect.style.boxShadow = '0 0 18px rgba(255,61,113,0.5)';
        setTimeout(() => {
            subjectSelect.style.borderColor = '';
            subjectSelect.style.boxShadow = '';
        }, 600);
        return;
    }

    if (!subtopicText) {
        subtopicInput.style.borderColor = '#ff3d71';
        subtopicInput.style.boxShadow = '0 0 18px rgba(255,61,113,0.5)';
        setTimeout(() => {
            subtopicInput.style.borderColor = '';
            subtopicInput.style.boxShadow = '';
        }, 600);
        return;
    }

    const tagClass = tagClassMap[subjectValue] || 'tag-hmath';
    const label = subjectLabelMap[subjectValue] || 'english';

    const todoObject = {
        id: Date.now(),
        subTag: tagClass,
        subLabel: label,
        subTopic: subtopicText,
        done: false
    };

    todoListArray.push(todoObject);
    setLocalStorage('todoListArray', todoListArray);

    const newIndex = todoListArray.length - 1;
    const wrapper = createTodoElement(todoObject, newIndex);

    const todoItem = wrapper.querySelector('.todo-item');
    todoItem.style.boxShadow = '0 0 25px rgba(0,229,255,0.3), 0 0 50px rgba(180,77,255,0.2)';
    setTimeout(() => { todoItem.style.boxShadow = ''; }, 500);

    updateCount();

    subtopicInput.value = '';
    subjectSelect.selectedIndex = 0;
}

// ── Helper functions ──────────────────────────────
function updateCount() {
    const items = todoList.querySelectorAll('.todo-wrapper');
    const totalCount = items.length;
    
    todoCount.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;

    const completedItems = document.querySelectorAll('.todo-checkbox[data-done="true"]');
    const completedCount = completedItems.length;
    
    //Achievement! 
    let playerState = getLocalStorage('playerState');
    playerState.todoStreak = completedCount;
    setLocalStorage('playerState', playerState);
    checkAch();
    //

    const completedLabel = document.getElementById('completedCount');
    if (completedCount > 0) {
        completedLabel.textContent = `${completedCount} completed`;
        completedLabel.style.display = 'inline';
    } else {
        completedLabel.style.display = 'none';
    }

    emptyState.style.display = totalCount === 0 ? 'flex' : 'none';
}

function deselectCurrent() {
    if (currentSelectedWrapper) {
        currentSelectedWrapper.classList.remove('selected');
        currentSelectedWrapper = null;
    }
}

function selectWrapper(wrapper) {
    if (currentSelectedWrapper === wrapper) {
        deselectCurrent();
    } else {
        deselectCurrent();
        wrapper.classList.add('selected');
        currentSelectedWrapper = wrapper;
    }
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Global click to deselect when clicking outside ──
document.addEventListener('click', function(e) {
    if (e.target.closest('.todo-wrapper')) return;
    deselectCurrent();
});

// ── Initialisation ────────────────────────────────
btnAdd.addEventListener('click', addTodo);
subtopicInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTodo();
    }
});