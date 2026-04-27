<template>
  <div class="home-page">
    <div class="welcome-header">
      <div class="user-info">
        <div class="avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#192126" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div>
          <div class="greeting">Olá! 👋</div>
          <div class="greeting-sub">Bora treinar hoje?</div>
        </div>
      </div>
    </div>

    <h2 class="section-title">Visão Geral</h2>

    <div class="stat-grid-home mb">
      <div class="stat-card-home card-accent">
        <div class="stat-val-home">{{ appStore.sessions.length }}</div>
        <div class="stat-label-home">Treinos feitos</div>
        <div class="stat-icon-home">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
        </div>
      </div>

      <div class="stat-card-home card-surface">
        <div class="stat-val-home accent-text">{{ weekSessions }}</div>
        <div class="stat-label-home">Esta semana</div>
        <div class="stat-icon-home">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
      </div>

      <div class="stat-card-home card-surface">
        <div class="stat-val-home accent-text">{{ totalVolume }}</div>
        <div class="stat-label-home">Volume (kg)</div>
        <div class="stat-icon-home">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5l11 11"></path><path d="M21 21l-1-1"></path><path d="M3 3l1 1"></path><path d="M18 22l4-4"></path><path d="M2 6l4-4"></path></svg>
        </div>
      </div>

      <div class="stat-card-home card-accent">
        <div class="stat-val-home">{{ streak }}</div>
        <div class="stat-label-home">Streak (dias)</div>
        <div class="stat-icon-home">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19c2.5-2.5 2.5-6 0-8.5l-4-4a2.83 2.83 0 0 0-4 0l-4 4c-2.5 2.5-2.5 6 0 8.5a6 6 0 0 0 8.5 0z"></path></svg>
        </div>
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

const weekSessions = computed(() => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const sessionsArray = Array.isArray(appStore.sessions) ? appStore.sessions : [];
  return sessionsArray.filter((s) => new Date(s.started_at) >= weekAgo).length;
});

const totalVolume = computed(() => {
  const sessionsArray = Array.isArray(appStore.sessions) ? appStore.sessions : [];
  return sessionsArray.reduce((acc, s) => acc + (s.totalVolume || 0), 0);
});

const streak = computed(() => {
  let s = 0,
    d = new Date();
  d.setHours(0, 0, 0, 0);
  const sessionsArray = Array.isArray(appStore.sessions) ? appStore.sessions : [];
  while (true) {
    const hasSesh = sessionsArray.some((sess) => {
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
</script>

<style scoped>
.home-page {
  padding: 20px;
  padding-bottom: 24px;
  width: 100%;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
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
  font-size: 18px;
  font-weight: 700;
}

.greeting-sub {
  font-size: 13px;
  color: var(--text2);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

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
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  color: #192126;
}

.card-surface .stat-val-home {
  color: var(--text);
}

.accent-text {
  color: var(--accent) !important;
}

.stat-label-home {
  font-size: 12px;
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
  bottom: 14px;
  right: 14px;
  opacity: 0.2;
  color: #192126;
}

.card-surface .stat-icon-home {
  color: var(--text);
}
</style>
