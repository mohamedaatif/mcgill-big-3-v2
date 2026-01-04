/**
 * McGill Big 3 V2 - Main App Controller
 */

(function () {
    // DOM Elements
    const elements = {
        // Navigation
        navItems: document.querySelectorAll('.nav-item'),
        pages: document.querySelectorAll('.page'),

        // Workout - Level
        levelBar: document.getElementById('levelBar'),
        levelBadge: document.getElementById('levelBadge'),
        badDayMode: document.getElementById('badDayMode'),
        levelModal: document.getElementById('levelModal'),
        levelOptions: document.getElementById('levelOptions'),
        closeLevelModal: document.getElementById('closeLevelModal'),

        // Workout - Exercise
        exerciseName: document.getElementById('exerciseName'),
        exerciseList: document.getElementById('exerciseList'),
        exerciseItems: document.querySelectorAll('.exercise-item'),

        // Workout - Timer
        timerView: document.getElementById('timerView'),
        timerDisplay: document.getElementById('timerDisplay'),
        tensionSleeve: document.getElementById('tensionSleeve'),
        stageText: document.getElementById('stageText'),
        repCount: document.getElementById('repCount'),
        phaseLabel: document.getElementById('phaseLabel'),
        sideLabel: document.getElementById('sideLabel'),
        setLabel: document.getElementById('setLabel'),
        btnStart: document.getElementById('btnStart'),
        btnStop: document.getElementById('btnStop'),

        // Progress
        streakCount: document.getElementById('streakCount'),
        totalSessions: document.getElementById('totalSessions'),
        levelSessions: document.getElementById('levelSessions'),
        nextLevelIn: document.getElementById('nextLevelIn'),
        calendarGrid: document.getElementById('calendarGrid'),
        weekCount: document.getElementById('weekCount'),
        monthCount: document.getElementById('monthCount'),
        levelUpBanner: document.getElementById('levelUpBanner'),
        btnLevelUp: document.getElementById('btnLevelUp'),

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
    let currentWorkoutPlan = null;

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

        if (pageId === 'progress') updateProgressPage();
        if (pageId === 'pain') updatePainPage();
    }

    // ===== Level Management =====
    function initLevelControls() {
        // Level badge click opens modal
        elements.levelBadge.addEventListener('click', showLevelModal);
        elements.closeLevelModal.addEventListener('click', hideLevelModal);

        // Bad day toggle
        elements.badDayMode.addEventListener('change', () => {
            Storage.setBadDayMode(elements.badDayMode.checked);
            updateLevelDisplay();
            updateExerciseMeta();
        });

        // Level up button
        elements.btnLevelUp.addEventListener('click', () => {
            const settings = Storage.getSettings();
            const nextLevel = Exercises.getNextLevel(settings.level);
            if (nextLevel) {
                Storage.setLevel(nextLevel);
                updateLevelDisplay();
                updateExerciseMeta();
                updateProgressPage();
            }
        });
    }

    function showLevelModal() {
        const levels = Exercises.getAllLevels();
        const settings = Storage.getSettings();

        let html = '';
        Object.values(levels).forEach(level => {
            const isActive = level.id === settings.level ? 'active' : '';
            html += `
                <button class="level-option ${isActive}" data-level="${level.id}">
                    <span class="level-icon">${level.icon}</span>
                    <span class="level-name">${level.name}</span>
                    <span class="level-desc">${level.description}</span>
                </button>
            `;
        });

        elements.levelOptions.innerHTML = html;

        // Add click handlers
        elements.levelOptions.querySelectorAll('.level-option').forEach(btn => {
            btn.addEventListener('click', () => {
                Storage.setLevel(btn.dataset.level);
                updateLevelDisplay();
                updateExerciseMeta();
                hideLevelModal();
            });
        });

        elements.levelModal.classList.remove('hidden');
    }

    function hideLevelModal() {
        elements.levelModal.classList.add('hidden');
    }

    function updateLevelDisplay() {
        const settings = Storage.getSettings();
        const level = settings.badDayMode ?
            Exercises.getBadDayLevel() :
            Exercises.getLevel(settings.level);

        elements.levelBadge.querySelector('.level-icon').textContent = level.icon;
        elements.levelBadge.querySelector('.level-name').textContent = level.name;
        elements.levelBadge.querySelector('.level-desc').textContent = level.description;

        elements.badDayMode.checked = settings.badDayMode;
    }

    function updateExerciseMeta() {
        const settings = Storage.getSettings();
        const level = settings.badDayMode ?
            Exercises.getBadDayLevel() :
            Exercises.getLevel(settings.level);

        const pyramidStr = level.pyramid.join('-');

        document.querySelectorAll('.exercise-meta').forEach(el => {
            const exerciseId = el.dataset.meta;
            const exercise = Exercises.getExercise(exerciseId);
            const suffix = exercise.bilateral ? ' (L+R)' : '';
            el.textContent = `${pyramidStr} × ${level.holdDuration}s${suffix}`;
        });
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

        // Update header
        elements.exerciseName.textContent = currentExercise.name;

        // Highlight selected
        elements.exerciseItems.forEach(item => {
            item.classList.toggle('active', item.dataset.exercise === exerciseId);
        });

        // Generate workout plan
        currentWorkoutPlan = Exercises.generateWorkoutPlan(
            exerciseId,
            settings.level,
            settings.badDayMode
        );

        // Hide level bar, show timer
        elements.levelBar.classList.add('hidden');
        elements.timerView.classList.remove('hidden');
        elements.exerciseList.classList.add('hidden');

        // Initialize timer
        Timer.start(currentWorkoutPlan, {
            soundEnabled: settings.soundEnabled,
            vibrationEnabled: settings.vibrationEnabled
        }, {
            onTick: updateTimerUI,
            onPhaseChange: onPhaseChange,
            onStateChange: onStateChange,
            onComplete: onWorkoutComplete,
            onStop: resetTimerView
        });
    }

    function updateTimerUI(data) {
        // Timer display
        elements.timerDisplay.textContent = data.time.toString().padStart(2, '0');

        // Tension sleeve fill
        elements.tensionSleeve.style.height = `${data.progress}%`;

        // Rep count
        const pad = n => n.toString().padStart(2, '0');
        elements.repCount.textContent = `${pad(data.rep)} / ${pad(data.totalReps)}`;

        // Phase
        elements.phaseLabel.textContent = data.phase.toUpperCase();

        // Side
        elements.sideLabel.textContent = data.side || '—';

        // Set
        const level = Storage.getSettings().badDayMode ?
            Exercises.getBadDayLevel() :
            Exercises.getLevel(Storage.getSettings().level);
        elements.setLabel.textContent = `${data.set} / ${level.pyramid.length}`;

        // Visual state
        if (data.phase === 'hold') {
            elements.stageText.textContent = data.side ? `${data.side}` : 'Tension Loading';
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
        // Side announcement could go here
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
        const settings = Storage.getSettings();
        Storage.saveWorkout({
            exercise: currentExercise.id,
            level: settings.level,
            badDay: settings.badDayMode,
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
        elements.levelBar.classList.remove('hidden');
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
        const settings = Storage.getSettings();
        const streak = Storage.getStreak();
        const total = Storage.getTotalSessions();
        const levelSessions = Storage.getSessionsAtLevel(settings.level);
        const level = Exercises.getLevel(settings.level);

        elements.streakCount.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
        elements.totalSessions.textContent = total;
        elements.levelSessions.textContent = levelSessions;

        // Next level calculation
        if (level.sessionsToAdvance) {
            const remaining = Math.max(0, level.sessionsToAdvance - levelSessions);
            elements.nextLevelIn.textContent = remaining > 0 ? `${remaining} sessions` : 'Ready!';
        } else {
            elements.nextLevelIn.textContent = '—';
        }

        // Level up banner
        const suggestedLevel = Storage.shouldSuggestLevelUp();
        if (suggestedLevel) {
            elements.levelUpBanner.classList.remove('hidden');
        } else {
            elements.levelUpBanner.classList.add('hidden');
        }

        // Calendar
        generateCalendar();

        // Week/month stats
        elements.weekCount.textContent = `${Storage.getWeekStats()} / 7`;
        elements.monthCount.textContent = `${Storage.getMonthStats()} / 28`;
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
            Storage.savePainLog({ level: currentPainLevel });
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
        initLevelControls();
        initWorkoutPage();
        initPainPage();

        updateLevelDisplay();
        updateExerciseMeta();
        updateProgressPage();
        updatePainPage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
