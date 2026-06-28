<template>
  <div>
    <div class="exercise-nav">
      <button class="nav-btn" @click="$emit('prev')" :disabled="isFirst">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="exercise-title-block">
        <div class="exercise-number">{{ modelValue + 1 }} / {{ exercises.length }}</div>
        <div class="exercise-name">{{ exercises[modelValue]?.name }}</div>
        <div class="exercise-muscle" v-if="exercises[modelValue]?.muscle_group">
          {{ exercises[modelValue].muscle_group }}
        </div>
      </div>

      <button class="nav-btn" @click="$emit('next')" :disabled="isLast">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <div class="exercise-dots">
      <div
        v-for="(ex, i) in exercises"
        :key="i"
        class="ex-dot"
        :class="{
          'ex-dot-active': i === modelValue,
          'ex-dot-done': ex.logs?.length > 0,
        }"
        @click="$emit('update:modelValue', Number(i))"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  exercises: any[]
  modelValue: number
}>()

defineEmits<{
  'update:modelValue': [index: number]
  prev: []
  next: []
}>()

const isFirst = computed(() => props.modelValue === 0)
const isLast = computed(() => props.modelValue >= props.exercises.length - 1)
</script>

<style scoped>
.exercise-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}
.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text);
  transition: all 0.2s;
  flex-shrink: 0;
}
.nav-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.exercise-title-block {
  flex: 1;
  text-align: center;
}
.exercise-number {
  font-size: 11px;
  color: var(--text2);
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.exercise-name {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}
.exercise-muscle {
  font-size: 12px;
  color: var(--accent);
  text-transform: capitalize;
  margin-top: 2px;
}
.exercise-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.ex-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--bg4);
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}
.ex-dot-active {
  border-color: var(--accent);
  background: var(--accent-dim);
  transform: scale(1.2);
}
.ex-dot-done {
  background: var(--accent);
  border-color: var(--accent);
}
</style>
