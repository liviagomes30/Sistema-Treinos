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

  async function resumeSession(sessionId: string) {
    isLoading.value = true
    error.value = null
    try {
      const session = await sessionService.getById(sessionId)
      if (!session) throw new Error('Sessão não encontrada')
      
      const workoutId = typeof session.workout_id === 'object' ? (session.workout_id as any)._id : session.workout_id
      const workoutName = typeof session.workout_id === 'object' ? (session.workout_id as any).name : 'Treino'
      const workoutExercises = await workoutService.getExercises(workoutId)

      if (session.status === 'completed') {
        await sessionService.update(sessionId, { status: 'active' })
      }

      activeSession.value = {
        workout_id: workoutId,
        workoutName: workoutName,
        exercises: workoutExercises.map((we: any) => {
          const exLogs = (session as any).logs?.filter((l: any) => {
            const exId = typeof l.workout_exercise_id === 'object' ? l.workout_exercise_id._id : l.workout_exercise_id
            return exId === we._id
          }) || []

          return {
            exercise_id: we._id,
            name: we.exercise_catalog_id?.name || we.custom_name || we.name || 'Exercício',
            muscle_group: we.exercise_catalog_id?.muscle_group || we.muscle_group,
            series: we.series,
            reps: we.reps,
            weight_kg: we.weight_kg || 0,
            set_type: we.set_type,
            rest_seconds: we.rest_seconds,
            logs: exLogs,
          }
        }),
      }
      currentSessionId.value = sessionId
    } catch (err: any) {
      error.value = 'Falha ao carregar sessão para editar'
      console.error(err)
      throw err
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

      const createdLog = await sessionService.addLog(currentSessionId.value, {
        workout_exercise_id: exerciseId,
        ...logData,
      })

      const exercise = activeSession.value.exercises.find((ex: any) => ex.exercise_id === exerciseId)
      if (exercise) {
        const existingIdx = exercise.logs.findIndex((l: any) => l.set_number === logData.set_number)
        if (existingIdx > -1) {
          exercise.logs[existingIdx] = createdLog
        } else {
          exercise.logs.push(createdLog)
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

  async function updateLogSet(exerciseId: string, logId: string, logData: { set_number?: number; reps_done?: number; weight_used_kg?: number }) {
    if (!activeSession.value || !currentSessionId.value) return

    isSavingSet.value = true
    try {
      const updatedLog = await sessionService.updateLog(currentSessionId.value, logId, logData)

      const exercise = activeSession.value.exercises.find((ex: any) => ex.exercise_id === exerciseId)
      if (exercise) {
        const existingIdx = exercise.logs.findIndex((l: any) => l._id === logId)
        if (existingIdx > -1) {
          exercise.logs[existingIdx] = updatedLog
        }
      }
    } catch (err: any) {
      error.value = 'Erro ao atualizar série'
      console.error(err)
      throw err
    } finally {
      isSavingSet.value = false
    }
  }

  async function deleteLogSet(exerciseId: string, logId: string) {
    if (!activeSession.value || !currentSessionId.value) return

    isSavingSet.value = true
    try {
      await sessionService.removeLog(currentSessionId.value, logId)

      const exercise = activeSession.value.exercises.find((ex: any) => ex.exercise_id === exerciseId)
      if (exercise) {
        exercise.logs = exercise.logs.filter((l: any) => l._id !== logId)
      }
    } catch (err: any) {
      error.value = 'Erro ao remover série'
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

  async function finishSession() {
    if (!currentSessionId.value) {
      resetSession()
      return
    }

    try {
      await sessionService.update(currentSessionId.value, { 
        status: 'completed',
        endTime: new Date().toISOString()
      })
      resetSession()
    } catch (err: any) {
      error.value = 'Erro ao finalizar treino'
      console.error(err)
      throw err
    }
  }

  return { activeSession, currentSessionId, isLoading, isSavingSet, error, startSession, resumeSession, logSet, updateLogSet, deleteLogSet, resetSession, finishSession }
})
