import type { EventStatus } from '../../types'

interface StatusBadgeProps {
    status: EventStatus
}
type BadgeStyle = {bg: string; text: string}

const statusStyles: Record<EventStatus,BadgeStyle> = {

        open:          { bg: 'bg-blue-100',   text: 'text-blue-800' },   // new, needs triage
        investigating: { bg: 'bg-violet-100', text: 'text-violet-800' }, // in progress  (amber if you prefer)
        resolved:      { bg: 'bg-green-100',  text: 'text-green-600' },  // done, de-emphasized
}




export default function StatusBadge({status} : StatusBadgeProps) {


    const styles = statusStyles[status]

    return (
        
        <span className = {`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${styles.bg} ${styles.text }`}>
            {status.toUpperCase()}
        </span>
    )
}
