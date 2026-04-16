<template>
  <BaseModal
    :modelValue="isOpen"
    @update:modelValue="emit('update:isOpen', $event)"
    :title="isEdit ? 'Editar treino' : 'Novo treino'"
  >
    <div class="form-group">
      <label>Nome do treino *</label>
      <input v-model="form.name" placeholder="ex: Peito + Tríceps" />
    </div>
    <div class="form-group">
      <label>Descrição</label>
      <textarea
        v-model="form.description"
        rows="2"
        placeholder="Descrição opcional"
      ></textarea>
    </div>
    <div
      class="flex-end"
      style="display: flex; justify-content: flex-end; gap: 8px"
    >
      <button class="btn btn-ghost" @click="close">Cancelar</button>
      <button class="btn btn-accent" @click="save">
        {{ isEdit ? "Salvar" : "Criar" }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from "vue";
import BaseModal from "../ui/BaseModal.vue";

const props = defineProps({
  isOpen: Boolean,
  isEdit: Boolean,
  initialData: {
    type: Object,
    default: () => ({ name: "", description: "" }),
  },
});

const emit = defineEmits(["update:isOpen", "save"]);

const form = ref({ name: "", description: "" });

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      // Clona o estado inicial
      form.value = { ...props.initialData };
    }
  },
);

function close() {
  emit("update:isOpen", false);
}

function save() {
  if (!form.value.name.trim()) return;
  emit("save", { ...form.value });
  close();
}
</script>
