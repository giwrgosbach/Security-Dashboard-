import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUIStore } from './stores/uiStore'

import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const theme = useUIStore((s) => s.theme)

  // Sync the theme to <html> after every toggle. classList.toggle(name, force)
  // adds the class when force=true, removes it when false — one call, no branching.
  // The anti-flash script in index.html does this same operation at parse time so
  // the very first paint is already correct; this effect keeps it in sync afterward.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected: auth gate → app shell → pages.
            Two layers of <Outlet />: ProtectedRoute renders AppLayout, AppLayout renders the page. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />

            {/* Admin-only branch — role guard nested inside the auth guard */}
            <Route element={<AdminRoute />}>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
