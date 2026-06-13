


// Types for the app
export type  Severity  = 'critical' | 'high' | 'medium' | 'low'
export type EventStatus = 'open' | 'investigating' | 'resolved'
export type Role = 'admin' | 'analyst' | 'viewer'



export interface User {
    id: string
    name: string
    email: string
    role: Role
}


export interface SecurityEvent {

    id : string
    timestamp : string 
    severity : Severity 
    description : string
    source : string
    status : EventStatus
    assignedTo?: string
}

