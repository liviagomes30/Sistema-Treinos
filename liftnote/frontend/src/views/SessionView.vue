<template>
  <div>
    <div style="display: grid; grid-template-columns: 1fr 280px; gap: 20px">
      <div>
        <div
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          "
        >
          <div>
            <div
              style="
                font-size: 11px;
                color: var(--text2);
                font-family: var(--font-mono);
              "
            >
              SESSÃO ATIVA
            </div>
            <div style="font-family: var(--font-display); font-size: 26px">
              {{ activeSession?.workoutName }}
            </div>
          </div>
          <div style="margin-left: auto; display: flex; gap: 8px">
            <button class="btn btn-ghost" @click="toggleTimer">
              {{ timerRunning ? "⏸ Pausar" : "▶ Retomar" }}
            </button>
            <button class="btn btn-accent" @click="finishSession">
              ✓ Finalizar
            </button>
            <button class="btn btn-danger" @click="cancelSession">✕</button>
          </div>
        </div>

        <div
          v-for="(ex, ei) in activeSession.exercises"
          :key="ex._id"
          :class="['exercise-card', { active: activeExerciseIdx === ei }]"
        >
          <div
            class="exercise-header"
            @click="activeExerciseIdx = activeExerciseIdx === ei ? -1 : ei"
          >
            <div style="display: flex; align-items: center; gap: 10px">
              <span :class="['tag', exerciseComplete(ex) ? 'tag-accent' : '']">
                {{ exerciseComplete(ex) ? "✓" : ei + 1 }}
              </span>
              <div>
                <div style="font-weight: 500">{{ ex.name }}</div>
                <div style="font-size: 11px; color: var(--text2)">
                  {{ ex.muscle_group }}
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center">
              <span class="tag">{{
                ex.set_type === "pyramid"
                  ? "Pirâmide"
                  : ex.series + "x" + ex.reps
              }}</span>
              <span style="color: var(--text2)">{{
                activeExerciseIdx === ei ? "▲" : "▼"
              }}</span>
            </div>
          </div>
          <div v-if="activeExerciseIdx === ei" class="exercise-sets">
            <div
              style="
                display: grid;
                grid-template-columns: 28px 80px 80px 80px auto;
                gap: 8px;
                padding: 8px 0 4px;
                font-size: 10px;
                color: var(--text3);
                text-transform: uppercase;
                letter-spacing: 0.5px;
              "
            >
              <span>#</span><span>Peso (kg)</span><span>Reps</span
              ><span>Alvo</span><span></span>
            </div>
            <div
              v-for="(s, si) in getExSets(ex)"
              :key="si"
              style="
                display: grid;
                grid-template-columns: 28px 80px 80px 80px auto;
                gap: 8px;
                align-items: center;
                padding: 6px 0;
                border-bottom: 1px solid var(--border);
              "
            >
              <span class="set-num">{{ si + 1 }}</span>
              <input
                type="number"
                :value="s.weightLogged"
                @change="logSet(ex._id, si, 'weight', $event.target.value)"
                style="padding: 5px 8px; font-size: 12px"
                min="0"
              />
              <input
                type="number"
                :value="s.repsLogged"
                @change="logSet(ex._id, si, 'reps', $event.target.value)"
                style="padding: 5px 8px; font-size: 12px"
                min="0"
              />
              <span
                style="
                  font-size: 11px;
                  color: var(--text2);
                  font-family: var(--font-mono);
                "
                >{{ s.targetReps }}r @ {{ s.targetWeight }}kg</span
              >
              <button
                class="btn btn-accent btn-sm"
                v-if="!s.done"
                @click="markSetDone(ex._id, si)"
              >
                ✓
              </button>
              <span v-else class="tag tag-accent">✓</span>
            </div>
            <div style="font-size: 11px; color: var(--text2); padding-top: 8px">
              Descanso:
              {{ ex.no_rest ? "Sem descanso" : ex.rest_seconds + "s" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Timer sidebar -->
      <div>
        <div class="card" style="text-align: center; margin-bottom: 12px">
          <div
            style="
              font-size: 11px;
              color: var(--text2);
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-bottom: 4px;
            "
          >
            Tempo de treino
          </div>
          <div class="timer-display">{{ timerDisplay }}</div>
          <div style="display: flex; gap: 8px; justify-content: center">
            <button class="btn btn-ghost btn-sm" @click="toggleTimer">
              {{ timerRunning ? "⏸" : "▶" }}
            </button>
            <button class="btn btn-ghost btn-sm" @click="resetTimer">↺</button>
          </div>
        </div>

        <div class="card">
          <h3>Progresso</h3>
          <div style="margin-bottom: 12px">
            <div
              style="
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                margin-bottom: 6px;
              "
            >
              <span class="muted">Exercícios completos</span>
              <span style="font-family: var(--font-mono)"
                >{{ completedExercises }}/{{
                  activeSession.exercises.length
                }}</span
              >
            </div>
            <div
              style="
                height: 4px;
                background: var(--bg4);
                border-radius: 2px;
                overflow: hidden;
              "
            >
              <div
                :style="{
                  width:
                    (completedExercises / activeSession.exercises.length) *
                      100 +
                    '%',
                  height: '100%',
                  background: 'var(--accent)',
                  transition: 'width 0.3s',
                  borderRadius: '2px',
                }"
              ></div>
            </div>
          </div>
          <div style="font-size: 12px; color: var(--text2)">
            Volume atual:
            <strong style="color: var(--accent)">{{ sessionVolume }} kg</strong>
          </div>
        </div>

        <div class="card mt" style="margin-top: 12px">
          <h3>Anotações</h3>
          <textarea
            v-model="activeSession.notes"
            rows="3"
            placeholder="Como está se sentindo? Notas do treino..."
            style="resize: none; font-size: 12px"
          ></textarea>
        </div>
      </div>
    </div>
  </div>

  <!-- ─── HISTORY ─── -->
</template>

<script setup>
import { ref, computed } from "vue";
import { useSessionStore } from "../store/sessionStore";
import { useRouter } from "vue-router";

const sessionStore = useSessionStore();
const router = useRouter();

const activeSession = computed(() => sessionStore.activeSession);
const timerDisplay = ref("00:00");
const timerRunning = ref(false);
const activeExerciseIdx = ref(0);
const sessionVolume = ref(0);
const completedExercises = ref(0);

// Stub functions
function toggleTimer() {
  timerRunning.value = !timerRunning.value;
}
function resetTimer() {
  timerDisplay.value = "00:00";
}
function finishSession() {
  sessionStore.finishSession();
  router.push("/history");
}
function cancelSession() {
  sessionStore.cancelSession();
  router.push("/workouts");
}
function getSetStatus(s) {
  return "pendente";
}
function exerciseComplete(e) {
  return false;
}
</script>
