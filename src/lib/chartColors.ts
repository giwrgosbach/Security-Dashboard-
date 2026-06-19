import type { Severity, EventStatus } from '../types'

// WHY this file exists (and isn't just imported from the badges):
// The badge components store *Tailwind class names* ('bg-red-100'), which only
// mean anything as a DOM element's className. Recharts renders SVG, and an SVG
// `fill` needs a *real* color value (hex / CSS color) — it can't read a class name.
// Same palette as the badges, different representation. Values mirror Tailwind's
// *-500 shades so charts and badges stay visually in sync.

export const severityChartColors: Record<Severity, string> = {
  critical: '#ef4444', // red-500
  high:     '#f97316', // orange-500
  medium:   '#eab308', // yellow-500
  low:      '#22c55e', // green-500
}

export const statusChartColors: Record<EventStatus, string> = {
  open:          '#3b82f6', // blue-500
  investigating: '#8b5cf6', // violet-500
  resolved:      '#22c55e', // green-500
}
