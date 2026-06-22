import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { Severity } from '../../types'
import { severityChartColors } from '../../lib/chartColors'
import { useUIStore } from '../../stores/uiStore'

// The shape each bar needs: a label (severity) + a value (count).
// Exported so your useMemo in DashboardPage can return exactly this type.
export interface SeverityDatum {
  severity: Severity
  count: number
}

interface SeverityBarChartProps {
  data: SeverityDatum[]
}

// Presentational only: it receives already-derived data and just draws it.
// (Same rule as EventTable — the page computes, the component renders.)
export default function SeverityBarChart({ data }: SeverityBarChartProps) {
  // Recharts renders SVG + a portal tooltip with INLINE styles — Tailwind `dark:`
  // classes can't reach it. So the chart reads the theme from the store directly
  // and switches color VALUES. (The bar colors themselves are semantic — red =
  // critical — so they stay identical in both themes.)
  const isDark = useUIStore((s) => s.theme === 'dark')
  const gridStroke = isDark ? '#334155' : '#e2e8f0' // slate-700 / slate-200
  const tickFill = isDark ? '#94a3b8' : '#64748b' // slate-400 / slate-500
  const tooltipStyle = isDark
    ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }
    : undefined

  // Attach each bar's color to its datum. Recharts reads a `fill` field straight
  // off the data entry, so we don't need the (now-deprecated) <Cell> child.
  // Color stays a CHART concern — your derived `data` keeps its clean {severity,count} shape.
  const coloredData = data.map((d) => ({
    ...d,
    fill: severityChartColors[d.severity],
  }))

  return (
    // Recharts charts have NO intrinsic size — they expand to fill their parent.
    // ResponsiveContainer measures the parent and redraws on resize. It needs a
    // height: an explicit number here (or a parent with a fixed height). width
    // "100%" = fill the card it sits in.
    <ResponsiveContainer width="100%" height={260}>
      {/* BarChart is the coordinate system. Everything inside is declared as JSX
          children rather than set in an options object — that's the Recharts model:
          declarative charts, composed from components. */}
      <BarChart data={coloredData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        {/* faint horizontal guide lines; vertical={false} drops the busy vertical set */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
        {/* dataKey ties an axis/series to a FIELD NAME on each datum object */}
        <XAxis
          dataKey="severity"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: tickFill }}
        />
        <YAxis
          allowDecimals={false} // counts are whole numbers
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: tickFill }}
          width={32}
        />
        <Tooltip
          cursor={{ fill: isDark ? 'rgba(148,163,184,0.1)' : 'rgba(15,23,42,0.04)' }}
          contentStyle={tooltipStyle}
        />
        {/* One <Bar> = one series (the 'count' field). radius rounds the top corners.
            Each bar's color comes from the `fill` field we mapped onto coloredData above. */}
        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
