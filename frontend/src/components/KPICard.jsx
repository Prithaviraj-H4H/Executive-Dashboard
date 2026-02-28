const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/20',   icon: 'text-blue-400',   value: 'text-blue-400'   },
  green:  { bg: 'bg-green-500/20',  icon: 'text-green-400',  value: 'text-green-400'  },
  purple: { bg: 'bg-purple-500/20', icon: 'text-purple-400', value: 'text-purple-400' },
  orange: { bg: 'bg-orange-500/20', icon: 'text-orange-400', value: 'text-orange-400' },
  teal:   { bg: 'bg-teal-500/20',   icon: 'text-teal-400',   value: 'text-teal-400'   },
  indigo: { bg: 'bg-indigo-500/20', icon: 'text-indigo-400', value: 'text-indigo-400' },
  rose:   { bg: 'bg-rose-500/20',   icon: 'text-rose-400',   value: 'text-rose-400'   },
  amber:  { bg: 'bg-amber-500/20',  icon: 'text-amber-400',  value: 'text-amber-400'  },
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

function Sparkline({ data, colorClass }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const W = 100
  const H = 28

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 3) - 1.5
    return [x.toFixed(2), y.toFixed(2)]
  })

  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const first = pts[0]
  const last = pts[pts.length - 1]
  const area = `M${first[0]},${first[1]} ${pts.slice(1).map(([x, y]) => `L${x},${y}`).join(' ')} L${last[0]},${H} L${first[0]},${H} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`w-full ${colorClass}`}
      style={{ height: '28px' }}
    >
      <path d={area} fill="currentColor" opacity="0.12" />
      <polyline
        points={polyline}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  )
}

export default function KPICard({ label, value, prefix, suffix, color = 'blue', loading, icon: Icon, sparkline }) {
  const palette = COLOR_MAP[color] || COLOR_MAP.blue

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-dark-muted mb-1.5">
            {label}
          </p>
          {loading || value === undefined ? (
            <div className="h-7 w-28 rounded bg-slate-200 dark:bg-dark-border animate-pulse" />
          ) : (
            <p className={`text-2xl font-bold ${palette.value}`}>
              {formatValue(value, prefix, suffix)}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`shrink-0 p-3 rounded-xl ${palette.bg}`}>
            <Icon size={22} className={palette.icon} />
          </div>
        )}
      </div>

      {/* Sparkline */}
      <div className="px-0 pb-0 mt-auto">
        <Sparkline data={sparkline} colorClass={palette.value} />
      </div>
    </div>
  )
}
