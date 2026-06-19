import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from 'recharts'
import type { EventStatus } from '../../types'
import { statusChartColors } from '../../lib/chartColors'

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
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
