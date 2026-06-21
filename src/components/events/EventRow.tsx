
import type { SecurityEvent } from '../../types'


import SeverityBadge from '../ui/SeverityBadge'

import StatusBadge from '../ui/StatusBadge'

import { useUIStore } from '../../stores/uiStore'
import { hasPermission } from '../../lib/permissions'


interface EventRowProps {


    event: SecurityEvent
    onEdit: (event: SecurityEvent) => void // call UP to the page to open the edit form
    onDelete: (id: string) => void // call UP to the page to delete this event
}


export default function EventRow({event, onEdit, onDelete}: EventRowProps) {

    const currentRole = useUIStore((s) => s.currentRole)

    return (

        <tr className = "border-b border-slate-200 hover:bg-slate-50">

            <td className = "px-4 py-3"> <SeverityBadge severity = {event.severity} /></td>
            <td className = "px-4 py-3"> {event.description}</td>
            <td className = "px-4 py-3"> {event.source}</td>
            <td className = "px-4 py-3"> <StatusBadge status = {event.status} /></td>
            <td className = "px-4 py-3"> {event.assignedTo ?? '-' }</td>
            <td className = "px-4 py-3"> {new Date (event.timestamp).toLocaleString()}</td>

            {/* Role-aware actions. hasPermission is the single gate; buttons are Day-7 placeholders. */}
            <td className="px-4 py-3">
              <div className="flex gap-2">
                {hasPermission(currentRole, 'edit') && (
                  <button
                    type="button"
                    onClick={() => onEdit(event)}
                    className="cursor-pointer rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                )}
                {hasPermission(currentRole, 'delete') && (
                  <button
                    type="button"
                    onClick={() => onDelete(event.id)}
                    className="cursor-pointer rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
                {/* viewer has neither → a dash so the cell isn't empty */}
                {!hasPermission(currentRole, 'edit') && !hasPermission(currentRole, 'delete') && (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>
            </td>

        </tr>


    )
}