// State
const state = {
    goals: JSON.parse(localStorage.getItem('goals')) || [],
    opponentProgress: 65 // Mock data for now
};

// DOM Elements
const elements = {
    goalList: document.getElementById('goal-list'),
    addBtn: document.getElementById('add-goal-btn'),
    inputArea: document.getElementById('goal-input-area'),
    input: document.getElementById('new-goal-input'),
    saveBtn: document.getElementById('save-goal-btn'),
    myProgress: document.getElementById('my-progress'),
    motivationMsg: document.getElementById('motivation-msg')
};

// Core Logic
function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(state.goals));
    render();
}

function addGoal(text) {
    if (!text.trim()) return;
    const newGoal = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString().split('T')[0] // Today's date YYYY-MM-DD
    };
    state.goals.push(newGoal);
    saveGoals();
    elements.input.value = '';
    elements.inputArea.classList.add('hidden');
}

function toggleGoal(id) {
    const goal = state.goals.find(g => g.id === id);
    if (goal) {
        goal.completed = !goal.completed;
        saveGoals();
    }
}

function deleteGoal(id) {
    state.goals = state.goals.filter(g => g.id !== id);
    saveGoals();
}

function calculateProgress() {
    if (state.goals.length === 0) return 0;
    const completed = state.goals.filter(g => g.completed).length;
    return Math.round((completed / state.goals.length) * 100);
}

function getMotivationMessage(percent) {
    if (percent === 100) return "완벽해! 오늘 하루를 지배했어! 👑";
    if (percent >= 80) return "거의 다 왔어! 조금만 더 힘내! 🔥";
    if (percent >= 50) return "절반은 넘었어! 멈추지 마! 🏃";
    if (percent > 0) return "시작이 반이야! 계속 가보자! 🌱";
    return "아직 시작도 안 했다고? 움직여! ⚡️";
}

// Rendering
function render() {
    // 1. Render Goal List
    elements.goalList.innerHTML = '';
    state.goals.forEach(goal => {
        const li = document.createElement('li');
        li.className = `goal-item ${goal.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="check-circle">
                <i class="fa-solid fa-check" style="display: ${goal.completed ? 'block' : 'none'}"></i>
            </div>
            <span class="goal-text">${goal.text}</span>
            <button class="delete-btn" onclick="event.stopPropagation(); window.deleteGoalHandler(${goal.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        li.onclick = () => toggleGoal(goal.id);
        elements.goalList.appendChild(li);
    });

    // 2. Update Progress
    const progress = calculateProgress();
    elements.myProgress.style.setProperty('--percent', progress);
    elements.myProgress.querySelector('.percent-text').textContent = `${progress}%`;
    
    // 3. Update Motivation
    elements.motivationMsg.textContent = getMotivationMessage(progress);
}

// Event Listeners
elements.addBtn.addEventListener('click', () => {
    elements.inputArea.classList.toggle('hidden');
    if (!elements.inputArea.classList.contains('hidden')) {
        elements.input.focus();
    }
});

elements.saveBtn.addEventListener('click', () => addGoal(elements.input.value));

elements.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addGoal(elements.input.value);
});

// Expose delete handler to window for inline onclick
window.deleteGoalHandler = (id) => deleteGoal(id);

// Initial Render
render();
