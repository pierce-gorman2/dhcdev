import { useState } from 'react'
import { useAdmin } from '../context/AdminContext.jsx'

export default function AdminUnlockModal({ open, onClose }) {
  const { login } = useAdmin()
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(passphrase)
      setPassphrase('')
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-ink-900">Unlock editing</h3>
        <p className="mt-1 text-sm text-ink-600">Enter the admin passphrase to make changes.</p>
        <input
          autoFocus
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="mt-3 w-full rounded-md border border-ink-200 px-3 py-2 text-sm focus:border-ink-400 focus:outline-none"
          placeholder="Passphrase"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Unlock'}
          </button>
        </div>
      </form>
    </div>
  )
}
