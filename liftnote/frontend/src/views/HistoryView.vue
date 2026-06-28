<template>
  <div class="calendar-page">
    <CalendarGrid
      :current-year="currentYear"
      :current-month="currentMonth"
      :calendar-days="calendarDays"
      :selected-date="selectedDate"
      @prev-month="prevMonth"
      @next-month="nextMonth"
      @go-to-month="goToMonth"
      @select-date="selectDate"
    />

    <MonthStatsCard
      :session-count="monthSessionCount"
      :avg-duration="monthAvgDuration"
    />

    <SessionFilters v-model="historySearch" />

    <div class="sessions-section">
      <div class="section-header-row">
        <h2 class="section-title">{{ selectedDateLabel }}</h2>
        <button v-if="viewingDay" class="clear-day-btn" @click="clearDayFilter">Ver mês todo</button>
      </div>

      <div v-if="filteredHistory.length === 0" class="empty-state">
        <div class="empty-icon">🗓️</div>
        <div class="empty-text">
          {{ viewingDay ? 'Nenhum treino neste dia' : 'Nenhuma sessão encontrada neste mês' }}
        </div>
      </div>

      <transition-group name="list" tag="div" class="session-list">
        <div
          v-for="session in filteredHistory"
          :key="session._id"
          class="session-card"
          @click="viewSession(session)"
        >
          <div class="session-date-col">
            <div class="session-day">{{ new Date(session.started_at).getDate() }}</div>
            <div class="session-month-short">{{ shortMonth(session.started_at) }}</div>
          </div>

          <div class="session-info">
            <div class="session-name">{{ getWorkoutName(session.workout_id) }}</div>
            <div class="session-meta">
              <span>🕐 {{ formatTime(session.started_at) }}</span>
              <span v-if="session.duration_seconds">· ⏱ {{ formatDuration(session.duration_seconds) }}</span>
            </div>
          </div>

          <div class="session-actions">
            <span :class="['status-badge', statusClass(session.status)]">{{ statusLabel(session.status) }}</span>
            <div style="display: flex; gap: 8px;">
              <button class="edit-btn" @click.stop="editSession(session)" title="Editar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="delete-btn" @click.stop="deleteSession(session._id)" title="Excluir">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                  <path d="M10 11v6M14 11v6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <ConfirmModal
      v-model:isOpen="showDeleteModal"
      title="Excluir Sessão"
      message="Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita."
      confirmText="Excluir"
      cancelText="Cancelar"
      :isDanger="true"
      @confirm="confirmDeleteSession"
    />

    <SessionDetailModal
      v-model:isOpen="showSessionModal"
      :session="modalSession"
      :workoutName="modalWorkoutName"
      :loading="loadingSession"
      :generatingAi="generatingAi"
      @generateAiSummary="handleGenerateAiSummary"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../store/appStore'
import { useSessionStore } from '../store/sessionStore'
import { sessionService } from '../services/sessionService'
import api from '../services/api'
import ConfirmModal from '../components/ui/ConfirmModal.vue'
import SessionDetailModal from '../components/workouts/SessionDetailModal.vue'
import CalendarGrid from '../components/history/CalendarGrid.vue'
import MonthStatsCard from '../components/history/MonthStatsCard.vue'
import SessionFilters from '../components/history/SessionFilters.vue'
import type { Session } from '../types'
import { generateMonthDayGrid, type CalendarDay } from '../utils/calendarHelpers'

const appStore = useAppStore()
const sessionStore = useSessionStore()
const router = useRouter()

onMounted(() => {
  appStore.fetchSessions()
  appStore.fetchWorkouts()
})

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())
const selectedDate = ref<Date | null>(null)
const viewingDay = computed(() => selectedDate.value !== null)

const historySearch = ref('')
const showDeleteModal = ref(false)
const sessionToDelete = ref<string | null>(null)
const showSessionModal = ref(false)
const modalSession = ref<any>(null)
const modalWorkoutName = ref('')
const loadingSession = ref(false)
const generatingAi = ref(false)

function prevMonth() {
  selectedDate.value = null
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  selectedDate.value = null
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function goToMonth(monthIdx: number, year: number) {
  currentMonth.value = monthIdx
  currentYear.value = year
  selectedDate.value = null
}

const sessionsArray = computed(() => {
  const all = Array.isArray(appStore.sessions) ? (appStore.sessions as Session[]) : []
  return all.filter((s) => s.status !== 'cancelled')
})

const calendarDays = computed((): CalendarDay[] =>
  generateMonthDayGrid(currentYear.value, currentMonth.value, sessionsArray.value)
)

function selectDate(day: CalendarDay) {
  if (!day.isCurrentMonth) {
    goToMonth(day.date.getMonth(), day.date.getFullYear())
    return
  }
  if (selectedDate.value?.toDateString() === day.date.toDateString()) {
    selectedDate.value = null
  } else {
    selectedDate.value = day.date
  }
}

function clearDayFilter() {
  selectedDate.value = null
}

const monthSessions = computed(() =>
  sessionsArray.value.filter((s) => {
    const d = new Date(s.started_at)
    return d.getFullYear() === currentYear.value && d.getMonth() === currentMonth.value
  })
)

const monthSessionCount = computed(() => monthSessions.value.length)
const monthAvgDuration = computed(() => {
  const withDuration = monthSessions.value.filter((s: any) => s.duration_seconds)
  if (!withDuration.length) return 0
  return withDuration.reduce((a: number, s: any) => a + s.duration_seconds, 0) / withDuration.length / 60
})

const filteredHistory = computed(() => {
  let list = sessionsArray.value.filter((s) => {
    const d = new Date(s.started_at)
    if (selectedDate.value) {
      return d.toDateString() === selectedDate.value.toDateString()
    }
    return d.getFullYear() === currentYear.value && d.getMonth() === currentMonth.value
  })

  if (historySearch.value.trim()) {
    const q = historySearch.value.toLowerCase()
    list = list.filter((s) => getWorkoutName((s as any).workout_id).toLowerCase().includes(q))
  }

  return list.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
})

const selectedDateLabel = computed(() => {
  if (selectedDate.value) {
    return selectedDate.value.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    })
  }
  const date = new Date(currentYear.value, currentMonth.value, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
})

function getWorkoutName(workoutId: any) {
  if (typeof workoutId === 'object' && workoutId?.name) return workoutId.name
  return appStore.getWorkoutName(workoutId)
}

function shortMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(secs?: number) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function statusLabel(status: string) {
  const map: Record<string, string> = { completed: 'Completo', in_progress: 'Em and.', cancelled: 'Cancelado' }
  return map[status] || status
}

function statusClass(status: string) {
  return ({ completed: 'badge-green', in_progress: 'badge-blue', cancelled: 'badge-red' }[status] || '')
}

async function viewSession(session: Session) {
  modalWorkoutName.value = getWorkoutName((session as any).workout_id)
  modalSession.value = session
  showSessionModal.value = true
  loadingSession.value = true
  try {
    const full = await sessionService.getById(session._id)
    modalSession.value = full
  } catch (err) {
    console.error(err)
  } finally {
    loadingSession.value = false
  }
}

async function handleGenerateAiSummary(session: any) {
  if (!session?._id) return
  generatingAi.value = true
  try {
    const res = await api.post(`/ai/analyze/${session._id}`)
    if (modalSession.value?._id === session._id) {
      modalSession.value = { ...modalSession.value, ai_summary: res.data.ai_summary }
    }
    await appStore.fetchSessions()
  } catch (err) {
    console.error(err)
  } finally {
    generatingAi.value = false
  }
}

async function editSession(session: Session) {
  try {
    await sessionStore.reloadExistingSession(session._id)
    router.push('/session')
  } catch (error) {
    console.error('Erro ao retomar a sessão:', error)
    alert('Falha ao abrir a sessão para edição.')
  }
}

function deleteSession(id: string) {
  sessionToDelete.value = id
  showDeleteModal.value = true
}

async function confirmDeleteSession() {
  if (!sessionToDelete.value) return
  try {
    await sessionService.delete(sessionToDelete.value)
    await appStore.fetchSessions()
    sessionToDelete.value = null
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.calendar-page {
  padding: 20px;
  padding-bottom: calc(96px + env(safe-area-inset-bottom) + 16px);
  width: 100%;
}
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
  transition: border-color 0.2s, background 0.2s;
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
.edit-btn {
  background: none;
  border: none;
  color: var(--text3);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: color 0.2s, background 0.2s;
}
.edit-btn:hover {
  color: var(--accent);
  background: rgba(46, 204, 113, 0.1);
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
  transition: color 0.2s, background 0.2s;
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
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
