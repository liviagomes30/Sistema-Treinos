<template>
  <BaseModal :modelValue="isOpen" @update:modelValue="val => emit('update:isOpen', val)" :title="title">
    <div class="confirm-content">
      <p class="confirm-message">{{ message }}</p>
      
      <div class="confirm-actions">
        <button class="btn btn-ghost" @click="closeModal">{{ cancelText }}</button>
        <button class="btn" :class="isDanger ? 'btn-danger' : 'btn-accent'" @click="onConfirm">{{ confirmText }}</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue';

withDefaults(defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  isDanger: false
});

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

function closeModal() {
  emit('update:isOpen', false);
  emit('cancel');
}

function onConfirm() {
  emit('update:isOpen', false);
  emit('confirm');
}
</script>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.confirm-message {
  font-size: 16px;
  color: var(--text2);
  line-height: 1.5;
  margin: 0;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
