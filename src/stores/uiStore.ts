import { create } from 'zustand'
import type { Role } from '../types' // reuse the single source of truth for roles

// The store's shape: the state it holds + the actions that change it.
// (Actions live INSIDE the store — that's the Zustand convention.)
interface UIStore {
  currentRole: Role // which role the UI is rendering as right now
  setRole: (role: Role) => void // swap the active role (drives the demo role-switcher)
}

// create<UIStore>() returns a hook you call in any component — no <Provider> needed.
// The callback receives `set` (the updater) and returns the initial state + actions.
export const useUIStore = create<UIStore>((set) => ({
  currentRole: 'admin', // start as admin so the full UI is visible by default

  // set({ ... }) shallow-merges: we pass only the key we're changing,
  // every other field in the store is preserved automatically.
  setRole: (role) => set({ currentRole: role }),
}))
