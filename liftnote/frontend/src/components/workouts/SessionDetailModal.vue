<template>
  <BaseModal
    :modelValue="isOpen"
    @update:modelValue="emit('update:isOpen', $event)"
    :title="workoutName"
  >
    <div style="font-size: 12px; color: var(--text2); margin-bottom: 12px">
      {{ formattedDate }}
    </div>
    <div
      class="stat-grid mb"
      style="
        margin-bottom: 14px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      "
    >
      <div class="stat-card">
        <div class="stat-val" style="font-size: 22px">
          {{ formattedDuration || "—" }}
        </div>
        <div class="stat-label">Duração</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="font-size: 22px">
          {{ statusLabel }}
        </div>
        <div class="stat-label">Status</div>
      </div>
    </div>

    <div v-if="session?.ai_summary" class="ai-bubble">
      <div class="ai-label">
        <div class="ai-dot"></div>
        Análise da IA
      </div>
      <div style="font-size: 13px; line-height: 1.7">
        {{ session.ai_summary }}
      </div>
    </div>
    <div v-else style="margin-top: 12px">
      <button
        class="btn btn-accent btn-sm"
        @click="emit('generateAiSummary', session)"
      >
        ✦ Gerar análise com IA
      </button>
    </div>

    <div
      class="flex-end"
      style="margin-top: 16px; display: flex; justify-content: flex-end"
    >
      <button class="btn btn-ghost" @click="close">Fechar</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseModal from "../ui/BaseModal.vue";
import type { Session } from "../../types";

const props = withDefaults(defineProps<{
  isOpen: boolean;
  session?: Session | any;
  workoutName?: string;
}>(), {
  workoutName: "Treino"
});

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "generateAiSummary", value: any): void;
}>();

const formattedDate = computed(() => {
  if (!props.session?.started_at) return "";
  return new Date(props.session.started_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const formattedDuration = computed(() => {
  if (!props.session) return null;
  if (props.session.duration_formatted) return props.session.duration_formatted;
  const s = props.session.duration_seconds;
  if (!s) return null;
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}m ${ss}s`;
});

const statusLabel = computed(() => {
  const map = { completed: "Finalizado", cancelled: "Cancelado" };
  return map[props.session?.status] || "Em andamento";
});

function close() {
  emit("update:isOpen", false);
}
</script>
