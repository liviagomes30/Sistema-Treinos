<template>
          <div>
            <div class="stat-grid mb">
              <div class="stat-card">
                <div class="stat-val">
                  {{ sessions.filter((s) => s.status === "completed").length }}
                </div>
                <div class="stat-label">Sessões completas</div>
              </div>
              <div class="stat-card">
                <div class="stat-val">{{ Math.round(avgDuration) }}</div>
                <div class="stat-label">Média (min)</div>
              </div>
              <div class="stat-card">
                <div class="stat-val">{{ totalVolume }}</div>
                <div class="stat-label">Volume total kg</div>
              </div>
            </div>

            <div class="card mt">
              <h3>Treinos por dia (últimas 4 semanas)</h3>
              <div class="progress-bars">
                <div class="bar-item" v-for="(d, i) in last28Days" :key="i">
                  <div
                    class="bar-fill"
                    :class="{ active: d.count > 0 }"
                    :style="{ height: Math.max(4, d.count * 40) + 'px' }"
                  ></div>
                  <div class="bar-label">{{ d.label }}</div>
                </div>
              </div>
            </div>

            <div class="card mt">
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  margin-bottom: 14px;
                "
              >
                <h3 style="margin: 0">Resumo de sessão por IA</h3>
                <span class="tag tag-accent">Claude AI</span>
              </div>
              <div
                v-if="!selectedSessionForAI"
                class="empty-state"
                style="padding: 20px"
              >
                <div class="empty-text">
                  Selecione uma sessão no histórico para gerar o resumo
                </div>
              </div>
              <div v-else>
                <div
                  style="
                    margin-bottom: 12px;
                    font-size: 12px;
                    color: var(--text2);
                  "
                >
                  Sessão:
                  <strong>{{
                    getWorkoutName(selectedSessionForAI.workout_id)
                  }}</strong>
                  · {{ formatDate(selectedSessionForAI.started_at) }}
                </div>
                <div v-if="aiLoading" class="ai-bubble">
                  <div class="ai-label">
                    <div class="ai-dot"></div>
                    Gerando análise...
                  </div>
                  <div style="color: var(--text2); font-size: 13px">
                    Analisando seu treino...
                  </div>
                </div>
                <div
                  v-else-if="selectedSessionForAI.ai_summary"
                  class="ai-bubble"
                >
                  <div class="ai-label">
                    <div class="ai-dot"></div>
                    Análise da IA
                  </div>
                  <div
                    style="
                      font-size: 13px;
                      line-height: 1.7;
                      color: var(--text);
                    "
                  >
                    {{ selectedSessionForAI.ai_summary }}
                  </div>
                </div>
                <button
                  v-if="!selectedSessionForAI.ai_summary && !aiLoading"
                  class="btn btn-accent"
                  @click="generateAISummary"
                >
                  ✦ Gerar análise com IA
                </button>
              </div>
            </div>
          </div>

          <!-- ─── SETTINGS ─── -->
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../store/appStore';
const appStore = useAppStore();
const progressFilter = ref('volume');
const chartData = computed(() => []);
const maxChartVal = ref(100);
function formatDuration(durationSeconds: number) { return durationSeconds; }
</script>
