import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSessionStore = defineStore('session', () => {
  const activeSession = ref<any>(null)
  
  function startSession(workout: any) {
    activeSession.value = {
      _id: 'sess_' + Date.now(),
      workout_id: workout._id,
      workoutName: workout.title,
      started_at: new Date().toISOString(),
      status: "in_progress",
    }
  }

  function finishSession() {
    if (activeSession.value) {
      activeSession.value.status = 'completed';
      activeSession.value.ended_at = new Date().toISOString();
      activeSession.value = null;
    }
  }

  function cancelSession() {
    activeSession.value = null;
  }

  return { activeSession, startSession, finishSession, cancelSession }
})
