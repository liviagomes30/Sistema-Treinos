<template>
  <div class="active-session-page">
    <!-- Topbar -->
    <div class="topbar-session">
      <div class="icon-btn" @click="goBack">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </div>

      <span class="topbar-title">{{ activeSession?.workoutName || "Treino" }}</span>

      <button class="btn btn-accent btn-sm" @click="finishSession" style="font-size: 12px; padding: 6px 12px; font-weight: 700;">
        Finalizar
      </button>
    </div>

    <!-- Barra de progresso global -->
    <div class="global-progress-bar">
      <div class="global-progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <div v-if="currentExercise" class="active-exercise-container">
      <!-- Nav entre exercícios -->
      <div class="exercise-nav">
        <button class="nav-btn" @click="prevExercise" :disabled="activeExerciseIdx === 0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div class="exercise-title-block">
          <div class="exercise-number">
            {{ activeExerciseIdx + 1 }} / {{ activeSession?.exercises?.length || 0 }}
          </div>
          <div class="exercise-name">{{ currentExercise.name }}</div>
          <div class="exercise-muscle" v-if="currentExercise.muscle_group">
            {{ currentExercise.muscle_group }}
          </div>
        </div>

        <button
          class="nav-btn"
          @click="nextExercise"
          :disabled="!activeSession || activeExerciseIdx >= activeSession.exercises.length - 1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Indicadores de exercícios -->
      <div class="exercise-dots">
        <div
          v-for="(ex, i) in activeSession?.exercises"
          :key="i"
          class="ex-dot"
          :class="{
            'ex-dot-active': i === activeExerciseIdx,
            'ex-dot-done': hasAnyLog(ex),
          }"
          @click="activeExerciseIdx = i"
        ></div>
      </div>

      <!-- Editor da série -->
      <div class="current-set-editor card">
        <div class="set-header">
          <div class="set-header-left">
            <div class="set-hint">
              Sugestão: <strong>{{ currentExercise.series }}x{{ currentExercise.reps }}</strong>
              <span v-if="currentExercise.weight_kg"> · {{ currentExercise.weight_kg }}kg</span>
            </div>
          </div>
          <div class="series-logged-count">
            {{ currentExercise.logs?.length || 0 }} registrada{{ currentExercise.logs?.length !== 1 ? 's' : '' }}
          </div>
        </div>

        <div class="set-inputs">
          <div class="input-group">
            <label>Peso (kg)</label>
            <div class="input-stepper">
              <button class="stepper-btn" @click="currentWeightInput = Math.max(0, currentWeightInput - 2.5)">−</button>
              <input type="number" v-model.number="currentWeightInput" min="0" />
              <button class="stepper-btn" @click="currentWeightInput += 2.5">+</button>
            </div>
          </div>
          <div class="input-group">
            <label>Reps</label>
            <div class="input-stepper">
              <button class="stepper-btn" @click="currentRepsInput = Math.max(0, currentRepsInput - 1)">−</button>
              <input type="number" v-model.number="currentRepsInput" min="0" />
              <button class="stepper-btn" @click="currentRepsInput++">+</button>
            </div>
          </div>
        </div>

        <div>
          <button
            class="btn btn-accent btn-large mt"
            style="width: 100%"
            :disabled="sessionStore.isSavingSet || currentRepsInput <= 0"
            @click="registerSet"
          >
            <template v-if="sessionStore.isSavingSet">
              <span class="spinner-btn"></span> Salvando...
            </template>
            <template v-else>
              + Registrar Série
            </template>
          </button>
        </div>
      </div>

      <!-- Histórico de séries registradas para este exercício -->
      <div v-if="currentExercise.logs?.length" class="logged-sets-panel card mt">
        <div class="logged-sets-header">Séries registradas</div>
        <div class="logged-sets-list">
          <div
            v-for="(log, i) in currentExercise.logs"
            :key="i"
            class="logged-set-row"
          >
            <span class="log-set-num">S{{ log.set_number }}</span>
            <span class="log-weight">{{ log.weight_used_kg }}kg</span>
            <span class="log-reps">× {{ log.reps_done }} reps</span>
            <div class="log-actions" style="margin-left: auto;">
              <button class="btn btn-icon btn-small danger-text" @click="deleteLog(log._id)" :disabled="sessionStore.isSavingSet">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="feather">
                  <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      Nenhum exercício encontrado nesta sessão.
    </div>

    <!-- Painel de progresso -->
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
          @click="activeExerciseIdx = i"
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

    <!-- Confirm Finish Modal -->
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
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "../store/sessionStore";
import ConfirmModal from "../components/ui/ConfirmModal.vue";

const router = useRouter();
const sessionStore = useSessionStore();
const activeSession = computed(() => sessionStore.activeSession);

const activeExerciseIdx = ref(0);
const currentWeightInput = ref(0);
const currentRepsInput = ref(0);
const showFinishModal = ref(false);

const currentExercise = computed(
  () => activeSession.value?.exercises?.[activeExerciseIdx.value],
);

watch(
  () => activeExerciseIdx.value,
  () => {
    loadDefaultInputs();
  },
);

onMounted(() => {
  if (!activeSession.value) {
    router.push("/workouts");
    return;
  }
  loadDefaultInputs();
});

function loadDefaultInputs() {
  const ex = currentExercise.value;
  if (!ex) return;
  currentWeightInput.value = ex.weight_kg || 0;
  currentRepsInput.value = ex.reps || 0;
}

function prevExercise() {
  if (activeExerciseIdx.value > 0) activeExerciseIdx.value--;
}

function nextExercise() {
  if (activeSession.value && activeExerciseIdx.value < activeSession.value.exercises.length - 1) {
    activeExerciseIdx.value++;
  }
}

async function deleteLog(logId: string) {
  const exercise = currentExercise.value;
  if (!exercise) return;

  await sessionStore.deleteLogSet(exercise.exercise_id, logId);
}

function goBack() {
  const hadSession = !!sessionStore.currentSessionId;
  if (hadSession) {
    router.push("/workouts");
  } else {
    router.push("/workouts");
  }
}

async function registerSet() {
  const exercise = currentExercise.value;
  if (!exercise) return;

  const nextSetNumber = (exercise.logs?.length || 0) + 1;

  await sessionStore.logSet(exercise.exercise_id, {
    set_number: nextSetNumber,
    reps_done: currentRepsInput.value,
    weight_used_kg: currentWeightInput.value,
  });
}

function finishSession() {
  showFinishModal.value = true;
}

async function onConfirmFinish() {
  await sessionStore.finishSession();
  router.push("/history");
}

function hasAnyLog(exercise: any) {
  return exercise.logs?.length > 0;
}

const totalLogged = computed(() => {
  if (!activeSession.value?.exercises) return 0;
  return activeSession.value.exercises.reduce(
    (acc: number, ex: any) => acc + (ex.logs?.length || 0),
    0,
  );
});

const progressPercentage = computed(() => {
  const exercises = activeSession.value?.exercises || [];
  if (!exercises.length) return 0;
  const withLogs = exercises.filter((ex: any) => ex.logs?.length > 0).length;
  return (withLogs / exercises.length) * 100;
});
</script>

<style scoped>
.active-session-page {
  padding: 16px 20px;
  padding-bottom: 40px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Topbar */
.topbar-session {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.topbar-title {
  font-size: 15px;
  font-weight: 700;
  flex: 1;
  text-align: center;
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
.save-indicator {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  font-size: 12px;
  color: var(--accent);
  font-weight: 600;
}

/* Spinner */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}
.spinner-btn {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(25, 33, 38, 0.3);
  border-top-color: #192126;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Global progress bar */
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

/* Exercise nav */
.active-exercise-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.exercise-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}
.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text);
  transition: all 0.2s;
  flex-shrink: 0;
}
.nav-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.exercise-title-block {
  flex: 1;
  text-align: center;
}
.exercise-number {
  font-size: 11px;
  color: var(--text2);
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.exercise-name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}
.exercise-muscle {
  font-size: 12px;
  color: var(--accent);
  text-transform: capitalize;
  margin-top: 2px;
}

/* Exercise dots */
.exercise-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.ex-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg4);
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}
.ex-dot-active {
  border-color: var(--accent);
  background: var(--accent-dim);
  transform: scale(1.2);
}
.ex-dot-done {
  background: var(--accent);
  border-color: var(--accent);
}

/* Set editor card */
.current-set-editor {
  padding: 20px;
  border-radius: 20px;
  background: var(--surface);
}
.set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.set-hint {
  font-size: 12px;
  color: var(--text2);
}
.set-hint strong {
  color: var(--text);
}
.series-logged-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-dim);
  padding: 3px 10px;
  border-radius: 20px;
}

/* Inputs */
.set-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.input-group label {
  display: block;
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.input-stepper {
  display: flex;
  align-items: center;
  background: var(--bg);
  border-radius: 12px;
  overflow: hidden;
}
.stepper-btn {
  width: 40px;
  height: 52px;
  background: transparent;
  border: none;
  color: var(--text2);
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  flex-shrink: 0;
}
.stepper-btn:hover {
  color: var(--accent);
  background: var(--accent-dim);
}
.input-stepper input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 4px;
  color: var(--text);
  font-size: 20px;
  font-family: var(--font-mono);
  font-weight: 700;
  text-align: center;
  outline: none;
  min-width: 0;
}

/* Logged sets panel */
.logged-sets-panel {
  padding: 16px 20px;
}
.logged-sets-header {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text2);
  margin-bottom: 10px;
}
.logged-sets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.logged-set-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}
.log-set-num {
  font-size: 11px;
  font-weight: 700;
  background: var(--accent);
  color: #192126;
  padding: 2px 7px;
  border-radius: 10px;
  font-family: var(--font-mono);
}
.log-weight {
  font-weight: 700;
  font-family: var(--font-mono);
}
.log-reps {
  color: var(--text2);
}

/* Progress panel */
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

.mt { margin-top: 12px; }
.muted { color: var(--text2); }
.log-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.log-actions button {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-light);
  transition: color 0.2s;
}
.log-actions button:hover {
  color: var(--accent);
}
.log-actions button.danger-text:hover {
  color: var(--danger);
}
</style>
