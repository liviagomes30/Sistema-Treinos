<template>
  <BaseModal
    :modelValue="isOpen"
    @update:modelValue="emit('update:isOpen', $event)"
    title="Sessão finalizada!"
  >
    <div
      class="stat-grid mb"
      style="
        margin-bottom: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      "
    >
      <div class="stat-card">
        <div class="stat-val">
          {{ session?.duration_formatted || "—" }}
        </div>
        <div class="stat-label">Duração</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ session?.totalVolume || 0 }}</div>
        <div class="stat-label">Volume kg</div>
      </div>
    </div>

    <div v-if="aiLoading" class="ai-bubble">
      <div class="ai-label">
        <div class="ai-dot"></div>
        IA analisando seu treino...
      </div>
    </div>
    <div v-else-if="session?.ai_summary" class="ai-bubble">
      <div class="ai-label">
        <div class="ai-dot"></div>
        Análise da IA
      </div>
      <div style="font-size: 13px; line-height: 1.7">
        {{ session.ai_summary }}
      </div>
    </div>

    <div
      class="flex-end"
      style="margin-top: 16px; display: flex; justify-content: flex-end"
    >
      <button class="btn btn-accent" @click="close">Ver histórico</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "../ui/BaseModal.vue";
import type { Session } from "../../types";

withDefaults(defineProps<{
  isOpen: boolean;
  session?: Session | any;
  aiLoading?: boolean;
}>(), {
  aiLoading: false
});

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "close"): void;
}>();

function close() {
  emit("update:isOpen", false);
  emit("close");
}
</script>
