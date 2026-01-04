/**
 * McGill Big 3 V2 - Main App Controller
 * Complete implementation with all V1 features
 */

(function () {
    // DOM Elements
    const elements = {
        // Navigation
        navItems: document.querySelectorAll('.nav-item'),
        pages: document.querySelectorAll('.page'),
        settingsFab: document.getElementById('settingsFab'),

        // Workout - Header
        greeting: document.getElementById('greeting'),
        exerciseName: document.getElementById('exerciseName'),

        // Workout - Last Session
        lastSessionCard: document.getElementById('lastSessionCard'),
        lastSessionDate: document.getElementById('lastSessionDate'),
        lastLevel: document.getElementById('lastLevel'),
        lastPyramid: document.getElementById('lastPyramid'),
        lastHold: document.getElementById('lastHold'),

        // Workout - Consistency
        weeklyScore: document.getElementById('weeklyScore'),
        consistencyFill: document.getElementById('consistencyFill'),

        // Workout - Level
        levelBar: document.getElementById('levelBar'),
        levelBadge: document.getElementById('levelBadge'),
        badDayMode: document.getElementById('badDayMode'),
        levelModal: document.getElementById('levelModal'),
        levelOptions: document.getElementById('levelOptions'),
        closeLevelModal: document.getElementById('closeLevelModal'),

        // Workout - Exercise
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

        // Workout - Complete
        workoutComplete: document.getElementById('workoutComplete'),
        completeMessage: document.getElementById('completeMessage'),
        completeDuration: document.getElementById('completeDuration'),
        completeProgress: document.getElementById('completeProgress'),
        completeActions: document.getElementById('completeActions'),

        // Workout - Instructions Modal
        instructionsModal: document.getElementById('instructionsModal'),
        instructionsTitle: document.getElementById('instructionsTitle'),
        instructionsBody: document.getElementById('instructionsBody'),
        closeInstructions: document.getElementById('closeInstructions'),

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
        painHistory: document.getElementById('painHistory'),
        symptomGrid: document.getElementById('symptomGrid'),
        locationGrid: document.getElementById('locationGrid'),

        // Settings
        settingHold: document.getElementById('settingHold'),
        settingRest: document.getElementById('settingRest'),
        settingSound: document.getElementById('settingSound'),
        settingVibration: document.getElementById('settingVibration'),
        holdValue: document.getElementById('holdValue'),
        restValue: document.getElementById('restValue'),
        btnResetSettings: document.getElementById('btnResetSettings')
    };

    let currentExercise = null;
    let currentPainLevel = 5;
    let currentWorkoutPlan = null;
    let workoutStartTime = null;
    let todayProgress = {};
    let selectedSymptoms = [];
    let selectedLocation = null;

    // ===== Initialization =====
    function init() {
        updateGreeting();
        initNavigation();
        initExerciseIcons();
        initLevelControls();
        initWorkoutPage();
        initPainPage();
        initSettingsPage();
        initInstructionsModal();

        updateLevelDisplay();
        updateExerciseMeta();
        updateConsistencyCard();
        updateLastSessionCard();
        updateProgressPage();
        updatePainPage();
        loadSettings();
        resetTodayProgress();
    }

    // ===== Exercise Icons (SVG injection) =====
    function initExerciseIcons() {
        document.querySelectorAll('.exercise-icon[data-info]').forEach(icon => {
            const exerciseId = icon.dataset.info;
            const exercise = Exercises.getExercise(exerciseId);
            if (exercise && exercise.icon) {
                icon.innerHTML = exercise.icon;
            }
        });
    }

    // ===== Greeting =====
    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Good evening';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 17) greeting = 'Good afternoon';
        elements.greeting.textContent = greeting;
    }

    // ===== Navigation =====
    function initNavigation() {
        elements.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                showPage(page);
            });
        });

        elements.settingsFab.addEventListener('click', () => {
            showPage('settings');
        });
    }

    function showPage(pageId) {
        elements.pages.forEach(p => p.classList.remove('active'));
        elements.navItems.forEach(n => n.classList.remove('active'));

        document.getElementById(`page-${pageId}`).classList.add('active');
        const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (navItem) navItem.classList.add('active');

        if (pageId === 'progress') updateProgressPage();
        if (pageId === 'pain') updatePainPage();
        if (pageId === 'settings') loadSettings();
    }

    // ===== Last Session Card =====
    function updateLastSessionCard() {
        const workouts = Storage.getWorkouts();
        if (workouts.length === 0) {
            elements.lastSessionCard.classList.add('hidden');
            return;
        }

        // Get most recent workout
        const lastWorkout = workouts[0];
        const lastLevel = Exercises.getLevel(lastWorkout.level || 'standard');

        // Format date
        const date = new Date(lastWorkout.date);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        let dateStr;
        if (diffDays === 0) {
            dateStr = 'Today';
        } else if (diffDays === 1) {
            dateStr = 'Yesterday';
        } else if (diffDays < 7) {
            dateStr = `${diffDays} days ago`;
        } else {
            dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        elements.lastSessionDate.textContent = dateStr;
        elements.lastLevel.textContent = lastLevel.name;
        elements.lastPyramid.textContent = lastLevel.pyramid.join('-');
        elements.lastHold.textContent = `${lastLevel.holdDuration}s`;
        elements.lastSessionCard.classList.remove('hidden');
    }

    // ===== Consistency Card =====
    function updateConsistencyCard() {
        const weekStats = Storage.getWeekStats();
        const percentage = (weekStats / 7) * 100;
        elements.weeklyScore.textContent = `${weekStats}/7`;
        elements.consistencyFill.style.width = `${percentage}%`;
    }

    // ===== Today Progress Tracking =====
    function resetTodayProgress() {
        todayProgress = {
            'curl-up': false,
            'side-plank': false,
            'bird-dog': false
        };
    }

    function getCompletedCount() {
        return Object.values(todayProgress).filter(v => v).length;
    }

    // ===== Level Management =====
    function initLevelControls() {
        elements.levelBadge.addEventListener('click', showLevelModal);
        elements.closeLevelModal.addEventListener('click', hideLevelModal);

        elements.badDayMode.addEventListener('change', () => {
            Storage.setBadDayMode(elements.badDayMode.checked);
            updateLevelDisplay();
            updateExerciseMeta();
        });

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
                    <span class="level-name">${level.name}</span>
                    <span class="level-desc">${level.description}</span>
                </button>
            `;
        });

        elements.levelOptions.innerHTML = html;

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

    // ===== Exercise Instructions Modal =====
    function initInstructionsModal() {
        document.querySelectorAll('[data-info]').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const exerciseId = icon.dataset.info;
                showInstructions(exerciseId);
            });
        });

        elements.closeInstructions.addEventListener('click', () => {
            elements.instructionsModal.classList.add('hidden');
        });
    }

    function showInstructions(exerciseId) {
        const exercise = Exercises.getExercise(exerciseId);
        if (!exercise) return;

        elements.instructionsTitle.textContent = exercise.name;

        let html = '<ol class="instructions-list">';
        exercise.instructions.forEach(step => {
            html += `<li>${step}</li>`;
        });
        html += '</ol>';

        if (exercise.tips && exercise.tips.length > 0) {
            html += '<p class="tips-label">Tips</p><ul class="tips-list">';
            exercise.tips.forEach(tip => {
                html += `<li>${tip}</li>`;
            });
            html += '</ul>';
        }

        elements.instructionsBody.innerHTML = html;
        elements.instructionsModal.classList.remove('hidden');
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
        workoutStartTime = Date.now();

        elements.exerciseName.textContent = currentExercise.name;

        elements.exerciseItems.forEach(item => {
            item.classList.toggle('active', item.dataset.exercise === exerciseId);
        });

        currentWorkoutPlan = Exercises.generateWorkoutPlan(
            exerciseId,
            settings.level,
            settings.badDayMode
        );

        elements.levelBar.classList.add('hidden');
        elements.timerView.classList.remove('hidden');
        elements.exerciseList.classList.add('hidden');
        document.getElementById('consistencyCard').classList.add('hidden');
        elements.lastSessionCard.classList.add('hidden');

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
        elements.timerDisplay.textContent = data.time.toString().padStart(2, '0');
        elements.tensionSleeve.style.height = `${data.progress}%`;

        const pad = n => n.toString().padStart(2, '0');

        // Handle "Get Ready" phase
        if (data.phase === 'ready') {
            elements.repCount.textContent = '— / —';
            elements.phaseLabel.textContent = 'READY';
            elements.sideLabel.textContent = '—';
            elements.setLabel.textContent = '— / —';
            elements.stageText.textContent = 'Get Ready';
            elements.timerView.classList.remove('state-rest');
            elements.timerDisplay.classList.remove('vibrate');
            return;
        }

        elements.repCount.textContent = `${pad(data.rep)} / ${pad(data.totalReps)}`;
        elements.phaseLabel.textContent = data.phase.toUpperCase();
        elements.sideLabel.textContent = data.side || '—';

        const level = Storage.getSettings().badDayMode ?
            Exercises.getBadDayLevel() :
            Exercises.getLevel(Storage.getSettings().level);
        elements.setLabel.textContent = `${data.set} / ${level.pyramid.length}`;

        if (data.phase === 'hold') {
            elements.stageText.textContent = data.side ? `${data.side}` : 'Tension Loading';
            elements.timerView.classList.remove('state-rest');
            if (data.isRunning) elements.timerDisplay.classList.add('vibrate');
        } else {
            elements.stageText.textContent = data.isSetRest ? 'Set Rest' : 'Rest';
            elements.timerView.classList.add('state-rest');
            elements.timerDisplay.classList.remove('vibrate');
        }
    }

    function onPhaseChange(step) { }

    function onStateChange(state) {
        elements.btnStart.textContent = state.isRunning ? 'Pause' : 'Resume';
        if (!state.isRunning) elements.timerDisplay.classList.remove('vibrate');
    }

    function onWorkoutComplete() {
        elements.timerDisplay.classList.remove('vibrate');

        // Calculate duration
        const duration = Math.round((Date.now() - workoutStartTime) / 1000);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;

        // Mark complete
        todayProgress[currentExercise.id] = true;
        const completedCount = getCompletedCount();
        const allDone = completedCount === 3;

        // Save workout
        const settings = Storage.getSettings();
        Storage.saveWorkout({
            exercise: currentExercise.id,
            level: settings.level,
            badDay: settings.badDayMode,
            completed: true
        });

        // Update UI
        const item = document.querySelector(`.exercise-item[data-exercise="${currentExercise.id}"]`);
        if (item) {
            item.classList.add('done');
            item.querySelector('.exercise-status').textContent = '✓';
        }

        // Show complete screen
        elements.timerView.classList.add('hidden');
        elements.workoutComplete.classList.remove('hidden');

        elements.completeDuration.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        elements.completeProgress.textContent = `${completedCount}/3`;

        if (allDone) {
            elements.completeMessage.textContent = 'All exercises complete! Great job caring for your spine.';
        } else {
            const remaining = 3 - completedCount;
            elements.completeMessage.textContent = `${currentExercise.name} complete! ${remaining} more to go.`;
        }

        // Action buttons
        let actionsHtml = '';
        if (allDone) {
            actionsHtml = `
                <button class="btn btn-primary" id="btnFinishSession">Finish Session</button>
                <button class="btn btn-secondary" id="btnLogPainAfter">Log Pain Level</button>
            `;
        } else {
            const exercises = ['curl-up', 'side-plank', 'bird-dog'];
            const nextId = exercises.find(id => !todayProgress[id]);
            const nextEx = nextId ? Exercises.getExercise(nextId) : null;

            actionsHtml = `
                <button class="btn btn-primary" id="btnContinue" data-next="${nextId}">Continue: ${nextEx?.name}</button>
                <button class="btn btn-secondary" id="btnBackToList">Back to List</button>
            `;
        }
        elements.completeActions.innerHTML = actionsHtml;

        // Attach handlers
        const continueBtn = document.getElementById('btnContinue');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                resetCompleteView();
                selectExercise(continueBtn.dataset.next);
            });
        }

        const backBtn = document.getElementById('btnBackToList');
        if (backBtn) {
            backBtn.addEventListener('click', resetCompleteView);
        }

        const finishBtn = document.getElementById('btnFinishSession');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                updateConsistencyCard();
                updateLastSessionCard();
                resetTodayProgress();
                resetCompleteView();

                // Reset exercise status icons
                elements.exerciseItems.forEach(item => {
                    item.classList.remove('done');
                    item.querySelector('.exercise-status').textContent = '—';
                });
            });
        }

        const logPainBtn = document.getElementById('btnLogPainAfter');
        if (logPainBtn) {
            logPainBtn.addEventListener('click', () => {
                resetCompleteView();
                showPage('pain');
            });
        }
    }

    function resetCompleteView() {
        elements.workoutComplete.classList.add('hidden');
        elements.exerciseList.classList.remove('hidden');
        elements.levelBar.classList.remove('hidden');
        document.getElementById('consistencyCard').classList.remove('hidden');
        updateLastSessionCard();
        elements.exerciseName.textContent = 'McGill Big 3';
        elements.exerciseItems.forEach(item => item.classList.remove('active'));
    }

    function resetTimerView() {
        elements.timerView.classList.add('hidden');
        elements.exerciseList.classList.remove('hidden');
        elements.levelBar.classList.remove('hidden');
        document.getElementById('consistencyCard').classList.remove('hidden');
        updateLastSessionCard();
        elements.timerDisplay.classList.remove('vibrate');
        elements.timerView.classList.remove('state-rest');
        elements.tensionSleeve.style.height = '0%';
        elements.timerDisplay.textContent = '10';
        elements.btnStart.textContent = 'Initiate';
        elements.btnStart.disabled = false;
        elements.exerciseName.textContent = 'McGill Big 3';
        elements.exerciseItems.forEach(item => item.classList.remove('active'));
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

        if (level.sessionsToAdvance) {
            const remaining = Math.max(0, level.sessionsToAdvance - levelSessions);
            elements.nextLevelIn.textContent = remaining > 0 ? `${remaining}` : 'Ready!';
        } else {
            elements.nextLevelIn.textContent = '—';
        }

        const suggestedLevel = Storage.shouldSuggestLevelUp();
        elements.levelUpBanner.classList.toggle('hidden', !suggestedLevel);

        generateCalendar();

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

        // Symptom buttons
        elements.symptomGrid.querySelectorAll('.symptom-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const symptom = btn.dataset.symptom;
                if (selectedSymptoms.includes(symptom)) {
                    selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
                } else {
                    selectedSymptoms.push(symptom);
                }
            });
        });

        // Location buttons
        elements.locationGrid.querySelectorAll('.location-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                elements.locationGrid.querySelectorAll('.location-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedLocation = btn.dataset.location;
            });
        });

        elements.btnLogPain.addEventListener('click', () => {
            Storage.savePainLog({
                level: currentPainLevel,
                symptoms: [...selectedSymptoms],
                location: selectedLocation
            });

            // Reset selections
            selectedSymptoms = [];
            selectedLocation = null;
            elements.symptomGrid.querySelectorAll('.symptom-btn').forEach(b => b.classList.remove('active'));
            elements.locationGrid.querySelectorAll('.location-btn').forEach(b => b.classList.remove('active'));

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
            const symptoms = log.symptoms ? log.symptoms.join(', ') : '';
            const location = log.location ? log.location.replace('-', ' ') : '';
            const details = [symptoms, location].filter(Boolean).join(' • ');

            html += `
                <div class="history-item">
                    <div class="history-level ${levelClass}">${log.level}</div>
                    <div class="history-info">
                        <div class="history-date">${dateStr}</div>
                        ${details ? `<div class="history-notes">${details}</div>` : ''}
                    </div>
                </div>
            `;
        });

        elements.painHistory.innerHTML = html;
    }

    // ===== Settings Page =====
    function initSettingsPage() {
        elements.settingHold.addEventListener('input', (e) => {
            elements.holdValue.textContent = `${e.target.value}s`;
        });

        elements.settingHold.addEventListener('change', (e) => {
            Storage.saveSettings({ customHoldDuration: parseInt(e.target.value) });
        });

        elements.settingRest.addEventListener('input', (e) => {
            elements.restValue.textContent = `${e.target.value}s`;
        });

        elements.settingRest.addEventListener('change', (e) => {
            Storage.saveSettings({ customRestDuration: parseInt(e.target.value) });
        });

        elements.settingSound.addEventListener('change', (e) => {
            Storage.saveSettings({ soundEnabled: e.target.checked });
        });

        elements.settingVibration.addEventListener('change', (e) => {
            Storage.saveSettings({ vibrationEnabled: e.target.checked });
        });

        elements.btnResetSettings.addEventListener('click', () => {
            Storage.saveSettings({
                level: 'standard',
                badDayMode: false,
                soundEnabled: true,
                vibrationEnabled: true,
                customHoldDuration: null,
                customRestDuration: null
            });
            loadSettings();
            updateLevelDisplay();
            updateExerciseMeta();
        });
    }

    function loadSettings() {
        const settings = Storage.getSettings();
        const level = Exercises.getLevel(settings.level);

        const holdDuration = settings.customHoldDuration || level.holdDuration;
        const restDuration = settings.customRestDuration || level.restBetweenReps || 10;

        elements.settingHold.value = holdDuration;
        elements.holdValue.textContent = `${holdDuration}s`;
        elements.settingRest.value = restDuration;
        elements.restValue.textContent = `${restDuration}s`;
        elements.settingSound.checked = settings.soundEnabled !== false;
        elements.settingVibration.checked = settings.vibrationEnabled !== false;
    }

    // ===== Initialize =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
