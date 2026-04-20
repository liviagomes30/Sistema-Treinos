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

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: boolean;
  title: string;
}>(), {
  modelValue: false
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
}>();

function close() {
  emit("update:modelValue", false);
  emit("close");
}
</script>

<style scoped>
/* Os estilos da classe modal-overlay e modal já devem estar no main.css */
</style>
