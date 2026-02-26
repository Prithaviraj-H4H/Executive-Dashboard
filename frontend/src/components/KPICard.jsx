const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-blue-500',   border: 'border-blue-100 dark:border-blue-800/40' },
  green:  { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-500',  border: 'border-green-100 dark:border-green-800/40' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20',icon:'text-purple-500', border: 'border-purple-100 dark:border-purple-800/40' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20',icon:'text-orange-500', border: 'border-orange-100 dark:border-orange-800/40' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-900/20',   icon: 'text-teal-500',   border: 'border-teal-100 dark:border-teal-800/40' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20',icon:'text-indigo-500', border: 'border-indigo-100 dark:border-indigo-800/40' },
  rose:   { bg: 'bg-rose-50 dark:bg-rose-900/20',   icon: 'text-rose-500',   border: 'border-rose-100 dark:border-rose-800/40' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-500',  border: 'border-amber-100 dark:border-amber-800/40' },
}

function formatValue(value, prefix, suffix) {
  if (value === undefined || value === null) return '—'
  const num = Number(value)
  if (prefix === '$') {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }
  if (suffix === '%') return `${num.toFixed(1)}%`
  return num.toLocaleString()
}

export default function KPICard({ label, value, prefix, suffix, color = 'blue', loading }) {
  const palette = COLOR_MAP[color] || COLOR_MAP.blue

  return (
    <div className={`card p-4 border ${palette.border} transition-all`}>
      <p className="label mb-2">{label}</p>
      {loading || value === undefined ? (
        <div className="h-7 w-28 rounded bg-slate-200 dark:bg-dark-border animate-pulse" />
      ) : (
        <p className={`text-2xl font-bold ${palette.icon}`}>
          {formatValue(value, prefix, suffix)}
        </p>
      )}
    </div>
  )
}
