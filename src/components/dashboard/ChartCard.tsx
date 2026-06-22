import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  children: ReactNode
}

// Plain presentational shell so every chart sits in a consistent white card.
// Reused by the severity bar chart now, and the status donut in step 5.
export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h2>
      {children}
    </div>
  )
}
