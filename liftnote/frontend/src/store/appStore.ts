import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAppStore = defineStore("app", () => {
  const workouts = ref([
    {
      _id: "w1",
      title: "Treino A",
      description: "Inferiores",
      color: "accent",
    },
    { _id: "w2", title: "Treino B", description: "Superiores", color: "blue" },
  ]);
  const exercises = ref([
    {
      _id: "e1",
      workout_id: "w1",
      name: "Agachamento Livre",
      muscle_group: "legs",
      set_type: "linear",
      series: 4,
      reps: 10,
      weight_kg: 40,
      rest_seconds: 90,
      order: 0,
    },
    {
      _id: "e2",
      workout_id: "w1",
      name: "Leg Press",
      muscle_group: "legs",
      set_type: "linear",
      series: 3,
      reps: 12,
      weight_kg: 100,
      rest_seconds: 60,
      order: 1,
    },
    {
      _id: "e3",
      workout_id: "w2",
      name: "Supino Reto",
      muscle_group: "chest",
      set_type: "linear",
      series: 4,
      reps: 8,
      weight_kg: 60,
      rest_seconds: 90,
      order: 0,
    },
  ]);
  const sessions = ref([
    {
      _id: "s1",
      user_id: "u1",
      workout_id: "w1",
      started_at: new Date(Date.now() - 86400000).toISOString(),
      ended_at: new Date(Date.now() - 80000000).toISOString(),
      duration_seconds: 6400,
      totalVolume: 4800,
      status: "completed",
      exercises: [
        {
          exercise_id: "e1",
          logs: [{ series: 1, reps_done: 10, weight_used: 40 }],
        },
      ],
    },
  ]);

  // Getters
  const getWorkoutName = computed(() => {
    return (id: string) => {
      const w = workouts.value.find((w) => w._id === id);
      return w ? w.title : "Treino Removido";
    };
  });

  // Actions
  function addWorkout(workout: any) {
    workouts.value.push(workout);
  }

  function addExercise(exercise: any) {
    exercises.value.push(exercise);
  }

  return {
    workouts,
    exercises,
    sessions,
    getWorkoutName,
    addWorkout,
    addExercise,
  };
});
