import { NavLink } from 'react-router-dom'

// Centralized link list — add a route here and it shows up in the sidebar.
// On Day 4 we'll filter this by the user's role (RBAC).
const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/events', label: 'Events' },
  { to: '/settings', label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="flex w-60 flex-col gap-1 bg-slate-900 p-4 text-slate-100">
      <span className="mb-4 px-3 text-lg font-semibold">SecOps</span>

      {navItems.map((item) => (
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
