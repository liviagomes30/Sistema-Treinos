<template>
  <BaseModal
    :modelValue="isOpen"
    @update:modelValue="emit('update:isOpen', $event)"
    title="Adicionar exercício"
  >
    <div class="form-group">
      <label>Nome *</label>
      <input v-model="form.name" placeholder="ex: Supino reto" />
    </div>
    <div
      class="grid-2"
      style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px"
    >
      <div class="form-group">
        <label>Grupo muscular</label>
        <select v-model="form.muscle_group">
          <option value="chest">Peito</option>
          <option value="back">Costas</option>
          <option value="shoulders">Ombros</option>
          <option value="biceps">Bíceps</option>
          <option value="triceps">Tríceps</option>
          <option value="legs">Pernas</option>
          <option value="core">Core</option>
          <option value="glutes">Glúteos</option>
          <option value="calves">Panturrilha</option>
          <option value="other">Outro</option>
        </select>
      </div>
      <div class="form-group">
        <label>Tipo de série</label>
        <select v-model="form.set_type">
          <option value="linear">Linear</option>
          <option value="pyramid">Pirâmide</option>
        </select>
      </div>
    </div>
    <div
      v-if="form.set_type === 'linear'"
      class="grid-3"
      style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px"
    >
      <div class="form-group">
        <label>Séries</label>
        <input v-model.number="form.series" type="number" min="1" max="20" />
      </div>
      <div class="form-group">
        <label>Reps</label>
        <input v-model.number="form.reps" type="number" min="1" />
      </div>
      <div class="form-group">
        <label>Peso (kg)</label>
        <input
          v-model.number="form.weight_kg"
          type="number"
          min="0"
          step="0.5"
        />
      </div>
    </div>
    <div
      class="grid-2"
      style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px"
    >
      <div class="form-group">
        <label>Descanso (seg)</label>
        <input v-model.number="form.rest_seconds" type="number" min="0" />
      </div>
      <div
        class="form-group"
        style="display: flex; align-items: center; padding-top: 22px; gap: 8px"
      >
        <input
          type="checkbox"
          v-model="form.no_rest"
          id="no_rest"
          style="width: auto"
        />
        <label for="no_rest" style="margin: 0; cursor: pointer"
          >Sem descanso</label
        >
      </div>
    </div>
    <div class="form-group">
      <label>Observações</label>
      <input v-model="form.notes" placeholder="Opcional" />
    </div>
    <div
      class="flex-end"
      style="display: flex; justify-content: flex-end; gap: 8px"
    >
      <button class="btn btn-ghost" @click="close">Cancelar</button>
      <button class="btn btn-accent" @click="save">Adicionar</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseModal from "../ui/BaseModal.vue";

interface ExerciseForm {
  name: string;
  muscle_group: string;
  set_type: string;
  series: number;
  reps: number;
  weight_kg: number;
  rest_seconds: number;
  no_rest?: boolean;
  notes?: string;
}

const props = withDefaults(defineProps<{
  isOpen: boolean;
  initialData?: ExerciseForm;
}>(), {
  initialData: () => ({
    name: "",
    muscle_group: "chest",
    set_type: "linear",
    series: 3,
    reps: 10,
    weight_kg: 0,
    rest_seconds: 90,
    no_rest: false,
    notes: "",
  })
});

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "save", value: ExerciseForm): void;
}>();

const form = ref<ExerciseForm>({ ...props.initialData });

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      form.value = { ...props.initialData };
    }
  },
);

function close() {
  emit("update:isOpen", false);
}

function save() {
  if (!form.value.name) return;
  emit("save", { ...form.value });
  close();
}
</script>
