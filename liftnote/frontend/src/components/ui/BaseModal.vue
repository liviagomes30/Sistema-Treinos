<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-title">
        {{ title }}
        <span class="modal-close" @click="close">×</span>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "close"]);

function close() {
  emit("update:modelValue", false);
  emit("close");
}
</script>

<style scoped>
/* Os estilos da classe modal-overlay e modal já devem estar no main.css */
</style>
