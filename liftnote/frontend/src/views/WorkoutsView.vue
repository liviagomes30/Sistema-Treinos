<template>
  <div class="workouts-page">
    <div class="page-header">
      <h1 class="page-title">Seus Treinos</h1>
      <button class="btn btn-accent btn-sm" @click="showWorkoutModal = true">
        + Novo
      </button>
    </div>

    <div v-if="appStore.workouts.length === 0" class="empty-state">
      <div class="empty-icon">◈</div>
      <div class="empty-text">
        Nenhum treino criado ainda.<br />Crie seu primeiro treino!
      </div>
    </div>

    <div v-else class="workout-list">
      <div
        v-for="w in appStore.workouts"
        :key="w._id"
        class="workout-card"
      >
        <div class="card-body">
          <div class="workout-icon-bg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
          </div>
          <div class="workout-info">
            <div class="workout-name">{{ w.name }}</div>
            <div class="workout-desc">{{ w.description || "Sem descrição" }}</div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-ghost btn-sm" style="flex: 1;" @click="router.push(`/workouts/${w._id}`)">
            Detalhes
          </button>
          <button class="btn btn-accent btn-sm" style="flex: 1;" @click="handleStartSession(w)">
            ▶ Iniciar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de novo treino -->
    <WorkoutModal
      v-model:isOpen="showWorkoutModal"
      :isEdit="false"
      @save="handleSaveWorkout"
    />

    <!-- Modal de seleção de academia -->
    <GymSelectorModal
      v-model:isOpen="showGymSelector"
      @select="onGymSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "../store/appStore";
import { useSessionStore } from "../store/sessionStore";
import WorkoutModal from "../components/workouts/WorkoutModal.vue";
import GymSelectorModal from "../components/ui/GymSelectorModal.vue";
import type { Workout, GymPlace } from "../types";

const appStore = useAppStore();
const sessionStore = useSessionStore();
const router = useRouter();
const showWorkoutModal = ref(false);
const showGymSelector = ref(false);
const pendingWorkout = ref<Workout | null>(null);

onMounted(() => {
  appStore.fetchWorkouts();
});

async function handleStartSession(workout: Workout) {
  if (sessionStore.activeSession) {
    if (!confirm('Você já tem um treino em andamento. Deseja cancelar o atual e iniciar um novo?')) {
      return;
    }
  }
  pendingWorkout.value = workout;
  showGymSelector.value = true;
}

async function onGymSelected(gym: GymPlace | null) {
  if (!pendingWorkout.value) return;
  await sessionStore.initializeWorkoutSession(pendingWorkout.value, gym);
  pendingWorkout.value = null;
  if (sessionStore.activeSession) {
    router.push("/session");
  }
}

async function handleSaveWorkout(data: { name: string; description: string }) {
  await appStore.addWorkout({
    name: data.name,
    description: data.description,
  });
  showWorkoutModal.value = false;
}
</script>

<style scoped>
.workouts-page {
  padding: 20px;
  padding-bottom: 24px;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
}

.workout-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workout-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 0.2s;
}

.workout-card:hover {
  border-color: var(--border2);
}

.card-body {
  display: flex;
  align-items: center;
  gap: 14px;
}

.workout-icon-bg {
  width: 46px;
  height: 46px;
  border-radius: var(--r);
  background: var(--accent-dim);
  border: 1px solid rgba(187, 242, 70, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}

.workout-info {
  flex: 1;
  min-width: 0;
}

.workout-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workout-desc {
  font-size: 12px;
  color: var(--text2);
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  display: flex;
  gap: 10px;
}
</style>
