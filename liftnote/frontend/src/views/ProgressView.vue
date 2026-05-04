<template>
  <div class="progress-page">
    <!-- Stats rápidos -->
    <div class="stat-grid mb">
      <div class="stat-card">
        <div class="stat-val">{{ completedSessions }}</div>
        <div class="stat-label">Sessões completas</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ Math.round(avgDuration) }}</div>
        <div class="stat-label">Média (min)</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ totalVolume.toLocaleString("pt-BR") }}</div>
        <div class="stat-label">Volume total (kg)</div>
      </div>
      <div class="stat-card accent-card">
        <div class="stat-val">{{ weekStreak }}</div>
        <div class="stat-label">Semanas ativas</div>
      </div>
    </div>

    <!-- Tabs de IA -->
    <div class="ai-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="ai-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- ─── TAB 1: Análise de Sessão ─────────────────────────── -->
    <div v-if="activeTab === 'session'" class="tab-content">
      <div class="ai-card card">
        <div class="ai-card-header">
          <div>
            <div class="ai-badge">✦ Gemini AI</div>
            <h3 class="ai-title">Análise de Sessão</h3>
            <p class="ai-desc">
              Selecione uma sessão concluída para receber feedback detalhado do
              seu personal trainer virtual.
            </p>
          </div>
        </div>

        <!-- Seletor de sessão -->
        <div class="session-selector" v-if="completedSessionsList.length">
          <label class="input-label">Sessão para analisar</label>
          <div class="session-list">
            <div
              v-for="s in completedSessionsList.slice(0, 8)"
              :key="s._id"
              class="session-item"
              :class="{ selected: selectedSession?._id === s._id }"
              @click="selectSession(s)"
            >
              <div class="session-item-left">
                <div class="session-item-name">
                  {{ getWorkoutName(s.workout_id) }}
                </div>
                <div class="session-item-date">
                  {{ formatDate(s.started_at) }}
                </div>
              </div>
              <div class="session-item-right">
                <span v-if="s.ai_summary" class="analyzed-badge"
                  >✓ Analisado</span
                >
                <span
                  v-else
                  class="session-item-dur"
                  v-if="s.duration_seconds"
                  >{{ formatDuration(s.duration_seconds) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state-sm">
          Nenhuma sessão concluída ainda. Complete um treino para analisar!
        </div>

        <!-- Resultado da análise -->
        <div v-if="selectedSession" class="ai-result-area">
          <div v-if="sessionAnalysis" class="ai-bubble">
            <div class="ai-bubble-header">
              <div class="ai-dot-live"></div>
              <span>Análise gerada por Gemini</span>
            </div>
            <div class="ai-text" v-html="formatMarkdown(sessionAnalysis)"></div>
          </div>

          <div v-else-if="loadingSession" class="ai-loading">
            <div class="loading-spinner"></div>
            <span>Analisando seu treino com Gemini AI...</span>
          </div>

          <button
            v-if="!loadingSession"
            class="btn btn-accent btn-ai mt"
            @click="runSessionAnalysis"
          >
            {{ sessionAnalysis ? "↻ Reanalisar sessão" : "✦ Analisar com IA" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── TAB 2: Progresso por Exercício ───────────────────── -->
    <div v-if="activeTab === 'exercise'" class="tab-content">
      <div class="ai-card card">
        <div class="ai-card-header">
          <div>
            <div class="ai-badge">✦ Gemini AI</div>
            <h3 class="ai-title">Progresso por Exercício</h3>
            <p class="ai-desc">
              Escolha um exercício para ver sua evolução de carga, volume e
              receber sugestões de progressão.
            </p>
          </div>
        </div>

        <!-- Seletor de exercício -->
        <div class="form-group">
          <label class="input-label">Exercício</label>
          <input
            class="input-modern"
            v-model="exerciseSearch"
            placeholder="Buscar exercício..."
            @input="fetchExercises"
          />
          <div
            v-if="exerciseResults.length && exerciseSearch"
            class="exercise-dropdown"
          >
            <div
              v-for="ex in exerciseResults"
              :key="ex._id"
              class="exercise-option"
              @click="selectExercise(ex)"
            >
              <span>{{ ex.name }}</span>
              <span class="ex-muscle">{{ ex.muscle_group }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedExercise" class="selected-exercise-chip">
          <span>🏋️ {{ selectedExercise.name }}</span>
          <span class="chip-muscle">{{ selectedExercise.muscle_group }}</span>
          <button
            class="chip-clear"
            @click="
              selectedExercise = null;
              exerciseAnalysis = null;
            "
          >
            ✕
          </button>
        </div>

        <!-- Resultado -->
        <div v-if="selectedExercise" class="ai-result-area">
          <div v-if="exerciseAnalysis" class="ai-bubble">
            <div class="ai-bubble-header">
              <div class="ai-dot-live"></div>
              <span
                >{{ exerciseAnalysis.sessions_analyzed }} sessões
                analisadas</span
              >
            </div>
            <div
              class="ai-text"
              v-html="formatMarkdown(exerciseAnalysis.analysis)"
            ></div>
          </div>

          <div v-else-if="loadingExercise" class="ai-loading">
            <div class="loading-spinner"></div>
            <span>Calculando sua progressão com Gemini AI...</span>
          </div>

          <button
            v-if="!loadingExercise"
            class="btn btn-accent btn-ai mt"
            @click="runExerciseAnalysis"
          >
            {{ exerciseAnalysis ? "↻ Reanalisar" : "✦ Analisar Progresso" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── TAB 3: Coach Semanal ─────────────────────────────── -->
    <div v-if="activeTab === 'coach'" class="tab-content">
      <div class="ai-card card coach-card">
        <div class="ai-card-header">
          <div>
            <div class="ai-badge coach-badge">✦ Gemini AI · Coach</div>
            <h3 class="ai-title">Relatório do Coach</h3>
            <p class="ai-desc">
              Análise completa das suas últimas 4 semanas: consistência,
              tendências e plano de ação personalizado.
            </p>
          </div>
          <div class="coach-icon">🤖</div>
        </div>

        <!-- Stats das 4 semanas -->
        <div v-if="weeklyData" class="weekly-stats">
          <div class="weekly-stat">
            <div class="weekly-stat-val">{{ weeklyData.total_sessions }}</div>
            <div class="weekly-stat-label">Treinos</div>
          </div>
          <div class="weekly-stat">
            <div class="weekly-stat-val">
              {{ weeklyData.avg_sessions_per_week }}
            </div>
            <div class="weekly-stat-label">Média/semana</div>
          </div>
          <div class="weekly-stat">
            <div class="weekly-stat-val">
              {{ weeklyData.total_volume_kg.toLocaleString("pt-BR") }}
            </div>
            <div class="weekly-stat-label">Volume (kg)</div>
          </div>
        </div>

        <!-- Resultado -->
        <div v-if="coachReport" class="ai-bubble coach-bubble">
          <div class="ai-bubble-header">
            <div class="ai-dot-live"></div>
            <span>Relatório gerado por Gemini</span>
          </div>
          <div class="ai-text" v-html="formatMarkdown(coachReport)"></div>
        </div>

        <div v-else-if="loadingCoach" class="ai-loading">
          <div class="loading-spinner"></div>
          <span>Preparando seu relatório personalizado...</span>
        </div>

        <button
          v-if="!loadingCoach"
          class="btn btn-accent btn-ai mt"
          @click="runWeeklyCoach"
        >
          {{
            coachReport ? "↻ Atualizar relatório" : "✦ Gerar Relatório do Coach"
          }}
        </button>
      </div>
    </div>

    <!-- Barras de treinos por dia (últimas 4 semanas) -->
    <div class="card mt activity-card">
      <h3 class="card-title">Atividade — últimas 4 semanas</h3>
      <div class="progress-bars">
        <div class="bar-item" v-for="(d, i) in last28Days" :key="i">
          <div class="bar-wrap">
            <div
              class="bar-fill"
              :class="{ active: d.count > 0 }"
              :style="{ height: Math.max(4, d.count * 36) + 'px' }"
            ></div>
          </div>
          <div class="bar-label">{{ d.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAppStore } from "../store/appStore";
import api from "../services/api";

const appStore = useAppStore();

onMounted(() => {
  appStore.fetchSessions();
  appStore.fetchWorkouts();
});

// ─── Tabs ─────────────────────────────────────────────────────
const tabs = [
  { id: "session", icon: "📋", label: "Sessão" },
  { id: "exercise", icon: "💪", label: "Exercício" },
  { id: "coach", icon: "🤖", label: "Coach" },
];
const activeTab = ref("session");

// ─── Estado ───────────────────────────────────────────────────
const selectedSession = ref<any>(null);
const sessionAnalysis = ref("");
const loadingSession = ref(false);

const exerciseSearch = ref("");
const exerciseResults = ref<any[]>([]);
const selectedExercise = ref<any>(null);
const exerciseAnalysis = ref<any>(null);
const loadingExercise = ref(false);

const coachReport = ref("");
const weeklyData = ref<any>(null);
const loadingCoach = ref(false);

// ─── Computed ─────────────────────────────────────────────────
const sessionsArray = computed(() =>
  Array.isArray(appStore.sessions) ? appStore.sessions : [],
);

const completedSessionsList = computed(() =>
  sessionsArray.value
    .filter((s: any) => s.status === "completed")
    .sort(
      (a: any, b: any) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    ),
);

const completedSessions = computed(() => completedSessionsList.value.length);

const avgDuration = computed(() => {
  const c = sessionsArray.value.filter((s: any) => s.duration_seconds);
  if (!c.length) return 0;
  return (
    c.reduce((a: number, s: any) => a + s.duration_seconds, 0) / c.length / 60
  );
});

const totalVolume = computed(() =>
  sessionsArray.value.reduce(
    (acc: number, s: any) => acc + (s.totalVolume || 0),
    0,
  ),
);

const weekStreak = computed(() => {
  const weeks = new Set<string>();
  for (const s of sessionsArray.value) {
    if (s.status !== "completed") continue;
    const d = new Date(s.started_at);
    const week = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
    weeks.add(week);
  }
  return weeks.size;
});

const last28Days = computed(() => {
  const days = [];
  const now = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const count = sessionsArray.value.filter((s: any) => {
      const sd = new Date(s.started_at);
      sd.setHours(0, 0, 0, 0);
      return sd.getTime() === d.getTime() && s.status === "completed";
    }).length;
    const label = i === 0 ? "hoje" : i % 7 === 0 ? `${i / 7}s` : "";
    days.push({ count, label });
  }
  return days;
});

// ─── Helpers ──────────────────────────────────────────────────
function getWorkoutName(id: string) {
  return appStore.workouts?.find((w: any) => w._id === id)?.name || "Treino";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Converte markdown do Gemini em HTML estruturado.
 * Lida com variações como "** texto **", "---", listas, etc.
 */
function formatMarkdown(text: string): string {
  if (!text) return "";

  // 1. Normaliza line endings
  let t = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2. Remove separadores horizontais (---, ***, ___)
  t = t.replace(/^\s*[-*_]{3,}\s*$/gm, "");

  // 3. Separa "**Título** texto na mesma linha" em duas linhas
  t = t.replace(/^(\*\*\s*.+?\s*\*\*)\s+([^*\n].+)$/gm, "$1\n$2");

  const lines = t.split("\n");
  const parts: string[] = [];
  let paraLines: string[] = [];

  const flush = () => {
    if (!paraLines.length) return;
    const html = paraLines
      .join("<br/>")
      .replace(/\*\*\s*(.+?)\s*\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+?)\*/g, "<em>$1</em>")
      // Remove asteriscos soltos que sobraram
      .replace(/\*{1,2}/g, "");
    parts.push(`<p>${html}</p>`);
    paraLines = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    // Linha vazia → fecha parágrafo
    if (!line) {
      flush();
      continue;
    }

    // Remove marcadores de lista (*, -, •) no início
    const withoutBullet = line.replace(/^[*\-•]\s+/, "");

    // Detecta título: qualquer linha que começa E termina com ** (com ou sem espaço interno)
    // Ex: "**Título**", "** 🏆 Resumo **", "**texto**"
    const isTitleLine =
      /^\*{2}\s*.+\s*\*{2}$/.test(line) &&
      (line.match(/\*\*/g) || []).length === 2;

    if (isTitleLine) {
      flush();
      // Extrai o texto entre os ** (remove ** e espaços extras)
      const title = line
        .replace(/^\*{2}\s*/, "")
        .replace(/\s*\*{2}$/, "")
        .trim();
      parts.push(`<div class="ai-section-title">${title}</div>`);
      continue;
    }

    paraLines.push(withoutBullet);
  }

  flush();
  return parts.join("");
}

function selectSession(s: any) {
  selectedSession.value = s;
  sessionAnalysis.value = s.ai_summary || "";
}

async function runSessionAnalysis() {
  if (!selectedSession.value) return;
  loadingSession.value = true;
  sessionAnalysis.value = "";
  try {
    const res = await api.post(`/ai/analyze/${selectedSession.value._id}`);
    sessionAnalysis.value = res.data.ai_summary;
    // Atualiza no objeto local também
    selectedSession.value.ai_summary = res.data.ai_summary;
  } catch (err: any) {
    sessionAnalysis.value =
      err.response?.data?.error || "Erro ao gerar análise. Tente novamente.";
  } finally {
    loadingSession.value = false;
  }
}

// ─── Exercício ────────────────────────────────────────────────
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
async function fetchExercises() {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (!exerciseSearch.value.trim()) {
    exerciseResults.value = [];
    return;
  }
  searchTimeout = setTimeout(async () => {
    try {
      const res = await api.get("/catalog", {
        params: { search: exerciseSearch.value, limit: 8 },
      });
      exerciseResults.value = res.data?.data || res.data || [];
    } catch {
      exerciseResults.value = [];
    }
  }, 300);
}

function selectExercise(ex: any) {
  selectedExercise.value = ex;
  exerciseSearch.value = "";
  exerciseResults.value = [];
  exerciseAnalysis.value = null;
}

async function runExerciseAnalysis() {
  if (!selectedExercise.value) return;
  loadingExercise.value = true;
  exerciseAnalysis.value = null;
  try {
    const res = await api.get(`/ai/progress/${selectedExercise.value._id}`);
    exerciseAnalysis.value = res.data;
  } catch (err: any) {
    exerciseAnalysis.value = {
      analysis: err.response?.data?.error || "Erro ao gerar análise.",
    };
  } finally {
    loadingExercise.value = false;
  }
}

// ─── Coach ────────────────────────────────────────────────────
async function runWeeklyCoach() {
  loadingCoach.value = true;
  coachReport.value = "";
  weeklyData.value = null;
  try {
    const res = await api.get("/ai/weekly-coach");
    weeklyData.value = res.data;
    coachReport.value = res.data.coach_report;
  } catch (err: any) {
    coachReport.value =
      err.response?.data?.error ||
      "Erro ao gerar relatório. Você precisa ter treinos nas últimas 4 semanas.";
  } finally {
    loadingCoach.value = false;
  }
}
</script>

<style scoped>
.progress-page {
  padding: 20px;
  padding-bottom: 100px;
  width: 100%;
}

/* Stats */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r2);
  padding: 16px;
}
.accent-card {
  background: var(--accent);
  border-color: var(--accent);
}
.accent-card .stat-val,
.accent-card .stat-label {
  color: #192126;
}
.stat-val {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
}
.accent-card .stat-val {
  color: #192126;
}
.stat-label {
  font-size: 11px;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

/* Tabs */
.ai-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  background: var(--surface);
  padding: 6px;
  border-radius: 14px;
  border: 1px solid var(--border);
}
.ai-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text2);
  transition: all 0.2s;
}
.ai-tab.active {
  background: var(--accent);
  color: #192126;
}
.tab-icon {
  font-size: 18px;
}
.tab-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* AI Card */
.ai-card {
  padding: 20px;
  border-radius: 20px;
  overflow: visible !important;
}
.coach-card {
  border-color: rgba(200, 241, 53, 0.3);
}
.ai-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.ai-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: var(--accent-dim);
  color: var(--accent);
  border: 1px solid rgba(200, 241, 53, 0.3);
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 8px;
}
.coach-badge {
  background: rgba(200, 241, 53, 0.15);
}
.ai-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px;
}
.ai-desc {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
  margin: 0;
}
.coach-icon {
  font-size: 36px;
}

/* Session selector */
.session-selector {
  margin-bottom: 16px;
}
.input-label {
  display: block;
  font-size: 11px;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  font-weight: 700;
}
.session-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.session-item:hover {
  border-color: var(--accent);
}
.session-item.selected {
  border-color: var(--accent);
  background: var(--accent-dim);
}
.session-item-name {
  font-size: 14px;
  font-weight: 600;
}
.session-item-date {
  font-size: 11px;
  color: var(--text2);
  margin-top: 2px;
}
.session-item-dur {
  font-size: 12px;
  color: var(--text2);
  font-family: var(--font-mono);
}
.analyzed-badge {
  font-size: 10px;
  font-weight: 700;
  background: var(--accent-dim);
  color: var(--accent);
  padding: 3px 8px;
  border-radius: 20px;
}

/* Exercise selector */
.form-group {
  position: relative;
  margin-bottom: 12px;
}
.input-modern {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--r);
  padding: 12px 16px;
  color: var(--text);
  font-size: 14px;
  font-family: var(--font);
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.input-modern:focus {
  border-color: var(--accent);
}
.exercise-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  z-index: 10;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.exercise-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 14px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}
.exercise-option:hover {
  background: var(--accent-dim);
}
.ex-muscle {
  font-size: 11px;
  color: var(--text2);
}
.selected-exercise-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-dim);
  border: 1px solid rgba(200, 241, 53, 0.3);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 16px;
}
.chip-muscle {
  font-size: 11px;
  color: var(--text2);
}
.chip-clear {
  background: none;
  border: none;
  color: var(--text3);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}

/* AI Bubble */
.ai-result-area {
  margin-top: 4px;
}
.ai-bubble {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}
/* Estilizando a barra de rolagem do ai-bubble */
.ai-bubble::-webkit-scrollbar {
  width: 6px;
}
.ai-bubble::-webkit-scrollbar-track {
  background: transparent;
}
.ai-bubble::-webkit-scrollbar-thumb {
  background: var(--border2);
  border-radius: 6px;
}
.ai-bubble::-webkit-scrollbar-thumb:hover {
  background: var(--text3);
}

.coach-bubble {
  border-color: rgba(200, 241, 53, 0.2);
}
.ai-bubble-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text2);
  margin-bottom: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ai-dot-live {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}
.ai-text {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text);
  word-break: break-word;
}
/* Loading */
.ai-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  color: var(--text2);
  font-size: 13px;
}
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Weekly stats */
.weekly-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg);
  border-radius: 12px;
}
.weekly-stat {
  flex: 1;
  text-align: center;
}
.weekly-stat-val {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
}
.weekly-stat-label {
  font-size: 10px;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

/* Btn AI */
.btn-ai {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-weight: 700;
}

/* Activity bars */
.activity-card {
  padding: 16px 20px;
}
.card-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  color: var(--text2);
}
.progress-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 72px;
}
.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
}
.bar-wrap {
  flex: 1;
  display: flex;
  align-items: flex-end;
  width: 100%;
}
.bar-fill {
  width: 100%;
  background: var(--bg4);
  border-radius: 3px 3px 0 0;
  min-height: 4px;
  transition: height 0.3s;
}
.bar-fill.active {
  background: var(--accent);
}
.bar-label {
  font-size: 9px;
  color: var(--text3);
}

/* Misc */
.empty-state-sm {
  text-align: center;
  padding: 24px;
  color: var(--text2);
  font-size: 13px;
}
.tab-content {
  animation: fadeIn 0.2s ease;
  overflow: visible !important;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.mb {
  margin-bottom: 16px;
}
.mt {
  margin-top: 12px;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r2);
}
</style>

<style>
/* Estilos globais para conteúdo gerado via v-html (formatMarkdown) */
.ai-text p {
  margin: 0 0 10px;
  color: var(--text);
  font-size: 13px;
  line-height: 1.8;
}
.ai-text p:last-child {
  margin-bottom: 0;
}
.ai-text strong {
  color: var(--accent);
  font-weight: 700;
}
.ai-text em {
  color: var(--text2);
  font-style: normal;
}
.ai-text .ai-section-title {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: var(--accent);
  margin: 14px 0 8px;
  padding: 6px 12px;
  background: rgba(200, 241, 53, 0.1);
  border-left: 3px solid var(--accent);
  border-radius: 0 8px 8px 0;
}
.ai-text .ai-section-title:first-child {
  margin-top: 0;
}
</style>
