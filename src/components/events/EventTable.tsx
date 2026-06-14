
import type { SecurityEvent } from '../../types'

import EventRow from './EventRow'





interface EventTableProps {
    events: SecurityEvent[]
}



export default function EventTable({events}: EventTableProps) {


    return (

        <table className="table-auto w-full">
            <thead>
                <tr>
                    <th scope="col" className="px-4 py-2 text-left">Severity</th>
                    <th scope="col" className="px-4 py-2 text-left">Description</th>
                    <th scope="col" className="px-4 py-2 text-left">Source</th>
                    <th scope="col" className="px-4 py-2 text-left">Status</th>
                    <th scope="col" className="px-4 py-2 text-left">Assigned To</th>
                    <th scope="col" className="px-4 py-2 text-left">Timestamp</th>
                </tr>
            </thead>
            <tbody>
                {events.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                            No events found
                        </td>
                    </tr>
                ) : (
                events.map((event) => <EventRow key={event.id} event={event} />)
                )}
            </tbody>
        </table>

    )





}