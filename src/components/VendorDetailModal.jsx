import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { STATUS_META, STATUS_ORDER } from '../utils/status.js'
import { formatDateTime } from '../utils/dates.js'
import ConfirmDialog from './ConfirmDialog.jsx'

export default function VendorDetailModal({ sv, isAdmin, logs, onClose, onUpdated, onDeleted, onAddLog }) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [logNote, setLogNote] = useState('')

  useEffect(() => {
    if (sv) {
      setForm({
        status: sv.status,
        notes: sv.notes || '',
        contact_name_override: sv.contact_name_override || '',
        phone_override: sv.phone_override || '',
        email_override: sv.email_override || '',
      })
      setError('')
    }
  }, [sv])

  if (!sv || !form) return null

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const updated = await api.storeVendors.update(sv.id, form)
      onUpdated(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(status) {
    setForm((f) => ({ ...f, status }))
    try {
      const updated = await api.storeVendors.update(sv.id, { status })
      onUpdated(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete() {
    try {
      await api.storeVendors.remove(sv.id)
      onDeleted(sv.id)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAddLog(e) {
    e.preventDefault()
    if (!logNote.trim()) return
    await onAddLog(logNote.trim(), sv.id)
    setLogNote('')
  }

  const vendorLogs = logs.filter((l) => l.store_vendor_id === sv.id)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/40 p-4 pt-10">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-ink-200 p-4">
          <div>
            <h3 className="text-base font-semibold text-ink-900">{sv.company_name || sv.vendor_contact_name}</h3>
            {sv.industry && <p className="text-xs text-ink-500">{sv.industry}</p>}
          </div>
          <button onClick={onClose} className="text-sm text-ink-400 hover:text-ink-700">
            Close
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-ink-500">Status</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  disabled={!isAdmin}
                  onClick={() => handleStatusChange(s)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    form.status === s
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 text-ink-600 hover:bg-ink-100'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${form.status === s ? 'bg-white' : STATUS_META[s].dot}`} />
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </div>

          <fieldset disabled={!isAdmin} className="space-y-3 disabled:opacity-60">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-ink-500">
                Contact name {sv.vendor_contact_name && `(master: ${sv.vendor_contact_name})`}
              </label>
              <input
                value={form.contact_name_override}
                onChange={(e) => setForm((f) => ({ ...f, contact_name_override: e.target.value }))}
                placeholder={sv.vendor_contact_name || 'Uses master vendor contact'}
                className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-ink-500">Phone override</label>
                <input
                  value={form.phone_override}
                  onChange={(e) => setForm((f) => ({ ...f, phone_override: e.target.value }))}
                  placeholder={sv.vendor_phone || '—'}
                  className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-ink-500">Email override</label>
                <input
                  value={form.email_override}
                  onChange={(e) => setForm((f) => ({ ...f, email_override: e.target.value }))}
                  placeholder={sv.vendor_email || '—'}
                  className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-ink-500">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
              />
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {isAdmin && (
            <div className="flex items-center justify-between border-t border-ink-100 pt-3">
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove from this store
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-ink-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}

          <div className="border-t border-ink-100 pt-3">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-500">Update log</label>
            <div className="mt-2 space-y-2">
              {vendorLogs.length === 0 && <p className="text-xs text-ink-400">No notes logged yet.</p>}
              {vendorLogs.map((l) => (
                <div key={l.id} className="rounded-md bg-ink-50 px-3 py-2 text-sm text-ink-700">
                  <p>{l.note}</p>
                  <p className="mt-1 text-xs text-ink-400">{formatDateTime(l.created_at)}</p>
                </div>
              ))}
            </div>
            {isAdmin && (
              <form onSubmit={handleAddLog} className="mt-2 flex gap-2">
                <input
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder="e.g. left message, waiting on callback"
                  className="flex-1 rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-md bg-ink-100 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-200"
                >
                  Log
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Remove this vendor from the board?"
        message={`This only removes ${sv.company_name || 'this vendor'} from this store. The vendor stays in the master list and on any other store's board.`}
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          setConfirmDelete(false)
          handleDelete()
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
