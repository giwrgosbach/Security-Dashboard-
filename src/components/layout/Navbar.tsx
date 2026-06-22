import { Show, SignInButton, UserButton } from "@clerk/react"
import { useUIStore } from "../../stores/uiStore"
import type { Role } from "../../types"

export default function Navbar() {
  const currentRole = useUIStore((s) => s.currentRole)
  const setRole = useUIStore((s) => s.setRole)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-900">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Security Operations Dashboard
      </span>

      <div className="flex items-center gap-3">

        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* DEMO role switcher — not a production pattern */}
        <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          Role
          <select
            value={currentRole}
            onChange={(e) => setRole(e.target.value as Role)}
            className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
        </label>

        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="cursor-pointer rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              Sign in
            </button>
          </SignInButton>
        </Show>

        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  )
}
