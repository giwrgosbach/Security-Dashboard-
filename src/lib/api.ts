import type { SecurityEvent } from '../types'

const API_BASE = import.meta.env.VITE_API_URL

export async function fetchEvents(): Promise<SecurityEvent[]> {
  const res = await fetch(`${API_BASE}`)
  if (!res.ok) throw new Error(`Failed to load events: ${res.status}`) // ← fetch won't throw on 404/500; you must
  return res.json()
}

// The CREATE payload is "a SecurityEvent without an id" — the server assigns the id.
// Omit<T, K> = take type T, drop key K. This is the TS utility-type lesson: we
// describe the request body precisely, reusing SecurityEvent instead of redefining
// every field by hand. If the shape changes, this type updates automatically.
export type NewEvent = Omit<SecurityEvent, 'id'>

// POST = create. Two things you MUST do when sending JSON over fetch:
//   1. JSON.stringify the body (fetch won't serialise an object for you), and
//   2. set Content-Type: application/json so the server parses the body as JSON.
// Same gotcha as fetchEvents: fetch doesn't throw on 4xx/5xx, so we check res.ok.
export async function createEvent(payload: NewEvent): Promise<SecurityEvent> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to create event: ${res.status}`)
  return res.json() // mockapi echoes back the created row — now WITH its server id
}

// PUT = full replace of the row at /:id. The id goes in the URL, the new field
// values go in the body. (PATCH would merge a Partial instead; PUT replaces.)
export async function updateEvent(id: string, payload: NewEvent): Promise<SecurityEvent> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to update event: ${res.status}`)
  return res.json()
}

// DELETE removes the row at /:id. No body to send, and nothing useful comes back,
// so we don't parse JSON — we just confirm it worked (res.ok) and resolve void.
export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Failed to delete event: ${res.status}`)
}