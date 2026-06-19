import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { SecurityEvent } from '../types'
import EventTable from '../components/events/EventTable'
import EventFilters from '../components/events/EventFilters'
import Pagination from '../components/ui/Pagination'
import { fetchEvents } from '../lib/api'

const PAGE_SIZE = 8

// Rank severities so "critical" sorts above "low" (a plain string sort would be alphabetical).
const severityRank: Record<SecurityEvent['severity'], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

// Returns a negative / zero / positive number — the shape Array.prototype.sort expects.
function compareEvents(a: SecurityEvent, b: SecurityEvent, field: string): number {
  switch (field) {
    case 'severity':
      return severityRank[a.severity] - severityRank[b.severity]
    case 'timestamp':
      return a.timestamp.localeCompare(b.timestamp) // ISO strings sort chronologically
    case 'assignedTo':
      return (a.assignedTo ?? '').localeCompare(b.assignedTo ?? '')
    case 'status':
      return a.status.localeCompare(b.status)
    case 'source':
      return a.source.localeCompare(b.source)
    default:
      return a.description.localeCompare(b.description)
  }
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // SERVER STATE: React Query owns the events list. queryKey ['events'] is the
  // cache identity; queryFn is how it fetches. data/isLoading/isError come for free.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

  // `data` is undefined until the fetch resolves — fall back to [] so the
  // filter/sort/paginate pipeline below never runs on undefined and crashes.
  const events = data ?? []

  // --- ALL view state read from the URL (shareable + refresh-safe) ---
  const search = (searchParams.get('search') ?? '').toLowerCase()
  const severity = searchParams.get('severity') ?? 'all'
  const status = searchParams.get('status') ?? 'all'
  const sortField = searchParams.get('sort') ?? 'timestamp'
  const sortDir = searchParams.get('dir') ?? 'desc'
  const page = Number(searchParams.get('page')) || 1 // garbage/absent → 1

  // 1) filter
  const filtered = events.filter(
    (event) =>
      `${event.description} ${event.source}`.toLowerCase().includes(search) &&
      (severity === 'all' || event.severity === severity) &&
      (status === 'all' || event.status === status),
  )

  // 2) sort — copy first! .sort() mutates the array in place, and mockEvents is shared.
  const sorted = [...filtered].sort((a, b) => {
    const result = compareEvents(a, b, sortField)
    return sortDir === 'asc' ? result : -result
  })

  // 3) paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(page, 1), totalPages) // clamp out-of-range pages
  const start = (safePage - 1) * PAGE_SIZE
  const paged = sorted.slice(start, start + PAGE_SIZE)

  // Clicking a header: same column → flip direction; new column → sort ascending.
  function handleSort(field: string) {
    const next = new URLSearchParams(searchParams)
    if (sortField === field) {
      next.set('dir', sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      next.set('sort', field)
      next.set('dir', 'asc')
    }
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
      <EventFilters />
      <EventTable 
        events={paged}
        isLoading={isLoading}
        isError={isError}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
      />
      <Pagination page={safePage} totalPages={totalPages} />
    </div>
  )
}
