import { NavLink } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'
import { hasPermission, type Permission } from '../../lib/permissions'

// Centralized link list. `requires` (optional) gates a link behind a permission.
const navItems: { to: string; label: string; requires?: Permission }[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/events', label: 'Events' },
  { to: '/settings', label: 'Settings', requires: 'manage_users' },
]

export default function Sidebar() {
  const currentRole = useUIStore((s) => s.currentRole)

  // Keep a link if it needs no permission, OR the current role has that permission.
  const visibleItems = navItems.filter(
    (item) => !item.requires || hasPermission(currentRole, item.requires),
  )

  return (
    <aside className="flex w-60 flex-col gap-1 bg-slate-900 p-4 text-slate-100">
      <span className="mb-4 px-3 text-lg font-semibold">SecOps</span>

      {visibleItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  )
}
