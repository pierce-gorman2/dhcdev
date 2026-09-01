import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { useAdmin } from '../context/AdminContext.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const EMPTY_FORM = { company_name: '', contact_name: '', phone: '', email: '', industry: '' }

export default function ManageVendors() {
  const { isAdmin } = useAdmin()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    api.vendors
      .list()
      .then(setVendors)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return vendors
    return vendors.filter((v) =>
      [v.company_name, v.contact_name, v.industry, v.email].filter(Boolean).some((f) => f.toLowerCase().includes(q))
    )
  }, [vendors, query])

  function startEdit(v) {
    setEditingId(v.id)
    setForm({
      company_name: v.company_name || '',
      contact_name: v.contact_name || '',
      phone: v.phone || '',
      email: v.email || '',
      industry: v.industry || '',
    })
  }

  async function saveEdit() {
    const updated = await api.vendors.update(editingId, form)
    setVendors((prev) => prev.map((v) => (v.id === editingId ? updated : v)))
    setEditingId(null)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.company_name.trim() && !form.contact_name.trim()) return
    const created = await api.vendors.create(form)
    setVendors((prev) => [created, ...prev])
    setForm(EMPTY_FORM)
    setCreating(false)
  }

  async function handleDelete(id) {
    await api.vendors.remove(id)
    setVendors((prev) => prev.filter((v) => v.id !== id))
    setConfirmDeleteId(null)
  }

  if (loading) return <p className="text-sm text-ink-500">Loading vendors…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Manage vendors</h1>
          <p className="mt-1 text-sm text-ink-500">
            Master vendor list, shared across every store. Edits here update the master record everywhere it's used.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors…"
            className="w-56 rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
          />
          {isAdmin && (
            <button
              onClick={() => setCreating((c) => !c)}
              className="rounded-md bg-ink-900 px-3 py-2 text-sm font-medium text-white hover:bg-ink-800"
            >
              + New vendor
            </button>
          )}
        </div>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-ink-200 bg-white p-4 sm:grid-cols-5">
          <input
            value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            placeholder="Company name"
            className="rounded-md border border-ink-200 px-3 py-2 text-sm"
          />
          <input
            value={form.contact_name}
            onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
            placeholder="Contact name"
            className="rounded-md border border-ink-200 px-3 py-2 text-sm"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Phone"
            className="rounded-md border border-ink-200 px-3 py-2 text-sm"
          />
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            className="rounded-md border border-ink-200 px-3 py-2 text-sm"
          />
          <input
            value={form.industry}
            onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
            placeholder="Industry"
            className="rounded-md border border-ink-200 px-3 py-2 text-sm"
          />
          <div className="sm:col-span-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-md px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-800">
              Add vendor
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-ink-200 bg-white">
        <table className="min-w-full divide-y divide-ink-200 text-sm">
          <thead className="bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-2.5">Company</th>
              <th className="px-4 py-2.5">Contact</th>
              <th className="px-4 py-2.5">Phone</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Industry</th>
              {isAdmin && <th className="px-4 py-2.5" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filtered.map((v) =>
              editingId === v.id ? (
                <tr key={v.id} className="bg-ink-50">
                  <td className="px-4 py-2">
                    <input
                      value={form.company_name}
                      onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                      className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={form.contact_name}
                      onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                      className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={form.industry}
                      onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                      className="w-full rounded-md border border-ink-200 px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="text-xs text-ink-500 hover:text-ink-800">
                        Cancel
                      </button>
                      <button onClick={saveEdit} className="text-xs font-medium text-ink-900 hover:underline">
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={v.id} className="hover:bg-ink-50">
                  <td className="px-4 py-2 font-medium text-ink-900">{v.company_name || '—'}</td>
                  <td className="px-4 py-2 text-ink-600">{v.contact_name || '—'}</td>
                  <td className="px-4 py-2 text-ink-600">{v.phone || '—'}</td>
                  <td className="px-4 py-2 text-ink-600">{v.email || '—'}</td>
                  <td className="px-4 py-2 text-ink-600">{v.industry || '—'}</td>
                  {isAdmin && (
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => startEdit(v)} className="text-xs font-medium text-ink-600 hover:text-ink-900">
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(v.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete this vendor?"
        message="This removes the vendor from the master list and from every store's board. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}
