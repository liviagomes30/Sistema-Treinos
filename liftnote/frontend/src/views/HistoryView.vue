<template>
          <div>
            <div
              style="
                display: flex;
                gap: 10px;
                margin-bottom: 16px;
                flex-wrap: wrap;
              "
            >
              <input
                v-model="historySearch"
                placeholder="Buscar treino..."
                style="max-width: 200px"
              />
              <select v-model="historyFilter" style="max-width: 160px">
                <option value="">Todos os status</option>
                <option value="completed">Completo</option>
                <option value="in_progress">Em andamento</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div v-if="filteredHistory.length === 0" class="empty-state">
              <div class="empty-icon">◷</div>
              <div class="empty-text">Nenhuma sessão encontrada</div>
            </div>
            <div
              v-for="session in filteredHistory"
              :key="session._id"
              class="history-item"
              @click="viewSession(session)"
            >
              <div class="history-date">
                <div class="history-date-day">
                  {{ new Date(session.started_at).getDate() }}
                </div>
                <div class="history-date-month">
                  {{ months[new Date(session.started_at).getMonth()] }}
                </div>
              </div>
              <div style="flex: 1">
                <div
                  style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                  "
                >
                  <span style="font-weight: 500">{{
                    getWorkoutName(session.workout_id)
                  }}</span>
                  <span
                    :class="[
                      'tag',
                      session.status === 'completed'
                        ? 'tag-accent'
                        : session.status === 'cancelled'
                          ? 'tag-red'
                          : 'tag-blue',
                    ]"
                    >{{ statusLabel(session.status) }}</span
                  >
                </div>
                <div style="font-size: 11px; color: var(--text2)">
                  {{ formatDate(session.started_at) }} · Duração:
                  {{
                    session.duration_formatted ||
                    formatDuration(session.duration_seconds) ||
                    "—"
                  }}
                </div>
                <div
                  v-if="session.ai_summary"
                  style="
                    font-size: 11px;
                    color: var(--text3);
                    margin-top: 4px;
                    font-style: italic;
                  "
                >
                  🤖 {{ session.ai_summary.substring(0, 80) }}...
                </div>
              </div>
              <div
                style="display: flex; gap: 6px; align-items: center"
                @click.stop
              >
                <button
                  class="btn btn-danger btn-sm"
                  @click="deleteSession(session._id)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- ─── PROGRESS ─── -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '../store/appStore';
import { sessionService } from '../services/sessionService';
import type { Session } from '../types';

const appStore = useAppStore();
const historySearch = ref('');
const historyFilter = ref('');

const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

onMounted(() => {
  appStore.fetchSessions();
  appStore.fetchWorkouts();
});

const filteredHistory = computed<Session[]>(() => {
  const sessionsArray = Array.isArray(appStore.sessions) ? appStore.sessions : [];
  let sessions = [...sessionsArray];
  
  if (historyFilter.value) {
    sessions = sessions.filter(s => s.status === historyFilter.value);
  }
  
  if (historySearch.value) {
    const q = historySearch.value.toLowerCase();
    sessions = sessions.filter(s => {
      const workoutName = getWorkoutName(s.workout_id).toLowerCase();
      return workoutName.includes(q);
    });
  }

  // Sort by date descending
  return sessions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
});

async function deleteSession(id: string) {
  if (confirm("Tem certeza que deseja excluir esta sessão?")) {
    try {
      await sessionService.delete(id);
      await appStore.fetchSessions();
    } catch (err) {
      console.error(err);
    }
  }
}

function viewSession(session: Session) {
  // Poderia abrir um modal ou navegar para detalhes
  console.log("Viewing session", session);
}

function formatDate(dateStr: string) { 
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getWorkoutName(workoutId: any) { 
  if (typeof workoutId === 'object' && workoutId?.name) return workoutId.name;
  return appStore.getWorkoutName(workoutId); 
}

function statusLabel(status: string) { 
  const labels: Record<string, string> = {
    completed: 'Completo',
    in_progress: 'Em andamento',
    cancelled: 'Cancelado'
  };
  return labels[status] || status;
}

function formatDuration(durationSeconds?: number) { 
  if (!durationSeconds) return null;
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
</script>
