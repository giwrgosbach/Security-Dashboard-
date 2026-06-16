import { useAuth } from '@clerk/react'
import { Navigate, Outlet } from 'react-router-dom'

// A layout-route guard with no UI of its own. Three states:
export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth()

  // ① Auth still resolving — don't decide yet (prevents the "auth flash" / wrongful redirect on refresh).
  if (!isLoaded) {
    return <div className="p-6 text-slate-500">Loading…</div>
  }

  // ② Resolved and NOT signed in — bounce to the login page.
  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  // ③ Signed in — render the protected children (AppLayout → pages).
  return <Outlet />
}
