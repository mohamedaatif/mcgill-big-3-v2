/**
 * McGill Big 3 V2 - Timer Module
 * Taut Cable Chronometry style
 */

const Timer = (function () {
    let state = {
        isRunning: false,
        isPaused: false,
        plan: null,
        currentIndex: 0,
        timeLeft: 0,
        interval: null,
        callbacks: {}
    };

    function start(workoutPlan, callbacks) {
        state.plan = workoutPlan;
        state.currentIndex = 0;
        state.callbacks = callbacks;
        state.isRunning = false;
        state.isPaused = false;

        // Set initial time
        const current = getCurrentStep();
        state.timeLeft = current.duration;

        // Initial UI update
        updateUI();
    }

    function toggle() {
        if (state.isRunning) {
            pause();
        } else {
            resume();
        }
    }

    function resume() {
        state.isRunning = true;
        state.isPaused = false;

        state.interval = setInterval(() => {
            state.timeLeft -= 0.1;

            if (state.timeLeft <= 0) {
                nextStep();
            }

            updateUI();
        }, 100);

        if (state.callbacks.onStateChange) {
            state.callbacks.onStateChange({ isRunning: true });
        }
    }

    function pause() {
        state.isRunning = false;
        state.isPaused = true;
        clearInterval(state.interval);

        if (state.callbacks.onStateChange) {
            state.callbacks.onStateChange({ isRunning: false });
        }
    }

    function stop() {
        state.isRunning = false;
        state.isPaused = false;
        clearInterval(state.interval);

        if (state.callbacks.onStop) {
            state.callbacks.onStop();
        }
    }

    function nextStep() {
        state.currentIndex++;

        if (state.currentIndex >= state.plan.plan.length) {
            // Workout complete
            pause();
            if (state.callbacks.onComplete) {
                state.callbacks.onComplete();
            }
            return;
        }

        const current = getCurrentStep();
        state.timeLeft = current.duration;

        if (state.callbacks.onPhaseChange) {
            state.callbacks.onPhaseChange(current);
        }
    }

    function getCurrentStep() {
        return state.plan.plan[state.currentIndex];
    }

    function updateUI() {
        const current = getCurrentStep();
        const total = current.duration;
        const elapsed = total - state.timeLeft;
        const progress = (elapsed / total) * 100;

        if (state.callbacks.onTick) {
            state.callbacks.onTick({
                time: Math.ceil(state.timeLeft),
                progress,
                phase: current.type,
                rep: current.rep,
                totalReps: current.totalReps,
                set: current.set,
                side: current.side,
                isRunning: state.isRunning
            });
        }
    }

    function getProgress() {
        const current = getCurrentStep();
        const total = current.duration;
        const elapsed = total - state.timeLeft;
        return (elapsed / total) * 100;
    }

    return {
        start,
        toggle,
        resume,
        pause,
        stop,
        getProgress,
        getCurrentStep
    };
})();
