

type Tone = 'default' | 'critical' | 'warning' | 'success'
interface StatCardProps {

    label :string
    value: number
    tone?: Tone
}





const toneStyles: Record<Tone, string> = {
  default:  'text-slate-900 dark:text-slate-100',
  critical: 'text-red-600',
  warning:  'text-orange-600',
  success:  'text-green-600',
}



export default function StatCard({label, value, tone = "default"} : StatCardProps) {

    return (


    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className = "text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>

      <p className = {`text -3xl font-semibold mt-1 ${toneStyles[tone]}`}>{value}</p>
    </div>



    )

}

