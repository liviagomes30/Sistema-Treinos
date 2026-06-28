<template>
  <div class="summary-page">
    <div class="topbar-summary">
      <div class="icon-btn" @click="router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </div>
      <div class="page-title-small">Resumo</div>
      <div class="icon-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
      </div>
    </div>

    <h1 class="summary-title">{{ workout?.name || 'Resumo do Treino' }}</h1>
    <p class="muted mb" style="margin-top: -16px;">{{ workout?.description }}</p>

    <div class="progress-section mb">
      <div class="progress-label">Progresso geral:</div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: 100%;"></div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h2 style="font-size: 16px; font-weight: 600; margin: 0;">Exercícios</h2>
      <button class="btn btn-ghost btn-sm" style="color: var(--accent)" @click="showAddExercise = true">+ Adicionar</button>
    </div>

    <div v-if="loading" class="empty-state">Carregando exercícios...</div>
    
    <div v-else-if="exercises.length === 0" class="empty-state">
      <div class="empty-icon">⚖</div>
      <p>Este treino ainda não tem exercícios.<br>Adicione alguns para começar!</p>
    </div>

    <div v-else class="exercises-summary-list">
      <div 
        v-for="(ex, index) in exercises" 
        :key="ex._id"
        class="exercise-item-card"
      >
        <div class="ex-image">
          <span style="font-weight: 800; font-size: 18px; color: var(--text3)">{{ index + 1 }}</span>
        </div>
        <div class="ex-info">
          <div class="ex-name">{{ getExerciseName(ex) }}</div>
          <div class="ex-meta">{{ ex.series }} sets x {{ ex.reps }} reps • {{ ex.weight_kg }}kg</div>
          <div class="ex-meta" style="font-size: 10px;">{{ formatMuscleGroup(getExerciseMuscleGroup(ex)) }}</div>
        </div>
        <div class="ex-actions">
          <button class="btn btn-ghost btn-sm" style="padding: 4px; border-radius: 8px; color: var(--text2);" @click="editExercise(ex)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn btn-danger btn-sm" style="padding: 4px; border-radius: 8px; margin-left: 4px;" @click="removeExercise(ex._id)">✕</button>
        </div>
      </div>
    </div>

    <div class="bottom-action">
      <button class="btn btn-accent btn-large" @click="startSession">Iniciar Treino</button>
    </div>

    <!-- Modal Adicionar/Editar Exercício -->
    <BaseModal :modelValue="showAddExercise" @update:modelValue="val => { if (!val) resetModal(); showAddExercise = val; }" :title="isEditing ? 'Editar Exercício' : 'Adicionar Exercício'">
      <div class="form-group mb">
        <label>1. Grupo Muscular (Opcional)</label>
        <div class="custom-select-wrapper">
          <button
            type="button"
            class="custom-select-trigger"
            :class="{ open: categoryDropdownOpen }"
            @click="categoryDropdownOpen = !categoryDropdownOpen"
          >
            <span>{{ selectedCategory ? formatMuscleGroup(selectedCategory) : 'Todos os grupos musculares' }}</span>
            <svg class="select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div v-if="categoryDropdownOpen" class="custom-select-dropdown">
            <div class="custom-select-option" :class="{ selected: selectedCategory === '' }" @click="selectCategory('')">
              Todos os grupos musculares
            </div>
            <div
              v-for="cat in categories"
              :key="cat"
              class="custom-select-option"
              :class="{ selected: selectedCategory === cat }"
              @click="selectCategory(cat)"
            >
              {{ formatMuscleGroup(cat) }}
            </div>
          </div>
        </div>
      </div>

      <div class="form-group mb">
        <label>2. Buscar Exercício</label>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Ex: Supino..." 
          style="width: 100%; margin-bottom: 8px"
        />
        
        <div class="exercise-select-list" v-if="filteredCatalog.length > 0">
          <div 
            v-for="item in filteredCatalog" 
            :key="item._id" 
            class="exercise-option"
            :class="{ active: selectedCatalogId === item._id }"
            @click="selectedCatalogId = item._id"
          >
            {{ item.name }} 
            <span class="exercise-option-cat">{{ formatMuscleGroup(item.muscle_group) }}</span>
          </div>
        </div>
        <div v-else class="muted" style="text-align: center; padding: 12px; border: 1px solid var(--border); border-radius: 6px;">
          Nenhum exercício encontrado.
        </div>
      </div>

      <div v-if="selectedExerciseData" class="exercise-info card mb">
        <h4 style="margin: 0 0 8px 0; color: var(--accent)">{{ selectedExerciseData.name }}</h4>
        <p v-if="selectedExerciseData.description" style="font-size: 13px; margin: 0 0 12px 0; line-height: 1.4">
          {{ selectedExerciseData.description }}
        </p>
        <div v-if="selectedExerciseData.instructions">
          <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">Instruções:</div>
          <ul v-if="Array.isArray(selectedExerciseData.instructions)" style="font-size: 12px; color: var(--text2); padding-left: 20px; margin: 0;">
            <li v-for="(inst, i) in selectedExerciseData.instructions" :key="i" style="margin-bottom: 4px">{{ inst }}</li>
          </ul>
          <p v-else style="font-size: 12px; color: var(--text2); margin: 0; line-height: 1.4">
            {{ selectedExerciseData.instructions }}
          </p>
        </div>
      </div>

      <div v-if="selectedCatalogId" class="grid-2">
        <div class="form-group">
          <label>Séries</label>
          <input type="number" v-model="exerciseForm.series" min="1">
        </div>
        <div class="form-group">
          <label>Reps</label>
          <input type="number" v-model="exerciseForm.reps" min="1">
        </div>
        <div class="form-group">
          <label>Peso (kg)</label>
          <input type="number" v-model="exerciseForm.weight_kg" min="0">
        </div>
        <div class="form-group">
          <label>Descanso (s)</label>
          <input type="number" v-model="exerciseForm.rest_seconds" min="0">
        </div>
      </div>

      <div class="flex-end mt">
        <button class="btn btn-ghost" @click="resetModal()">Cancelar</button>
        <button class="btn btn-accent" :disabled="!selectedCatalogId" @click="handleSaveExercise">
          Confirmar
        </button>
      </div>
    </BaseModal>

    <!-- Modal Confirmação de Exclusão -->
    <ConfirmModal 
      v-model:isOpen="showRemoveModal"
      title="Remover Exercício"
      message="Tem certeza que deseja remover este exercício do seu treino?"
      confirmText="Remover"
      cancelText="Cancelar"
      :isDanger="true"
      @confirm="confirmRemoveExercise"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';
import { useSessionStore } from '../store/sessionStore';
import BaseModal from '../components/ui/BaseModal.vue';
import ConfirmModal from '../components/ui/ConfirmModal.vue';
import { formatMuscleGroup } from '../utils/formatters';
import type { Workout, Exercise, ExerciseCatalogItem, ExerciseCatalogRef } from '../types';

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const workoutId = route.params.id as string;

const workout = ref<Workout | null>(null);
const exercises = ref<Exercise[]>([]);
const catalog = ref<ExerciseCatalogItem[]>([]);
const loading = ref(true);

const showAddExercise = ref(false);
const isEditing = ref(false);
const editingExerciseId = ref('');

const showRemoveModal = ref(false);
const exerciseToRemove = ref<string | null>(null);

const selectedCategory = ref('');
const selectedCatalogId = ref('');
const searchQuery = ref('');
const categoryDropdownOpen = ref(false);

function selectCategory(value: string) {
  selectedCategory.value = value;
  categoryDropdownOpen.value = false;
  handleCategoryChange();
}

const categories = computed(() => {
  const groups = new Set(catalog.value.map(c => c.muscle_group));
  return Array.from(groups).sort();
});

const filteredCatalog = computed(() => {
  let list = catalog.value;
  
  if (selectedCategory.value) {
    list = list.filter(c => c.muscle_group === selectedCategory.value);
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q));
  }
  
  return list;
});

const selectedExerciseData = computed(() => {
  return catalog.value.find(c => c._id === selectedCatalogId.value) || null;
});



function handleCategoryChange() {
  selectedCatalogId.value = '';
  searchQuery.value = '';
}
const exerciseForm = ref({
  series: 3,
  reps: 10,
  weight_kg: 0,
  rest_seconds: 60,
  set_type: 'linear',
  no_rest: false,
  is_optional: false,
  notes: '',
  pyramid_sets: []
});

onMounted(async () => {
  try {
    const [wData, exData, catData] = await Promise.all([
      workoutService.getById(workoutId),
      workoutService.getExercises(workoutId),
      exerciseService.getAll()
    ]);
    workout.value = wData;
    exercises.value = exData;
    catalog.value = catData;
  } catch (err) {
    console.error('Erro ao carregar dados do treino', err);
  } finally {
    loading.value = false;
  }
});

function resetModal() {
  showAddExercise.value = false;
  isEditing.value = false;
  editingExerciseId.value = '';
  selectedCategory.value = '';
  selectedCatalogId.value = '';
  searchQuery.value = '';
  exerciseForm.value = {
    series: 3, reps: 10, weight_kg: 0, rest_seconds: 60,
    set_type: 'linear', no_rest: false, is_optional: false, notes: '', pyramid_sets: []
  };
}

async function handleSaveExercise() {
  const catalogItem = catalog.value.find(c => c._id === selectedCatalogId.value);
  if (!catalogItem) return;

  try {
    if (isEditing.value) {
      const updatedEx = await workoutService.updateExercise(workoutId, editingExerciseId.value, {
        ...exerciseForm.value,
        exercise_catalog_id: selectedCatalogId.value
      });
      const index = exercises.value.findIndex(e => e._id === editingExerciseId.value);
      if (index !== -1) {
        exercises.value[index] = updatedEx;
      }
    } else {
      const newEx = await workoutService.addExercise(workoutId, {
        ...exerciseForm.value,
        exercise_catalog_id: selectedCatalogId.value,
        order: exercises.value.length + 1
      });
      exercises.value.push(newEx);
    }
    resetModal();
  } catch (err: any) {
    console.error('Erro ao salvar exercício', err.response?.data || err);
  }
}

function editExercise(ex: any) {
  isEditing.value = true;
  editingExerciseId.value = ex._id;
  selectedCatalogId.value = ex.exercise_catalog_id?._id || ex.exercise_catalog_id || '';
  selectedCategory.value = ex.exercise_catalog_id?.muscle_group || '';
  
  exerciseForm.value = {
    series: ex.series || 3,
    reps: ex.reps || 10,
    weight_kg: ex.weight_kg || 0,
    rest_seconds: ex.rest_seconds || 60,
    set_type: ex.set_type || 'linear',
    no_rest: ex.no_rest || false,
    is_optional: ex.is_optional || false,
    notes: ex.notes || '',
    pyramid_sets: ex.pyramid_sets || []
  };
  showAddExercise.value = true;
}

function removeExercise(id: string) {
  exerciseToRemove.value = id;
  showRemoveModal.value = true;
}

async function confirmRemoveExercise() {
  if (!exerciseToRemove.value) return;
  try {
    await workoutService.removeExercise(workoutId, exerciseToRemove.value);
    exercises.value = exercises.value.filter(e => e._id !== exerciseToRemove.value);
    exerciseToRemove.value = null;
  } catch (err) {
    console.error('Erro ao remover exercício', err);
  }
}

async function startSession() {
  if (workout.value) {
    await sessionStore.initializeWorkoutSession(workout.value);
    router.push('/session');
  }
}

function getExerciseName(ex: Exercise): string {
  const cat = ex.exercise_catalog_id;
  if (typeof cat === 'object' && cat !== null) {
    return (cat as ExerciseCatalogRef).name || ex.custom_name || ex.name || 'Exercício';
  }
  return ex.custom_name || ex.name || 'Exercício';
}

function getExerciseMuscleGroup(ex: Exercise): string {
  const cat = ex.exercise_catalog_id;
  if (typeof cat === 'object' && cat !== null) {
    return (cat as ExerciseCatalogRef).muscle_group || ex.muscle_group || '';
  }
  return ex.muscle_group || '';
}
</script>

<style scoped>
.summary-page {
  padding: 20px;
  padding-bottom: calc(96px + env(safe-area-inset-bottom) + 16px);
}
.topbar-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.icon-btn {
  cursor: pointer;
  color: var(--text);
}
.page-title-small {
  font-weight: 600;
  font-size: 16px;
}

.summary-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.progress-section {
  margin-bottom: 32px;
}
.progress-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}
.progress-bar-container {
  height: 12px;
  background: var(--bg4);
  border-radius: 6px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 6px;
}

.exercises-summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.exercise-item-card {
  display: flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
}
.ex-image {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--accent-dim);
  border: 1px solid rgba(187, 242, 70, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: var(--accent);
}
.ex-info {
  flex: 1;
}
.ex-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}
.ex-meta {
  font-size: 12px;
  color: var(--text2);
}
.ex-actions {
  display: flex;
  align-items: center;
  margin-left: 12px;
}
.check-circle-green {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: var(--accent-dim);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-action {
  position: fixed;
  bottom: 68px;
  left: 0;
  right: 0;
  padding: 16px 20px 8px;
  display: flex;
  justify-content: center;
  z-index: 99;
}
.bottom-action .btn-large {
  max-width: 440px;
  width: 100%;
}

/* Modal styles (kept from original) */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.flex-end {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.exercise-select-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
}
.exercise-option {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
.exercise-option:last-child {
  border-bottom: none;
}
.exercise-option:hover {
  background: var(--surface);
}
.exercise-option.active {
  background: var(--accent);
  color: #192126;
  font-weight: 600;
}
.exercise-option-cat {
  font-size: 11px;
  color: var(--text2);
}
.exercise-option.active .exercise-option-cat {
  color: rgba(25, 33, 38, 0.6);
}

/* ── Custom Select ── */
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--r);
  padding: 10px 14px;
  color: var(--text);
  font-family: var(--font);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s;
  text-align: left;
}

.custom-select-trigger:focus,
.custom-select-trigger.open {
  border-color: var(--accent);
  outline: none;
}

.select-chevron {
  flex-shrink: 0;
  color: var(--text2);
  transition: transform 0.2s;
}

.custom-select-trigger.open .select-chevron {
  transform: rotate(180deg);
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--r);
  z-index: 300;
  max-height: 220px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.custom-select-option {
  padding: 11px 14px;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid var(--border);
}

.custom-select-option:last-child {
  border-bottom: none;
}

.custom-select-option:hover {
  background: var(--surface2);
}

.custom-select-option.selected {
  color: var(--accent);
  background: var(--accent-dim);
  font-weight: 600;
}
</style>
