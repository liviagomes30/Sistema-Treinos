<template>
  <div class="progress-page">
    <div class="stat-grid mb">
      <div class="stat-card">
        <div class="stat-val">{{ completedSessions }}</div>
        <div class="stat-label">Sessões completas</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ Math.round(avgDuration) }}</div>
        <div class="stat-label">Média (min)</div>
      </div>
      <div class="stat-card accent-card">
        <div class="stat-val">{{ weekStreak }}</div>
        <div class="stat-label">Semanas ativas</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useAppStore } from "../store/appStore";

const appStore = useAppStore();

onMounted(() => {
  appStore.fetchSessions();
  appStore.fetchWorkouts();
});

const sessionsArray = computed(() =>
  Array.isArray(appStore.sessions) ? appStore.sessions : [],
);

const completedSessions = computed(() =>
  sessionsArray.value.filter((s: any) => s.status === "completed").length,
);

const avgDuration = computed(() => {
  const c = sessionsArray.value.filter((s: any) => s.duration_seconds);
  if (!c.length) return 0;
  return c.reduce((a: number, s: any) => a + s.duration_seconds, 0) / c.length / 60;
});

const weekStreak = computed(() => {
  const weeks = new Set<string>();
  for (const s of sessionsArray.value) {
    if (s.status !== "completed") continue;
    const d = new Date(s.started_at);
    const week = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
    weeks.add(week);
  }
  return weeks.size;
});
</script>

<style scoped>
.progress-page {
  padding: 20px;
  padding-bottom: calc(96px + env(safe-area-inset-bottom) + 16px);
  width: 100%;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 16px;
}

.accent-card {
  background: var(--accent);
  border-color: var(--accent);
}

.accent-card .stat-val,
.accent-card .stat-label {
  color: #192126;
}

.stat-val {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
}

.stat-label {
  font-size: 11px;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.mb { margin-bottom: 16px; }
</style>
