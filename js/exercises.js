/**
 * McGill Big 3 V2 - Exercise Definitions
 * With progression levels and McGill protocol sequencing
 */

const Exercises = (function () {
    // Progression levels (McGill-backed)
    const LEVELS = {
        beginner: {
            id: 'beginner',
            name: 'Beginner',
            icon: '🌱',
            pyramid: [3, 2, 1],
            holdDuration: 5,
            restDuration: 5,
            description: '3-2-1 × 5s',
            sessionsToAdvance: 7
        },
        developing: {
            id: 'developing',
            name: 'Developing',
            icon: '🌿',
            pyramid: [5, 3, 1],
            holdDuration: 8,
            restDuration: 5,
            description: '5-3-1 × 8s',
            sessionsToAdvance: 7
        },
        standard: {
            id: 'standard',
            name: 'Standard',
            icon: '🌳',
            pyramid: [5, 3, 1],
            holdDuration: 10,
            restDuration: 5,
            description: '5-3-1 × 10s',
            sessionsToAdvance: 14
        },
        advanced: {
            id: 'advanced',
            name: 'Advanced',
            icon: '💪',
            pyramid: [8, 5, 3],
            holdDuration: 10,
            restDuration: 5,
            description: '8-5-3 × 10s',
            sessionsToAdvance: null
        },
        challenge: {
            id: 'challenge',
            name: 'Challenge',
            icon: '🏆',
            pyramid: [1],
            holdDuration: 60,
            restDuration: 10,
            description: '1 × 60s',
            sessionsToAdvance: null
        }
    };

    // Bad day mode - simplified routine
    const BAD_DAY_LEVEL = {
        id: 'badday',
        name: 'Bad Day',
        icon: '😓',
        pyramid: [3],
        holdDuration: 5,
        restDuration: 5,
        description: '3 × 5s gentle'
    };

    // Exercise definitions
    const exercises = {
        'curl-up': {
            id: 'curl-up',
            name: 'Curl-Up',
            icon: '🔄',
            bilateral: false,
            instructions: [
                'Lie on back, one knee bent, foot flat',
                'Hands under lower back arch',
                'Lift head and shoulders as one unit',
                'Keep chin tucked - don\'t pull neck',
                'Hold, then slowly lower'
            ],
            tips: [
                'No movement in lower back',
                'Imagine grapefruit under chin'
            ]
        },
        'side-plank': {
            id: 'side-plank',
            name: 'Side Plank',
            icon: '📐',
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
                'Breathe normally throughout'
            ]
        },
        'bird-dog': {
            id: 'bird-dog',
            name: 'Bird-Dog',
            icon: '🐕',
            bilateral: true,
            sides: ['Left arm/Right leg', 'Right arm/Left leg'],
            instructions: [
                'Start on all fours',
                'Keep spine neutral',
                'Raise opposite arm and leg',
                'Form straight line hand to foot',
                'Hold, then return with control'
            ],
            tips: [
                'No movement in lower back',
                'Don\'t let hips rotate'
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
     * Example: 5L→5R→Rest→3L→3R→Rest→1L→1R
     */
    function generateWorkoutPlan(exerciseId, levelId, isBadDay = false) {
        const exercise = exercises[exerciseId];
        const level = isBadDay ? BAD_DAY_LEVEL : getLevel(levelId);

        if (!exercise) return null;

        const plan = [];
        const { pyramid, holdDuration, restDuration } = level;

        if (exercise.bilateral) {
            // McGill protocol: do both sides within each pyramid set
            pyramid.forEach((reps, setIndex) => {
                // Left side reps
                for (let rep = 1; rep <= reps; rep++) {
                    plan.push({
                        type: 'hold',
                        duration: holdDuration,
                        rep,
                        totalReps: reps,
                        set: setIndex + 1,
                        side: exercise.sides[0] // Left
                    });
                    // Rest after each hold (except last of set if more sides coming)
                    plan.push({
                        type: 'rest',
                        duration: restDuration,
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
                        side: exercise.sides[1] // Right
                    });

                    // Rest after each hold (except very last one)
                    const isLastRep = rep === reps;
                    const isLastSet = setIndex === pyramid.length - 1;
                    if (!(isLastRep && isLastSet)) {
                        plan.push({
                            type: 'rest',
                            duration: restDuration,
                            rep,
                            totalReps: reps,
                            set: setIndex + 1,
                            side: exercise.sides[1]
                        });
                    }
                }
            });
        } else {
            // Unilateral exercise (curl-up)
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
                    if (!(isLastRep && isLastSet)) {
                        plan.push({
                            type: 'rest',
                            duration: restDuration,
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
