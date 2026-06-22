import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '../types'

export type Theme = 'light' | 'dark'

interface UIStore {
  currentRole: Role
  theme: Theme
  setRole: (role: Role) => void
  toggleTheme: () => void
}

// create<UIStore>()(...) — the extra () is required when composing middleware
// in TypeScript. Zustand uses curried type inference: the first call fixes the
// store's type; the second call receives the middleware-wrapped creator. Without
// the extra (), TS can't thread the generic through the middleware chain.
export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      currentRole: 'admin',

      // Smart initializer: on first visit (nothing in localStorage yet) we read the
      // OS preference. persist will override this with the stored value on return
      // visits — so the user's explicit choice always wins over the OS default.
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',

      setRole: (role) => set({ currentRole: role }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    // 'ui-store' is the localStorage key. The anti-flash script in index.html reads
    // this EXACT key — keep them in sync or flash prevention silently breaks.
    { name: 'ui-store' }
  )
)
