import DOMPurify from 'dompurify'
import type { NewEvent } from './api'

// VALIDATION — "is this input allowed?" A pure function: it reads the form and
// returns a list of human-readable errors (empty = valid). It does NOT mutate the
// input or sanitize — that's a separate job below, so each stays testable in isolation.
export function validateEventForm(form: NewEvent): string[] {
  const errors: string[] = []

  if (form.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters.')
  }
  if (form.source.trim().length === 0) {
    errors.push('Source is required.')
  }

  return errors
}

// SANITIZATION — "make this input safe." Returns a NEW object (never mutates the
// form) with dangerous markup stripped from the free-text fields. ALLOWED_TAGS: []
// means "these are plain text — strip ALL HTML", so a payload like
// <img src=x onerror=...> can never round-trip through our system at rest.
//
// Why bother when React already escapes {description} on render? Defense in depth:
// the stored value may later be consumed by something that does NOT auto-escape —
// an email, a PDF export, a different client, a stray dangerouslySetInnerHTML. The
// real boundary is still the server, which must validate + sanitize again.
export function sanitizeEventForm(form: NewEvent): NewEvent {
  const clean = (value: string) =>
    DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })

  return {
    ...form,
    description: clean(form.description.trim()),
    source: clean(form.source.trim()),
    assignedTo: form.assignedTo ? clean(form.assignedTo.trim()) : form.assignedTo,
  }
}
