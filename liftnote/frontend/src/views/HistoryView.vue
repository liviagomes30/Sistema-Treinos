<template>
  <div class="calendar-page">
    <div class="topbar-calendar">
      <div class="icon-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </div>
      <div class="current-month">{{ currentMonthName }} {{ currentYear }}</div>
      <div class="icon-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </div>
    </div>

    <div class="calendar-wrapper mb">
      <div class="weekdays">
        <div class="weekday" v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">{{ day }}</div>
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

    <!-- Filters original logic -->
    <div style="display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
      <input
        v-model="historySearch"
        placeholder="Buscar treino..."
        style="max-width: 200px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px; color: white;"
      />
      <select v-model="historyFilter" style="max-width: 160px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px; color: white;">
        <option value="">Todos os status</option>
        <option value="completed">Completo</option>
        <option value="in_progress">Em andamento</option>
        <option value="cancelled">Cancelado</option>
      </select>
    </div>

    <div class="daily-plan-section">
      <div class="section-header">
        <h2 class="section-title">Daily plan</h2>
        <span class="view-all">View All</span>
      </div>

      <div v-if="filteredHistory.length === 0" class="empty-state">
        <div class="empty-icon">◷</div>
        <div class="empty-text">Nenhuma sessão encontrada</div>
      </div>

      <div class="daily-plan-list">
        <div 
          v-for="session in filteredHistory"
          :key="session._id"
          class="workout-card-daily"
          @click="viewSession(session)"
        >
          <div class="card-left">
            <div class="workout-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
            </div>
            <div class="workout-info">
              <div class="workout-name">{{ getWorkoutName(session.workout_id) }}</div>
              <div class="workout-meta">
                {{ formatDate(session.started_at) }} • {{ session.duration_formatted || formatDuration(session.duration_seconds) || "—" }}
              </div>
            </div>
          </div>
          <div class="card-right">
            <span :class="[
              'status-badge',
              session.status === 'completed' ? 'badge-green' : session.status === 'cancelled' ? 'badge-red' : 'badge-blue'
            ]">
              {{ statusLabel(session.status) }}
            </span>
            <button class="btn btn-danger btn-sm" style="padding: 4px 8px; font-size: 10px;" @click.stop="deleteSession(session._id)">✕</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '../store/appStore';
import { sessionService } from '../services/sessionService';
import type { Session } from '../types';

const appStore = useAppStore();
const historySearch = ref('');
const historyFilter = ref('');

const selectedDate = ref<Date>(new Date());
const currentMonth = ref<number>(new Date().getMonth());
const currentYear = ref<number>(new Date().getFullYear());

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentMonthName = computed(() => monthNames[currentMonth.value]);

interface CalendarDay {
  number: number;
  date: Date;
  isCurrentMonth: boolean;
}

const calendarDays = computed(() => {
  const days: CalendarDay[] = [];
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);
  
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // Previous month days
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      number: prevMonthLastDay - i,
      date: new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i),
      isCurrentMonth: false
    });
  }
  
  // Current month days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push({
      number: i,
      date: new Date(currentYear.value, currentMonth.value, i),
      isCurrentMonth: true
    });
  }
  
  // Next month days to fill grid
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      number: i,
      date: new Date(currentYear.value, currentMonth.value + 1, i),
      isCurrentMonth: false
    });
  }
  
  return days;
});

function selectDate(day: CalendarDay) {
  selectedDate.value = day.date;
  if (!day.isCurrentMonth) {
    currentMonth.value = day.date.getMonth();
    currentYear.value = day.date.getFullYear();
  }
}

function isSelected(day: CalendarDay) {
  return day.date.toDateString() === selectedDate.value.toDateString();
}

function hasWorkout(date: Date) {
  const sessionsArray = Array.isArray(appStore.sessions) ? appStore.sessions : [];
  return sessionsArray.some(s => new Date(s.started_at).toDateString() === date.toDateString());
}

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

  // Filter by selected date
  sessions = sessions.filter(s => new Date(s.started_at).toDateString() === selectedDate.value.toDateString());

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
    in_progress: 'Em and.',
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
.icon-btn {
  cursor: pointer;
  color: var(--text);
}
.current-month {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
}

/* Calendar Grid */
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
.day-cell.other-month {
  color: var(--text3);
}
.day-cell.active {
  background: var(--accent);
  color: #192126;
}
.workout-dot {
  width: 4px;
  height: 4px;
  background: var(--accent);
  border-radius: 50%;
  position: absolute;
  bottom: 6px;
}
.day-cell.active .workout-dot {
  background: #192126;
}

/* Daily Plan */
.daily-plan-section {
  margin-top: 24px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
}
.view-all {
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
}

.daily-plan-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.workout-card-daily {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}
.card-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.workout-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--accent-dim);
  border: 1px solid rgba(187, 242, 70, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}
.workout-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}
.workout-meta {
  font-size: 12px;
  color: var(--text2);
}
.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}
.badge-green { background: rgba(187, 242, 70, 0.15); color: var(--accent); }
.badge-blue { background: rgba(149, 204, 227, 0.15); color: var(--blue); }
.badge-red { background: rgba(237, 71, 71, 0.15); color: var(--red); }
</style>
