<template>
  <div class="active-session-page">
    <div class="topbar-session">
      <div class="icon-btn" @click="goBack">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </div>

      <div class="topbar-center">
        <span class="topbar-title">{{ activeSession?.workoutName || "Treino" }}</span>
        <span v-if="activeSession?.gym_name" class="topbar-gym">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
          {{ activeSession.gym_name }}
        </span>
      </div>

      <button class="btn btn-accent btn-sm" @click="finishSession" style="font-size: 12px; padding: 6px 12px; font-weight: 700;">
        Finalizar
      </button>
    </div>

    <div class="global-progress-bar">
      <div class="global-progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <div v-if="currentExercise" class="active-exercise-container">
      <ExerciseNavigator
        v-model="activeExerciseIdx"
        :exercises="activeSession!.exercises"
        @prev="prevExercise"
        @next="nextExercise"
      />

      <SetInputForm
        :exercise="currentExercise"
        :log-count="currentExercise.logs?.length || 0"
        :is-saving="sessionStore.isSavingSet"
        @submit="handleSetSubmit"
      />

      <LoggedSetsList
        :logs="currentExercise.logs || []"
        :is-saving="sessionStore.isSavingSet"
        @delete-log="handleDeleteLog"
      />
    </div>

    <div v-else class="empty-state">
      Nenhum exercício encontrado nesta sessão.
    </div>

    <div class="progress-panel card mt">
      <div class="progress-panel-header">
        <span class="muted" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px">
          Exercícios
        </span>
      </div>

      <div class="exercise-status-list">
        <div
          v-for="(ex, i) in activeSession?.exercises"
          :key="i"
          class="ex-status-row"
          :class="{ 'ex-status-active': i === activeExerciseIdx }"
          @click="activeExerciseIdx = Number(i)"
        >
          <div
            class="ex-status-indicator"
            :class="{
              done: hasAnyLog(ex),
              active: i === activeExerciseIdx && !hasAnyLog(ex),
            }"
          >
            <svg v-if="hasAnyLog(ex)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span v-else-if="i === activeExerciseIdx" class="active-dot"></span>
          </div>
          <span class="ex-status-name">{{ ex.name }}</span>
          <span class="ex-status-sets">{{ ex.logs?.length || 0 }} série{{ ex.logs?.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <div class="progress-bar-bg" style="height: 4px; margin-top: 12px">
        <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <ConfirmModal
      v-model:isOpen="showFinishModal"
      title="Finalizar Treino"
      message="Deseja realmente finalizar o treino?"
      confirmText="Finalizar"
      cancelText="Cancelar"
      @confirm="onConfirmFinish"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../store/sessionStore'
import ConfirmModal from '../components/ui/ConfirmModal.vue'
import ExerciseNavigator from '../components/session/ExerciseNavigator.vue'
import SetInputForm from '../components/session/SetInputForm.vue'
import LoggedSetsList from '../components/session/LoggedSetsList.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const activeSession = computed(() => sessionStore.activeSession)

const activeExerciseIdx = ref(0)
const showFinishModal = ref(false)

const currentExercise = computed(
  () => activeSession.value?.exercises?.[activeExerciseIdx.value],
)

onMounted(() => {
  if (!activeSession.value) {
    router.push('/workouts')
  }
})

function prevExercise() {
  if (activeExerciseIdx.value > 0) activeExerciseIdx.value--
}

function nextExercise() {
  if (activeSession.value && activeExerciseIdx.value < activeSession.value.exercises.length - 1) {
    activeExerciseIdx.value++
  }
}

async function handleSetSubmit(data: { reps: number; weight: number }) {
  const exercise = currentExercise.value
  if (!exercise) return
  const nextSetNumber = (exercise.logs?.length || 0) + 1
  await sessionStore.recordExerciseSet(exercise.exercise_id, {
    set_number: nextSetNumber,
    reps_done: data.reps,
    weight_used_kg: data.weight,
  })
}

async function handleDeleteLog(logId: string) {
  const exercise = currentExercise.value
  if (!exercise) return
  await sessionStore.deleteLogSet(exercise.exercise_id, logId)
}

function goBack() {
  router.push('/workouts')
}

function finishSession() {
  showFinishModal.value = true
}

async function onConfirmFinish() {
  await sessionStore.finishSession()
  router.push('/history')
}

function hasAnyLog(exercise: any) {
  return exercise.logs?.length > 0
}

const progressPercentage = computed(() => {
  const exercises = activeSession.value?.exercises || []
  if (!exercises.length) return 0
  const withLogs = exercises.filter((ex: any) => ex.logs?.length > 0).length
  return (withLogs / exercises.length) * 100
})
</script>

<style scoped>
.active-session-page {
  padding: 16px 20px;
  padding-bottom: 40px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.topbar-session {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.topbar-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
}
.topbar-title {
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}
.topbar-gym {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--accent);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.icon-btn {
  cursor: pointer;
  color: var(--text);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  transition: background 0.2s;
  flex-shrink: 0;
}
.icon-btn:hover {
  background: var(--surface);
}
.global-progress-bar {
  height: 3px;
  background: var(--bg4);
  border-radius: 2px;
  margin-bottom: 20px;
  overflow: hidden;
}
.global-progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.4s ease;
  border-radius: 2px;
}
.active-exercise-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.progress-panel {
  padding: 16px 20px;
}
.progress-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.exercise-status-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ex-status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.ex-status-row:hover { background: var(--bg4); }
.ex-status-row.ex-status-active { background: var(--accent-dim); }
.ex-status-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text3);
}
.ex-status-indicator.done {
  background: var(--accent);
  border-color: var(--accent);
  color: #192126;
}
.ex-status-indicator.active {
  border-color: var(--accent);
  color: var(--accent);
}
.active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: block;
}
.ex-status-name { flex: 1; font-size: 13px; font-weight: 500; }
.ex-status-sets { font-size: 11px; color: var(--text2); font-family: var(--font-mono); }
.progress-bar-bg { background: var(--bg4); border-radius: 3px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: var(--accent); transition: width 0.3s ease; }
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text2);
}
.mt { margin-top: 12px; }
.muted { color: var(--text2); }
</style>
