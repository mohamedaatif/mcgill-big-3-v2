/**
 * McGill Big 3 V2 - Timer Module
 * With audio cues, vibration, and phase management
 */

const Timer = (function () {
    let state = {
        isRunning: false,
        isPaused: false,
        plan: null,
        currentIndex: 0,
        timeLeft: 0,
        interval: null,
        callbacks: {},
        settings: {}
    };

    // Audio context for Web Audio API sounds
    let audioContext = null;
    let audioUnlocked = false;

    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume if suspended (browser autoplay policy)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // iOS requires playing a sound during user interaction to unlock audio
        if (!audioUnlocked && audioContext.state === 'running') {
            // Play a silent buffer to unlock audio on iOS
            const buffer = audioContext.createBuffer(1, 1, 22050);
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
            audioUnlocked = true;
        }
    }

    // Play a tone with envelope
    function playTone(frequency, duration = 150, type = 'sine', volume = 0.3) {
        if (!state.settings.soundEnabled) return;
        initAudio();

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = type;
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + duration / 1000);
    }

    // Play chord (multiple frequencies)
    function playChord(frequencies, duration = 200, volume = 0.15) {
        frequencies.forEach(f => playTone(f, duration, 'sine', volume));
    }

    // ===== SOUND PATTERNS =====
    const sounds = {
        // HOLD phase - energizing, ascending
        startHold: () => {
            playTone(440, 100, 'sine', 0.25);
            setTimeout(() => playTone(554, 100, 'sine', 0.25), 80);
            setTimeout(() => playTone(659, 150, 'sine', 0.3), 160);
        },

        endHold: () => {
            playTone(659, 100, 'sine', 0.2);
            setTimeout(() => playTone(554, 100, 'sine', 0.2), 80);
            setTimeout(() => playTone(440, 150, 'sine', 0.25), 160);
        },

        // REST phase - calming, soft
        startRest: () => {
            playChord([220, 277, 330], 300, 0.1);
        },

        // Countdown beeps - escalating
        countdown3: () => playTone(600, 80, 'sine', 0.2),
        countdown2: () => playTone(700, 100, 'sine', 0.25),
        countdown1: () => playTone(800, 120, 'sine', 0.3),
        countdown0: () => playChord([523, 659, 784], 200, 0.3),

        // Progress
        repComplete: () => {
            playTone(523, 60, 'sine', 0.15);
            setTimeout(() => playTone(659, 80, 'sine', 0.2), 50);
        },

        workoutComplete: () => {
            playChord([523, 659, 784], 150, 0.2);
            setTimeout(() => playChord([587, 740, 880], 150, 0.25), 150);
            setTimeout(() => playChord([659, 831, 988], 300, 0.3), 300);
        },

        // Side switch - distinct ascending two-tone
        switchSides: () => {
            playTone(392, 100, 'triangle', 0.25);  // G4
            setTimeout(() => playTone(523, 150, 'triangle', 0.3), 100);  // C5
        }
    };

    // ===== VIBRATION PATTERNS =====
    function vibrate(pattern) {
        if (!state.settings.vibrationEnabled) return;
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    const vibrations = {
        startHold: () => vibrate([100, 50, 100]),
        endHold: () => vibrate([80, 40, 80]),
        startRest: () => vibrate([50]),
        countdown: () => vibrate([30]),
        repComplete: () => vibrate([40, 30, 40]),
        workoutComplete: () => vibrate([100, 50, 100, 50, 200]),
        switchSides: () => vibrate([150, 100, 150])  // Distinct pattern for side switch
    };

    // ===== TIMER CONTROL =====
    function start(workoutPlan, settings, callbacks) {
        state.plan = workoutPlan;
        state.currentIndex = 0;
        state.callbacks = callbacks;
        state.isRunning = false;
        state.isPaused = false;
        state.settings = settings;
        state.getReadyDone = false; // Reset for new workout

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
        initAudio(); // Ensure audio context is ready

        // If this is the first start (not a resume from pause), do get-ready countdown
        if (!state.isPaused && state.currentIndex === 0 && !state.getReadyDone) {
            startGetReadyCountdown();
            return;
        }

        actuallyResume();
    }

    function startGetReadyCountdown() {
        state.isRunning = true;
        state.getReadyCountdown = 3;

        if (state.callbacks.onTick) {
            state.callbacks.onTick({
                time: state.getReadyCountdown,
                progress: 0,
                phase: 'ready',
                rep: 0,
                totalReps: 0,
                set: 0,
                side: null,
                isRunning: true,
                isGetReady: true
            });
        }

        if (state.callbacks.onStateChange) {
            state.callbacks.onStateChange({ isRunning: true, isGetReady: true });
        }

        const countdownInterval = setInterval(() => {
            state.getReadyCountdown--;

            // Play countdown sounds
            if (state.getReadyCountdown === 2) {
                sounds.countdown3();
                vibrations.countdown();
            } else if (state.getReadyCountdown === 1) {
                sounds.countdown2();
                vibrations.countdown();
            } else if (state.getReadyCountdown === 0) {
                sounds.countdown1();
                vibrations.countdown();
            }

            if (state.callbacks.onTick) {
                state.callbacks.onTick({
                    time: state.getReadyCountdown,
                    progress: ((3 - state.getReadyCountdown) / 3) * 100,
                    phase: 'ready',
                    rep: 0,
                    totalReps: 0,
                    set: 0,
                    side: null,
                    isRunning: true,
                    isGetReady: true
                });
            }

            if (state.getReadyCountdown <= 0) {
                clearInterval(countdownInterval);
                state.getReadyDone = true;
                actuallyResume();
            }
        }, 1000);
    }

    function actuallyResume() {
        state.isRunning = true;
        state.isPaused = false;

        // Play phase start sound
        const current = getCurrentStep();
        if (current.type === 'hold') {
            sounds.startHold();
            vibrations.startHold();
        } else {
            sounds.startRest();
            vibrations.startRest();
        }

        state.interval = setInterval(() => {
            tick();
        }, 100);

        if (state.callbacks.onStateChange) {
            state.callbacks.onStateChange({ isRunning: true, isGetReady: false });
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

    function tick() {
        const prevTime = Math.ceil(state.timeLeft);
        state.timeLeft -= 0.1;
        const newTime = Math.ceil(state.timeLeft);

        // Countdown sounds on whole seconds
        if (prevTime !== newTime && newTime > 0 && newTime <= 3) {
            if (newTime === 3) {
                sounds.countdown3();
                vibrations.countdown();
            } else if (newTime === 2) {
                sounds.countdown2();
                vibrations.countdown();
            } else if (newTime === 1) {
                sounds.countdown1();
                vibrations.countdown();
            }
        }

        if (state.timeLeft <= 0) {
            nextStep();
        }

        updateUI();
    }

    function nextStep() {
        const prevStep = getCurrentStep();

        // Play transition sound
        if (prevStep.type === 'hold') {
            sounds.endHold();
            vibrations.endHold();
            sounds.repComplete();
            vibrations.repComplete();
        }

        state.currentIndex++;

        if (state.currentIndex >= state.plan.plan.length) {
            // Workout complete
            sounds.workoutComplete();
            vibrations.workoutComplete();
            pause();
            if (state.callbacks.onComplete) {
                state.callbacks.onComplete();
            }
            return;
        }

        const current = getCurrentStep();
        state.timeLeft = current.duration;

        // Check for side switch on bilateral exercises (when starting new side's hold)
        const sideChanged = prevStep.side && current.side && prevStep.side !== current.side;

        if (sideChanged && current.type === 'hold') {
            // Side is switching - play distinct feedback
            sounds.switchSides();
            vibrations.switchSides();

            if (state.callbacks.onSideSwitch) {
                state.callbacks.onSideSwitch(current.side);
            }
        }

        // Play new phase sound
        if (current.type === 'hold') {
            // Don't play startHold if we just played switchSides
            if (!sideChanged) {
                sounds.startHold();
            }
            vibrations.startHold();
        } else {
            sounds.startRest();
            vibrations.startRest();
        }

        if (state.callbacks.onPhaseChange) {
            state.callbacks.onPhaseChange(current);
        }
    }

    function getCurrentStep() {
        return state.plan.plan[state.currentIndex];
    }

    // Skip current rep (marks as incomplete)
    function skip() {
        const current = getCurrentStep();

        // Only skip during hold phase
        if (current.type !== 'hold') return;

        // Notify that this rep was skipped
        if (state.callbacks.onSkip) {
            state.callbacks.onSkip({
                set: current.set,
                rep: current.rep,
                side: current.side
            });
        }

        // Move to next step
        nextStep();
        updateUI();
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
        skip,
        getProgress,
        getCurrentStep
    };
})();
