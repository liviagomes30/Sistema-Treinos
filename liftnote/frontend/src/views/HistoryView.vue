<template>
  <div class="calendar-page">
    <!-- ── Navegação de mês/ano ─────────────────────────────── -->
    <div class="month-nav">
      <button class="nav-arrow" @click="prevMonth">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="month-center" @click="showYearPicker = !showYearPicker">
        <span class="month-label">{{ currentMonthName }}</span>
        <span class="year-label">{{ currentYear }}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          class="chevron"
          :class="{ open: showYearPicker }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <button
        class="nav-arrow"
        @click="nextMonth"
        :disabled="isCurrentMonthOrFuture"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- ── Picker de ano/mês rápido ───────────────────────────── -->
    <transition name="dropdown">
      <div v-if="showYearPicker" class="year-picker-panel card">
        <div class="year-picker-header">
          <button class="year-nav" @click="pickerYear--">‹</button>
          <span class="picker-year-label">{{ pickerYear }}</span>
          <button
            class="year-nav"
            @click="pickerYear++"
            :disabled="pickerYear >= new Date().getFullYear()"
          >
            ›
          </button>
        </div>
        <div class="month-grid">
          <button
            v-for="(m, i) in monthNames"
            :key="i"
            class="month-chip"
            :class="{
              active: i === currentMonth && pickerYear === currentYear,
              disabled: isFutureMonth(i, pickerYear),
            }"
            :disabled="isFutureMonth(i, pickerYear)"
            @click="goToMonth(i, pickerYear)"
          >
            {{ m.slice(0, 3) }}
          </button>
        </div>
      </div>
    </transition>

    <!-- ── Calendário ──────────────────────────────────────────── -->
    <div class="calendar-wrapper mb">
      <div class="weekdays">
        <div
          class="weekday"
          v-for="d in ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']"
          :key="d"
        >
          {{ d }}
        </div>
      </div>
      <div class="days-grid">
        <div
          class="day-cell"
          v-for="(day, i) in calendarDays"
          :key="i"
          :class="{
            'other-month': !day.isCurrentMonth,
            active: isSelected(day),
            'has-workout': day.sessionCount > 0,
            today: day.isToday,
          }"
          @click="selectDate(day)"
        >
          <span class="day-number">{{ day.number }}</span>
          <div v-if="day.sessionCount > 0" class="workout-dot">
            <span v-if="day.sessionCount > 1" class="dot-count">{{
              day.sessionCount
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Estatísticas do mês ─────────────────────────────────── -->
    <div class="month-stats">
      <div class="month-stat">
        <span class="month-stat-val">{{ monthSessionCount }}</span>
        <span class="month-stat-label">treinos</span>
      </div>
      <div class="stat-divider"></div>
      <div class="month-stat">
        <span class="month-stat-val">{{
          monthVolume.toLocaleString("pt-BR")
        }}</span>
        <span class="month-stat-label">kg volume</span>
      </div>
      <div class="stat-divider"></div>
      <div class="month-stat">
        <span class="month-stat-val">{{ Math.round(monthAvgDuration) }}</span>
        <span class="month-stat-label">min médio</span>
      </div>
    </div>

    <div class="progress-cta">
      <button class="btn btn-accent btn-sm" @click="$router.push('/progress')">
        Ver progresso
      </button>
    </div>

    <!-- ── Busca e filtro ──────────────────────────────────────── -->
    <div class="filters-row">
      <div class="search-box">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="search-icon"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          v-model="historySearch"
          placeholder="Buscar treino..."
          class="search-input"
        />
        <button
          v-if="historySearch"
          class="clear-btn"
          @click="historySearch = ''"
        >
          ✕
        </button>
      </div>
      <select v-model="historyFilter" class="filter-select">
        <option value="">Todos</option>
        <option value="completed">Completo</option>
        <option value="in_progress">Em andamento</option>
        <option value="cancelled">Cancelado</option>
      </select>
    </div>

    <!-- ── Lista de sessões ────────────────────────────────────── -->
    <div class="sessions-section">
      <div class="section-header-row">
        <h2 class="section-title">
          {{ selectedDateLabel }}
        </h2>
        <button v-if="viewingDay" class="clear-day-btn" @click="clearDayFilter">
          Ver mês todo
        </button>
      </div>

      <div v-if="filteredHistory.length === 0" class="empty-state">
        <div class="empty-icon">🗓️</div>
        <div class="empty-text">
          {{
            viewingDay
              ? "Nenhum treino neste dia"
              : "Nenhuma sessão encontrada neste mês"
          }}
        </div>
      </div>

      <transition-group name="list" tag="div" class="session-list">
        <div
          v-for="session in filteredHistory"
          :key="session._id"
          class="session-card"
          @click="viewSession(session)"
        >
          <!-- Data lateral -->
          <div class="session-date-col">
            <div class="session-day">
              {{ new Date(session.started_at).getDate() }}
            </div>
            <div class="session-month-short">
              {{ shortMonth(session.started_at) }}
            </div>
          </div>

          <!-- Info principal -->
          <div class="session-info">
            <div class="session-name">
              {{ getWorkoutName(session.workout_id) }}
            </div>
            <div class="session-meta">
              <span>🕐 {{ formatTime(session.started_at) }}</span>
              <span v-if="session.duration_seconds"
                >· ⏱ {{ formatDuration(session.duration_seconds) }}</span
              >
              <span v-if="session.totalVolume"
                >· 🏋️ {{ session.totalVolume }}kg</span
              >
            </div>
          </div>

          <!-- Status + ações -->
          <div class="session-actions">
            <span :class="['status-badge', statusClass(session.status)]">
              {{ statusLabel(session.status) }}
            </span>
            <button
              class="delete-btn"
              @click.stop="deleteSession(session._id)"
              title="Excluir"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6M14 11v6"></path>
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Modal exclusão -->
    <ConfirmModal
      v-model:isOpen="showDeleteModal"
      title="Excluir Sessão"
      message="Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita."
      confirmText="Excluir"
      cancelText="Cancelar"
      :isDanger="true"
      @confirm="confirmDeleteSession"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAppStore } from "../store/appStore";
import { sessionService } from "../services/sessionService";
import ConfirmModal from "../components/ui/ConfirmModal.vue";
import type { Session } from "../types";

const appStore = useAppStore();

onMounted(() => {
  appStore.fetchSessions();
  appStore.fetchWorkouts();
});

// ── Estado de navegação ────────────────────────────────────────
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDate = ref<Date | null>(null); // null = ver mês todo
const viewingDay = computed(() => selectedDate.value !== null);

const showYearPicker = ref(false);
const pickerYear = ref(today.getFullYear());

// ── Filtros de busca ───────────────────────────────────────────
const historySearch = ref("");
const historyFilter = ref("");
const showDeleteModal = ref(false);
const sessionToDelete = ref<string | null>(null);

// ── Nomes ─────────────────────────────────────────────────────
const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const currentMonthName = computed(() => monthNames[currentMonth.value]);

// ── Navegação ─────────────────────────────────────────────────
const isCurrentMonthOrFuture = computed(() => {
  const now = new Date();
  return (
    currentYear.value > now.getFullYear() ||
    (currentYear.value === now.getFullYear() &&
      currentMonth.value >= now.getMonth())
  );
});

function prevMonth() {
  showYearPicker.value = false;
  selectedDate.value = null;
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  pickerYear.value = currentYear.value;
}

function nextMonth() {
  if (isCurrentMonthOrFuture.value) return;
  showYearPicker.value = false;
  selectedDate.value = null;
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  pickerYear.value = currentYear.value;
}

function isFutureMonth(monthIdx: number, year: number) {
  const now = new Date();
  return (
    year > now.getFullYear() ||
    (year === now.getFullYear() && monthIdx > now.getMonth())
  );
}

function goToMonth(monthIdx: number, year: number) {
  if (isFutureMonth(monthIdx, year)) return;
  currentMonth.value = monthIdx;
  currentYear.value = year;
  pickerYear.value = year;
  selectedDate.value = null;
  showYearPicker.value = false;
}

// ── Calendário ────────────────────────────────────────────────
interface CalendarDay {
  number: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessionCount: number;
}

const sessionsArray = computed(() =>
  Array.isArray(appStore.sessions) ? (appStore.sessions as Session[]) : [],
);

const calendarDays = computed((): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const startDow = firstDay.getDay();
  const prevLast = new Date(currentYear.value, currentMonth.value, 0).getDate();

  // dias do mês anterior
  for (let i = startDow - 1; i >= 0; i--) {
    const date = new Date(
      currentYear.value,
      currentMonth.value - 1,
      prevLast - i,
    );
    days.push({
      number: prevLast - i,
      date,
      isCurrentMonth: false,
      isToday: false,
      sessionCount: countSessions(date),
    });
  }
  // dias do mês atual
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    const isToday = date.toDateString() === today.toDateString();
    days.push({
      number: i,
      date,
      isCurrentMonth: true,
      isToday,
      sessionCount: countSessions(date),
    });
  }
  // completar grid (42 células)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    days.push({
      number: i,
      date,
      isCurrentMonth: false,
      isToday: false,
      sessionCount: countSessions(date),
    });
  }
  return days;
});

function countSessions(date: Date): number {
  return sessionsArray.value.filter((s) => {
    const sd = new Date(s.started_at);
    return (
      sd.getFullYear() === date.getFullYear() &&
      sd.getMonth() === date.getMonth() &&
      sd.getDate() === date.getDate()
    );
  }).length;
}

function isSelected(day: CalendarDay) {
  if (!selectedDate.value) return false;
  return day.date.toDateString() === selectedDate.value.toDateString();
}

function selectDate(day: CalendarDay) {
  if (!day.isCurrentMonth) {
    goToMonth(day.date.getMonth(), day.date.getFullYear());
    return;
  }
  // toggle: clica no mesmo dia desmarca
  if (selectedDate.value?.toDateString() === day.date.toDateString()) {
    selectedDate.value = null;
  } else {
    selectedDate.value = day.date;
  }
}

function clearDayFilter() {
  selectedDate.value = null;
}

// ── Estatísticas do mês ───────────────────────────────────────
const monthSessions = computed(() =>
  sessionsArray.value.filter((s) => {
    const d = new Date(s.started_at);
    return (
      d.getFullYear() === currentYear.value &&
      d.getMonth() === currentMonth.value
    );
  }),
);

const monthSessionCount = computed(() => monthSessions.value.length);
const monthVolume = computed(() =>
  monthSessions.value.reduce((a, s: any) => a + (s.totalVolume || 0), 0),
);
const monthAvgDuration = computed(() => {
  const c = monthSessions.value.filter((s: any) => s.duration_seconds);
  if (!c.length) return 0;
  return (
    c.reduce((a: number, s: any) => a + s.duration_seconds, 0) / c.length / 60
  );
});

// ── Sessões filtradas ─────────────────────────────────────────
const filteredHistory = computed(() => {
  let list = sessionsArray.value.filter((s) => {
    const d = new Date(s.started_at);
    if (selectedDate.value) {
      return d.toDateString() === selectedDate.value.toDateString();
    }
    return (
      d.getFullYear() === currentYear.value &&
      d.getMonth() === currentMonth.value
    );
  });

  if (historyFilter.value) {
    list = list.filter((s) => s.status === historyFilter.value);
  }
  if (historySearch.value.trim()) {
    const q = historySearch.value.toLowerCase();
    list = list.filter((s) =>
      getWorkoutName((s as any).workout_id)
        .toLowerCase()
        .includes(q),
    );
  }

  return list.sort(
    (a, b) =>
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );
});

const selectedDateLabel = computed(() => {
  if (selectedDate.value) {
    return selectedDate.value.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  }
  return `${currentMonthName.value} ${currentYear.value}`;
});

// ── Helpers ───────────────────────────────────────────────────
function getWorkoutName(workoutId: any) {
  if (typeof workoutId === "object" && workoutId?.name) return workoutId.name;
  return appStore.getWorkoutName(workoutId);
}

function shortMonth(dateStr: string) {
  return new Date(dateStr)
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(secs?: number) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    completed: "Completo",
    in_progress: "Em and.",
    cancelled: "Cancelado",
  };
  return map[status] || status;
}

function statusClass(status: string) {
  return (
    {
      completed: "badge-green",
      in_progress: "badge-blue",
      cancelled: "badge-red",
    }[status] || ""
  );
}

function viewSession(session: Session) {
  // placeholder — expandir inline no futuro
  console.log("Viewing session", session);
}

function deleteSession(id: string) {
  sessionToDelete.value = id;
  showDeleteModal.value = true;
}

async function confirmDeleteSession() {
  if (!sessionToDelete.value) return;
  try {
    await sessionService.delete(sessionToDelete.value);
    await appStore.fetchSessions();
    sessionToDelete.value = null;
  } catch (err) {
    console.error(err);
  }
}
</script>

<style scoped>
.calendar-page {
  padding: 20px;
  padding-bottom: 100px;
  width: 100%;
}

/* ── Navegação de mês ──────────────────────────────────────── */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.nav-arrow {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text);
  transition: all 0.2s;
}
.nav-arrow:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.month-center {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 20px;
  transition: background 0.2s;
  user-select: none;
}
.month-center:hover {
  background: var(--surface);
}

.month-label {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}
.year-label {
  font-size: 14px;
  color: var(--text2);
  font-weight: 600;
}
.chevron {
  color: var(--text3);
  transition: transform 0.2s;
}
.chevron.open {
  transform: rotate(180deg);
}

/* ── Picker de ano/mês ─────────────────────────────────────── */
.year-picker-panel {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 16px;
}
.year-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.year-nav {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: var(--text);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.year-nav:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.year-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.picker-year-label {
  font-weight: 700;
  font-size: 16px;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.month-chip {
  padding: 8px 4px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.month-chip:hover:not(.disabled):not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.month-chip.active {
  background: var(--accent);
  color: #192126;
  border-color: var(--accent);
}
.month-chip.disabled,
.month-chip:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ── Calendário ────────────────────────────────────────────── */
.calendar-wrapper {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 12px;
}
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}
.weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--text3);
  text-transform: uppercase;
  padding: 4px 0;
}
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.day-cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  gap: 2px;
}
.day-cell:hover {
  background: var(--bg4);
}
.day-cell.other-month .day-number {
  color: var(--text3);
}
.day-cell.today .day-number {
  color: var(--accent);
  font-weight: 800;
}
.day-cell.active {
  background: var(--accent);
}
.day-cell.active .day-number {
  color: #192126;
  font-weight: 800;
}
.day-cell.active .workout-dot {
  background: #192126;
}
.day-number {
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
}
.workout-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0;
}
.day-cell.has-workout:not(.active) .workout-dot {
  background: var(--accent);
}
.dot-count {
  display: none; /* exibe só num futuro tooltip */
}

/* ── Stats do mês ──────────────────────────────────────────── */
.month-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.progress-cta {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
.month-stat {
  text-align: center;
}
.month-stat-val {
  display: block;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
}
.month-stat-label {
  font-size: 10px;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}
.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}

/* ── Filtros ───────────────────────────────────────────────── */
.filters-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 12px;
}
.search-icon {
  color: var(--text3);
  flex-shrink: 0;
}
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 13px;
  font-family: var(--font);
  padding: 10px 0;
  outline: none;
}
.search-input::placeholder {
  color: var(--text3);
}
.clear-btn {
  background: none;
  border: none;
  color: var(--text3);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}
.filter-select {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--text);
  font-size: 13px;
  font-family: var(--font);
  outline: none;
  cursor: pointer;
}

/* ── Sessões ───────────────────────────────────────────────── */
.sessions-section {
}
.section-header-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text2);
  text-transform: capitalize;
  letter-spacing: 0.3px;
}
.clear-day-btn {
  font-size: 11px;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 700;
  text-decoration: underline;
  padding: 0;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 14px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.session-card:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.session-date-col {
  text-align: center;
  min-width: 32px;
  flex-shrink: 0;
}
.session-day {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
}
.session-month-short {
  font-size: 10px;
  color: var(--text2);
  text-transform: uppercase;
  font-weight: 700;
}

.session-info {
  flex: 1;
  min-width: 0;
}
.session-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
}
.session-meta {
  font-size: 11px;
  color: var(--text2);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.session-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}
.status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  white-space: nowrap;
}
.badge-green {
  background: rgba(200, 241, 53, 0.15);
  color: var(--accent);
}
.badge-blue {
  background: rgba(77, 166, 255, 0.15);
  color: var(--blue);
}
.badge-red {
  background: rgba(237, 71, 71, 0.15);
  color: var(--red);
}

.delete-btn {
  background: none;
  border: none;
  color: var(--text3);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition:
    color 0.2s,
    background 0.2s;
}
.delete-btn:hover {
  color: var(--red);
  background: var(--red-dim);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}
.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}
.empty-text {
  color: var(--text2);
  font-size: 14px;
}

/* Transições */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.mb {
  margin-bottom: 12px;
}
</style>
