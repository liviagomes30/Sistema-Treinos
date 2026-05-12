<template>
  <div class="active-session-page">
    <!-- Topbar -->
    <div class="topbar-session">
      <div class="icon-btn" @click="discardSession">
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
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>

      <span class="topbar-title">{{ activeSession?.workoutName || "Treino Ativo" }}</span>

      <div class="icon-btn" @click="finishSession" style="color: var(--accent)">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>

    <!-- Barra de progresso global (topo, fina) -->
    <div class="global-progress-bar">
      <div
        class="global-progress-fill"
        :style="{ width: progressPercentage + '%' }"
      ></div>
    </div>

    <!-- Info rápida da sessão -->
    <div class="session-meta-row">
      <span class="session-progress-label"
        >{{ completedExercises }}/{{
          activeSession?.exercises?.length || 0
        }}
        exercícios</span
      >
    </div>

    <div v-if="currentExercise" class="active-exercise-container">
      <!-- Nav entre exercícios -->
      <div class="exercise-nav">
        <button
          class="nav-btn"
          @click="prevExercise"
          :disabled="activeExerciseIdx === 0"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div class="exercise-title-block">
          <div class="exercise-number">
            Exercício {{ activeExerciseIdx + 1 }} de
            {{ activeSession?.exercises?.length || 0 }}
          </div>
          <div class="exercise-name">{{ currentExercise.name }}</div>
          <div class="exercise-muscle" v-if="currentExercise.muscle_group">
            {{ currentExercise.muscle_group }}
          </div>
        </div>

        <button
          class="nav-btn"
          @click="nextExercise"
          :disabled="
            !activeSession ||
            activeExerciseIdx >= activeSession.exercises.length - 1
          "
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Indicador de exercícios (bolinhas) -->
      <div class="exercise-dots">
        <div
          v-for="(ex, i) in activeSession?.exercises"
          :key="i"
          class="ex-dot"
          :class="{
            'ex-dot-active': i === activeExerciseIdx,
            'ex-dot-done': exerciseComplete(ex),
          }"
          @click="activeExerciseIdx = i"
        ></div>
      </div>

      <!-- Séries - pílulas -->
      <div class="sets-row">
        <div
          v-for="(set, i) in currentSets"
          :key="i"
          class="set-pill"
          :class="{ active: i === activeSetIdx, completed: set.done }"
          @click="
            activeSetIdx = i;
            loadSetInputs();
          "
        >
          <span v-if="set.done" class="set-pill-check">✓</span>
          <span v-else>S{{ i + 1 }}</span>
        </div>
      </div>

      <!-- Editor da série atual -->
      <div class="current-set-editor card">
        <div class="set-header">
          <div>
            <h3 style="margin: 0; font-size: 18px">
              Série {{ activeSetIdx + 1 }}
            </h3>
            <div
              v-if="lastSessionWeight !== null"
              style="font-size: 12px; color: var(--text2); margin-top: 2px"
            >
              Último:
              <strong style="color: var(--text)"
                >{{ lastSessionWeight }}kg × {{ lastSessionReps }}</strong
              >
            </div>
          </div>
          <span class="target-badge">
            Alvo: {{ currentSets[activeSetIdx]?.targetReps }} reps ·
            {{ currentSets[activeSetIdx]?.targetWeight }}kg
          </span>
        </div>

        <div class="set-inputs">
          <div class="input-group">
            <label>Peso (kg)</label>
            <div class="input-stepper">
              <button
                class="stepper-btn"
                @click="
                  currentWeightInput = Math.max(0, currentWeightInput - 2.5)
                "
              >
                −
              </button>
              <input
                type="number"
                v-model.number="currentWeightInput"
                min="0"
              />
              <button class="stepper-btn" @click="currentWeightInput += 2.5">
                +
              </button>
            </div>
          </div>
          <div class="input-group">
            <label>Reps</label>
            <div class="input-stepper">
              <button
                class="stepper-btn"
                @click="currentRepsInput = Math.max(0, currentRepsInput - 1)"
              >
                −
              </button>
              <input type="number" v-model.number="currentRepsInput" min="0" />
              <button class="stepper-btn" @click="currentRepsInput++">+</button>
            </div>
          </div>
        </div>

        <button
          class="btn btn-large mt"
          :class="currentSets[activeSetIdx]?.done ? 'btn-ghost' : 'btn-accent'"
          style="width: 100%"
          @click="markSetDone(currentExercise?.exercise_id || '', activeSetIdx)"
        >
          {{
            currentSets[activeSetIdx]?.done
              ? "✓ Série Completa"
              : "Completar Série"
          }}
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      Nenhum exercício encontrado nesta sessão.
    </div>

    <!-- Painel de progresso expandido -->
    <div class="progress-panel card mt">
      <div class="progress-panel-header">
        <span
          class="muted"
          style="
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          "
          >Progresso do Treino</span
        >
        <span style="font-size: 13px; font-weight: 700; color: var(--accent)"
          >{{ Math.round(progressPercentage) }}%</span
        >
      </div>

      <!-- Mini lista de exercícios com status -->
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
              done: exerciseComplete(ex),
              active: i === activeExerciseIdx && !exerciseComplete(ex),
            }"
          >
            <svg
              v-if="exerciseComplete(ex)"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span
              v-else-if="i === activeExerciseIdx"
              style="
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: currentColor;
                display: block;
              "
            ></span>
          </div>
          <span class="ex-status-name">{{ ex.name }}</span>
          <span class="ex-status-sets"
            >{{ ex.logs?.length || 0 }}/{{ ex.series }}s</span
          >
        </div>
      </div>

      <div class="progress-bar-bg" style="height: 5px; margin-top: 12px">
        <div
          class="progress-bar-fill"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>

      <div class="volume-stat mt" style="font-size: 13px">
        Volume:
        <strong style="color: var(--accent)">{{ sessionVolume }} kg</strong>
      </div>
    </div>

    <div class="bottom-action">
      <button class="btn btn-accent btn-large" @click="finishSession">
        Finalizar Treino
      </button>
    </div>

    <!-- Modal: Finalizar -->
    <ConfirmModal
      v-model:isOpen="showFinishModal"
      title="Finalizar Treino"
      message="Deseja finalizar este treino? Suas séries concluídas serão salvas no histórico."
      confirmText="Finalizar"
      @confirm="confirmFinishSession"
    />

    <!-- Modal: Descartar -->
    <ConfirmModal
      v-model:isOpen="showDiscardModal"
      title="Descartar Treino"
      message="Tem certeza que deseja descartar? Nenhum dado será salvo."
      confirmText="Descartar"
      confirmClass="btn-danger"
      @confirm="confirmDiscardSession"
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
const activeSetIdx = ref(0);
const currentWeightInput = ref(0);
const currentRepsInput = ref(0);
const lastSessionWeight = ref<number | null>(null);
const lastSessionReps = ref<number | null>(null);
const showFinishModal = ref(false);
const showDiscardModal = ref(false);

const currentExercise = computed(
  () => activeSession.value?.exercises?.[activeExerciseIdx.value],
);

const currentSets = computed(() => {
  const ex = currentExercise.value;
  if (!ex) return [];
  return getExSets(ex);
});

watch(
  () => activeExerciseIdx.value,
  () => {
    activeSetIdx.value = 0;
    loadSetInputs();
    fetchLastSessionLog();
  },
);

onMounted(() => {
  if (!activeSession.value) {
    router.push("/workouts");
    return;
  }
  loadSetInputs();
  fetchLastSessionLog();
});

function loadSetInputs() {
  const ex = currentExercise.value;
  if (!ex) return;
  const sets = getExSets(ex);
  const set = sets[activeSetIdx.value];
  if (set) {
    currentWeightInput.value = set.weightLogged || (ex as any).weight_kg || 0;
    currentRepsInput.value = set.repsLogged || (ex as any).reps || 0;
  }
}

async function fetchLastSessionLog() {
  lastSessionWeight.value = null;
  lastSessionReps.value = null;
  // Placeholder — implementar busca de histórico real
}

function prevExercise() {
  if (activeExerciseIdx.value > 0) activeExerciseIdx.value--;
}

function nextExercise() {
  if (
    activeSession.value &&
    activeExerciseIdx.value < activeSession.value.exercises!.length - 1
  ) {
    activeExerciseIdx.value++;
  }
}

function finishSession() {
  showFinishModal.value = true;
}

function discardSession() {
  showDiscardModal.value = true;
}

async function confirmFinishSession() {
  await sessionStore.finishSession();
  router.push("/history");
}

function confirmDiscardSession() {
  sessionStore.discardSession();
  router.push("/workouts");
}

const completedExercises = computed(() => {
  if (!activeSession.value?.exercises) return 0;
  return activeSession.value.exercises.filter((ex: any) => exerciseComplete(ex))
    .length;
});

const progressPercentage = computed(() => {
  const total = activeSession.value?.exercises?.length || 1;
  return (completedExercises.value / total) * 100;
});

const sessionVolume = computed(() => {
  if (!activeSession.value?.exercises) return 0;
  return activeSession.value.exercises.reduce((acc: number, ex: any) => {
    const exVol = (ex.logs || []).reduce(
      (exAcc: number, log: any) => exAcc + log.weight_used_kg * log.reps_done,
      0,
    );
    return acc + exVol;
  }, 0);
});

function exerciseComplete(exercise: any) {
  if (!exercise.logs || exercise.logs.length === 0) return false;
  return exercise.logs.length >= exercise.series;
}

function getExSets(exercise: any): any[] {
  const sets = [];
  const logs = exercise.logs || [];
  for (let i = 0; i < exercise.series; i++) {
    const log = logs.find((l: any) => l.set_number === i + 1);
    sets.push({
      set_number: i + 1,
      weightLogged: log?.weight_used_kg || exercise.weight_kg || 0,
      repsLogged: log?.reps_done || exercise.reps || 0,
      targetReps: exercise.reps,
      targetWeight: exercise.weight_kg,
      done: !!log,
    });
  }
  return sets;
}

function markSetDone(exerciseId: string, setIndex: number) {
  const exercise = (activeSession.value?.exercises as any[])?.find(
    (ex) => ex.exercise_id === exerciseId,
  );
  if (!exercise) return;

  const logData = {
    set_number: setIndex + 1,
    reps_done: currentRepsInput.value || exercise.reps || 10,
    weight_used_kg: currentWeightInput.value || exercise.weight_kg || 0,
  };

  sessionStore.logSet(exerciseId, logData);

  if (activeSetIdx.value < exercise.series - 1) {
    activeSetIdx.value++;
    loadSetInputs();
  }
}
</script>

<style scoped>
.active-session-page {
  padding: 16px 20px;
  padding-bottom: 120px;
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
}
.icon-btn:hover {
  background: var(--surface);
}

/* Global progress bar (topo) */
.global-progress-bar {
  height: 3px;
  background: var(--bg4);
  border-radius: 2px;
  margin-bottom: 16px;
  overflow: hidden;
}
.global-progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.4s ease;
  border-radius: 2px;
}

/* Session meta */
.session-meta-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}
.session-progress-label {
  font-size: 12px;
  color: var(--text2);
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
  text-transform: uppercase;
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

/* Sets row */
.sets-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.set-pill {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: var(--bg4);
  color: var(--text2);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.set-pill.active {
  background: var(--surface);
  border-color: var(--accent);
  color: var(--accent);
}
.set-pill.completed {
  background: rgba(200, 241, 53, 0.12);
  border-color: var(--accent);
  color: var(--accent);
}
.set-pill-check {
  font-size: 12px;
}

/* Set editor */
.current-set-editor {
  padding: 20px;
  border-radius: 20px;
  background: var(--surface);
}
.set-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.target-badge {
  font-size: 11px;
  background: var(--bg);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 20px;
  color: var(--text2);
  white-space: nowrap;
}

/* Stepper inputs */
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
  transition:
    color 0.2s,
    background 0.2s;
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

/* Exercise status list */
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
.ex-status-row:hover {
  background: var(--bg4);
}
.ex-status-row.ex-status-active {
  background: var(--accent-dim);
}
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
.ex-status-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
}
.ex-status-sets {
  font-size: 11px;
  color: var(--text2);
  font-family: var(--font-mono);
}

.progress-bar-bg {
  background: var(--bg4);
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}
.volume-stat {
  font-size: 13px;
  color: var(--text2);
}

/* Bottom action */
.bottom-action {
  position: fixed;
  bottom: 68px;
  left: 0;
  right: 0;
  padding: 16px 20px 8px;
  display: flex;
  justify-content: center;
  z-index: 99;
  background: linear-gradient(to top, var(--bg) 60%, transparent);
}
.bottom-action .btn-large {
  max-width: 440px;
  width: 100%;
}

.mt {
  margin-top: 12px;
}
.muted {
  color: var(--text2);
}
</style>
