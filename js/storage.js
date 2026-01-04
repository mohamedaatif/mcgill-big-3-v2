/**
 * McGill Big 3 V2 - Storage Module
 * Simple localStorage wrapper for MVP
 */

const Storage = (function() {
    const KEYS = {
        WORKOUTS: 'mcgill_workouts',
        PAIN_LOGS: 'mcgill_pain_logs',
        SETTINGS: 'mcgill_settings'
    };

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
    }

    function getWorkoutsForDate(dateStr) {
        return getWorkouts().filter(w => w.date.startsWith(dateStr));
    }

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

    function getSettings() {
        const data = localStorage.getItem(KEYS.SETTINGS);
        return data ? JSON.parse(data) : {
            holdDuration: 10,
            restDuration: 5,
            repPattern: [5, 3, 1]
        };
    }

    function saveSettings(settings) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    }

    // Calculate streak
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

    return {
        getWorkouts,
        saveWorkout,
        getWorkoutsForDate,
        getPainLogs,
        savePainLog,
        getSettings,
        saveSettings,
        getStreak
    };
})();
