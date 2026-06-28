<template>
  <div>
    <div class="month-nav">
      <button class="nav-arrow" @click="$emit('prevMonth')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="month-center" @click="showYearPicker = !showYearPicker">
        <span class="month-label">{{ monthNames[currentMonth] }}</span>
        <span class="year-label">{{ currentYear }}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="chevron" :class="{ open: showYearPicker }">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      <button class="nav-arrow" @click="$emit('nextMonth')" :disabled="isCurrentMonthOrFuture">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <transition name="dropdown">
      <div v-if="showYearPicker" class="year-picker-panel card">
        <div class="year-picker-header">
          <button class="year-nav" @click="pickerYear--">‹</button>
          <span class="picker-year-label">{{ pickerYear }}</span>
          <button class="year-nav" @click="pickerYear++" :disabled="pickerYear >= new Date().getFullYear()">›</button>
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
            @click="handleGoToMonth(i, pickerYear)"
          >
            {{ m.slice(0, 3) }}
          </button>
        </div>
      </div>
    </transition>

    <div class="calendar-wrapper mb">
      <div class="weekdays">
        <div class="weekday" v-for="d in ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']" :key="d">{{ d }}</div>
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
          @click="$emit('selectDate', day)"
        >
          <span class="day-number">{{ day.number }}</span>
          <div v-if="day.sessionCount > 0" class="workout-dot">
            <span v-if="day.sessionCount > 1" class="dot-count">{{ day.sessionCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CalendarDay } from '../../utils/calendarHelpers'

const props = defineProps<{
  currentYear: number
  currentMonth: number
  calendarDays: CalendarDay[]
  selectedDate: Date | null
}>()

const emit = defineEmits<{
  prevMonth: []
  nextMonth: []
  goToMonth: [monthIdx: number, year: number]
  selectDate: [day: CalendarDay]
}>()

const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const showYearPicker = ref(false)
const pickerYear = ref(props.currentYear)

watch(() => props.currentYear, (y) => { pickerYear.value = y })

const isCurrentMonthOrFuture = computed(() => {
  const now = new Date()
  return (
    props.currentYear > now.getFullYear() ||
    (props.currentYear === now.getFullYear() && props.currentMonth >= now.getMonth())
  )
})

function isFutureMonth(monthIdx: number, year: number) {
  const now = new Date()
  return year > now.getFullYear() || (year === now.getFullYear() && monthIdx > now.getMonth())
}

function handleGoToMonth(monthIdx: number, year: number) {
  if (isFutureMonth(monthIdx, year)) return
  showYearPicker.value = false
  emit('goToMonth', monthIdx, year)
}

function isSelected(day: CalendarDay) {
  if (!props.selectedDate) return false
  return day.date.toDateString() === props.selectedDate.toDateString()
}
</script>

<style scoped>
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
  display: none;
}
.mb {
  margin-bottom: 12px;
}
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
