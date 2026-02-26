import { useCallback, useMemo, useRef } from 'react'
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

export default function ChartCard({ chart, filterKey, className = '', isLoading }) {
  const { isDark } = useTheme()
  const { applyChartFilter } = useDashboard()
  const plotDivRef = useRef(null)

  const figure = useMemo(() => {
    try {
      return JSON.parse(chart.figure_json)
    } catch {
      return null
    }
  }, [chart.figure_json])

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
      // Support pie labels and bar x/y values
      const value = point.label ?? point.x ?? point.y
      if (value !== undefined) applyChartFilter(filterKey, String(value))
    },
    [filterKey, applyChartFilter]
  )

  const handleDownload = useCallback(async () => {
    const el = plotDivRef.current?.el
    if (!el) return
    try {
      const url = await Plotly.toImage(el, { format: 'png', width: 1400, height: 700, scale: 2 })
      const a = document.createElement('a')
      a.href = url
      a.download = `${chart.chart_id}.png`
      a.click()
    } catch (e) {
      console.error('Download failed', e)
    }
  }, [chart.chart_id])

  return (
    <div className={`card flex flex-col overflow-hidden ${className}`}>
      {/* Card header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{chart.title}</h3>
        <div className="flex items-center gap-2">
          {filterKey && (
            <span className="text-xs text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-full hidden sm:inline">
              Click to filter
            </span>
          )}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-dark-border text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Download PNG"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Chart body */}
      <div className="relative flex-1 min-h-0 h-72">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-dark-card/60 rounded-b-xl">
            <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {figure ? (
          <Plot
            ref={plotDivRef}
            data={figure.data}
            layout={mergedLayout}
            config={{
              displayModeBar: false,
              responsive: true,
            }}
            onClick={handleClick}
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
