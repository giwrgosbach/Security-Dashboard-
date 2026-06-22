
import type {SecurityEvent } from '../../types'



interface SeverityBadgeProps {
    severity: SecurityEvent['severity']
}

type SecurityStyle = {

    bg: string
    text: string
    dot: string
}

const config: Record<SecurityEvent['severity'], SecurityStyle> = {


    critical: { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-500' },
    high:     { bg: 'bg-orange-100 dark:bg-orange-500/15', text: 'text-orange-800 dark:text-orange-300', dot: 'bg-orange-500' },
    medium:   { bg: 'bg-yellow-100 dark:bg-yellow-500/15', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500' },
    low:      { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500' },

}



export default function SeverityBadge({severity} : SeverityBadgeProps) {
    
    const styles = config[severity]
    
    return (
        
        <span className = {`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${styles.bg} ${styles.text}`}>
            <span className = {`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            {severity.toUpperCase()}
        </span>
    )
}