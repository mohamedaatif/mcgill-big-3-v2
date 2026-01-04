/**
 * McGill Big 3 V2 - Exercise Definitions
 */

const Exercises = (function () {
    const exercises = {
        'curl-up': {
            id: 'curl-up',
            name: 'Curl-Up',
            icon: '🔄',
            bilateral: false,
            description: 'Hands under lower back, one knee bent'
        },
        'side-plank': {
            id: 'side-plank',
            name: 'Side Plank',
            icon: '◀▶',
            bilateral: true,
            sides: ['Left', 'Right'],
            description: 'Elbow under shoulder, maintain neutral spine'
        },
        'bird-dog': {
            id: 'bird-dog',
            name: 'Bird-Dog',
            icon: '🐕',
            bilateral: true,
            sides: ['Left', 'Right'],
            description: 'Opposite arm and leg extended'
        }
    };

    function getExercise(id) {
        return exercises[id];
    }

    function getAllExercises() {
        return Object.values(exercises);
    }

    function generateWorkoutPlan(exerciseId, settings) {
        const exercise = exercises[exerciseId];
        const { holdDuration, restDuration, repPattern } = settings;

        const plan = [];

        if (exercise.bilateral) {
            // For bilateral: L reps, then R reps
            exercise.sides.forEach(side => {
                repPattern.forEach((reps, setIndex) => {
                    for (let rep = 1; rep <= reps; rep++) {
                        plan.push({
                            type: 'hold',
                            duration: holdDuration,
                            rep,
                            totalReps: reps,
                            set: setIndex + 1,
                            side
                        });

                        // Add rest between reps (not after last rep of last set)
                        const isLastRep = rep === reps;
                        const isLastSet = setIndex === repPattern.length - 1;
                        if (!(isLastRep && isLastSet)) {
                            plan.push({
                                type: 'rest',
                                duration: restDuration,
                                rep,
                                totalReps: reps,
                                set: setIndex + 1,
                                side
                            });
                        }
                    }
                });
            });
        } else {
            // For unilateral exercises
            repPattern.forEach((reps, setIndex) => {
                for (let rep = 1; rep <= reps; rep++) {
                    plan.push({
                        type: 'hold',
                        duration: holdDuration,
                        rep,
                        totalReps: reps,
                        set: setIndex + 1
                    });

                    const isLastRep = rep === reps;
                    const isLastSet = setIndex === repPattern.length - 1;
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
            plan,
            totalHolds: plan.filter(p => p.type === 'hold').length
        };
    }

    return {
        getExercise,
        getAllExercises,
        generateWorkoutPlan
    };
})();
