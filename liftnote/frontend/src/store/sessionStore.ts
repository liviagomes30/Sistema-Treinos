import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Workout } from '../types'
import { sessionService } from '../services/sessionService'
import { workoutService } from '../services/workoutService'

export const useSessionStore = defineStore('session', () => {
  const activeSession = ref<any | null>(null)
  const currentSessionId = ref<string | null>(null)
  const isLoading = ref(false)
  const isSavingSet = ref(false)
  const error = ref<string | null>(null)

  async function startSession(workout: Workout) {
    isLoading.value = true
    error.value = null
    currentSessionId.value = null
    try {
      const workoutExercises = await workoutService.getExercises(workout._id)

      activeSession.value = {
        workout_id: workout._id,
        workoutName: workout.name,
        exercises: workoutExercises.map((we: any) => ({
          exercise_id: we._id,
          name: we.exercise_catalog_id?.name || we.custom_name || we.name || 'Exercício',
          muscle_group: we.exercise_catalog_id?.muscle_group || we.muscle_group,
          series: we.series,
          reps: we.reps,
          weight_kg: we.weight_kg || 0,
          set_type: we.set_type,
          rest_seconds: we.rest_seconds,
          logs: [],
        })),
      }
    } catch (err: any) {
      error.value = 'Falha ao carregar exercícios do treino'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function logSet(exerciseId: string, logData: { set_number: number; reps_done: number; weight_used_kg: number }) {
    if (!activeSession.value) return

    isSavingSet.value = true
    try {
      if (!currentSessionId.value) {
        const session = await sessionService.create({ workout_id: activeSession.value.workout_id })
        currentSessionId.value = session._id
      }

      await sessionService.addLog(currentSessionId.value, {
        workout_exercise_id: exerciseId,
        ...logData,
      })

      const exercise = activeSession.value.exercises.find((ex: any) => ex.exercise_id === exerciseId)
      if (exercise) {
        const existingIdx = exercise.logs.findIndex((l: any) => l.set_number === logData.set_number)
        if (existingIdx > -1) {
          exercise.logs[existingIdx] = logData
        } else {
          exercise.logs.push(logData)
        }
      }
    } catch (err: any) {
      error.value = 'Erro ao salvar série'
      console.error(err)
      throw err
    } finally {
      isSavingSet.value = false
    }
  }

  function resetSession() {
    activeSession.value = null
    currentSessionId.value = null
  }

  return { activeSession, currentSessionId, isLoading, isSavingSet, error, startSession, logSet, resetSession }
})
