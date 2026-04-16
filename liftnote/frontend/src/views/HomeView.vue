<template>
  <div class="home">
    <div class="stat-grid mb">
      <div class="stat-card">
        <div class="stat-val">{{ appStore.sessions.length }}</div>
        <div class="stat-label">Treinos feitos</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ weekSessions }}</div>
        <div class="stat-label">Esta semana</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ totalVolume }}</div>
        <div class="stat-label">Volume (kg) total</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ streak }}</div>
        <div class="stat-label">Dias seguidos</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAppStore } from "../store/appStore";

const appStore = useAppStore();

const weekSessions = computed(() => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  return appStore.sessions.filter((s) => new Date(s.started_at) >= weekAgo)
    .length;
});

const totalVolume = computed(() => {
  return appStore.sessions.reduce((acc, s) => acc + (s.totalVolume || 0), 0);
});

const streak = computed(() => {
  let s = 0,
    d = new Date();
  d.setHours(0, 0, 0, 0);
  while (true) {
    const hasSesh = appStore.sessions.some((sess) => {
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
