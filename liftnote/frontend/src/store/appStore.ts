import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Workout, Exercise, Session } from "../types";
import { workoutService } from "../services/workoutService";
import { sessionService } from "../services/sessionService";

export const useAppStore = defineStore("app", () => {
  const workouts = ref<Workout[]>([]);
  const exercises = ref<Exercise[]>([]);
  const sessions = ref<Session[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const getWorkoutName = computed(() => {
    return (id: string) => {
      const w = workouts.value.find((w) => w._id === id);
      return w ? w.name : "Treino Removido";
    };
  });

  async function fetchWorkouts() {
    isLoading.value = true;
    try {
      workouts.value = await workoutService.getAll();
    } catch (err: any) {
      error.value = "Erro ao carregar treinos";
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSessions() {
    isLoading.value = true;
    try {
      sessions.value = await sessionService.getAll();
    } catch (err: any) {
      error.value = "Erro ao carregar sessões";
    } finally {
      isLoading.value = false;
    }
  }

  async function addWorkout(workoutData: Partial<Workout>) {
    try {
      const newWorkout = await workoutService.create(workoutData);
      workouts.value.push(newWorkout);
    } catch (err: any) {
      error.value = "Erro ao criar treino";
    }
  }

  return {
    workouts,
    exercises,
    sessions,
    isLoading,
    error,
    getWorkoutName,
    fetchWorkouts,
    fetchSessions,
    addWorkout,
  };
});
