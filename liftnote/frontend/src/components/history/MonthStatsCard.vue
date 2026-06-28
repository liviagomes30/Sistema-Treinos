<template>
  <div class="month-stats">
    <div class="month-stat">
      <span class="month-stat-val">{{ sessionCount }}</span>
      <span class="month-stat-label">treinos</span>
    </div>
    <div class="stat-divider"></div>
    <div class="month-stat">
      <span class="month-stat-val">{{ Math.round(avgDuration) }}</span>
      <span class="month-stat-label">min médio</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sessionCount: number
  avgDuration: number
}>()
</script>

<style scoped>
.month-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.month-stat {
  text-align: center;
}
.month-stat-val {
  display: block;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
}
.month-stat-label {
  font-size: 10px;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}
.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}
</style>
