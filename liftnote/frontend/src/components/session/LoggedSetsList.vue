<template>
  <div v-if="logs.length" class="logged-sets-panel card mt">
    <div class="logged-sets-header">Séries registradas</div>
    <div class="logged-sets-list">
      <div v-for="(log, i) in logs" :key="i" class="logged-set-row">
        <span class="log-set-num">S{{ log.set_number }}</span>
        <span class="log-weight">{{ log.weight_used_kg }}kg</span>
        <span class="log-reps">× {{ log.reps_done }} reps</span>
        <div class="log-actions" style="margin-left: auto;">
          <button class="btn btn-icon btn-small danger-text" @click="$emit('deleteLog', log._id)" :disabled="isSaving">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="feather">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  logs: any[]
  isSaving: boolean
}>()

defineEmits<{
  deleteLog: [logId: string]
}>()
</script>

<style scoped>
.logged-sets-panel {
  padding: 16px 20px;
}
.logged-sets-header {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text2);
  margin-bottom: 10px;
}
.logged-sets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.logged-set-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}
.log-set-num {
  font-size: 11px;
  font-weight: 700;
  background: var(--accent);
  color: #192126;
  padding: 2px 7px;
  border-radius: 10px;
  font-family: var(--font-mono);
}
.log-weight {
  font-weight: 700;
  font-family: var(--font-mono);
}
.log-reps {
  color: var(--text2);
}
.log-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.log-actions button {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-light);
  transition: color 0.2s;
}
.log-actions button:hover {
  color: var(--accent);
}
.log-actions button.danger-text:hover {
  color: var(--danger);
}
.mt {
  margin-top: 12px;
}
</style>
