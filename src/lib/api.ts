import type { SecurityEvent } from '../types'

const API_BASE = import.meta.env.VITE_API_URL

export async function fetchEvents(): Promise<SecurityEvent[]> {
  const res = await fetch(`${API_BASE}`)
  if (!res.ok) throw new Error(`Failed to load events: ${res.status}`) // ← fetch won't throw on 404/500; you must
  return res.json()
}