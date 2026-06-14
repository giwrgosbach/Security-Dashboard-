
import type { SecurityEvent } from '../../types'


import SeverityBadge from '../ui/SeverityBadge'

import StatusBadge from '../ui/StatusBadge' 



interface EventRowProps {


    event: SecurityEvent
}


export default function EventRow({event}: EventRowProps) {

    return (

        <tr className = "border-b border-slate-200 hover:bg-slate-50">

            <td className = "px-4 py-3"> <SeverityBadge severity = {event.severity} /></td>
            <td className = "px-4 py-3"> {event.description}</td>
            <td className = "px-4 py-3"> {event.source}</td>
            <td className = "px-4 py-3"> <StatusBadge status = {event.status} /></td>
            <td className = "px-4 py-3"> {event.assignedTo ?? '-' }</td>
            <td className = "px-4 py-3"> {new Date (event.timestamp).toLocaleString()}</td>

        </tr>


    )
}