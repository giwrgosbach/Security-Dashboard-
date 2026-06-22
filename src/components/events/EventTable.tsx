import type { SecurityEvent } from '../../types'
import EventRow from './EventRow'

interface EventTableProps {
    isLoading: boolean
    isError: boolean
  events: SecurityEvent[]
  sortField: string
  sortDir: string
  onSort: (field: string) => void // callback up to the page — table stays presentational
  onEdit: (event: SecurityEvent) => void // same idea: row asks the page to open the edit form
  onDelete: (id: string) => void // row asks the page to delete it
}

// One source of truth for the columns: label + the field key used for sorting.
const columns = [
  { key: 'severity', label: 'Severity' },
  { key: 'description', label: 'Description' },
  { key: 'source', label: 'Source' },
  { key: 'status', label: 'Status' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'timestamp', label: 'Time' },
]

export default function EventTable({ events, isLoading, isError, sortField, sortDir, onSort, onEdit, onDelete }: EventTableProps) {
  // Decide what goes INSIDE <tbody>, in priority order. Building it as a variable
  // here keeps the JSX below clean — no tangled nested ternary.
  let body
  if (isLoading) {
    body = (
      <tr>
        <td colSpan={7} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
          Loading events…
        </td>
      </tr>
    )
  } else if (isError) {
    body = (
      <tr>
        <td colSpan={7} className="px-4 py-6 text-center text-red-600 dark:text-red-400">
          Failed to load events. Please try again.
        </td>
      </tr>
    )
  } else if (events.length === 0) {
    body = (
      <tr>
        <td colSpan={7} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
          No events found
        </td>
      </tr>
    )
  } else {
    body = events.map((event) => <EventRow key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} />)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full table-auto text-sm text-slate-700 dark:text-slate-200">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="px-4 py-2 text-left">
                {/* header is a <button> → clicking sorts by this column (and is keyboard-accessible) */}
                <button
                  type="button"
                  onClick={() => onSort(col.key)}
                  className="inline-flex cursor-pointer items-center gap-1 font-medium hover:text-slate-900 dark:hover:text-slate-100"
                >
                  {col.label}
                  {/* arrow shows only on the active sort column */}
                  {sortField === col.key && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </button>
              </th>
            ))}
            {/* Actions column — not sortable, so a plain header (no sort button) */}
            <th scope="col" className="px-4 py-2 text-left font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  )
}
