import { useMemo, useState } from 'react'
import { api } from '../lib/api.js'

export default function AddVendorModal({ open, onClose, storeId, allVendors, existingVendorIds, onAdded }) {
  const [query, setQuery] = useState('')
  const [addingId, setAddingId] = useState(null)
  const [error, setError] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allVendors
      .filter((v) => !existingVendorIds.has(v.id))
      .filter((v) => {
        if (!q) return true
        return [v.company_name, v.contact_name, v.industry, v.email]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(q))
      })
  }, [allVendors, existingVendorIds, query])

  if (!open) return null

  async function handleAdd(vendorId) {
    setAddingId(vendorId)
    setError('')
    try {
      const row = await api.storeVendors.create({ store_id: storeId, vendor_id: vendorId })
      onAdded(row)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/40 p-4 pt-16">
      <div className="flex max-h-[75vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl">
        <div className="border-b border-ink-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink-900">Add vendor to board</h3>
            <button onClick={onClose} className="text-sm text-ink-400 hover:text-ink-700">
              Close
            </button>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, contact, or industry…"
            className="mt-3 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="p-4 text-center text-sm text-ink-400">No matching vendors.</p>
          )}
          {results.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-ink-50">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">{v.company_name || v.contact_name}</p>
                <p className="truncate text-xs text-ink-500">
                  {[v.industry, v.contact_name].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button
                onClick={() => handleAdd(v.id)}
                disabled={addingId === v.id}
                className="shrink-0 rounded-md bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-800 disabled:opacity-50"
              >
                {addingId === v.id ? 'Adding…' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
