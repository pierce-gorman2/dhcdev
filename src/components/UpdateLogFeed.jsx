import { useState } from 'react'
import { formatDateTime } from '../utils/dates.js'

export default function UpdateLogFeed({ logs, isAdmin, onAddLog }) {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!note.trim()) return
    setSubmitting(true)
    try {
      await onAddLog(note.trim(), null)
      setNote('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-ink-900">Update log</h3>
      <p className="mt-0.5 text-xs text-ink-500">General notes for this store, not tied to one vendor.</p>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a quick note…"
            className="flex-1 rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {logs.length === 0 && <p className="text-xs text-ink-400">No updates logged yet.</p>}
        {logs.map((l) => (
          <div key={l.id} className="rounded-md bg-ink-50 px-3 py-2 text-sm text-ink-700">
            <p>{l.note}</p>
            <p className="mt-1 text-xs text-ink-400">{formatDateTime(l.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
