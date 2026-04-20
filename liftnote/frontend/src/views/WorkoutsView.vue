<template>
  <div class="workouts-view">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      "
    >
      <h2>Seus Treinos</h2>
      <button class="btn btn-accent" @click="showWorkoutModal = true">
        + Novo treino
      </button>
    </div>

    <div v-if="appStore.workouts.length === 0" class="empty-state">
      <div class="empty-icon">◈</div>
      <div class="empty-text">
        Nenhum treino criado ainda.<br />Crie seu primeiro treino!
      </div>
    </div>

    <div v-else>
      <div
        v-for="w in appStore.workouts"
        :key="w._id"
        class="card mt"
        style="
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <div>
          <h3>{{ w.name }}</h3>
          <p style="font-size: 13px; color: var(--text2)">
            {{ w.description || "Sem descrição" }}
          </p>
        </div>
        <div style="display: flex; gap: 8px">
          <button class="btn btn-ghost btn-sm" @click="router.push(`/workouts/${w._id}`)">Ver Exercícios</button>
          <button class="btn btn-accent btn-sm" @click="handleStartSession(w)">
            ▶ Iniciar
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <WorkoutModal
      v-model:isOpen="showWorkoutModal"
      :isEdit="false"
      @save="handleSaveWorkout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "../store/appStore";
import { useSessionStore } from "../store/sessionStore";
import WorkoutModal from "../components/workouts/WorkoutModal.vue";
import type { Workout } from "../types";

const appStore = useAppStore();
const sessionStore = useSessionStore();
const router = useRouter();
const showWorkoutModal = ref(false);

onMounted(() => {
  appStore.fetchWorkouts();
});

async function handleStartSession(workout: Workout) {
  await sessionStore.startSession(workout);
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
