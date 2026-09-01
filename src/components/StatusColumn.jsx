import { STATUS_META } from '../utils/status.js'
import VendorCard from './VendorCard.jsx'

export default function StatusColumn({ status, items, isAdmin, onOpen, onDelete, onDrop, dragOver, setDragOver }) {
  const meta = STATUS_META[status]
  const isBlockedCol = status === 'blocked'

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-lg border ${
        isBlockedCol ? 'border-red-200 bg-red-50/40' : 'border-ink-200 bg-ink-100/40'
      } ${dragOver ? 'ring-2 ring-ink-400' : ''}`}
      onDragOver={(e) => {
        if (!isAdmin) return
        e.preventDefault()
        setDragOver?.(status)
      }}
      onDragLeave={() => setDragOver?.(null)}
      onDrop={(e) => {
        if (!isAdmin) return
        e.preventDefault()
        const vendorId = e.dataTransfer.getData('text/plain')
        setDragOver?.(null)
        if (vendorId) onDrop(status, vendorId)
      }}
    >
      <div className="flex items-center gap-2 border-b border-ink-200 px-3 py-2.5">
        <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
        <h3 className={`text-sm font-semibold ${isBlockedCol ? 'text-red-700' : 'text-ink-800'}`}>
          {meta.label}
        </h3>
        <span className="ml-auto text-xs font-medium text-ink-400">{items.length}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2.5">
        {items.length === 0 && (
          <p className="px-1 py-3 text-center text-xs text-ink-400">No vendors</p>
        )}
        {items.map((sv) => (
          <VendorCard
            key={sv.id}
            sv={sv}
            isAdmin={isAdmin}
            onOpen={onOpen}
            onDelete={onDelete}
            draggable={isAdmin}
            onDragStart={(e, item) => {
              e.dataTransfer.setData('text/plain', item.id)
            }}
          />
        ))}
      </div>
    </div>
  )
}
