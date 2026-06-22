import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from 'recharts'
import type { EventStatus } from '../../types'
import { statusChartColors } from '../../lib/chartColors'
import { useUIStore } from '../../stores/uiStore'

// Same idea as SeverityDatum: a label (status) + a value (count).
// Exported so your useMemo can return exactly this shape.
export interface StatusDatum {
  status: EventStatus
  count: number
}

interface StatusDonutChartProps {
  data: StatusDatum[]
}

export default function StatusDonutChart({ data }: StatusDonutChartProps) {
  // Same reason as the bar chart: Recharts uses inline styles, so `dark:` classes
  // don't apply — read the theme and switch the Legend text + Tooltip colors. The
  // default Legend text is near-black, which would vanish on a dark card.
  const isDark = useUIStore((s) => s.theme === 'dark')
  const legendStyle = { fontSize: 12, color: isDark ? '#cbd5e1' : '#334155' } // slate-300 / slate-700
  const tooltipStyle = isDark
    ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }
    : undefined

  // Identical per-datum fill trick as the bar chart — Pie reads `fill` off each
  // entry, so no deprecated <Cell>. Color stays a chart concern.
  const coloredData = data.map((d) => ({
    ...d,
    fill: statusChartColors[d.status],
  }))

  return (
    // Same wrapper as the bar chart: charts have no intrinsic size, so
    // ResponsiveContainer measures the parent and we give it a height.
    <ResponsiveContainer width="100%" height={260}>
      {/* PieChart needs NO axes — a pie has no x/y. That's the big structural
          difference from BarChart. */}
      <PieChart>
        <Pie
          data={coloredData}
          dataKey="count"   // the NUMBER each slice is sized by (the angle)
          nameKey="status"  // the LABEL for each slice (shown in tooltip/legend)
          innerRadius={60}  // > 0 is what makes it a DONUT — it punches the hole
          outerRadius={90}
          paddingAngle={2}  // tiny gap between slices
        />
        {/* Tooltip on hover; Legend lists status → color. Both read nameKey. */}
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={legendStyle} />
      </PieChart>
    </ResponsiveContainer>
  )
}
