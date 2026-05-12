<template>
  <div class="home-page">
    <!-- Header -->
    <div class="welcome-header">
      <div class="user-info">
        <div class="avatar">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#192126"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div>
          <div class="greeting">{{ greetingText }} 👋</div>
          <div class="greeting-sub">{{ todayFormatted }}</div>
        </div>
      </div>
      <div class="header-streak" v-if="streak > 0">
        <span class="fire-emoji">🔥</span>
        <span class="streak-count">{{ streak }}</span>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stat-grid-home mb">
      <div class="stat-card-home card-accent">
        <div class="stat-val-home">{{ sessionsArray.length }}</div>
        <div class="stat-label-home">Treinos feitos</div>
        <div class="stat-icon-home">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
        </div>
      </div>

      <div class="stat-card-home card-surface">
        <div class="stat-val-home accent-text">{{ weekSessions }}</div>
        <div class="stat-label-home">Esta semana</div>
        <div class="stat-icon-home">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
      </div>

      <div class="stat-card-home card-surface">
        <div class="stat-val-home accent-text">
          {{ totalVolume.toLocaleString("pt-BR") }}
        </div>
        <div class="stat-label-home">Volume total (kg)</div>
        <div class="stat-icon-home">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4M6 9h12M6 15h12"
            ></path>
          </svg>
        </div>
      </div>

      <div class="stat-card-home card-accent">
        <div class="stat-val-home">
          {{ avgDuration }}<span class="stat-unit">min</span>
        </div>
        <div class="stat-label-home">Média por treino</div>
        <div class="stat-icon-home">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
      </div>
    </div>

    <!-- Progresso semanal -->
    <div class="card weekly-progress-card mb">
      <div class="weekly-header">
        <span class="weekly-title">Semana atual</span>
        <span class="weekly-sub"
          >{{ weekSessions }} de {{ weekGoal }} treinos</span
        >
      </div>
      <div class="week-dots">
        <div v-for="(day, i) in weekDays" :key="i" class="week-day-col">
          <div
            class="week-dot"
            :class="{
              'dot-done': day.hasSession,
              'dot-today': day.isToday && !day.hasSession,
              'dot-future': !day.hasSession && !day.isToday,
            }"
          >
            <span class="week-dot-num">{{ day.label }}</span>
          </div>
          <span class="week-day-label">{{ day.letter }}</span>
        </div>
      </div>
      <div class="progress-bar-bg mt" style="height: 5px">
        <div
          class="progress-bar-fill"
          :style="{
            width: Math.min((weekSessions / weekGoal) * 100, 100) + '%',
          }"
        ></div>
      </div>
    </div>

    <!-- Último treino -->
    <div v-if="lastSession" class="card last-session-card mb">
      <div class="last-session-header">
        <div>
          <div class="section-label">Último treino</div>
          <div class="last-session-name">
            {{ getWorkoutName(lastSession.workout_id) }}
          </div>
        </div>
        <div class="last-session-badge badge-ok">
          ✓ Completo
        </div>
      </div>
      <div class="last-session-meta">
        <span>📅 {{ formatDate(lastSession.started_at) }}</span>
        <span v-if="lastSession.duration_seconds"
          >⏱ {{ formatDuration(lastSession.duration_seconds) }}</span
        >
        <span v-if="lastSession.totalVolume"
          >🏋️ {{ lastSession.totalVolume }} kg</span
        >
      </div>
    </div>

    <!-- Treinos disponíveis -->
    <div v-if="appStore.workouts?.length" class="section-block">
      <h2 class="section-title">Iniciar Treino</h2>
      <div class="workout-list-home">
        <div
          v-for="workout in appStore.workouts.slice(0, 3)"
          :key="workout._id"
          class="workout-row-home"
          @click="$router.push('/workouts/' + workout._id)"
        >
          <div class="workout-row-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4M6 9h12M6 15h12"
              ></path>
            </svg>
          </div>
          <div class="workout-row-info">
            <div class="workout-row-name">{{ workout.name }}</div>
            <div class="workout-row-sub" v-if="workout.description">
              {{ workout.description }}
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text3)"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>

    <!-- Estado vazio -->
    <div
      v-if="!sessionsArray.length && !appStore.workouts?.length"
      class="empty-home"
    >
      <div class="empty-icon">🏋️</div>
      <div class="empty-title">Bem-vindo ao LiftNote!</div>
      <div class="empty-desc">
        Crie seu primeiro treino e comece a acompanhar sua evolução.
      </div>
      <button class="btn btn-accent mt" @click="$router.push('/workouts')">
        Criar Treino
      </button>
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

const weekGoal = 4; // meta semanal de treinos

const greetingText = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
});

const todayFormatted = computed(() =>
  new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }),
);

const sessionsArray = computed(() => {
  const all = Array.isArray(appStore.sessions) ? appStore.sessions : [];
  return all.filter((s) => s.status !== 'cancelled');
});

const weekSessions = computed(() => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  return sessionsArray.value.filter(
    (s) => new Date(s.started_at) >= weekAgo && s.status === "completed",
  ).length;
});

const totalVolume = computed(() =>
  sessionsArray.value.reduce((acc, s) => acc + (s.totalVolume || 0), 0),
);

const avgDuration = computed(() => {
  const completed = sessionsArray.value.filter((s) => s.duration_seconds);
  if (!completed.length) return 0;
  return Math.round(
    completed.reduce((a, s) => a + s.duration_seconds, 0) /
      completed.length /
      60,
  );
});

const streak = computed(() => {
  let s = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (true) {
    const hasSesh = sessionsArray.value.some((sess) => {
      const sd = new Date(sess.started_at);
      sd.setHours(0, 0, 0, 0);
      return sd.getTime() === d.getTime() && sess.status === "completed";
    });
    if (!hasSesh) break;
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
});

const lastSession = computed(() => {
  if (!sessionsArray.value.length) return null;
  return [...sessionsArray.value].sort(
    (a, b) =>
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  )[0];
});

const weekDays = computed(() => {
  const labels = ["D", "S", "T", "Q", "Q", "S", "S"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // domingo

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const isToday = day.getTime() === today.getTime();
    const hasSession = sessionsArray.value.some((s) => {
      const sd = new Date(s.started_at);
      sd.setHours(0, 0, 0, 0);
      return sd.getTime() === day.getTime() && s.status === "completed";
    });
    const dayNum = day.getDate().toString();
    return { label: dayNum, letter: labels[i], isToday, hasSession };
  });
});

function getWorkoutName(id: string) {
  return appStore.workouts?.find((w: any) => w._id === id)?.name || "Treino";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
</script>

<style scoped>
.home-page {
  padding: 20px;
  padding-bottom: 100px;
  width: 100%;
}

/* Header */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 46px;
  height: 46px;
  border-radius: 23px;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.greeting {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}
.greeting-sub {
  font-size: 12px;
  color: var(--text2);
  text-transform: capitalize;
}
.header-streak {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 6px 12px;
}
.fire-emoji {
  font-size: 16px;
}
.streak-count {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
}

/* Stat Grid */
.stat-grid-home {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.stat-card-home {
  position: relative;
  padding: 20px 16px 16px;
  border-radius: var(--r2);
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 110px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.card-accent {
  background: var(--accent);
}
.card-surface {
  background: var(--surface);
}
.stat-val-home {
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  color: #192126;
}
.stat-unit {
  font-size: 14px;
  font-weight: 600;
  margin-left: 2px;
}
.card-surface .stat-val-home {
  color: var(--text);
}
.accent-text {
  color: var(--accent) !important;
}
.stat-label-home {
  font-size: 11px;
  font-weight: 700;
  color: rgba(25, 33, 38, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.card-surface .stat-label-home {
  color: var(--text2);
}
.stat-icon-home {
  position: absolute;
  bottom: 12px;
  right: 12px;
  opacity: 0.15;
  color: #192126;
}
.card-surface .stat-icon-home {
  color: var(--text);
}

/* Weekly progress */
.weekly-progress-card {
  padding: 16px 20px;
}
.weekly-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14px;
}
.weekly-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.weekly-sub {
  font-size: 12px;
  color: var(--text2);
}
.week-dots {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 10px;
}
.week-day-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.week-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg4);
  border: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.week-dot-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--text3);
  line-height: 1;
}
.dot-done {
  background: var(--accent);
  border-color: var(--accent);
}
.dot-today {
  border-color: var(--accent);
  background: var(--accent-dim);
}
.dot-future {
  background: var(--bg4);
}
.dot-done .week-dot-num {
  color: #192126;
}
.dot-today .week-dot-num {
  color: var(--accent);
}
.week-day-label {
  font-size: 10px;
  color: var(--text3);
  text-transform: uppercase;
  font-weight: 700;
}
.progress-bar-bg {
  background: var(--bg4);
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.4s ease;
}

/* Last session */
.last-session-card {
  padding: 16px 20px;
}
.section-label {
  font-size: 11px;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.last-session-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.last-session-name {
  font-size: 16px;
  font-weight: 700;
}
.last-session-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.badge-ok {
  background: var(--accent-dim);
  color: var(--accent);
}
.badge-cancelled {
  background: var(--red-dim);
  color: var(--red);
}
.last-session-meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text2);
}

/* Section */
.section-block {
  margin-bottom: 24px;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

/* Workout rows */
.workout-list-home {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.workout-row-home {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 14px 16px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.workout-row-home:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
}
.workout-row-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}
.workout-row-info {
  flex: 1;
  min-width: 0;
}
.workout-row-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.workout-row-sub {
  font-size: 12px;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Empty state */
.empty-home {
  text-align: center;
  padding: 48px 20px;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.empty-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.empty-desc {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
}

.mb {
  margin-bottom: 12px;
}
.mt {
  margin-top: 12px;
}
</style>
