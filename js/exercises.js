/**
 * McGill Big 3 V2 - Exercise Definitions
 * With progression levels, McGill protocol sequencing, and SVG icons
 */

const Exercises = (function () {
    // SVG Icons - Consistent design language
    // stroke="currentColor" inherits orange from CSS
    const ICONS = {
        // Curl-Up: Person lying on back, upper body curled up
        'curl-up': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="5" cy="16" r="2.5"/>
            <path d="M7 18.5c1.5 0 3 .5 5 1.5"/>
            <path d="M12 20h10"/>
            <path d="M12 20l4-6l4 6"/>
            <path d="M8 20h4"/>
        </svg>`,

        // Side Plank: Person in plank on forearm
        'side-plank': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="5" cy="12" r="2"/>
            <path d="M8 14l12 3"/>
            <path d="M8 14l-1 3h-3"/>
        </svg>`,

        // Bird-Dog: Person on all fours, opposite arm and leg extended
        'bird-dog': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="17.5" cy="11.5" r="2.5"/>
            <path d="M9 14h7"/>
            <path d="M9 14v6"/>
            <path d="M16 14v6"/>
            <path d="M9 14L3 12"/>
            <path d="M16 14l6-2"/>
        </svg>`
    };

    // Progression levels (McGill-backed)
    // Rest times based on McGill's recommendations:
    // - 10-15 seconds between reps (within a set)
    // - 30 seconds between sets
    // - 8-10 second holds for endurance
    const LEVELS = {
        beginner: {
            id: 'beginner',
            name: 'Beginner',
            pyramid: [3, 2, 1],
            holdDuration: 5,
            restBetweenReps: 10,
            restBetweenSets: 30,
            description: '3-2-1 × 5s',
            sessionsToAdvance: 7
        },
        developing: {
            id: 'developing',
            name: 'Developing',
            pyramid: [5, 3, 1],
            holdDuration: 8,
            restBetweenReps: 10,
            restBetweenSets: 30,
            description: '5-3-1 × 8s',
            sessionsToAdvance: 7
        },
        standard: {
            id: 'standard',
            name: 'Standard',
            pyramid: [5, 3, 1],
            holdDuration: 10,
            restBetweenReps: 10,
            restBetweenSets: 30,
            description: '5-3-1 × 10s',
            sessionsToAdvance: 14
        },
        advanced: {
            id: 'advanced',
            name: 'Advanced',
            pyramid: [8, 5, 3],
            holdDuration: 10,
            restBetweenReps: 15,
            restBetweenSets: 30,
            description: '8-5-3 × 10s',
            sessionsToAdvance: null
        },
        challenge: {
            id: 'challenge',
            name: 'Challenge',
            pyramid: [1],
            holdDuration: 60,
            restBetweenReps: 0,
            restBetweenSets: 60,
            description: '1 × 60s',
            sessionsToAdvance: null
        }
    };

    // Bad day mode - simplified routine
    const BAD_DAY_LEVEL = {
        id: 'badday',
        name: 'Bad Day',
        pyramid: [3],
        holdDuration: 5,
        restBetweenReps: 10,
        restBetweenSets: 30,
        description: '3 × 5s gentle'
    };

    // Exercise definitions
    const exercises = {
        'curl-up': {
            id: 'curl-up',
            name: 'Curl-Up',
            icon: ICONS['curl-up'],
            bilateral: false,
            instructions: [
                'Lie on back, one knee bent, foot flat',
                'Hands under lower back to maintain arch',
                'Lift head and shoulders as one unit',
                'Keep chin tucked — don\'t pull neck',
                'Hold, then slowly lower'
            ],
            tips: [
                'No movement in lower back',
                'Imagine grapefruit under chin',
                'Breathe normally throughout hold'
            ]
        },
        'side-plank': {
            id: 'side-plank',
            name: 'Side Plank',
            icon: ICONS['side-plank'],
            bilateral: true,
            sides: ['Left', 'Right'],
            instructions: [
                'Lie on side, elbow under shoulder',
                'Stack knees (beginner) or feet (advanced)',
                'Place top hand on opposite shoulder',
                'Lift hips to form straight line',
                'Hold, then lower with control'
            ],
            tips: [
                'Keep hips aligned with torso',
                'Breathe normally throughout',
                'Don\'t let hips sag or pike'
            ]
        },
        'bird-dog': {
            id: 'bird-dog',
            name: 'Bird-Dog',
            icon: ICONS['bird-dog'],
            bilateral: true,
            sides: ['Left arm/Right leg', 'Right arm/Left leg'],
            instructions: [
                'Start on all fours, spine neutral',
                'Engage core before moving',
                'Raise opposite arm and leg',
                'Form straight line hand to foot',
                'Hold, then return with control'
            ],
            tips: [
                'No movement in lower back',
                'Don\'t let hips rotate',
                'Move slowly and deliberately'
            ]
        }
    };

    function getExercise(id) {
        return exercises[id];
    }

    function getAllExercises() {
        return Object.values(exercises);
    }

    function getLevel(levelId) {
        return LEVELS[levelId] || LEVELS.standard;
    }

    function getAllLevels() {
        return LEVELS;
    }

    function getLevelOrder() {
        return ['beginner', 'developing', 'standard', 'advanced', 'challenge'];
    }

    function getNextLevel(currentLevelId) {
        const order = getLevelOrder();
        const idx = order.indexOf(currentLevelId);
        return idx < order.length - 1 ? order[idx + 1] : null;
    }

    function getBadDayLevel() {
        return BAD_DAY_LEVEL;
    }

    /**
     * Generate workout plan for a single exercise
     * For bilateral exercises: L→R within each pyramid set (McGill protocol)
     * Uses proper rest durations:
     * - restBetweenReps: short rest after each hold
     * - restBetweenSets: longer rest between pyramid sets
     * @param {object} options - Optional overrides { customHoldDuration, customRestDuration }
     */
    function generateWorkoutPlan(exerciseId, levelId, isBadDay = false, options = {}) {
        const exercise = exercises[exerciseId];
        const level = isBadDay ? BAD_DAY_LEVEL : getLevel(levelId);

        if (!exercise) return null;

        const plan = [];
        const { pyramid, restBetweenSets } = level;

        // Use custom durations if provided, otherwise use level defaults
        const holdDuration = options.customHoldDuration || level.holdDuration;
        const restBetweenReps = options.customRestDuration || level.restBetweenReps;

        if (exercise.bilateral) {
            pyramid.forEach((reps, setIndex) => {
                // Left side reps
                for (let rep = 1; rep <= reps; rep++) {
                    plan.push({
                        type: 'hold',
                        duration: holdDuration,
                        rep,
                        totalReps: reps,
                        set: setIndex + 1,
                        side: exercise.sides[0]
                    });
                    plan.push({
                        type: 'rest',
                        duration: restBetweenReps,
                        rep,
                        totalReps: reps,
                        set: setIndex + 1,
                        side: exercise.sides[0]
                    });
                }

                // Right side reps
                for (let rep = 1; rep <= reps; rep++) {
                    plan.push({
                        type: 'hold',
                        duration: holdDuration,
                        rep,
                        totalReps: reps,
                        set: setIndex + 1,
                        side: exercise.sides[1]
                    });

                    const isLastRep = rep === reps;
                    const isLastSet = setIndex === pyramid.length - 1;

                    if (isLastRep && !isLastSet) {
                        // Longer rest between sets
                        plan.push({
                            type: 'rest',
                            duration: restBetweenSets,
                            rep,
                            totalReps: reps,
                            set: setIndex + 1,
                            side: exercise.sides[1],
                            isSetRest: true
                        });
                    } else if (!isLastRep || !isLastSet) {
                        plan.push({
                            type: 'rest',
                            duration: restBetweenReps,
                            rep,
                            totalReps: reps,
                            set: setIndex + 1,
                            side: exercise.sides[1]
                        });
                    }
                }
            });
        } else {
            pyramid.forEach((reps, setIndex) => {
                for (let rep = 1; rep <= reps; rep++) {
                    plan.push({
                        type: 'hold',
                        duration: holdDuration,
                        rep,
                        totalReps: reps,
                        set: setIndex + 1
                    });

                    const isLastRep = rep === reps;
                    const isLastSet = setIndex === pyramid.length - 1;

                    if (isLastRep && !isLastSet) {
                        plan.push({
                            type: 'rest',
                            duration: restBetweenSets,
                            rep,
                            totalReps: reps,
                            set: setIndex + 1,
                            isSetRest: true
                        });
                    } else if (!isLastRep || !isLastSet) {
                        plan.push({
                            type: 'rest',
                            duration: restBetweenReps,
                            rep,
                            totalReps: reps,
                            set: setIndex + 1
                        });
                    }
                }
            });
        }

        return {
            exercise,
            level,
            plan,
            totalHolds: plan.filter(p => p.type === 'hold').length
        };
    }

    return {
        LEVELS,
        ICONS,
        getExercise,
        getAllExercises,
        getLevel,
        getAllLevels,
        getLevelOrder,
        getNextLevel,
        getBadDayLevel,
        generateWorkoutPlan
    };
})();
