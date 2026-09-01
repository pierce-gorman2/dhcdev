import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'
import { STATUS_META, effectiveContact } from '../utils/status.js'

export default function Rollup() {
  const [stores, setStores] = useState([])
  const [storeVendors, setStoreVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [onlyBlocked, setOnlyBlocked] = useState(false)

  useEffect(() => {
    Promise.all([api.stores.list(), api.storeVendors.list()])
      .then(([s, sv]) => {
        setStores(s)
        setStoreVendors(sv)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const byStore = useMemo(() => {
    const map = {}
    for (const sv of storeVendors) {
      if (onlyBlocked && sv.status !== 'blocked') continue
      map[sv.store_id] = map[sv.store_id] || []
      map[sv.store_id].push(sv)
    }
    return map
  }, [storeVendors, onlyBlocked])

  const blockedCount = storeVendors.filter((sv) => sv.status === 'blocked').length

  if (loading) return <p className="text-sm text-ink-500">Loading rollup…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Cross-market rollup</h1>
          <p className="mt-1 text-sm text-ink-500">Every store's board at a glance.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-ink-600">
          <input
            type="checkbox"
            checked={onlyBlocked}
            onChange={(e) => setOnlyBlocked(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300"
          />
          Blocked only ({blockedCount})
        </label>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {stores.map((store) => {
          const items = byStore[store.id] || []
          return (
            <div key={store.id} className="rounded-lg border border-ink-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <Link to={`/stores/${store.id}`} className="text-sm font-semibold text-ink-900 hover:underline">
                  {store.name}
                </Link>
                <span className="text-xs text-ink-400">{items.length} shown</span>
              </div>

              {items.length === 0 ? (
                <p className="mt-3 text-xs text-ink-400">
                  {onlyBlocked ? 'Nothing blocked here.' : 'No vendors added yet.'}
                </p>
              ) : (
                <div className="mt-3 space-y-1.5">
                  {items.map((sv) => {
                    const { contactName } = effectiveContact(sv)
                    const meta = STATUS_META[sv.status]
                    return (
                      <div
                        key={sv.id}
                        className={`flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm ${
                          sv.status === 'blocked' ? 'bg-red-50' : 'bg-ink-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-800">{sv.company_name}</p>
                          {contactName && <p className="truncate text-xs text-ink-500">{contactName}</p>}
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-ink-600">
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
