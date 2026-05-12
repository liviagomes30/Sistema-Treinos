import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Session, Workout } from '../types'
import { sessionService } from '../services/sessionService'
import { workoutService } from '../services/workoutService'

export const useSessionStore = defineStore('session', () => {
  const activeSession = ref<Session | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function startSession(workout: Workout) {
    isLoading.value = true
    error.value = null
    try {
      const workoutExercises = await workoutService.getExercises(workout._id)

      activeSession.value = {
        _id: '',
        workout_id: workout._id,
        workoutName: workout.name,
        started_at: new Date().toISOString(),
        status: 'completed',
        exercises: workoutExercises.map((we) => ({
          exercise_id: we._id,
          exercise_catalog_id: (we as any).exercise_catalog_id?._id,
          name: (we as any).exercise_catalog_id?.name || (we as any).custom_name || we.name || 'Exercício',
          muscle_group: (we as any).exercise_catalog_id?.muscle_group || we.muscle_group,
          series: we.series,
          reps: we.reps,
          weight_kg: we.weight_kg || 0,
          set_type: we.set_type,
          rest_seconds: we.rest_seconds,
          logs: [],
        })) as any,
      }
    } catch (err: any) {
      error.value = 'Falha ao carregar exercícios do treino'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  function logSet(exerciseId: string, logData: any) {
    if (!activeSession.value) return

    const exercise = (activeSession.value.exercises as any[])?.find(
      (ex) => ex.exercise_id === exerciseId,
    )
    if (!exercise) return

    const existingIdx = exercise.logs.findIndex(
      (l: any) => l.set_number === logData.set_number,
    )

    if (existingIdx > -1) {
      exercise.logs[existingIdx] = logData
    } else {
      exercise.logs.push(logData)
    }
  }

  async function finishSession() {
    if (!activeSession.value) return
    isLoading.value = true
    error.value = null
    try {
      const session = await sessionService.create({
        workout_id: activeSession.value.workout_id,
      })

      const exercises = (activeSession.value.exercises as any[]) || []

      const logPromises = exercises.flatMap((ex) =>
        (ex.logs as any[]).map((log) =>
          sessionService.addLog(session._id, {
            workout_exercise_id: ex.exercise_id,
            set_number: log.set_number,
            reps_done: log.reps_done,
            weight_used_kg: log.weight_used_kg,
          }),
        ),
      )

      await Promise.all(logPromises)

      activeSession.value = null
    } catch (err: any) {
      error.value = 'Erro ao salvar sessão'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  function discardSession() {
    activeSession.value = null
  }

  return { activeSession, isLoading, error, startSession, logSet, finishSession, discardSession }
})
