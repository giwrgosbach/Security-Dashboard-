import { useMemo } from 'react'
import StatCard from '../components/dashboard/StatCard'
import { useQuery } from '@tanstack/react-query'
import type { Severity, EventStatus } from '../types'
import { fetchEvents } from '../lib/api'
import ChartCard from '../components/dashboard/ChartCard'
import SeverityBarChart from '../components/dashboard/SeverityBarChart'
import StatusDonutChart from '../components/dashboard/StatusDonutChart'

export default function DashboardPage() {
  // 1) GET — useQuery produces `data` (served from the ['events'] cache).
  const { data, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

  // 2) DERIVE — runs AFTER `data` exists, because it's below useQuery.
  const stats = useMemo(() => {
    const events = data ?? [] // fallback lives inside the memo
    const total = events.length

    // Seed every key to 0 so a 0-count category still shows (bar at 0 / card "0").
    const bySeverity: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    const byStatus: Record<EventStatus, number> = { open: 0, investigating: 0, resolved: 0 }

    // One pass, both tallies. event.severity / event.status ARE the keys.
    for (const event of events) {
      bySeverity[event.severity] += 1
      byStatus[event.status] += 1
    }

    // Reshape the severity tally into the {severity, count}[] the chart wants.
    const severityData = Object.entries(bySeverity).map(
      ([severity, count]) => ({ severity: severity as Severity, count }),
    )

    const statusData = Object.entries(byStatus).map(
        ([status,count]) => ({ status: status as EventStatus, count }),
    )


    return { total, bySeverity, byStatus, severityData, statusData } // ← severityData is RETURNED now
  }, [data]) // depends on the stable cache reference

  // 3) GUARDS — after every hook (Rules of Hooks).
  if (isLoading) return <p className="text-slate-500 dark:text-slate-400">Loading dashboard…</p>
  if (isError) return <p className="text-red-600 dark:text-red-400">Failed to load events. Please try again.</p>

  // 4) RENDER — read the derived stats.
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>

      {/* STAT CARDS ROW — your <StatCard> components go here (step 4).
          You already have the numbers: stats.total, stats.bySeverity, stats.byStatus. */}
          

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* StatCards here */}

          <StatCard label="Total events" value={stats.total} />
          <StatCard label="Critical events" value={stats.bySeverity.critical} tone = "critical" />
          <StatCard label = "Open" value={stats.byStatus.open} />
          <StatCard label = "Resolved" value={stats.byStatus.resolved}  tone = "success"/>



      </div>

      {/* CHARTS GRID — bar chart now; the status donut joins it in step 5. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Events by severity">
          <SeverityBarChart data={stats.severityData} />
        </ChartCard>

        <ChartCard title="Events by status">
            <StatusDonutChart data = {stats.statusData} />

        </ChartCard>
      </div>
    </div>
  )
}
