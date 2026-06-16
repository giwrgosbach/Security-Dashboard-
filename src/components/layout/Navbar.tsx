import { Show , SignInButton, UserButton } from "@clerk/react"
import { useUIStore } from "../../stores/uiStore"
import type { Role } from "../../types"

export default function Navbar() {
  // Selector form: this component re-renders only when currentRole / setRole change.
  const currentRole = useUIStore((s) => s.currentRole)
  const setRole = useUIStore((s) => s.setRole)

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <span className="text-sm font-medium text-slate-500">
        Security Operations Dashboard
      </span>

      <div className="flex items-center gap-3">
        {/* DEMO role switcher. In production the role comes from the IdP/JWT, not a dropdown —
            this only exists to show all three roles live. Frontend role = UX, never the security boundary. */}
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Role
          <select
            value={currentRole}
            onChange={(e) => setRole(e.target.value as Role)}
            className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
          >
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
        </label>

        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="cursor-pointer rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
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
