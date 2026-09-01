import { Link } from 'react-router-dom'
import { daysUntil, formatDate, countdownLabel } from '../utils/dates.js'
import { STATUS_META, STATUS_ORDER, STORE_STATUS_META } from '../utils/status.js'

export default function StoreCard({ store, vendorCounts }) {
  const days = daysUntil(store.target_open_date)
  const storeStatus = STORE_STATUS_META[store.status] || STORE_STATUS_META['pre-buildout']
  const total = STATUS_ORDER.reduce((sum, s) => sum + (vendorCounts[s] || 0), 0)
  const blocked = vendorCounts.blocked || 0

  return (
    <Link
      to={`/stores/${store.id}`}
      className={`block rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md ${
        blocked > 0 ? 'border-red-300' : 'border-ink-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-ink-900">{store.name}</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
          <span className={`h-1.5 w-1.5 rounded-full ${storeStatus.dot}`} />
          {storeStatus.label}
        </span>
      </div>
      {store.address && <p className="mt-0.5 text-sm text-ink-500">{store.address}</p>}

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-ink-600">{formatDate(store.target_open_date)}</span>
        <span
          className={`font-medium ${
            days !== null && days < 0
              ? 'text-red-600'
              : days !== null && days <= 14
              ? 'text-amber-600'
              : 'text-ink-700'
          }`}
        >
          {countdownLabel(days)}
        </span>
      </div>

      {total > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {STATUS_ORDER.filter((s) => vendorCounts[s]).map((s) => (
            <span
              key={s}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                s === 'blocked' ? 'bg-red-50 text-red-700' : 'bg-ink-100 text-ink-600'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dot}`} />
              {vendorCounts[s]} {STATUS_META[s].label}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-ink-400">No vendors added yet</p>
      )}
    </Link>
  )
}
