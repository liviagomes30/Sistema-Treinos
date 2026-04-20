import { ref, computed } from 'vue'
import { exerciseService } from '../services/exerciseService'
import type { ExerciseCatalogItem } from '../types'

export function useExercises() {
  const exercises = ref<ExerciseCatalogItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedMuscleGroup = ref('')
  const searchQuery = ref('')

  const fetchExercises = async (params: Record<string, any> = {}) => {
    loading.value = true
    error.value = null
    try {
      exercises.value = await exerciseService.getAll(params)
    } catch (err: any) {
      error.value = err.message || 'Falha ao buscar exercícios'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // Optional local filtering if not doing it purely on backend
  const filtered = computed(() => {
    let result = exercises.value

    if (selectedMuscleGroup.value) {
      result = result.filter(e => e.muscle_group === selectedMuscleGroup.value)
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(e => e.name.toLowerCase().includes(q))
    }

    return result
  })

  return { 
    exercises: filtered, 
    loading, 
    error,
    selectedMuscleGroup, 
    searchQuery,
    fetchExercises 
  }
}
