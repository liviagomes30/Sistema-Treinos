<template>
  <div class="active-session-page">
    <div class="topbar-session">
      <div class="icon-btn" @click="cancelSession">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </div>
      <div class="timer-display" @click="toggleTimer">
        <span v-if="!timerRunning" style="color: var(--accent)">Paused </span>
        {{ timerDisplay }}
      </div>
      <div class="icon-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
      </div>
    </div>

    <!-- Active Exercise Focus -->
    <div v-if="activeSession?.exercises?.length > 0" class="active-exercise-container">
      <div class="video-placeholder">
        <div class="play-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#192126" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
      </div>

      <div class="ex-header-nav">
        <button class="nav-arrow" @click="prevExercise" :disabled="activeExerciseIdx === 0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="ex-title-container">
          <h2 class="active-ex-name">{{ currentExercise?.name || 'Exercício' }}</h2>
          <div class="active-ex-meta">{{ currentExercise?.series || 0 }} Sets • {{ currentExercise?.reps || 0 }} Reps</div>
        </div>
        <button class="nav-arrow" @click="nextExercise" :disabled="activeExerciseIdx === activeSession.exercises.length - 1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- Sets Slider -->
      <div class="sets-slider-container">
        <div class="sets-slider">
          <div 
            v-for="(s, si) in currentSets" 
            :key="si"
            class="set-pill"
            :class="{ 'active': activeSetIdx === si, 'completed': s.done }"
            @click="activeSetIdx = si"
          >
            <span v-if="s.done" class="check-icon">✓</span>
            <span v-else>Set {{ si + 1 }}</span>
          </div>
        </div>
      </div>

      <!-- Current Set Input -->
      <div class="current-set-editor card">
        <div class="set-header">
          <h3>Set {{ activeSetIdx + 1 }}</h3>
          <span class="target-badge">Target: {{ currentSets[activeSetIdx]?.targetReps }}r @ {{ currentSets[activeSetIdx]?.targetWeight }}kg</span>
        </div>
        
        <div class="set-inputs">
          <div class="input-group">
            <label>Weight (kg)</label>
            <input 
              type="number" 
              :value="currentSets[activeSetIdx]?.weightLogged"
              @change="logSet(currentExercise?._id || '', activeSetIdx, 'weight', ($event.target as HTMLInputElement).value)"
              min="0"
            />
          </div>
          <div class="input-group">
            <label>Reps</label>
            <input 
              type="number" 
              :value="currentSets[activeSetIdx]?.repsLogged"
              @change="logSet(currentExercise?._id || '', activeSetIdx, 'reps', ($event.target as HTMLInputElement).value)"
              min="0"
            />
          </div>
        </div>

        <button 
          class="btn btn-large mt" 
          :class="currentSets[activeSetIdx]?.done ? 'btn-ghost' : 'btn-accent'"
          style="width: 100%;"
          @click="markSetDone(currentExercise?._id || '', activeSetIdx)"
        >
          {{ currentSets[activeSetIdx]?.done ? '✓ Completed' : 'Complete Set' }}
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      No exercises found in this session.
    </div>

    <!-- Progress Overview -->
    <div class="progress-card card mt">
      <div class="progress-header">
        <span class="muted">Workout Progress</span>
        <span style="font-weight: 600;">{{ completedExercises }}/{{ activeSession?.exercises?.length || 0 }}</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="volume-stat mt">
        Total Volume: <span style="color: var(--accent); font-weight: 700;">{{ sessionVolume }} kg</span>
      </div>
    </div>

    <div class="bottom-action">
      <button class="btn btn-accent btn-large" @click="finishSession">Finish Workout</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useSessionStore } from "../store/sessionStore";
import { useRouter } from "vue-router";
import type { Session, Exercise } from "../types";

const sessionStore = useSessionStore();
const router = useRouter();

const activeSession = computed(() => sessionStore.activeSession);
const timerDisplay = ref("00:00");
const timerRunning = ref(true);
const activeExerciseIdx = ref(0);
const activeSetIdx = ref(0);
const secondsElapsed = ref(0);
let timerInterval: any = null;

const currentExercise = computed(() => {
  if (!activeSession.value?.exercises) return null;
  return activeSession.value.exercises[activeExerciseIdx.value] || null;
});

const currentSets = computed(() => {
  if (!currentExercise.value) return [];
  return getExSets(currentExercise.value);
});

watch(activeExerciseIdx, () => {
  activeSetIdx.value = 0; // reset set view when changing exercise
});

onMounted(() => {
  if (!activeSession.value) {
    router.push("/workouts");
    return;
  }
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});

function startTimer() {
  timerRunning.value = true;
  timerInterval = setInterval(() => {
    secondsElapsed.value++;
    const mins = Math.floor(secondsElapsed.value / 60);
    const secs = secondsElapsed.value % 60;
    timerDisplay.value = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, 1000);
}

function stopTimer() {
  timerRunning.value = false;
  if (timerInterval) clearInterval(timerInterval);
}

function toggleTimer() {
  if (timerRunning.value) stopTimer();
  else startTimer();
}

function prevExercise() {
  if (activeExerciseIdx.value > 0) activeExerciseIdx.value--;
}

function nextExercise() {
  if (activeSession.value && activeExerciseIdx.value < activeSession.value.exercises.length - 1) {
    activeExerciseIdx.value++;
  }
}

async function finishSession() {
  if (confirm("Deseja finalizar este treino?")) {
    await sessionStore.finishSession();
    router.push("/history");
  }
}

async function cancelSession() {
  if (confirm("Tem certeza que deseja cancelar este treino? Os dados não serão salvos.")) {
    await sessionStore.cancelSession();
    router.push("/workouts");
  }
}

const completedExercises = computed(() => {
  if (!activeSession.value?.exercises) return 0;
  return activeSession.value.exercises.filter(ex => exerciseComplete(ex)).length;
});

const progressPercentage = computed(() => {
  const total = activeSession.value?.exercises?.length || 1;
  return (completedExercises.value / total) * 100;
});

const sessionVolume = computed(() => {
  if (!activeSession.value?.exercises) return 0;
  return activeSession.value.exercises.reduce((acc, ex) => {
    const exVol = ex.logs.reduce((exAcc: number, log: any) => exAcc + (log.weight_used_kg * log.reps_done), 0);
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
      done: !!log
    });
  }
  return sets;
}

async function logSet(exerciseId: string, setIndex: number, field: string, value: any) {
  const exercise = activeSession.value?.exercises.find((ex: any) => ex.exercise_id === exerciseId);
  if (!exercise) return;
  // Local state update for smooth typing could go here
}

async function markSetDone(exerciseId: string, setIndex: number) {
  const exercise = activeSession.value?.exercises.find((ex: any) => ex.exercise_id === exerciseId);
  if (!exercise) return;

  const setNum = setIndex + 1;
  const existingLogIdx = exercise.logs.findIndex((l: any) => l.set_number === setNum);
  
  const currentSetData = currentSets.value[setIndex];
  
  const logData = {
    set_number: setNum,
    reps_done: currentSetData.repsLogged || exercise.reps || 10,
    weight_used_kg: currentSetData.weightLogged || exercise.weight_kg || 0
  };

  try {
    await sessionStore.logSet(exerciseId, logData);
    if (existingLogIdx > -1) {
      exercise.logs[existingLogIdx] = logData;
    } else {
      exercise.logs.push(logData);
    }
    
    // Auto advance set
    if (activeSetIdx.value < exercise.series - 1) {
      activeSetIdx.value++;
    } else if (activeExerciseIdx.value < activeSession.value!.exercises.length - 1) {
      // Optional: Auto advance exercise when all sets done
      // activeExerciseIdx.value++;
    }
  } catch (err) {
    console.error(err);
  }
}

</script>

<style scoped>
.active-session-page {
  padding: 20px;
  padding-bottom: 100px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.topbar-session {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.icon-btn {
  cursor: pointer;
  color: var(--text);
}
.timer-display {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 700;
  background: var(--surface);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.active-exercise-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--surface);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}
.video-placeholder::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent);
  background-size: 20px 20px;
  opacity: 0.5;
}
.play-btn {
  width: 48px;
  height: 48px;
  background: var(--accent);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.ex-header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.nav-arrow {
  background: var(--surface);
  border: none;
  color: var(--text);
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.ex-title-container {
  text-align: center;
  flex: 1;
  padding: 0 16px;
}
.active-ex-name {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}
.active-ex-meta {
  font-size: 13px;
  color: var(--text2);
}

.sets-slider-container {
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}
.sets-slider {
  display: flex;
  gap: 12px;
}
.set-pill {
  padding: 10px 20px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.set-pill.active {
  background: var(--surface);
  border-color: var(--accent);
  color: var(--accent);
}
.set-pill.completed {
  background: rgba(187, 242, 70, 0.1);
  border-color: var(--accent);
  color: var(--accent);
}

.current-set-editor {
  padding: 20px;
  border-radius: 20px;
  background: var(--surface);
}
.set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.set-header h3 {
  font-size: 18px;
  margin: 0;
}
.target-badge {
  font-size: 11px;
  background: var(--bg);
  border: 1px solid var(--border);
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--text2);
}

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
}
.input-group input {
  width: 100%;
  background: var(--bg);
  border: none;
  padding: 16px;
  border-radius: 12px;
  color: var(--text);
  font-size: 18px;
  font-family: var(--font-mono);
  font-weight: 600;
  text-align: center;
  outline: none;
}

.progress-card {
  padding: 16px;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}
.progress-bar-bg {
  height: 6px;
  background: var(--bg4);
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px 24px;
  background: linear-gradient(0deg, var(--bg) 80%, rgba(25, 33, 38, 0));
  display: flex;
  justify-content: center;
  z-index: 100;
}
.bottom-action .btn-large {
  max-width: 440px;
  width: 100%;
}
</style>
