import type { Role } from '../types'   // reuse the Day-1 Role union — single source of truth

// the set of actions in the system
export type Permission = 'read' | 'create' | 'edit' | 'delete' | 'assign' | 'manage_users'

// Record<Role, …> forces every role to have an entry (your #10 exhaustiveness lesson)
const PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin:   ['read', 'create', 'edit', 'delete', 'assign', 'manage_users'],
  analyst: ['read', 'edit', 'assign'],
  viewer:  ['read'],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission)
}