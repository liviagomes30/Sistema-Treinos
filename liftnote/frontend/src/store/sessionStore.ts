import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Session, Workout, Exercise } from '../types'
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
      console.log("Iniciando sessão para treino:", workout._id);
      // 1. Criar a sessão no backend
      const sessionData = await sessionService.create({
        workout_id: workout._id
      });
      
      // 2. Buscar os exercícios do treino para popular a sessão localmente
      const workoutExercises = await workoutService.getExercises(workout._id)
      
      activeSession.value = {
        ...sessionData,
        workoutName: workout.name,
        exercises: workoutExercises.map(we => ({
          exercise_id: we._id, // we._id aqui é o WorkoutExercise ID no backend
          name: (we as any).exercise_catalog_id?.name || (we as any).custom_name || we.name || 'Exercício',
          muscle_group: (we as any).exercise_catalog_id?.muscle_group || we.muscle_group,
          series: we.series,
          reps: we.reps,
          set_type: we.set_type,
          rest_seconds: we.rest_seconds,
          logs: []
        })) as any // Casting temporário para lidar com a estrutura aninhada
      }
    } catch (err: any) {
      error.value = "Falha ao iniciar sessão"
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function logSet(exerciseId: string, logData: any) {
    if (!activeSession.value) return
    try {
      await sessionService.addLog(activeSession.value._id, {
        workout_exercise_id: exerciseId,
        ...logData
      })
      // Opcional: atualizar estado local se necessário
    } catch (err) {
      console.error("Erro ao salvar log", err)
    }
  }

  async function finishSession() {
    if (!activeSession.value) return
    isLoading.value = true
    try {
      await sessionService.update(activeSession.value._id, {
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      activeSession.value = null
    } catch (err) {
      error.value = "Erro ao finalizar sessão"
    } finally {
      isLoading.value = false
    }
  }

  async function cancelSession() {
    if (!activeSession.value) return
    try {
      await sessionService.update(activeSession.value._id, {
        status: 'cancelled',
        ended_at: new Date().toISOString()
      })
      activeSession.value = null
    } catch (err) {
      console.error(err)
    }
  }

  return { activeSession, isLoading, error, startSession, logSet, finishSession, cancelSession }
})
