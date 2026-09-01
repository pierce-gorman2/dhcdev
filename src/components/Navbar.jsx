import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'
import AdminUnlockModal from './AdminUnlockModal.jsx'

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100'
  }`

export default function Navbar() {
  const { isAdmin, logout, checked } = useAdmin()
  const [unlockOpen, setUnlockOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <NavLink to="/" className="mr-2 text-sm font-semibold tracking-tight text-ink-900">
          DHC Buildout Tracker
        </NavLink>
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/" end className={linkClass}>
            Overview
          </NavLink>
          <NavLink to="/rollup" className={linkClass}>
            Rollup
          </NavLink>
          <NavLink to="/vendors" className={linkClass}>
            Manage Vendors
          </NavLink>
        </nav>
        <div className="ml-auto">
          {checked && (
            isAdmin ? (
              <button
                onClick={logout}
                className="rounded-md border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100"
              >
                Editing unlocked — Lock
              </button>
            ) : (
              <button
                onClick={() => setUnlockOpen(true)}
                className="rounded-md border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100"
              >
                Unlock editing
              </button>
            )
          )}
        </div>
      </div>
      <AdminUnlockModal open={unlockOpen} onClose={() => setUnlockOpen(false)} />
    </header>
  )
}
