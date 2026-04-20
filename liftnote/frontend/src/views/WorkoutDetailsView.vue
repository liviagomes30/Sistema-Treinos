<template>
  <div class="workout-details">
    <div class="header mb">
      <button class="btn btn-ghost btn-sm mb" @click="router.back()">← Voltar</button>
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h2 style="margin: 0">{{ workout?.name }}</h2>
          <p class="muted">{{ workout?.description || 'Sem descrição' }}</p>
        </div>
        <div style="display: flex; gap: 8px">
          <button class="btn btn-ghost" @click="showAddExercise = true">+ Adicionar Exercício</button>
          <button class="btn btn-accent" @click="startSession">▶ Iniciar Treino</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="empty-state">Carregando exercícios...</div>
    
    <div v-else-if="exercises.length === 0" class="empty-state">
      <div class="empty-icon">⚖</div>
      <p>Este treino ainda não tem exercícios.<br>Adicione alguns para começar!</p>
      <button class="btn btn-accent mt" @click="showAddExercise = true">Adicionar primeiro exercício</button>
    </div>

    <div v-else class="exercise-list">
      <div v-for="(ex, index) in exercises" :key="ex._id" class="card mb">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <div style="display: flex; align-items: center; gap: 12px">
            <div class="tag">{{ index + 1 }}</div>
            <div>
              <div style="font-weight: 600">{{ ex.name }}</div>
              <div style="font-size: 12px; color: var(--text2)">{{ ex.muscle_group }}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px">
            <div style="text-align: right">
              <div style="font-size: 14px; font-weight: 500">{{ ex.series }} x {{ ex.reps }}</div>
              <div style="font-size: 11px; color: var(--text3)">{{ ex.weight_kg }}kg • {{ ex.rest_seconds }}s rest</div>
            </div>
            <button class="btn btn-danger btn-sm" @click="removeExercise(ex._id)">✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Adicionar Exercício -->
    <BaseModal v-model="showAddExercise" title="Adicionar Exercício">
      <div class="form-group mb">
        <label>1. Grupo Muscular (Opcional)</label>
        <select v-model="selectedCategory" @change="handleCategoryChange" style="width: 100%">
          <option value="">Todos os grupos musculares</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ formatMuscleGroup(cat) }}
          </option>
        </select>
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
        <button class="btn btn-ghost" @click="showAddExercise = false">Cancelar</button>
        <button class="btn btn-accent" :disabled="!selectedCatalogId" @click="handleAddExercise">
          Confirmar
        </button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';
import { useSessionStore } from '../store/sessionStore';
import BaseModal from '../components/ui/BaseModal.vue';
import type { Workout, Exercise, ExerciseCatalogItem } from '../types';

const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const workoutId = route.params.id as string;

const workout = ref<Workout | null>(null);
const exercises = ref<Exercise[]>([]);
const catalog = ref<ExerciseCatalogItem[]>([]);
const loading = ref(true);

const showAddExercise = ref(false);
const selectedCategory = ref('');
const selectedCatalogId = ref('');
const searchQuery = ref('');

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

const muscleGroupTranslations: Record<string, string> = {
  chest: 'Peito',
  back: 'Costas',
  legs: 'Pernas',
  shoulders: 'Ombros',
  arms: 'Braços',
  abs: 'Abdômen',
  cardio: 'Cardio',
  'full body': 'Corpo Inteiro',
  abdominais: 'Abdominais',
  isquiotibiais: 'Isquiotibiais',
  adutores: 'Adutores',
  quadriceps: 'Quadríceps',
  ombros: 'Ombros',
  peito: 'Peito',
  'meio-das-costas': 'Meio das Costas',
  panturrilhas: 'Panturrilhas',
  gluteos: 'Glúteos',
  'inferior-das-costas': 'Lombar',
  dorsais: 'Dorsais',
  triceps: 'Tríceps',
  trapezio: 'Trapézio',
  antebracos: 'Antebraços',
  pescoco: 'Pescoço',
  abdutores: 'Abdutores'
};

function formatMuscleGroup(str: string) {
  if (!str) return '';
  const key = str.toLowerCase();
  if (muscleGroupTranslations[key]) {
    return muscleGroupTranslations[key];
  }
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

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

async function handleAddExercise() {
  const catalogItem = catalog.value.find(c => c._id === selectedCatalogId.value);
  if (!catalogItem) return;

  try {
    const newEx = await workoutService.addExercise(workoutId, {
      ...exerciseForm.value,
      exercise_catalog_id: selectedCatalogId.value,
      order: exercises.value.length + 1
    });
    exercises.value.push(newEx);
    showAddExercise.value = false;
    selectedCategory.value = '';
    selectedCatalogId.value = '';
    searchQuery.value = '';
  } catch (err: any) {
    console.error('Erro ao adicionar exercício', err.response?.data || err);
  }
}

async function removeExercise(id: string) {
  if (!confirm('Remover este exercício do treino?')) return;
  try {
    await workoutService.removeExercise(workoutId, id);
    exercises.value = exercises.value.filter(e => e._id !== id);
  } catch (err) {
    console.error('Erro ao remover exercício', err);
  }
}

async function startSession() {
  if (workout.value) {
    await sessionStore.startSession(workout.value);
    router.push('/session');
  }
}
</script>

<style scoped>
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
.header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}
.exercise-select-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg2);
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
  color: #000;
  font-weight: 600;
}
.exercise-option-cat {
  font-size: 11px;
  color: var(--text2);
}
.exercise-option.active .exercise-option-cat {
  color: rgba(0,0,0,0.6);
}
</style>
