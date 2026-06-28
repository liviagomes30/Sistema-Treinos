<template>
  <div class="filters-row">
    <div class="search-box">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        placeholder="Buscar treino..."
        class="search-input"
      />
      <button v-if="modelValue" class="clear-btn" @click="$emit('update:modelValue', '')">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped>
.filters-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 12px;
}
.search-icon {
  color: var(--text3);
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 13px;
  font-family: var(--font);
  padding: 10px 0;
  outline: none;
}
.search-input::placeholder {
  color: var(--text3);
}
.clear-btn {
  background: none;
  border: none;
  color: var(--text3);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}
</style>
