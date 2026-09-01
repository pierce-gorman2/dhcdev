import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAdmin } from '../context/AdminContext.jsx'
import { STATUS_ORDER, STORE_STATUS_META } from '../utils/status.js'
import { daysUntil, formatDate, countdownLabel } from '../utils/dates.js'
import StatusColumn from '../components/StatusColumn.jsx'
import AddVendorModal from '../components/AddVendorModal.jsx'
import VendorDetailModal from '../components/VendorDetailModal.jsx'
import UpdateLogFeed from '../components/UpdateLogFeed.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function StoreBoard() {
  const { storeId } = useParams()
  const { isAdmin } = useAdmin()

  const [store, setStore] = useState(null)
  const [storeVendors, setStoreVendors] = useState([])
  const [allVendors, setAllVendors] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [addOpen, setAddOpen] = useState(false)
  const [activeSv, setActiveSv] = useState(null)
  const [dragOverStatus, setDragOverStatus] = useState(null)
  const [editingStore, setEditingStore] = useState(false)
  const [storeForm, setStoreForm] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    load()
  }, [storeId])

  function load() {
    setLoading(true)
    Promise.all([
      api.stores.list(),
      api.storeVendors.list(storeId),
      api.vendors.list(),
      api.updateLog.list(storeId),
    ])
      .then(([stores, sv, vendors, log]) => {
        const found = stores.find((s) => s.id === storeId)
        setStore(found || null)
        setStoreVendors(sv)
        setAllVendors(vendors)
        setLogs(log)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(STATUS_ORDER.map((s) => [s, []]))
    for (const sv of storeVendors) {
      ;(map[sv.status] || (map[sv.status] = [])).push(sv)
    }
    return map
  }, [storeVendors])

  const existingVendorIds = useMemo(() => new Set(storeVendors.map((sv) => sv.vendor_id)), [storeVendors])

  async function moveVendor(svId, status) {
    setStoreVendors((prev) => prev.map((sv) => (sv.id === svId ? { ...sv, status } : sv)))
    try {
      await api.storeVendors.update(svId, { status })
    } catch (err) {
      setError(err.message)
      load()
    }
  }

  async function removeStoreVendor(sv) {
    setDeleteTarget(null)
    setStoreVendors((prev) => prev.filter((row) => row.id !== sv.id))
    try {
      await api.storeVendors.remove(sv.id)
    } catch (err) {
      setError(err.message)
      load()
    }
  }

  async function addLog(note, storeVendorId) {
    const row = await api.updateLog.create({ store_id: storeId, store_vendor_id: storeVendorId, note })
    setLogs((prev) => [row, ...prev])
  }

  function startEditStore() {
    setStoreForm({
      target_open_date: store.target_open_date || '',
      status: store.status,
      notes: store.notes || '',
    })
    setEditingStore(true)
  }

  async function saveStore() {
    const updated = await api.stores.update(storeId, storeForm)
    setStore(updated)
    setEditingStore(false)
  }

  if (loading) return <p className="text-sm text-ink-500">Loading board…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!store) return <p className="text-sm text-ink-500">Store not found.</p>

  const days = daysUntil(store.target_open_date)
  const storeStatus = STORE_STATUS_META[store.status]

  return (
    <div>
      <Link to="/" className="text-xs font-medium text-ink-500 hover:text-ink-800">
        ← All stores
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">{store.name}</h1>
          {store.address && <p className="text-sm text-ink-500">{store.address}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
              <span className={`h-1.5 w-1.5 rounded-full ${storeStatus.dot}`} />
              {storeStatus.label}
            </span>
            <span className="text-ink-600">{formatDate(store.target_open_date)}</span>
            <span className="font-medium text-ink-700">{countdownLabel(days)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={startEditStore}
              className="rounded-md border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100"
            >
              Edit store
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setAddOpen(true)}
              className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-800"
            >
              + Add vendor
            </button>
          )}
        </div>
      </div>

      {editingStore && (
        <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-ink-200 bg-white p-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-ink-500">Target open date</label>
            <input
              type="date"
              value={storeForm.target_open_date}
              onChange={(e) => setStoreForm((f) => ({ ...f, target_open_date: e.target.value }))}
              className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-ink-500">Status</label>
            <select
              value={storeForm.status}
              onChange={(e) => setStoreForm((f) => ({ ...f, status: e.target.value }))}
              className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
            >
              {Object.entries(STORE_STATUS_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-500">Store notes</label>
            <textarea
              value={storeForm.notes}
              onChange={(e) => setStoreForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button onClick={() => setEditingStore(false)} className="rounded-md px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100">
              Cancel
            </button>
            <button onClick={saveStore} className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-800">
              Save
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {STATUS_ORDER.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              items={byStatus[status] || []}
              isAdmin={isAdmin}
              onOpen={setActiveSv}
              onDelete={setDeleteTarget}
              dragOver={dragOverStatus === status}
              setDragOver={setDragOverStatus}
              onDrop={(dropStatus, vendorId) => moveVendor(vendorId, dropStatus)}
            />
          ))}
        </div>

        <UpdateLogFeed logs={logs} isAdmin={isAdmin} onAddLog={addLog} />
      </div>

      <AddVendorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        storeId={storeId}
        allVendors={allVendors}
        existingVendorIds={existingVendorIds}
        onAdded={(row) => {
          setStoreVendors((prev) => [row, ...prev])
          setAddOpen(false)
        }}
      />

      <VendorDetailModal
        sv={activeSv}
        isAdmin={isAdmin}
        logs={logs}
        onClose={() => setActiveSv(null)}
        onUpdated={(updated) => {
          setStoreVendors((prev) => prev.map((sv) => (sv.id === updated.id ? updated : sv)))
          setActiveSv(updated)
        }}
        onDeleted={(id) => {
          setStoreVendors((prev) => prev.filter((sv) => sv.id !== id))
          setActiveSv(null)
        }}
        onAddLog={addLog}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this vendor from the board?"
        message={
          deleteTarget &&
          `This only removes ${deleteTarget.company_name || 'this vendor'} from ${store.name}. The vendor stays in the master list and on any other store's board.`
        }
        confirmLabel="Remove"
        danger
        onConfirm={() => removeStoreVendor(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
