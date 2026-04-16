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
              v-for="s in filteredHistory"
              :key="s._id"
              class="history-item"
              @click="viewSession(s)"
            >
              <div class="history-date">
                <div class="history-date-day">
                  {{ new Date(s.started_at).getDate() }}
                </div>
                <div class="history-date-month">
                  {{ months[new Date(s.started_at).getMonth()] }}
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
                    getWorkoutName(s.workout_id)
                  }}</span>
                  <span
                    :class="[
                      'tag',
                      s.status === 'completed'
                        ? 'tag-accent'
                        : s.status === 'cancelled'
                          ? 'tag-red'
                          : 'tag-blue',
                    ]"
                    >{{ statusLabel(s.status) }}</span
                  >
                </div>
                <div style="font-size: 11px; color: var(--text2)">
                  {{ formatDate(s.started_at) }} · Duração:
                  {{
                    s.duration_formatted ||
                    formatDuration(s.duration_seconds) ||
                    "—"
                  }}
                </div>
                <div
                  v-if="s.ai_summary"
                  style="
                    font-size: 11px;
                    color: var(--text3);
                    margin-top: 4px;
                    font-style: italic;
                  "
                >
                  🤖 {{ s.ai_summary.substring(0, 80) }}...
                </div>
              </div>
              <div
                style="display: flex; gap: 6px; align-items: center"
                @click.stop
              >
                <button
                  class="btn btn-danger btn-sm"
                  @click="deleteSession(s._id)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- ─── PROGRESS ─── -->
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '../store/appStore';
import { useSessionStore } from '../store/sessionStore';
const appStore = useAppStore();
const historySearch = ref('');
const historyFilter = ref('');
const filteredHistory = computed(() => []);
function viewSession(s) {}
function formatDate(d) { return d; }
function getWorkoutName(id) { return appStore.getWorkoutName(id); }
function statusLabel(s) { return s; }
function formatDuration(d) { return d; }
</script>
