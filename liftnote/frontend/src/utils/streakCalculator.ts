import type { Session } from '../types'

export function calculateCurrentStreak(sessions: Session[]): number {
  let streak = 0
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  while (true) {
    const hasSessionOnDate = sessions.some((s) => {
      const sd = new Date(s.started_at)
      sd.setHours(0, 0, 0, 0)
      return sd.getTime() === date.getTime() && s.status === 'completed'
    })
    if (!hasSessionOnDate) break
    streak++
    date.setDate(date.getDate() - 1)
  }
  return streak
}

export function buildWeekDayGrid(sessions: Session[]) {
  const letters = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    const isToday = day.getTime() === today.getTime()
    const hasSession = sessions.some((s) => {
      const sd = new Date(s.started_at)
      sd.setHours(0, 0, 0, 0)
      return sd.getTime() === day.getTime() && s.status === 'completed'
    })
    return { label: day.getDate().toString(), letter: letters[i], isToday, hasSession }
  })
}
