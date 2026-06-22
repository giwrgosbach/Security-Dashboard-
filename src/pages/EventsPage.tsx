import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SecurityEvent } from '../types'
import EventTable from '../components/events/EventTable'
import EventFilters from '../components/events/EventFilters'
import Pagination from '../components/ui/Pagination'
import EventFormModal from '../components/events/EventFormModal'
import { useUIStore } from '../stores/uiStore'
import { hasPermission } from '../lib/permissions'
import { deleteEvent, fetchEvents } from '../lib/api'

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
  const currentRole = useUIStore((s) => s.currentRole) // drives the RBAC gate on "New event"

  // The form modal's state: is it open, and (if editing) WHICH event?
  // editingEvent === undefined → CREATE mode; a real event → EDIT mode (pre-filled).
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<SecurityEvent | undefined>(undefined)

  // Open in CREATE mode — nothing to edit.
  function openCreate() {
    setEditingEvent(undefined)
    setShowForm(true)
  }

  // Open in EDIT mode — the row calls this UP with its event (lifting state up),
  // we remember it, and the modal pre-fills from it.
  function openEdit(event: SecurityEvent) {
    setEditingEvent(event)
    setShowForm(true)
  }

  // SERVER STATE: React Query owns the events list. queryKey ['events'] is the
  // cache identity; queryFn is how it fetches. data/isLoading/isError come for free.
  const { data, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

  // Delete is a page-level mutation (rows stay presentational). Same write→read
  // loop as create/update: on success we invalidate ['events'] and the table refetches.
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    onError: (error) => console.error('Failed to delete event:', error),
  })

  // Destructive action → confirm first. window.confirm is fine here; a polished
  // product would use a styled dialog, but the UX principle (confirm before delete)
  // is what matters.
  function handleDelete(id: string) {
    if (window.confirm('Delete this event? This cannot be undone.')) {
      deleteMutation.mutate(id)
    }
  }

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Events</h1>
        {/* Only roles with 'create' permission see the trigger — same hasPermission
            gate as the row Edit/Delete buttons. Frontend RBAC is UX; the API re-checks. */}
        {hasPermission(currentRole, 'create') && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            + New event
          </button>
        )}
      </div>
      <EventFilters />
      <EventTable
        events={paged}
        isLoading={isLoading}
        isError={isError}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
      <Pagination page={safePage} totalPages={totalPages} />

      {/* Renders ONLY while showForm is true. `event` decides the mode:
          undefined → create, a real event → edit (pre-filled). */}
      {showForm && (
        <EventFormModal event={editingEvent} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
