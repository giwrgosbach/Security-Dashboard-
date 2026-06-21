import { useEffect, useState } from 'react'
import type { ChangeEvent, SyntheticEvent } from 'react' // FormEvent is @deprecated in React 19 types
import type { SecurityEvent, Severity, EventStatus } from '../../types'
import type { NewEvent } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEvent, updateEvent } from '../../lib/api'
import { validateEventForm, sanitizeEventForm } from '../../lib/validation'
interface EventFormModalProps {
  /** Absent → "create" mode. Present → "edit" mode, pre-filled from this event. */
  event?: SecurityEvent
  /** Parent owns the open/closed state; the modal just calls this to ask to close. */
  onClose: () => void
}

// Build the form's starting values. We pass this as a LAZY initializer to useState
// below (useState(() => ...)) so it runs ONCE on mount, not on every render.
// - edit mode: copy the event's current values so the form is pre-filled.
// - create mode: sensible defaults. We stamp `timestamp` here, client-side — that's
//   the decision we made: a brand-new event's time is "now".
// Note: a controlled input can't take `undefined`, so the optional `assignedTo`
// falls back to '' (empty string = "nobody assigned yet").
function initialForm(event?: SecurityEvent): NewEvent {
  if (event) {
    return {
      timestamp: event.timestamp, // keep the original time when editing
      severity: event.severity,
      description: event.description,
      source: event.source,
      status: event.status,
      assignedTo: event.assignedTo ?? '',
    }
  }
  return {
    timestamp: new Date().toISOString(),
    severity: 'medium',
    description: '',
    source: '',
    status: 'open',
    assignedTo: '',
  }
}

export default function EventFormModal({ event, onClose }: EventFormModalProps) {
  const isEdit = Boolean(event)

  // ── FORM STATE: ONE object holds every field. The "spread-update" pattern
  //    (see the Source field below) changes one key while preserving the rest. ──
  const [form, setForm] = useState<NewEvent>(() => initialForm(event))

  // Validation errors to show the user. Empty = nothing wrong (or not yet submitted).
  const [errors, setErrors] = useState<string[]>([])


  const queryClient = useQueryClient()


  const createMutation = useMutation({

    mutationFn: (payload :NewEvent) => createEvent(payload),


    onSuccess: () => {



      queryClient.invalidateQueries({ queryKey: ['events'] })

      onClose() 
    },

    onError: (error) => {
      // Handle error — show toast notification etc
      console.error('Failed to create event:', error)
    }
  })

  const updateMutation = useMutation({
    // mutate() passes exactly ONE argument, but updateEvent needs id + payload —
    // so we bundle them into a single object here and destructure it back apart.
    mutationFn: ({ id, payload }: { id: string; payload: NewEvent }) => updateEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      onClose()
    },
    onError: (error) => {
      console.error('Failed to update event:', error)
    },
  })


  // a11y: Escape closes the modal. Add the listener on mount; the returned cleanup
  // function removes it on unmount — without that, every open would leak a listener.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault() // stop the browser's default full-page form reload

    // VALIDATE — reject bad input before anything leaves the client.
    const validationErrors = validateEventForm(form)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return // bail — don't send invalid data
    }
    setErrors([])

    // SANITIZE — strip dangerous markup before it's stored (defense in depth).
    const payload = sanitizeEventForm(form)

    // Branch on `event` (not the isEdit boolean): checking event directly lets
    // TypeScript NARROW the type, so event.id below needs no `!` assertion.
    if (event) {
      updateMutation.mutate({ id: event.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }


  // Either save in flight → disable the button. One flag covers both paths.
  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    // Backdrop: covers the screen, dims the page. Clicking it closes the modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      {/* Panel. stopPropagation so clicks INSIDE the form don't bubble up to the
          backdrop's onClose. role/aria-modal mark it as a dialog for screen readers. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit event' : 'Create event'}
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {isEdit ? 'Edit event' : 'New event'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Validation summary. role="alert" → screen readers announce it on appear. */}
          {errors.length > 0 && (
            <ul
              role="alert"
              className="list-inside list-disc space-y-0.5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          {/* ─────────────── MODEL FIELD: a controlled input ───────────────
              Copy this pattern for every other field.

              • value={form.source}  → the input shows whatever STATE says. State is
                the single source of truth, not the DOM. That's what "controlled"
                means — it's React's answer to Vue's v-model.
              • onChange → on every keystroke, update state, which re-renders the
                input with the new value. `...prev` keeps every OTHER field intact
                while we change just `source`.
              • The event is typed ChangeEvent<HTMLInputElement> — that's what makes
                `e.target.value` a typed string with autocomplete. */}
          <div>
            <label htmlFor="source" className="mb-1 block text-sm font-medium text-slate-700">
              Source
            </label>
            <input
              id="source"
              type="text"
              value={form.source}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, source: e.target.value }))
              }
              placeholder="e.g. firewall-eu-1"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <input
              id="description"
              type="text"
              value={form.description}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="e.g. Active exploitation attempt..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="severity" className="mb-1 block text-sm font-medium text-slate-700">
              Severity
            </label>
            <select
              id="severity"
              value={form.severity}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setForm((prev) => ({ ...prev, severity: e.target.value as Severity }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="EventStatus"
              value={form.status}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setForm((prev) => ({ ...prev, status: e.target.value as EventStatus }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
            </select>
          </div>


          <div>
            <label htmlFor="assignedTo" className="mb-1 block text-sm font-medium text-slate-700">
              Assigned To
            </label>
            <input
              id="assignedTo"
              type="text"
              value={form.assignedTo}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, assignedTo: e.target.value }))
              }
              placeholder="e.g. Mark Smith"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>


          {/* 👇 YOUR FIELDS GO HERE (step 3) — each binds to a key that ALREADY
              exists in `form` above:
                - description → <textarea>, same value/onChange shape
                - severity    → <select> over Severity   ('critical'|'high'|'medium'|'low')
                - status      → <select> over EventStatus ('open'|'investigating'|'resolved')
                - assignedTo  → <input type="text">, optional
              For a <select>, the change event is ChangeEvent<HTMLSelectElement>. */}

          {/* Footer actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              // 👉 step 4: disable while saving → disabled={mutation.isPending}
              disabled={isSaving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {isSaving ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
