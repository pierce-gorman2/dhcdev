import { useMemo, useState } from 'react'
import {
  addMonths,
  buildMonthGrid,
  inRange,
  isoDate,
  isSameDay,
  monthLabel,
  toDateOnly,
} from '../utils/calendar.js'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function StoreCalendar({ store, milestones, isAdmin, onAdd, onToggle, onDelete }) {
  const initialMonth = store.construction_start_date
    ? toDateOnly(store.construction_start_date)
    : new Date()
  const [monthDate, setMonthDate] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1))
  const [addDate, setAddDate] = useState('')
  const [addTitle, setAddTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const startDate = store.construction_start_date ? toDateOnly(store.construction_start_date) : null
  const openDate = store.target_open_date ? toDateOnly(store.target_open_date) : null
  const today = new Date()

  const milestonesByDate = useMemo(() => {
    const map = {}
    for (const m of milestones) {
      map[m.date] = map[m.date] || []
      map[m.date].push(m)
    }
    return map
  }, [milestones])

  const weeks = useMemo(() => buildMonthGrid(monthDate), [monthDate])

  const upcoming = useMemo(
    () => [...milestones].sort((a, b) => a.date.localeCompare(b.date)),
    [milestones]
  )

  async function handleAdd(e) {
    e.preventDefault()
    if (!addDate || !addTitle.trim()) return
    setSubmitting(true)
    try {
      await onAdd(addTitle.trim(), addDate)
      setAddTitle('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-ink-600">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2 py-0.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Construction start
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2 py-0.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Target open
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthDate((m) => addMonths(m, -1))}
            className="rounded-md border border-ink-200 px-2 py-1 text-sm text-ink-600 hover:bg-ink-100"
          >
            ←
          </button>
          <span className="min-w-[9rem] text-center text-sm font-semibold text-ink-800">
            {monthLabel(monthDate)}
          </span>
          <button
            onClick={() => setMonthDate((m) => addMonths(m, 1))}
            className="rounded-md border border-ink-200 px-2 py-1 text-sm text-ink-600 hover:bg-ink-100"
          >
            →
          </button>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-end gap-2 rounded-md bg-ink-50 p-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-ink-500">Date</label>
            <input
              type="date"
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              className="mt-1 rounded-md border border-ink-200 px-2 py-1.5 text-sm"
              required
            />
          </div>
          <div className="flex-1 min-w-[10rem]">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-500">Milestone</label>
            <input
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              placeholder="e.g. Rough-in inspection"
              className="mt-1 w-full rounded-md border border-ink-200 px-2 py-1.5 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      <div className="mt-4 overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-7 gap-px overflow-hidden rounded-md border border-ink-200 bg-ink-200">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="bg-ink-50 px-2 py-1.5 text-center text-xs font-medium text-ink-500">
              {d}
            </div>
          ))}
          {weeks.flat().map((day, i) => {
            const inMonth = day.getMonth() === monthDate.getMonth()
            const dayMilestones = milestonesByDate[isoDate(day)] || []
            const isStart = startDate && isSameDay(day, startDate)
            const isOpen = openDate && isSameDay(day, openDate)
            const isToday = isSameDay(day, today)
            const withinRange = inRange(day, store.construction_start_date, store.target_open_date)

            return (
              <div
                key={i}
                className={`min-h-[6rem] bg-white p-1.5 text-xs ${!inMonth ? 'bg-ink-50/60 text-ink-300' : ''} ${
                  withinRange && inMonth ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                      isToday ? 'bg-ink-900 text-white' : 'text-ink-600'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {isStart && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Construction start" />}
                  {isOpen && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Target open" />}
                </div>

                <div className="mt-1 space-y-1">
                  {dayMilestones.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => isAdmin && onToggle(m)}
                      className={`block w-full truncate rounded px-1 py-0.5 text-left text-[11px] ${
                        m.completed
                          ? 'bg-emerald-50 text-emerald-700 line-through'
                          : 'bg-ink-100 text-ink-700'
                      } ${isAdmin ? 'cursor-pointer hover:opacity-80' : ''}`}
                      title={m.title}
                    >
                      {m.title}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 border-t border-ink-100 pt-3">
        <h3 className="text-sm font-semibold text-ink-900">All milestones</h3>
        {upcoming.length === 0 && <p className="mt-2 text-xs text-ink-400">No milestones added yet.</p>}
        <div className="mt-2 space-y-1.5">
          {upcoming.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-2 rounded-md bg-ink-50 px-3 py-1.5 text-sm"
            >
              <label className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!m.completed}
                  disabled={!isAdmin}
                  onChange={() => onToggle(m)}
                  className="h-4 w-4 rounded border-ink-300"
                />
                <span className={`truncate ${m.completed ? 'text-ink-400 line-through' : 'text-ink-700'}`}>
                  {m.title}
                </span>
              </label>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-ink-400">{toDateOnly(m.date).toLocaleDateString()}</span>
                {isAdmin && (
                  <button onClick={() => onDelete(m)} className="text-xs font-medium text-red-600 hover:text-red-700">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
