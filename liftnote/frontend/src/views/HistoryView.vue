<template>
  <div class="calendar-page">
    <div class="topbar-calendar">
      <div class="icon-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </div>
      <div class="month-nav">
        <div class="icon-btn" @click="shiftMonth(-1)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </div>
        <div class="current-month">{{ currentMonthName }} {{ currentYear }}</div>
        <div class="icon-btn" @click="shiftMonth(1)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
      <div style="width: 24px;"></div>
    </div>

    <div class="calendar-wrapper mb">
      <div class="weekdays">
        <div class="weekday" v-for="day in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']" :key="day">{{ day }}</div>
      </div>
      <div class="days-grid">
        <div
          class="day-cell"
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="{ 'other-month': !day.isCurrentMonth, 'active': isSelected(day), 'has-workout': hasWorkout(day.date) }"
          @click="selectDate(day)"
        >
          <span class="day-number">{{ day.number }}</span>
          <div class="workout-dot" v-if="hasWorkout(day.date)"></div>
        </div>
      </div>
    </div>

    <div class="daily-plan-section">
      <div class="section-header">
        <h2 class="section-title">
          {{ formatSelectedDate(selectedDate) }}
        </h2>
        <span class="session-count" v-if="sessionsForDay.length > 0">
          {{ sessionsForDay.length }} treino{{ sessionsForDay.length > 1 ? 's' : '' }}
        </span>
      </div>

      <div v-if="loading" class="empty-state">
        <div class="empty-icon">⏳</div>
        <div class="empty-text">Carregando...</div>
      </div>

      <div v-else-if="sessionsForDay.length === 0" class="empty-state">
        <div class="empty-icon">◷</div>
        <div class="empty-text">Nenhum treino neste dia</div>
      </div>

      <div v-else class="daily-plan-list">
        <div
          v-for="session in sessionsForDay"
          :key="session._id"
          class="workout-card-daily"
        >
          <!-- Session header -->
          <div class="session-header" @click="toggleSession(session._id)">
            <div class="card-left">
              <div class="workout-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
              </div>
              <div class="workout-info">
                <div class="workout-name">{{ getWorkoutName(session.workout_id) }}</div>
                <div class="workout-meta">
                  {{ formatTime(session.started_at) }}
                  <span v-if="session.duration_seconds || session.duration_formatted">
                    • {{ session.duration_formatted || formatDuration(session.duration_seconds) }}
                  </span>
                  <span v-if="session.logs && session.logs.length > 0">
                    • {{ session.logs.length }} set{{ session.logs.length > 1 ? 's' : '' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-right">
              <span :class="['status-badge', statusBadgeClass(session.status)]">
                {{ statusLabel(session.status) }}
              </span>
              <svg
                class="chevron"
                :class="{ open: expandedSessions.has(session._id) }"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <!-- Logs detail (expandable) -->
          <div v-if="expandedSessions.has(session._id)" class="logs-section">
            <div v-if="!session.logs || session.logs.length === 0" class="no-logs">
              Nenhum exercício registrado nessa sessão.
            </div>
            <div v-else>
              <div
                v-for="(group, exName) in groupLogsByExercise(session.logs)"
                :key="exName"
                class="exercise-group"
              >
                <div class="exercise-group-header">
                  <span class="exercise-group-name">{{ exName }}</span>
                  <span class="exercise-group-muscle">{{ group.muscle_group }}</span>
                </div>
                <div class="sets-table">
                  <div class="sets-row sets-row-header">
                    <span>Série</span>
                    <span>Reps</span>
                    <span>Peso</span>
                    <span>Volume</span>
                  </div>
                  <div
                    v-for="log in group.sets"
                    :key="log._id"
                    class="sets-row"
                  >
                    <span class="set-number">{{ log.set_number }}</span>
                    <span>{{ log.reps_done }}×</span>
                    <span>{{ log.weight_used_kg }}kg</span>
                    <span class="volume-cell">{{ (log.reps_done * log.weight_used_kg).toFixed(1) }}kg</span>
                  </div>
                  <div class="sets-row sets-row-total">
                    <span>Total</span>
                    <span>{{ group.sets.reduce((a, l) => a + l.reps_done, 0) }}</span>
                    <span>—</span>
                    <span>{{ group.sets.reduce((a, l) => a + l.reps_done * l.weight_used_kg, 0).toFixed(1) }}kg</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="session-footer">
              <button class="btn btn-danger btn-sm" style="font-size: 11px;" @click.stop="deleteSession(session._id)">
                Excluir sessão
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-model:isOpen="showDeleteModal"
      title="Excluir Sessão"
      message="Tem certeza que deseja excluir esta sessão do seu histórico? Esta ação não pode ser desfeita."
      confirmText="Excluir"
      cancelText="Cancelar"
      :isDanger="true"
      @confirm="confirmDeleteSession"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { sessionService } from '../services/sessionService';
import ConfirmModal from '../components/ui/ConfirmModal.vue';
import type { Session, ExerciseLog, WorkoutRef } from '../types';

const loading = ref(false);
const monthlySessions = ref<Session[]>([]);
const expandedSessions = ref<Set<string>>(new Set());

const showDeleteModal = ref(false);
const sessionToDelete = ref<string | null>(null);

const selectedDate = ref<Date>(new Date());
const currentMonth = ref<number>(new Date().getMonth() + 1); // 1-based
const currentYear = ref<number>(new Date().getFullYear());

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const currentMonthName = computed(() => monthNames[currentMonth.value - 1]);

interface CalendarDay {
  number: number;
  date: Date;
  isCurrentMonth: boolean;
}

async function loadMonth() {
  loading.value = true;
  try {
    monthlySessions.value = await sessionService.getByMonth(currentYear.value, currentMonth.value);
  } catch (err) {
    console.error('Erro ao carregar sessões do mês', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadMonth();
});

function shiftMonth(delta: number) {
  let m = currentMonth.value + delta;
  let y = currentYear.value;
  if (m > 12) { m = 1; y++; }
  if (m < 1)  { m = 12; y--; }
  currentMonth.value = m;
  currentYear.value = y;
  selectedDate.value = new Date(y, m - 1, 1);
  expandedSessions.value = new Set();
}

watch([currentMonth, currentYear], loadMonth);

const calendarDays = computed((): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value, 0);
  const startDow = firstDay.getDay();
  const prevLastDay = new Date(currentYear.value, currentMonth.value - 1, 0).getDate();

  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ number: prevLastDay - i, date: new Date(currentYear.value, currentMonth.value - 2, prevLastDay - i), isCurrentMonth: false });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ number: i, date: new Date(currentYear.value, currentMonth.value - 1, i), isCurrentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ number: i, date: new Date(currentYear.value, currentMonth.value, i), isCurrentMonth: false });
  }
  return days;
});

function selectDate(day: CalendarDay) {
  selectedDate.value = day.date;
  if (!day.isCurrentMonth) {
    shiftMonth(day.date.getMonth() + 1 < currentMonth.value ? -1 : 1);
  }
}

function isSelected(day: CalendarDay) {
  return day.date.toDateString() === selectedDate.value.toDateString();
}

function hasWorkout(date: Date) {
  return monthlySessions.value.some(s => new Date(s.started_at).toDateString() === date.toDateString());
}

const sessionsForDay = computed(() =>
  monthlySessions.value
    .filter(s => new Date(s.started_at).toDateString() === selectedDate.value.toDateString())
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
);

function toggleSession(id: string) {
  const next = new Set(expandedSessions.value);
  next.has(id) ? next.delete(id) : next.add(id);
  expandedSessions.value = next;
}

function groupLogsByExercise(logs: ExerciseLog[]) {
  const map: Record<string, { muscle_group: string; sets: ExerciseLog[] }> = {};
  for (const log of logs) {
    const we = log.workout_exercise_id;
    const name = we?.custom_name || we?.exercise_catalog_id?.name || 'Exercício';
    const muscle = we?.exercise_catalog_id?.muscle_group || '';
    if (!map[name]) map[name] = { muscle_group: muscle, sets: [] };
    map[name].sets.push(log);
  }
  return map;
}

function getWorkoutName(workoutId: string | WorkoutRef) {
  if (typeof workoutId === 'object' && workoutId?.name) return workoutId.name;
  return 'Treino';
}

function deleteSession(id: string) {
  sessionToDelete.value = id;
  showDeleteModal.value = true;
}

async function confirmDeleteSession() {
  if (!sessionToDelete.value) return;
  try {
    await sessionService.delete(sessionToDelete.value);
    monthlySessions.value = monthlySessions.value.filter(s => s._id !== sessionToDelete.value);
    sessionToDelete.value = null;
  } catch (err) {
    console.error(err);
  }
}

function formatSelectedDate(date: Date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(secs?: number | null) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = { completed: 'Completo', in_progress: 'Em and.', cancelled: 'Cancelado' };
  return labels[status] || status;
}

function statusBadgeClass(status: string) {
  return status === 'completed' ? 'badge-green' : status === 'cancelled' ? 'badge-red' : 'badge-blue';
}
</script>

<style scoped>
.calendar-page {
  padding: 20px;
  padding-bottom: 80px;
  width: 100%;
}
.topbar-calendar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.month-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-btn {
  cursor: pointer;
  color: var(--text);
  display: flex;
  align-items: center;
}
.current-month {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  min-width: 160px;
  text-align: center;
}

/* Calendar */
.calendar-wrapper {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 12px;
}
.weekday {
  font-size: 13px;
  color: var(--text2);
  font-weight: 500;
}
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  position: relative;
}
.day-cell.other-month { color: var(--text3); }
.day-cell.active { background: var(--accent); color: #192126; }
.workout-dot {
  width: 4px;
  height: 4px;
  background: var(--accent);
  border-radius: 50%;
  position: absolute;
  bottom: 6px;
}
.day-cell.active .workout-dot { background: #192126; }

/* Daily Plan */
.daily-plan-section { margin-top: 24px; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  text-transform: capitalize;
}
.session-count {
  font-size: 12px;
  color: var(--text2);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 3px 10px;
}

.daily-plan-list { display: flex; flex-direction: column; gap: 12px; }

.workout-card-daily {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}

/* Session header row */
.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
}
.card-left { display: flex; align-items: center; gap: 14px; }
.workout-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--accent-dim);
  border: 1px solid rgba(187, 242, 70, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}
.workout-name { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
.workout-meta { font-size: 12px; color: var(--text2); }
.card-right { display: flex; align-items: center; gap: 10px; }
.chevron { transition: transform 0.2s ease; color: var(--text2); }
.chevron.open { transform: rotate(180deg); }

/* Badges */
.status-badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 10px; }
.badge-green { background: rgba(187, 242, 70, 0.15); color: var(--accent); }
.badge-blue  { background: rgba(149, 204, 227, 0.15); color: var(--blue); }
.badge-red   { background: rgba(237, 71, 71, 0.15); color: var(--red); }

/* Logs section */
.logs-section {
  border-top: 1px solid var(--border);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.no-logs { font-size: 13px; color: var(--text2); text-align: center; padding: 8px 0; }

.exercise-group { display: flex; flex-direction: column; gap: 6px; }
.exercise-group-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2px;
}
.exercise-group-name { font-size: 14px; font-weight: 600; }
.exercise-group-muscle { font-size: 11px; color: var(--accent); text-transform: uppercase; letter-spacing: 0.5px; }

.sets-table { display: flex; flex-direction: column; gap: 2px; }
.sets-row {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 1fr;
  font-size: 13px;
  padding: 5px 8px;
  border-radius: 8px;
  gap: 4px;
}
.sets-row-header {
  font-size: 11px;
  font-weight: 600;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 2px;
}
.sets-row-total {
  border-top: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  margin-top: 2px;
  padding-top: 6px;
}
.set-number {
  background: var(--accent-dim);
  color: var(--accent);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}
.volume-cell { color: var(--text2); }

.session-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
  border-top: 1px solid var(--border);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: var(--text2);
}
.empty-icon { font-size: 28px; }
.empty-text { font-size: 14px; }

.mb { margin-bottom: 24px; }
</style>
