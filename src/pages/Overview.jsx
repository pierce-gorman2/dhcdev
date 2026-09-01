import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import StoreCard from '../components/StoreCard.jsx'

export default function Overview() {
  const [stores, setStores] = useState([])
  const [storeVendors, setStoreVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.stores.list(), api.storeVendors.list()])
      .then(([s, sv]) => {
        setStores(s)
        setStoreVendors(sv)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const countsByStore = useMemo(() => {
    const map = {}
    for (const sv of storeVendors) {
      map[sv.store_id] = map[sv.store_id] || {}
      map[sv.store_id][sv.status] = (map[sv.store_id][sv.status] || 0) + 1
    }
    return map
  }, [storeVendors])

  if (loading) return <p className="text-sm text-ink-500">Loading stores…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Stores</h1>
      <p className="mt-1 text-sm text-ink-500">Buildout progress across every market.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} vendorCounts={countsByStore[store.id] || {}} />
        ))}
      </div>
    </div>
  )
}
