export interface CalendarDay {
  number: number
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  sessionCount: number
}

function countSessionsOnDate(sessions: any[], date: Date): number {
  return sessions.filter((s) => {
    const sd = new Date(s.started_at)
    return (
      sd.getFullYear() === date.getFullYear() &&
      sd.getMonth() === date.getMonth() &&
      sd.getDate() === date.getDate()
    )
  }).length
}

export function generateMonthDayGrid(year: number, month: number, sessions: any[]): CalendarDay[] {
  const today = new Date()
  const days: CalendarDay[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay()
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  for (let i = startDow - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({ number: prevMonthLastDay - i, date, isCurrentMonth: false, isToday: false, sessionCount: countSessionsOnDate(sessions, date) })
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    const isToday = date.toDateString() === today.toDateString()
    days.push({ number: i, date, isCurrentMonth: true, isToday, sessionCount: countSessionsOnDate(sessions, date) })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    days.push({ number: i, date, isCurrentMonth: false, isToday: false, sessionCount: countSessionsOnDate(sessions, date) })
  }

  return days
}
