// One-off dev script: replace mockapi's junk auto-generated rows with our clean,
// correctly-typed events. Run with:  node scripts/seed-mockapi.mjs
// Safe to delete after use. Not app code — just a data-seeding utility.

const BASE = 'https://6a329b1fc6ca2aee4385506d.mockapi.io'

// Same events as src/lib/mockEvents.ts, minus `id` (mockapi assigns its own on POST).
const events = [
  { timestamp: '2026-06-13T08:42:00Z', severity: 'critical', description: 'Multiple failed root login attempts from a single host', source: 'Auth Service', status: 'open' },
  { timestamp: '2026-06-13T09:15:00Z', severity: 'high', description: 'Port scan detected across the 10.0.0.0/24 subnet', source: 'IDS', status: 'investigating', assignedTo: 'a.petrova' },
  { timestamp: '2026-06-12T14:03:00Z', severity: 'medium', description: 'SQL injection attempt blocked on /api/login', source: 'WAF', status: 'resolved', assignedTo: 'j.silva' },
  { timestamp: '2026-06-10T07:30:00Z', severity: 'low', description: 'TLS certificate for mail.internal expires in 14 days', source: 'Monitoring', status: 'open' },
  { timestamp: '2026-06-13T11:58:00Z', severity: 'critical', description: 'Ransomware signature detected on endpoint WK-204', source: 'EDR', status: 'investigating', assignedTo: 'm.okafor' },
  { timestamp: '2026-06-13T06:20:00Z', severity: 'high', description: 'Large outbound data transfer to unrecognized domain', source: 'DLP', status: 'open' },
  { timestamp: '2026-06-12T22:47:00Z', severity: 'medium', description: 'Impossible-travel login: NL then BR within 10 minutes', source: 'Auth Service', status: 'investigating', assignedTo: 'a.petrova' },
  { timestamp: '2026-06-11T16:10:00Z', severity: 'low', description: 'Blocked inbound connection on deprecated port 23 (Telnet)', source: 'Firewall', status: 'resolved' },
  { timestamp: '2026-06-13T10:05:00Z', severity: 'high', description: 'Unexpected privilege escalation to the Domain Admins group', source: 'Audit', status: 'open' },
  { timestamp: '2026-06-13T12:30:00Z', severity: 'critical', description: 'Active exploitation attempt against CVE-2026-1337', source: 'WAF', status: 'open', assignedTo: 'm.okafor' },
  { timestamp: '2026-06-09T09:00:00Z', severity: 'medium', description: 'Outdated antivirus definitions on 12 hosts', source: 'Endpoint', status: 'resolved' },
  { timestamp: '2026-06-12T19:25:00Z', severity: 'low', description: 'Concurrent VPN sessions from the same account', source: 'VPN', status: 'investigating' },
  { timestamp: '2026-06-13T07:48:00Z', severity: 'high', description: 'Phishing campaign targeting the finance department', source: 'Email Gateway', status: 'open', assignedTo: 'j.silva' },
  { timestamp: '2026-06-11T13:15:00Z', severity: 'medium', description: 'Cloud IAM access key unused for 90 days still active', source: 'Cloud IAM', status: 'open' },
]

// 1) Delete every existing row (the junk mockapi auto-generated).
const existing = await fetch(`${BASE}/events`).then((r) => r.json())
console.log(`Deleting ${existing.length} existing rows…`)
for (const row of existing) {
  await fetch(`${BASE}/events/${row.id}`, { method: 'DELETE' })
}

// 2) POST our clean events.
console.log(`Seeding ${events.length} clean events…`)
for (const event of events) {
  const res = await fetch(`${BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status} ${res.statusText}`)
}

console.log('Done ✅  Reload the mockapi /events URL to verify.')
