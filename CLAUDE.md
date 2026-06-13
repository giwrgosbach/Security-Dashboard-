# CLAUDE.md — Security Dashboard Project

## Primary Goal
This project exists to prepare me for a Senior Frontend Developer 
interview at a cybersecurity company. Every feature should be 
built with that interview in mind.

When helping me:
- Explain WHY before showing code
- Don't just fix things — help me understand the fix
- Point out when something is production best practice vs overkill
- If I'm about to do something wrong, tell me before I build it
- Keep the interview context in mind — every pattern we use 
  should be something I can explain and defend out loud


# Coding Context — Security Dashboard Project
> Feed this to any AI model (Claude, Copilot, etc.) at the start of every session.
> Last updated: June 2026

---

## Who I Am

- Full stack developer, 7 years experience (PHP, JavaScript, SQL)
- Solid understanding of how web apps work end to end
- Know Vue and Svelte — understand component thinking and reactivity
- Seen React hooks explained but haven't built real React apps yet
- TypeScript: know JavaScript deeply, TypeScript is new — learning it properly
- Goal: build a production-quality React/TypeScript security dashboard in 15 days
- Then apply for a Senior Frontend Developer role at a cybersecurity company

## How I Learn Best

- I want to understand WHY, not just what to type
- Explain the concept briefly, then show me the code
- When I make mistakes, explain what went wrong conceptually
- Don't just fix my code — help me understand the fix
- I get the high from making broken things work — let me struggle a little before jumping in
- Real world context matters to me: tell me when a pattern is used in production vs when it's overkill

---

## The Project

**Name:** Security Operations Dashboard
**Purpose:** A UI that security analysts use to monitor, filter, assign, and resolve security events. Think simplified SIEM (Security Information and Event Management) tool.
**Live reference tools for inspiration:** Splunk, IBM QRadar, Microsoft Sentinel (simplified version)

### What It Does
- Login/authentication with role-based access
- Home dashboard with stats and charts
- Events table with search, filter, sort, pagination
- Event detail page
- Role-based UI (admin / analyst / viewer see different things)
- Create/edit events (admin only)
- Settings page (admin only)

### Why This Project
This directly mirrors what the target company builds — cybersecurity platforms for ESA, NATO, and the European Commission. Every feature maps to a real job requirement.

---

## Tech Stack — Locked In

```
React 18          Component framework
TypeScript        Strict mode on — no 'any' types allowed
Vite              Build tool (fast, modern, replaces Webpack)
Tailwind CSS      Styling (utility classes, no CSS files)
React Router v6   Navigation and routing
Zustand           UI/client state management
React Query       Server/API state management (TanStack Query v5)
Clerk             Authentication (OAuth2, JWT, session handling)
mockapi.io        Fake REST API (real HTTP calls, free)
Recharts          Charts and data visualization
DOMPurify         Input sanitization (XSS prevention)
Vercel            Deployment (free, automatic from GitHub)
```

### Installation (run once on Day 1)
```bash
npm create vite@latest security-dashboard -- --template react-ts
cd security-dashboard

# Core dependencies
npm install react-router-dom
npm install zustand
npm install @tanstack/react-query
npm install @clerk/clerk-react
npm install recharts
npm install dompurify @types/dompurify

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## TypeScript Rules for This Project

### Rule 1 — No 'any'. Ever.
```typescript
// ❌ WRONG — defeats the purpose of TypeScript
const handleEvent = (event: any) => { ... }

// ✅ RIGHT — define the shape properly
const handleEvent = (event: SecurityEvent) => { ... }
```

### Rule 2 — Define interfaces for everything
```typescript
// Define once, use everywhere
interface SecurityEvent {
  id: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'  // union types, not string
  description: string
  source: string
  status: 'open' | 'resolved' | 'investigating'
  assignedTo?: string  // optional field — the ? means it might not exist
}

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'analyst' | 'viewer'
}
```

### Rule 3 — Type your component props
```typescript
// ❌ WRONG
function EventBadge({ severity }) { ... }

// ✅ RIGHT
interface EventBadgeProps {
  severity: SecurityEvent['severity']  // reuse the type from your interface
  size?: 'sm' | 'md' | 'lg'           // optional with default
}

function EventBadge({ severity, size = 'md' }: EventBadgeProps) { ... }
```

### Rule 4 — Generic types for reusable components
```typescript
// A table that works with any data shape
interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
}
```

### Rule 5 — Type errors are your friends
When TypeScript shows a red underline — READ the error. Don't just add `as any` to silence it. The error is telling you something real about your data shape.

---

## React Patterns — The Important Ones

### useState — local component state
```typescript
// Simple value
const [isLoading, setIsLoading] = useState(false)

// Object state — always spread to update
const [filters, setFilters] = useState({
  severity: 'all',
  status: 'all',
  search: ''
})

// Update one field without losing others
setFilters(prev => ({ ...prev, severity: 'high' }))
//          ↑ prev is the current state — always use this pattern for objects
```

### useEffect — side effects (use sparingly)
```typescript
// Runs after every render — usually wrong
useEffect(() => { fetchData() })

// Runs once on mount — sometimes right
useEffect(() => { fetchData() }, [])

// Runs when dependency changes — most common correct usage
useEffect(() => {
  fetchData(userId)
}, [userId])  // only re-runs when userId changes

// REAL WORLD TIP: If you're using useEffect to fetch data — use React Query instead.
// useEffect for data fetching is the old way. React Query is the modern standard.
```

### useCallback — memoize functions
```typescript
// Without useCallback — new function created every render
// causes child components to re-render unnecessarily
const handleDelete = (id: string) => deleteEvent(id)

// With useCallback — same function reference between renders
const handleDelete = useCallback((id: string) => {
  deleteEvent(id)
}, [deleteEvent])  // only recreates if deleteEvent changes

// REAL WORLD TIP: Don't add useCallback everywhere. Only when:
// 1. The function is passed as a prop to a child component
// 2. The function is a dependency in a useEffect
// Premature optimization makes code harder to read.
```

### useMemo — memoize expensive calculations
```typescript
// Recalculates on every render — bad if events is large
const criticalEvents = events.filter(e => e.severity === 'critical')

// Only recalculates when events changes
const criticalEvents = useMemo(
  () => events.filter(e => e.severity === 'critical'),
  [events]
)

// REAL WORLD TIP: Same as useCallback — don't add everywhere.
// Use when: the calculation is genuinely expensive OR
// the result is a dependency of another hook.
```

---

## React Query Patterns

### Why React Query instead of useEffect + fetch
```typescript
// The old way — you write ALL of this yourself:
const [data, setData] = useState(null)
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  setIsLoading(true)
  fetch('/api/events')
    .then(res => res.json())
    .then(data => { setData(data); setIsLoading(false) })
    .catch(err => { setError(err); setIsLoading(false) })
}, [])

// The React Query way — all of that above, plus caching,
// background refetching, and deduplication, in 5 lines:
const { data, isLoading, error } = useQuery({
  queryKey: ['events'],
  queryFn: () => fetch('/api/events').then(res => res.json())
})
```

### Query keys — the most important concept in React Query
```typescript
// Query key is the cache identifier — think of it like a cache name
useQuery({ queryKey: ['events'] })              // all events
useQuery({ queryKey: ['events', eventId] })     // one specific event
useQuery({ queryKey: ['events', { severity: 'high' }] })  // filtered events

// REAL WORLD TIP: When you invalidate a query key, React Query
// automatically refetches. This is how you update UI after a mutation.
const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ['events'] })
// ↑ This triggers a refetch of all 'events' queries automatically
```

### Mutations — for creating/updating/deleting
```typescript
const createEvent = useMutation({
  mutationFn: (newEvent: Omit<SecurityEvent, 'id'>) =>
    fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(newEvent)
    }).then(res => res.json()),

  onSuccess: () => {
    // Invalidate events list so it refetches with the new event
    queryClient.invalidateQueries({ queryKey: ['events'] })
  },

  onError: (error) => {
    // Handle error — show toast notification etc
    console.error('Failed to create event:', error)
  }
})

// Call it like this
createEvent.mutate({ severity: 'high', description: '...', ... })
```

---

## Zustand Patterns

### Why Zustand for some state, React Query for other state
```typescript
// React Query handles: anything that comes from a server/API
// Zustand handles: UI state that doesn't come from a server

// Zustand store examples:
// - Current user role (for RBAC)
// - Dark mode preference
// - Sidebar open/closed
// - Which modal is open
// - Active filters (if you want them to persist across pages)

// NOT Zustand:
// - List of events (that's server state → React Query)
// - User profile data (server state → React Query)
```

### Store definition pattern
```typescript
import { create } from 'zustand'

interface UIStore {
  // State
  sidebarOpen: boolean
  darkMode: boolean
  currentRole: 'admin' | 'analyst' | 'viewer'

  // Actions — always defined inside the store
  toggleSidebar: () => void
  toggleDarkMode: () => void
  setRole: (role: UIStore['currentRole']) => void
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  sidebarOpen: true,
  darkMode: false,
  currentRole: 'admin',

  // Actions — set() updates the state
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
  setRole: (role) => set({ currentRole: role }),
}))

// Use it in any component — no providers needed
function Navbar() {
  const { darkMode, toggleDarkMode } = useUIStore()
  return <button onClick={toggleDarkMode}>{darkMode ? '☀️' : '🌙'}</button>
}
```

---

## React Router v6 Patterns

### Route structure for this project
```typescript
// main.tsx or App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — wrapped in layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />

            {/* Admin only */}
            <Route element={<AdminRoute />}>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### Protected route pattern
```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

// Redirects to login if not authenticated
function ProtectedRoute() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return <LoadingSpinner />
  if (!isSignedIn) return <Navigate to="/login" replace />

  return <Outlet />  // renders the child route
}

// Redirects to dashboard if wrong role
function AdminRoute() {
  const { currentRole } = useUIStore()

  if (currentRole !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
```

### Navigation and params
```typescript
import { useNavigate, useParams } from 'react-router-dom'

// Navigate programmatically
const navigate = useNavigate()
navigate('/events/123')
navigate(-1)  // go back

// Read URL params
function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: event } = useQuery({
    queryKey: ['events', id],
    queryFn: () => fetchEvent(id!)
  })
}
```

---

## RBAC Pattern — Role Based Access Control

### The core concept
```typescript
// Define what each role can do — single source of truth
const PERMISSIONS = {
  admin:   ['read', 'create', 'edit', 'delete', 'assign', 'manage_users'],
  analyst: ['read', 'edit', 'assign'],
  viewer:  ['read'],
} as const

type Permission = 'read' | 'create' | 'edit' | 'delete' | 'assign' | 'manage_users'
type Role = keyof typeof PERMISSIONS

function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission)
}
```

### Using it in components
```typescript
function EventActions({ event }: { event: SecurityEvent }) {
  const { currentRole } = useUIStore()

  return (
    <div className="flex gap-2">
      {/* Everyone can view */}
      <ViewButton event={event} />

      {/* Analysts and admins can assign */}
      {hasPermission(currentRole, 'assign') && (
        <AssignButton event={event} />
      )}

      {/* Only admins can delete */}
      {hasPermission(currentRole, 'delete') && (
        <DeleteButton event={event} />
      )}
    </div>
  )
}

// REAL WORLD TIP: RBAC on the frontend is ALWAYS just UX.
// The real security check MUST happen on the backend too.
// Never trust frontend role checks for actual security.
// The UI hides buttons — the API rejects unauthorized requests.
// Both are needed. Frontend = UX. Backend = security.
```

---

## Security Patterns — Know These for the Interview

### XSS Prevention
```typescript
import DOMPurify from 'dompurify'

// ❌ NEVER do this — XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ If you must render HTML — sanitize first
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ✅ Best option — just use text content, React escapes it automatically
<div>{userInput}</div>
// React automatically escapes special characters — this is safe
```

### Input validation pattern
```typescript
// Validate before sending to API
function validateEventForm(data: Partial<SecurityEvent>): string[] {
  const errors: string[] = []

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters')
  }

  if (!data.severity) {
    errors.push('Severity is required')
  }

  // Sanitize string inputs
  if (data.description) {
    data.description = DOMPurify.sanitize(data.description.trim())
  }

  return errors
}
```

### Auth token handling
```typescript
// ❌ WRONG — localStorage is accessible by JavaScript = XSS risk
localStorage.setItem('auth_token', token)

// ✅ RIGHT — Clerk handles this with httpOnly cookies automatically
// You never touch the token directly — Clerk manages it
// This is one reason to use an auth library vs rolling your own

// When making API calls — Clerk gives you a getToken() function
const { getToken } = useAuth()
const token = await getToken()

fetch('/api/events', {
  headers: { Authorization: `Bearer ${token}` }
})
```

### CSRF awareness
```typescript
// CSRF matters for cookie-based auth
// With JWT Bearer tokens in headers — CSRF is not an issue
// because malicious sites can't set custom headers cross-origin

// REAL WORLD TIP: Clerk uses httpOnly cookies + CSRF tokens internally.
// You don't manage this — but know WHY it matters when asked.
```

---

## Tailwind CSS Patterns

### The mental model
```typescript
// Tailwind = inline styles but with a design system
// Instead of: style={{ display: 'flex', gap: '8px', padding: '16px' }}
// You write: className="flex gap-2 p-4"

// Common patterns you'll use constantly:
"flex items-center justify-between"  // horizontal layout
"flex flex-col gap-4"                // vertical layout with spacing
"grid grid-cols-4 gap-4"            // 4 column grid
"w-full max-w-4xl mx-auto"          // centered container
"rounded-lg border border-gray-200 p-4"  // card
"text-sm font-medium text-gray-600"  // label text
"bg-red-100 text-red-800 rounded-full px-2 py-1"  // badge
```

### Severity badge component — build this early, use it everywhere
```typescript
const severityConfig = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  high:     { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  medium:   { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  low:      { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
}

function SeverityBadge({ severity }: { severity: SecurityEvent['severity'] }) {
  const config = severityConfig[severity]

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {severity.toUpperCase()}
    </span>
  )
}
```

### Dark mode with Tailwind
```typescript
// tailwind.config.js — enable class-based dark mode
module.exports = {
  darkMode: 'class',  // add 'dark' class to <html> to activate
  // ...
}

// Toggle dark mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark')
}

// Use in components
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

---

## Component Architecture — How to Think About It

### The rule: one component, one job
```
AppLayout          — page shell, sidebar, navbar
├── Sidebar        — navigation links, role-aware menu items
├── Navbar         — user info, dark mode toggle, logout
└── <Outlet />     — current page content

EventsPage         — page-level data fetching and state
├── EventFilters   — search, severity filter, status filter
├── EventTable     — renders the table
│   └── EventRow   — single row (knows nothing about filters)
│       └── SeverityBadge  — just a badge, no logic
│       └── StatusBadge    — just a badge, no logic
│       └── EventActions   — buttons, role-aware
└── Pagination     — prev/next, page info
```

### Where to fetch data — always at the page level
```typescript
// ✅ RIGHT — fetch at the page level, pass down as props
function EventsPage() {
  const { data: events, isLoading } = useQuery({ queryKey: ['events'], ... })
  return <EventTable events={events} isLoading={isLoading} />
}

function EventTable({ events, isLoading }: EventTableProps) {
  // Just renders — no fetching
}

// ❌ WRONG — fetching deep in the tree
function EventRow({ eventId }: { eventId: string }) {
  const { data } = useQuery({ queryKey: ['events', eventId], ... })
  // Now every row makes its own API call — N+1 problem
}
```

---

## Folder Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Generic: Button, Badge, Table, Modal
│   └── events/          # Feature-specific: EventRow, EventFilters
├── pages/               # One file per route
│   ├── DashboardPage.tsx
│   ├── EventsPage.tsx
│   ├── EventDetailPage.tsx
│   └── SettingsPage.tsx
├── stores/              # Zustand stores
│   └── uiStore.ts
├── hooks/               # Custom hooks
│   └── useEventFilters.ts
├── types/               # TypeScript interfaces
│   └── index.ts         # All interfaces exported from one file
├── lib/                 # Utilities
│   ├── api.ts           # API functions (fetch wrappers)
│   └── permissions.ts   # RBAC helpers
└── main.tsx
```

---

## The 15-Day Roadmap

### Week 1 — Build the Core
| Day | Focus | Key deliverable |
|-----|-------|----------------|
| 1 (Sat) | Setup + shell + TypeScript interfaces | Running app, routing, folder structure |
| 2 (Sun) | Events table + filtering + sorting | Working data table with hardcoded data |
| 3 (Mon) | Clerk authentication | Login, logout, protected routes |
| 4 (Tue) | Role-based UI (RBAC) | Admin/analyst/viewer render differently |
| 5 (Wed) | React Query + real API | mockapi.io, loading/error states |
| 6 (Thu) | Dashboard home page | Stats cards + Recharts charts |
| 7 (Fri) | Forms + mutations + input security | Create/edit events, DOMPurify |

### Week 2 — Polish + Apply
| Day | Focus | Key deliverable |
|-----|-------|----------------|
| 8 (Sat) | Polish + dark mode + accessibility | App looks genuinely good |
| 9 (Sun) | Deploy + README | Live Vercel URL, clean GitHub repo |
| 10 (Mon) | Security knowledge | OWASP Top 10, OAuth2, interview answers |
| 11 (Tue) | CV rewrite | Every requirement mapped |
| 12 (Wed) | Cover letter + LinkedIn | Full application package |
| 13 (Thu) | Interview prep | Live coding, system design, personal narrative |
| 14 (Fri) | Buffer + final review | Fix anything, tighten everything |
| 15 (Sat) | Submit | Application sent, friend notified |

---

## Real World Tips — Read These

**On TypeScript errors:**
When you see a red underline — hover over it, read the full error. TypeScript errors are specific and helpful once you learn to read them. Google the error message if you don't understand it. Don't suppress errors with `// @ts-ignore` unless you have a very good reason.

**On component size:**
If a component file gets longer than ~150 lines, it's trying to do too much. Split it. The split point is usually obvious — find the part that could stand alone.

**On premature optimization:**
Don't add useMemo and useCallback everywhere "just in case." Write the simple version first. Optimize when you can measure a real performance problem. Premature optimization makes code harder to read and maintain.

**On styling decisions:**
Pick a Tailwind pattern and stick to it. Consistency matters more than perfection. A card component that looks the same everywhere is better than 5 slightly different card styles.

**On state management:**
If state is only used in one component — useState.
If state is shared between a parent and its children — lift it to the parent, pass as props.
If state is needed across unrelated components — Zustand.
If state comes from the server — React Query.
Don't reach for Zustand until you genuinely need it.

**On committing:**
Commit after every feature works. Small commits with clear messages. "Add events table with filtering" not "stuff." GitHub history tells a story — make it readable.

**On asking for help:**
When stuck, try for 15-20 minutes alone first. The struggle is where learning happens. After 20 minutes — ask. Describe what you tried, what you expected, what actually happened. This is also how you ask questions in a real team.

**On reading documentation:**
react.dev is excellent — use it. TanStack Query docs are excellent — use them. Clerk docs are clear — use them. Don't rely only on AI or tutorials. Knowing how to read official docs is a senior developer skill.

---

## Interview Preparation Notes

### Questions you will definitely be asked:

**"Walk me through your project architecture."**
Start with the problem it solves. Then: component structure → state management choices → API integration → auth implementation → security considerations. Have the live URL open. Show, don't just tell.

**"Why Zustand over Redux?"**
"For this project's scale, Redux would be significant boilerplate with minimal benefit. Zustand gives me a simple store with no providers, no reducers, no action creators. If the app grew to need Redux DevTools time-travel debugging or very complex state interactions, I'd reconsider."

**"How do you handle authentication?"**
"I use Clerk which implements OAuth2/OIDC under the hood. Tokens are stored in httpOnly cookies — not localStorage — to prevent XSS token theft. Every protected route checks authentication state. API calls include the Bearer token in the Authorization header. On the UI layer, role-based rendering ensures users only see what they're permitted to see — but I understand that real security enforcement happens server-side."

**"What security considerations did you implement?"**
"Four main ones: input sanitization with DOMPurify to prevent XSS, auth-aware routing to prevent unauthorized page access, role-based UI rendering for RBAC, and secure token handling via Clerk's httpOnly cookie approach. I also avoided dangerouslySetInnerHTML throughout the codebase."

**"Tell me about your background."**
"Seven years of full stack development, most recently in healthcare IT — a regulated environment where data sensitivity and access control are non-negotiable. I built the JS and PHP logic for systems handling patient data, so the security mindset isn't new to me — it's how I think about web development. I've been deliberately transitioning toward frontend engineering for security platforms because the intersection of UX and security architecture is genuinely interesting to me."

---

## Daily Session Checklist

Before starting each session:
- [ ] Pull latest from GitHub
- [ ] `npm run dev` — make sure it still runs
- [ ] Know what you're building today (check roadmap)
- [ ] Have the relevant docs open (react.dev, TanStack, Clerk)

After each session:
- [ ] Everything you built works
- [ ] No TypeScript errors in the console
- [ ] Commit with a clear message
- [ ] Push to GitHub

---

*Build something real. Understand what you build. Ship it.*
