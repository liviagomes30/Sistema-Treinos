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
      <div class="stat-card accent-card">
        <div class="stat-val">{{ weekStreak }}</div>
        <div class="stat-label">Semanas ativas</div>
      </div>
    </div>

    <!-- Coach Card -->
    <div class="ai-card card coach-card">
      <div class="ai-card-header">
        <div>
          <div class="ai-badge coach-badge">✦ Gemini AI · Coach</div>
          <h3 class="ai-title">Relatório do Coach</h3>
          <p class="ai-desc">
            Análise de consistência, tendências e plano de ação personalizado.
          </p>
        </div>
        <div class="coach-icon">🤖</div>
      </div>

      <!-- Seletor de período -->
      <div class="period-selector">
        <span class="period-label">Período</span>
        <div class="period-pills">
          <button
            v-for="opt in periodOptions"
            :key="opt.value"
            class="period-pill"
            :class="{ active: selectedWeeks === opt.value }"
            @click="selectPeriod(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Stats do período -->
      <div v-if="weeklyData" class="weekly-stats">
        <div class="weekly-stat">
          <div class="weekly-stat-val">{{ weeklyData.total_sessions }}</div>
          <div class="weekly-stat-label">Treinos</div>
        </div>
        <div class="weekly-stat">
          <div class="weekly-stat-val">{{ weeklyData.avg_sessions_per_week }}</div>
          <div class="weekly-stat-label">Média/sem</div>
        </div>
        <div class="weekly-stat">
          <div class="weekly-stat-val">{{ weeklyData.total_volume_kg ? (weeklyData.total_volume_kg / 1000).toFixed(1) + 't' : '—' }}</div>
          <div class="weekly-stat-label">Volume</div>
        </div>
      </div>

      <!-- Resultado -->
      <div v-if="coachReport" class="ai-bubble coach-bubble">
        <div class="ai-bubble-header">
          <div class="ai-dot-live"></div>
          <span>Relatório gerado por Gemini · {{ selectedWeeks }} semanas</span>
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
        {{ coachReport ? "↻ Atualizar relatório" : "✦ Gerar Relatório do Coach" }}
      </button>
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

// ─── Estado ───────────────────────────────────────────────────
const coachReport = ref("");
const weeklyData = ref<any>(null);
const loadingCoach = ref(false);
const selectedWeeks = ref(4);

const periodOptions = [
  { value: 2, label: "2 sem" },
  { value: 4, label: "4 sem" },
  { value: 8, label: "8 sem" },
  { value: 12, label: "3 meses" },
];

function selectPeriod(weeks: number) {
  if (selectedWeeks.value === weeks) return;
  selectedWeeks.value = weeks;
  coachReport.value = "";
  weeklyData.value = null;
}

// ─── Computed ─────────────────────────────────────────────────
const sessionsArray = computed(() =>
  Array.isArray(appStore.sessions) ? appStore.sessions : [],
);

const completedSessions = computed(() =>
  sessionsArray.value.filter((s: any) => s.status === "completed").length,
);

const avgDuration = computed(() => {
  const c = sessionsArray.value.filter((s: any) => s.duration_seconds);
  if (!c.length) return 0;
  return c.reduce((a: number, s: any) => a + s.duration_seconds, 0) / c.length / 60;
});

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

// ─── Helpers ──────────────────────────────────────────────────
function formatMarkdown(text: string): string {
  if (!text) return "";

  let t = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  t = t.replace(/^\s*[-*_]{3,}\s*$/gm, "");
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
      .replace(/\*{1,2}/g, "");
    parts.push(`<p>${html}</p>`);
    paraLines = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }

    const withoutBullet = line.replace(/^[*\-•]\s+/, "");
    const innerText = line.replace(/^\*{2}\s*/, "").replace(/\s*\*{2}$/, "").trim();
    const isTitleLine =
      /^\*{2}\s*.+\s*\*{2}$/.test(line) &&
      (line.match(/\*\*/g) || []).length === 2 &&
      /^[\p{Lu}\p{Emoji}]/u.test(innerText);

    if (isTitleLine) {
      flush();
      parts.push(`<div class="ai-section-title">${innerText}</div>`);
      continue;
    }

    paraLines.push(withoutBullet);
  }

  flush();
  return parts.join("");
}

// ─── Coach ────────────────────────────────────────────────────
async function runWeeklyCoach() {
  loadingCoach.value = true;
  coachReport.value = "";
  weeklyData.value = null;
  try {
    const res = await api.get(`/ai/weekly-coach?weeks=${selectedWeeks.value}`);
    weeklyData.value = res.data;
    coachReport.value = res.data.coach_report;
  } catch (err: any) {
    coachReport.value =
      err.response?.data?.error ||
      `Erro ao gerar relatório. Você precisa ter treinos nas últimas ${selectedWeeks.value} semanas.`;
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

/* AI Card */
.ai-card {
  padding: 20px;
  border-radius: 20px;
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

/* Period selector */
.period-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.period-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text2);
  flex-shrink: 0;
}
.period-pills {
  display: flex;
  gap: 6px;
}
.period-pill {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text2);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font);
}
.period-pill:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.period-pill.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #192126;
}

/* AI Bubble */
.ai-bubble {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
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
  flex-shrink: 0;
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
  to { transform: rotate(360deg); }
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

/* Misc */
.mb { margin-bottom: 16px; }
.mt { margin-top: 12px; }
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r2);
}
</style>

<style>
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
