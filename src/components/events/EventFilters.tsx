import { useSearchParams } from 'react-router-dom'

// Filter values live in the URL (?search=&severity=&status=), NOT in React state.
// This component WRITES to the URL; EventsPage READS from it — they share state via the URL.
export default function EventFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  // READ current values from the URL, with sensible defaults.
  const search = searchParams.get('search') ?? ''
  const severity = searchParams.get('severity') ?? 'all'
  const status = searchParams.get('status') ?? 'all'

  // WRITE one param. Drop it from the URL when it's the default ('' / 'all') to keep the URL clean.
  // replace:true → don't push a new history entry per keystroke (back button shouldn't step through every letter).
  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === 'all') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Controlled input: its value comes FROM the URL; onChange writes BACK to the URL. */}
      <input
        type="text"
        value={search}
        onChange={(e) => updateParam('search', e.target.value)}
        placeholder="Search description or source…"
        className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <select
        value={severity}
        onChange={(e) => updateParam('severity', e.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="all">All severities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={status}
        onChange={(e) => updateParam('status', e.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="all">All statuses</option>
        <option value="open">Open</option>
        <option value="investigating">Investigating</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>
  )
}
