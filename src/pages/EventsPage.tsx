

import {mockEvents} from "../lib/mockEvents"

import EventTable from "../components/events/EventTable"




export default function EventsPage() {

    return (
        
        <EventTable events={mockEvents} />
    )
}