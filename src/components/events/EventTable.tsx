import type { SecurityEvent } from '../../types'
import EventRow from './EventRow'

interface EventTableProps {
  events: SecurityEvent[]
  sortField: string
  sortDir: string
  onSort: (field: string) => void // callback up to the page — table stays presentational
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

export default function EventTable({ events, sortField, sortDir, onSort }: EventTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full table-auto text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="px-4 py-2 text-left">
                {/* header is a <button> → clicking sorts by this column (and is keyboard-accessible) */}
                <button
                  type="button"
                  onClick={() => onSort(col.key)}
                  className="inline-flex cursor-pointer items-center gap-1 font-medium hover:text-slate-900"
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
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                No events found
              </td>
            </tr>
          ) : (
            events.map((event) => <EventRow key={event.id} event={event} />)
          )}
        </tbody>
      </table>
    </div>
  )
}
