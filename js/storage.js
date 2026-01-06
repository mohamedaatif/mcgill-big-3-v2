/**
 * McGill Big 3 V2 - Storage Module
 * localStorage wrapper with settings and progression tracking
 */

const Storage = (function () {
    const KEYS = {
        WORKOUTS: 'mcgill_v2_workouts',
        PAIN_LOGS: 'mcgill_v2_pain_logs',
        SETTINGS: 'mcgill_v2_settings',
        CUSTOM_LEVELS: 'mcgill_v2_custom_levels'
    };

    // Default settings
    const DEFAULT_SETTINGS = {
        level: 'standard',
        badDayMode: false,
        soundEnabled: true,
        vibrationEnabled: true,
        // Custom overrides (null = use level defaults)
        customHoldDuration: null,
        customRestDuration: null
    };

    // ===== Workouts =====
    function getWorkouts() {
        const data = localStorage.getItem(KEYS.WORKOUTS);
        return data ? JSON.parse(data) : [];
    }

    function saveWorkout(workout) {
        const workouts = getWorkouts();
        workouts.push({
            ...workout,
            date: new Date().toISOString(),
            id: Date.now()
        });
        localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
        return workouts.length;
    }

    function getWorkoutsForDate(dateStr) {
        return getWorkouts().filter(w => w.date.startsWith(dateStr));
    }

    function getTodayWorkouts() {
        const today = new Date().toISOString().split('T')[0];
        return getWorkoutsForDate(today);
    }

    // ===== Pain Logs =====
    function getPainLogs() {
        const data = localStorage.getItem(KEYS.PAIN_LOGS);
        return data ? JSON.parse(data) : [];
    }

    function savePainLog(log) {
        const logs = getPainLogs();
        logs.unshift({
            ...log,
            date: new Date().toISOString(),
            id: Date.now()
        });
        localStorage.setItem(KEYS.PAIN_LOGS, JSON.stringify(logs));
    }

    // ===== Settings =====
    function getSettings() {
        const data = localStorage.getItem(KEYS.SETTINGS);
        const saved = data ? JSON.parse(data) : {};
        return { ...DEFAULT_SETTINGS, ...saved };
    }

    function saveSettings(settings) {
        const current = getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
        return updated;
    }

    function setLevel(levelId) {
        return saveSettings({ level: levelId });
    }

    function setBadDayMode(enabled) {
        return saveSettings({ badDayMode: enabled });
    }

    // ===== Custom Levels =====
    function getCustomLevels() {
        const data = localStorage.getItem(KEYS.CUSTOM_LEVELS);
        return data ? JSON.parse(data) : {};
    }

    function saveCustomLevel(levelId, config) {
        const customLevels = getCustomLevels();
        customLevels[levelId] = config;
        localStorage.setItem(KEYS.CUSTOM_LEVELS, JSON.stringify(customLevels));
        return customLevels;
    }

    function resetCustomLevels() {
        localStorage.removeItem(KEYS.CUSTOM_LEVELS);
    }

    // ===== Progression Stats =====
    function getStreak() {
        const workouts = getWorkouts();
        if (workouts.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];

            const hasWorkout = workouts.some(w => w.date.startsWith(dateStr));

            if (hasWorkout) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return streak;
    }

    // Helper: get unique dates from workout array
    function getUniqueDates(workouts) {
        const dates = new Set();
        workouts.forEach(w => {
            dates.add(w.date.split('T')[0]); // Get just YYYY-MM-DD
        });
        return dates;
    }

    function getSessionsAtLevel(levelId) {
        const workouts = getWorkouts().filter(w => w.level === levelId);
        return getUniqueDates(workouts).size; // Count unique days
    }

    function getTotalSessions() {
        return getUniqueDates(getWorkouts()).size; // Count unique days
    }

    function getWeekStats() {
        const workouts = getWorkouts();
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekWorkouts = workouts.filter(w => new Date(w.date) >= weekStart);
        return getUniqueDates(weekWorkouts).size; // Count unique days
    }

    function getMonthStats() {
        const workouts = getWorkouts();
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const monthWorkouts = workouts.filter(w => new Date(w.date) >= monthStart);
        return getUniqueDates(monthWorkouts).size; // Count unique days
    }

    // Check if should suggest level up
    function shouldSuggestLevelUp() {
        const settings = getSettings();
        const level = Exercises.getLevel(settings.level);

        if (!level.sessionsToAdvance) return null;

        const sessionsAtLevel = getSessionsAtLevel(settings.level);
        if (sessionsAtLevel >= level.sessionsToAdvance) {
            return Exercises.getNextLevel(settings.level);
        }

        return null;
    }

    // Export all data as JSON object
    function exportAllData() {
        return {
            exportDate: new Date().toISOString(),
            version: '2.0',
            workouts: getWorkouts(),
            painLogs: getPainLogs(),
            settings: getSettings()
        };
    }

    return {
        getWorkouts,
        saveWorkout,
        getWorkoutsForDate,
        getTodayWorkouts,
        getPainLogs,
        savePainLog,
        getSettings,
        saveSettings,
        setLevel,
        setBadDayMode,
        getCustomLevels,
        saveCustomLevel,
        resetCustomLevels,
        getStreak,
        getSessionsAtLevel,
        getTotalSessions,
        getWeekStats,
        getMonthStats,
        shouldSuggestLevelUp,
        exportAllData
    };
})();
