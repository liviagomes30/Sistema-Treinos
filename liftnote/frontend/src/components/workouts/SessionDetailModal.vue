<template>
  <BaseModal
    :modelValue="isOpen"
    @update:modelValue="emit('update:isOpen', $event)"
    :title="workoutName"
  >
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Carregando detalhes...</span>
    </div>

    <template v-else>
      <div style="font-size: 12px; color: var(--text2); margin-bottom: 12px">
        {{ formattedDate }}
      </div>

      <div
        class="stat-grid-1"
        style="margin-bottom: 16px"
      >
        <div class="stat-card">
          <div class="stat-val" style="font-size: 22px">
            {{ statusLabel }}
          </div>
          <div class="stat-label">Status</div>
        </div>
      </div>

      <!-- Exercícios e logs -->
      <div v-if="exerciseGroups.length" class="exercises-section">
        <div class="exercises-title">Exercícios</div>
        <div class="exercise-list">
          <div
            v-for="(group, i) in exerciseGroups"
            :key="i"
            class="exercise-block"
          >
            <div class="exercise-header">
              <div class="exercise-name">{{ group.name }}</div>
              <div v-if="group.muscle" class="exercise-muscle">{{ group.muscle }}</div>
            </div>
            <div class="sets-table">
              <div class="sets-header">
                <span>Série</span>
                <span>Reps</span>
                <span>Peso</span>
              </div>
              <div
                v-for="(set, si) in group.sets"
                :key="si"
                class="set-row"
              >
                <span class="set-num">{{ set.set_number }}</span>
                <span>{{ set.reps_done }} rep{{ set.reps_done !== 1 ? 's' : '' }}</span>
                <span>{{ set.weight_used_kg > 0 ? set.weight_used_kg + ' kg' : '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="session?.logs !== undefined" class="no-exercises">
        Nenhum exercício registrado nesta sessão.
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseModal from "../ui/BaseModal.vue";
import type { Session } from "../../types";

const props = withDefaults(defineProps<{
  isOpen: boolean;
  session?: Session | any;
  workoutName?: string;
  loading?: boolean;
  generatingAi?: boolean;
}>(), {
  workoutName: "Treino",
  loading: false,
  generatingAi: false,
});

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "generateAiSummary", value: any): void;
}>();

const formattedDate = computed(() => {
  if (!props.session?.started_at) return "";
  return new Date(props.session.started_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const statusLabel = computed(() => {
  const map: Record<string, string> = { completed: "Finalizado", cancelled: "Cancelado" };
  return map[props.session?.status] || "Em andamento";
});

const exerciseGroups = computed(() => {
  const logs = props.session?.logs;
  if (!logs?.length) return [];

  const groups: Record<string, { name: string; muscle: string; order: number; sets: any[] }> = {};

  for (const log of logs) {
    const we = log.workout_exercise_id;
    if (!we) continue;
    const key = typeof we === "object" ? we._id : we;
    const name = we.custom_name || we.exercise_catalog_id?.name || "Exercício";
    const muscle = we.exercise_catalog_id?.muscle_group || "";
    const order = we.order ?? 999;
    if (!groups[key]) {
      groups[key] = { name, muscle, order, sets: [] };
    }
    groups[key].sets.push(log);
  }

  return Object.values(groups)
    .sort((a, b) => a.order - b.order)
    .map((g) => ({ ...g, sets: g.sets.sort((a, b) => a.set_number - b.set_number) }));
});

function close() {
  emit("update:isOpen", false);
}
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 0;
  color: var(--text2);
  font-size: 13px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stat-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.exercises-section {
  margin-top: 4px;
}

.exercises-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exercise-block {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.exercise-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 10px 12px 6px;
  gap: 8px;
}

.exercise-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.exercise-muscle {
  font-size: 10px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.sets-table {
  padding: 0 12px 10px;
}

.sets-header {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  font-size: 10px;
  color: var(--text3);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}

.set-row {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  font-size: 12px;
  color: var(--text2);
  padding: 4px 0;
}

.set-num {
  color: var(--accent);
  font-weight: 700;
}

.no-exercises {
  font-size: 13px;
  color: var(--text3);
  text-align: center;
  padding: 16px 0;
}
</style>
