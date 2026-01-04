/**
 * McGill Big 3 V2 - Main App Controller
 */

(function () {
    // DOM Elements
    const elements = {
        // Navigation
        navItems: document.querySelectorAll('.nav-item'),
        pages: document.querySelectorAll('.page'),

        // Workout
        exerciseName: document.getElementById('exerciseName'),
        exerciseList: document.getElementById('exerciseList'),
        exerciseItems: document.querySelectorAll('.exercise-item'),
        timerView: document.getElementById('timerView'),
        timerDisplay: document.getElementById('timerDisplay'),
        tensionSleeve: document.getElementById('tensionSleeve'),
        stageText: document.getElementById('stageText'),
        repCount: document.getElementById('repCount'),
        phaseLabel: document.getElementById('phaseLabel'),
        btnStart: document.getElementById('btnStart'),
        btnStop: document.getElementById('btnStop'),

        // Progress
        streakCount: document.getElementById('streakCount'),
        totalSessions: document.getElementById('totalSessions'),
        calendarGrid: document.getElementById('calendarGrid'),
        weekCount: document.getElementById('weekCount'),
        monthCount: document.getElementById('monthCount'),

        // Pain Log
        painGauge: document.getElementById('painGauge'),
        painFill: document.getElementById('painFill'),
        painValue: document.getElementById('painValue'),
        painUp: document.getElementById('painUp'),
        painDown: document.getElementById('painDown'),
        btnLogPain: document.getElementById('btnLogPain'),
        painHistory: document.getElementById('painHistory')
    };

    let currentExercise = null;
    let currentPainLevel = 5;

    // ===== Navigation =====
    function initNavigation() {
        elements.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                showPage(page);
            });
        });
    }

    function showPage(pageId) {
        elements.pages.forEach(p => p.classList.remove('active'));
        elements.navItems.forEach(n => n.classList.remove('active'));

        document.getElementById(`page-${pageId}`).classList.add('active');
        document.querySelector(`.nav-item[data-page="${pageId}"]`).classList.add('active');

        // Refresh page data
        if (pageId === 'progress') updateProgressPage();
        if (pageId === 'pain') updatePainPage();
    }

    // ===== Workout Page =====
    function initWorkoutPage() {
        elements.exerciseItems.forEach(item => {
            item.addEventListener('click', () => {
                const exerciseId = item.dataset.exercise;
                selectExercise(exerciseId);
            });
        });

        elements.btnStart.addEventListener('click', () => {
            Timer.toggle();
        });

        elements.btnStop.addEventListener('click', () => {
            Timer.stop();
            resetTimerView();
        });
    }

    function selectExercise(exerciseId) {
        currentExercise = Exercises.getExercise(exerciseId);
        const settings = Storage.getSettings();

        // Update UI
        elements.exerciseName.textContent = currentExercise.name;

        // Highlight selected
        elements.exerciseItems.forEach(item => {
            item.classList.toggle('active', item.dataset.exercise === exerciseId);
        });

        // Generate workout plan
        const workoutPlan = Exercises.generateWorkoutPlan(exerciseId, settings);

        // Show timer view
        elements.timerView.classList.remove('hidden');
        elements.exerciseList.classList.add('hidden');

        // Initialize timer
        Timer.start(workoutPlan, {
            onTick: updateTimerUI,
            onPhaseChange: onPhaseChange,
            onStateChange: onStateChange,
            onComplete: onWorkoutComplete,
            onStop: resetTimerView
        });
    }

    function updateTimerUI(data) {
        // Update timer display
        elements.timerDisplay.textContent = data.time.toString().padStart(2, '0');

        // Update tension sleeve (fill height)
        elements.tensionSleeve.style.height = `${data.progress}%`;

        // Update rep count
        const padNum = (n) => n.toString().padStart(2, '0');
        elements.repCount.textContent = `${padNum(data.rep)} / ${padNum(data.totalReps)}`;

        // Update phase
        elements.phaseLabel.textContent = data.phase.toUpperCase();

        // Update stage text
        if (data.phase === 'hold') {
            elements.stageText.textContent = data.side ? `${data.side} Side` : 'Tension Loading';
            elements.timerView.classList.remove('state-rest');
            if (data.isRunning) {
                elements.timerDisplay.classList.add('vibrate');
            }
        } else {
            elements.stageText.textContent = 'System Release';
            elements.timerView.classList.add('state-rest');
            elements.timerDisplay.classList.remove('vibrate');
        }
    }

    function onPhaseChange(step) {
        // Could add sounds here
    }

    function onStateChange(state) {
        elements.btnStart.textContent = state.isRunning ? 'Pause' : 'Resume';
        if (!state.isRunning) {
            elements.timerDisplay.classList.remove('vibrate');
        }
    }

    function onWorkoutComplete() {
        elements.timerDisplay.classList.remove('vibrate');
        elements.btnStart.textContent = 'Complete!';
        elements.btnStart.disabled = true;

        // Save workout
        Storage.saveWorkout({
            exercise: currentExercise.id,
            completed: true
        });

        // Mark exercise as done
        const item = document.querySelector(`.exercise-item[data-exercise="${currentExercise.id}"]`);
        if (item) {
            item.classList.add('done');
            item.querySelector('.exercise-status').textContent = '✓';
        }

        // Auto-reset after 2 seconds
        setTimeout(resetTimerView, 2000);
    }

    function resetTimerView() {
        elements.timerView.classList.add('hidden');
        elements.exerciseList.classList.remove('hidden');
        elements.timerDisplay.classList.remove('vibrate');
        elements.timerView.classList.remove('state-rest');
        elements.tensionSleeve.style.height = '0%';
        elements.timerDisplay.textContent = '10';
        elements.btnStart.textContent = 'Initiate';
        elements.btnStart.disabled = false;
        elements.exerciseName.textContent = 'Select Exercise';

        elements.exerciseItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    // ===== Progress Page =====
    function updateProgressPage() {
        const workouts = Storage.getWorkouts();
        const streak = Storage.getStreak();

        elements.streakCount.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
        elements.totalSessions.textContent = workouts.length;

        // Generate calendar
        generateCalendar();

        // Week/month counts
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        let weekWorkouts = 0;
        let monthWorkouts = 0;

        workouts.forEach(w => {
            const wDate = new Date(w.date);
            if (wDate >= weekStart) weekWorkouts++;
            if (wDate >= monthStart) monthWorkouts++;
        });

        elements.weekCount.textContent = `${weekWorkouts} / 7`;
        elements.monthCount.textContent = `${monthWorkouts} / 28`;
    }

    function generateCalendar() {
        const workouts = Storage.getWorkouts();
        const today = new Date();
        let html = '';

        for (let i = 27; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayNum = date.getDate();

            const hasWorkout = workouts.some(w => w.date.startsWith(dateStr));
            const isToday = i === 0;

            let classes = 'calendar-day';
            if (hasWorkout) classes += ' complete';
            if (isToday) classes += ' today';

            html += `<div class="${classes}">${dayNum}</div>`;
        }

        elements.calendarGrid.innerHTML = html;
    }

    // ===== Pain Log Page =====
    function initPainPage() {
        elements.painUp.addEventListener('click', () => {
            if (currentPainLevel < 10) {
                currentPainLevel++;
                updatePainGauge();
            }
        });

        elements.painDown.addEventListener('click', () => {
            if (currentPainLevel > 0) {
                currentPainLevel--;
                updatePainGauge();
            }
        });

        elements.btnLogPain.addEventListener('click', () => {
            Storage.savePainLog({
                level: currentPainLevel
            });
            updatePainHistory();
        });
    }

    function updatePainGauge() {
        const percentage = (currentPainLevel / 10) * 100;
        elements.painFill.style.height = `${percentage}%`;
        elements.painValue.textContent = currentPainLevel;
    }

    function updatePainPage() {
        updatePainGauge();
        updatePainHistory();
    }

    function updatePainHistory() {
        const logs = Storage.getPainLogs().slice(0, 7);

        if (logs.length === 0) {
            elements.painHistory.innerHTML = '<p style="color: var(--text-dim); padding: var(--space-md) 0;">No entries yet</p>';
            return;
        }

        let html = '';
        logs.forEach(log => {
            const date = new Date(log.date);
            const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const levelClass = log.level <= 3 ? 'low' : log.level >= 7 ? 'high' : '';

            html += `
                <div class="history-item">
                    <div class="history-level ${levelClass}">${log.level}</div>
                    <div class="history-info">
                        <div class="history-date">${dateStr}</div>
                    </div>
                </div>
            `;
        });

        elements.painHistory.innerHTML = html;
    }

    // ===== Initialize =====
    function init() {
        initNavigation();
        initWorkoutPage();
        initPainPage();
        updateProgressPage();
        updatePainPage();
    }

    // Start app when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
