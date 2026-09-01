import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Overview from './pages/Overview.jsx'
import StoreBoard from './pages/StoreBoard.jsx'
import Rollup from './pages/Rollup.jsx'
import ManageVendors from './pages/ManageVendors.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/stores/:storeId" element={<StoreBoard />} />
          <Route path="/rollup" element={<Rollup />} />
          <Route path="/vendors" element={<ManageVendors />} />
        </Routes>
      </main>
    </div>
  )
}
