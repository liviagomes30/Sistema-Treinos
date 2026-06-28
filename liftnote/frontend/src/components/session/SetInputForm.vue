<template>
  <div class="current-set-editor card">
    <div class="set-header">
      <div class="set-header-left">
        <div class="set-hint">
          Sugestão: <strong>{{ exercise.series }}x{{ exercise.reps }}</strong>
          <span v-if="exercise.weight_kg"> · {{ exercise.weight_kg }}kg</span>
        </div>
        <div v-if="exercise.last_loads?.length" class="last-load-hint">
          <span class="last-load-label">Último:</span>
          <span v-for="(s, i) in exercise.last_loads" :key="i" class="last-load-set">
            {{ s.weight_used_kg }}kg×{{ s.reps_done }}
          </span>
        </div>
      </div>
      <div class="series-logged-count">
        {{ logCount }} registrada{{ logCount !== 1 ? 's' : '' }}
      </div>
    </div>

    <div class="set-inputs">
      <div class="input-group">
        <label>Peso (kg)</label>
        <div class="input-stepper">
          <button class="stepper-btn" @click="weightInput = Math.max(0, weightInput - 2.5)">−</button>
          <input type="number" v-model.number="weightInput" min="0" />
          <button class="stepper-btn" @click="weightInput += 2.5">+</button>
        </div>
      </div>
      <div class="input-group">
        <label>Reps</label>
        <div class="input-stepper">
          <button class="stepper-btn" @click="repsInput = Math.max(0, repsInput - 1)">−</button>
          <input type="number" v-model.number="repsInput" min="0" />
          <button class="stepper-btn" @click="repsInput++">+</button>
        </div>
      </div>
    </div>

    <div>
      <button
        class="btn btn-accent btn-large mt"
        style="width: 100%"
        :disabled="isSaving || repsInput <= 0"
        @click="handleSubmit"
      >
        <template v-if="isSaving">
          <span class="spinner-btn"></span> Salvando...
        </template>
        <template v-else>
          + Registrar Série
        </template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  exercise: {
    series: number
    reps: number
    weight_kg: number
    last_loads?: any[]
  }
  logCount: number
  isSaving: boolean
}>()

const emit = defineEmits<{
  submit: [data: { reps: number; weight: number }]
}>()

const weightInput = ref(props.exercise.weight_kg || 0)
const repsInput = ref(props.exercise.reps || 0)

watch(
  () => props.exercise,
  (ex) => {
    weightInput.value = ex.weight_kg || 0
    repsInput.value = ex.reps || 0
  }
)

function handleSubmit() {
  emit('submit', { reps: repsInput.value, weight: weightInput.value })
}
</script>

<style scoped>
.current-set-editor {
  padding: 20px;
  border-radius: 20px;
  background: var(--surface);
}
.set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.set-hint {
  font-size: 12px;
  color: var(--text2);
}
.set-hint strong {
  color: var(--text);
}
.last-load-hint {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.last-load-label {
  font-size: 11px;
  color: var(--text2);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.last-load-set {
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-dim);
  padding: 2px 7px;
  border-radius: 8px;
}
.series-logged-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-dim);
  padding: 3px 10px;
  border-radius: 20px;
}
.set-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.input-group label {
  display: block;
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.input-stepper {
  display: flex;
  align-items: center;
  background: var(--bg);
  border-radius: 12px;
  overflow: hidden;
}
.stepper-btn {
  width: 40px;
  height: 52px;
  background: transparent;
  border: none;
  color: var(--text2);
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  flex-shrink: 0;
}
.stepper-btn:hover {
  color: var(--accent);
  background: var(--accent-dim);
}
.input-stepper input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 4px;
  color: var(--text);
  font-size: 20px;
  font-family: var(--font-mono);
  font-weight: 700;
  text-align: center;
  outline: none;
  min-width: 0;
}
.spinner-btn {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(25, 33, 38, 0.3);
  border-top-color: #192126;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  vertical-align: middle;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.mt {
  margin-top: 12px;
}
</style>
