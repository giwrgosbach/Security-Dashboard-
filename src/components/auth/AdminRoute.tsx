import { Navigate, Outlet } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'

// Role guard. It sits INSIDE ProtectedRoute, so auth is already settled here —
// this only decides "is the signed-in user an admin?".
// Reminder: this is UX. The /settings API must reject non-admins on its own.
export default function AdminRoute() {
  const currentRole = useUIStore((s) => s.currentRole)

  // Wrong role → bounce to a page everyone can see. `replace` so Back doesn't trap them.
  if (currentRole !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet /> // admin → render the nested admin pages
}
