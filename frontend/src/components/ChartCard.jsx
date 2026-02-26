import { useCallback, useMemo, useState } from 'react'
import Plot from 'react-plotly.js'
import { Download } from 'lucide-react'
import Plotly from 'plotly.js'
import { useTheme } from '../context/ThemeContext'
import { useDashboard } from '../context/DashboardContext'

const DARK_LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#CBD5E1', family: 'Inter, sans-serif' },
  xaxis: {
    gridcolor: 'rgba(255,255,255,0.08)',
    zerolinecolor: 'rgba(255,255,255,0.15)',
    tickfont: { color: '#94A3B8' },
  },
  yaxis: {
    gridcolor: 'rgba(255,255,255,0.08)',
    zerolinecolor: 'rgba(255,255,255,0.15)',
    tickfont: { color: '#94A3B8' },
  },
  legend: { font: { color: '#94A3B8' } },
}

const LIGHT_LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#374151', family: 'Inter, sans-serif' },
  xaxis: {
    gridcolor: 'rgba(0,0,0,0.07)',
    zerolinecolor: 'rgba(0,0,0,0.15)',
    tickfont: { color: '#6B7280' },
  },
  yaxis: {
    gridcolor: 'rgba(0,0,0,0.07)',
    zerolinecolor: 'rgba(0,0,0,0.15)',
    tickfont: { color: '#6B7280' },
  },
  legend: { font: { color: '#6B7280' } },
}

export default function ChartCard({
  chart,
  filterKey,
  className = '',
  isLoading,
  // Visual-level toggle props
  toggleConfig,   // { key, options: [{value, label}] } | null
  currentOption,  // current toggle value (string) | null
  onOptionChange, // (key, value) => void
  overrideChart,  // ChartData from per-chart API | null
}) {
  const { isDark } = useTheme()
  const { applyChartFilter } = useDashboard()
  const [plotDiv, setPlotDiv] = useState(null)

  // Prefer per-chart override when available (after toggle)
  const activeChart = overrideChart || chart

  const figure = useMemo(() => {
    try {
      return JSON.parse(activeChart.figure_json)
    } catch {
      return null
    }
  }, [activeChart.figure_json])

  const mergedLayout = useMemo(() => {
    if (!figure) return {}
    const themeOverrides = isDark ? DARK_LAYOUT : LIGHT_LAYOUT
    return {
      ...figure.layout,
      ...themeOverrides,
      xaxis: { ...(figure.layout?.xaxis || {}), ...themeOverrides.xaxis },
      yaxis: { ...(figure.layout?.yaxis || {}), ...themeOverrides.yaxis },
      legend: { ...(figure.layout?.legend || {}), ...themeOverrides.legend },
      font: { ...themeOverrides.font },
    }
  }, [figure, isDark])

  const handleClick = useCallback(
    (event) => {
      if (!filterKey || !event.points?.length) return
      const point = event.points[0]
      const value = point.label ?? point.x ?? point.y
      if (value !== undefined) applyChartFilter(filterKey, String(value))
    },
    [filterKey, applyChartFilter]
  )

  const handleDownload = useCallback(() => {
    if (!plotDiv) return
    Plotly.downloadImage(plotDiv, {
      format: 'png',
      filename: activeChart.chart_id,
      width: 1400,
      height: 700,
      scale: 2,
    })
  }, [plotDiv, activeChart.chart_id])

  return (
    <div className={`card flex flex-col overflow-hidden ${className}`}>
      {/* Card header */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2 gap-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug pt-0.5">
          {activeChart.title}
        </h3>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Visual-level toggle (Week/Month/Quarter or Category/Sub-Category) */}
          {toggleConfig && (
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-dark-border rounded-lg p-0.5">
              {toggleConfig.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onOptionChange(toggleConfig.key, opt.value)}
                  className={`
                    px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150
                    ${currentOption === opt.value
                      ? 'bg-white dark:bg-dark-card text-brand-blue shadow-sm'
                      : 'text-slate-500 dark:text-dark-muted hover:text-slate-700 dark:hover:text-slate-200'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Click-to-filter badge */}
          {filterKey && (
            <span className="text-xs text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full hidden lg:inline">
              Click to filter
            </span>
          )}

          {/* PNG download */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-dark-border
              text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Download PNG"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Chart body */}
      <div className="relative flex-1 min-h-0 h-72">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center
            bg-white/60 dark:bg-dark-card/60 rounded-b-xl">
            <div className="w-8 h-8 border-[3px] border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {figure ? (
          <Plot
            data={figure.data}
            layout={mergedLayout}
            config={{ displayModeBar: false, responsive: true }}
            onClick={handleClick}
            onInitialized={(_, graphDiv) => setPlotDiv(graphDiv)}
            onUpdate={(_, graphDiv) => setPlotDiv(graphDiv)}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Chart unavailable
          </div>
        )}
      </div>
    </div>
  )
}
