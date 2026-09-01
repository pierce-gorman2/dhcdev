import { effectiveContact } from '../utils/status.js'

export default function VendorCard({ sv, isAdmin, onOpen, onDelete, draggable, onDragStart }) {
  const { contactName, phone, email } = effectiveContact(sv)
  const isBlocked = sv.status === 'blocked'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(sv)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(sv)}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, sv)}
      className={`group relative w-full rounded-md border bg-white p-3 text-left shadow-sm transition hover:shadow-md ${
        isBlocked ? 'border-red-300 border-l-4 border-l-red-500' : 'border-ink-200'
      } ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
    >
      {isAdmin && (
        <button
          type="button"
          aria-label="Remove vendor from this store"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(sv)
          }}
          className="absolute right-1.5 top-1.5 rounded-full p-1 text-ink-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100"
        >
          ×
        </button>
      )}

      <p className="pr-4 text-sm font-semibold text-ink-900">
        {sv.company_name || contactName || 'Unnamed vendor'}
      </p>
      {sv.industry && <p className="mt-0.5 text-xs text-ink-500">{sv.industry}</p>}

      <div className="mt-2 space-y-0.5 text-xs text-ink-600">
        {contactName && <p>{contactName}</p>}
        {phone && <p className="text-ink-500">{phone}</p>}
        {email && <p className="truncate text-ink-500">{email}</p>}
      </div>

      {sv.notes && <p className="mt-2 line-clamp-2 text-xs italic text-ink-500">{sv.notes}</p>}
    </div>
  )
}
