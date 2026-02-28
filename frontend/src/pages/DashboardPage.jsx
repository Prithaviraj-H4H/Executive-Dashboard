import { useState, useEffect, useCallback } from 'react'
import { SlidersHorizontal, X, DollarSign, TrendingUp, Percent, ShoppingBag, Users, ShoppingCart, Truck, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import FilterPanel from '../components/FilterPanel'
import { useDashboard } from '../context/DashboardContext'
import { fetchChart } from '../services/api'

// Maps chart_id → which filter key a click on that chart updates
const CHART_FILTER_MAP = {
  sales_by_category:      'category',
  sales_by_market_region: 'market',
  segment_breakdown:      'segment',
  ship_mode_priority:     'ship_mode',
}

const KPI_CONFIGS = [
  { key: 'total_sales',          label: 'Total Sales',       prefix: '$', color: 'blue',   icon: DollarSign   },
  { key: 'total_profit',         label: 'Total Profit',      prefix: '$', color: 'green',  icon: TrendingUp   },
  { key: 'profit_margin',        label: 'Profit Margin',     suffix: '%', color: 'purple', icon: Percent      },
  { key: 'total_orders',         label: 'Total Orders',                   color: 'orange', icon: ShoppingBag  },
  { key: 'repeat_customer_rate', label: 'Repeat Customers',  suffix: '%', color: 'teal',   icon: Users        },
  { key: 'avg_order_value',      label: 'Avg Order Value',   prefix: '$', color: 'indigo', icon: ShoppingCart },
  { key: 'total_shipping_cost',  label: 'Shipping Cost',     prefix: '$', color: 'rose',   icon: Truck        },
  { key: 'avg_discount',         label: 'Avg Discount',      suffix: '%', color: 'amber',  icon: Tag          },
]

// Charts that span full width
const CHART_SPANS = {
  sales_profit_trend:    'col-span-1 md:col-span-2',
  sales_by_market_region:'col-span-1 md:col-span-2',
  top_products:          'col-span-1 md:col-span-2',
  discount_vs_profit:    'col-span-1 md:col-span-2',
  ship_mode_priority:    'col-span-1 md:col-span-2',
}

// Visual-level toggle configurations per chart
const CHART_TOGGLE_CONFIGS = {
  sales_profit_trend: {
    key: 'granularity',
    defaultValue: 'month',
    options: [
      { value: 'week',    label: 'Week'    },
      { value: 'month',   label: 'Month'   },
      { value: 'quarter', label: 'Quarter' },
    ],
  },
}

// Initial chart options (all at their defaults)
const INITIAL_CHART_OPTIONS = Object.fromEntries(
  Object.entries(CHART_TOGGLE_CONFIGS).map(([chartId, cfg]) => [
    chartId,
    { [cfg.key]: cfg.defaultValue },
  ])
)

export default function DashboardPage() {
  const { sessionId, kpis, charts, sparklines, activeFilters, isLoading } = useDashboard()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chartOptions, setChartOptions]   = useState(INITIAL_CHART_OPTIONS)
  const [chartOverrides, setChartOverrides] = useState({})  // { chart_id: ChartData }
  const [chartLoading, setChartLoading]   = useState({})    // { chart_id: bool }

  // When global filters change (charts prop updates), re-apply non-default chart options
  useEffect(() => {
    if (!sessionId || !charts.length) return

    const nonDefault = Object.entries(chartOptions).filter(([chartId, opts]) => {
      const cfg = CHART_TOGGLE_CONFIGS[chartId]
      return cfg && opts[cfg.key] !== cfg.defaultValue
    })

    nonDefault.forEach(([chartId, opts]) => {
      fetchChart(sessionId, activeFilters, chartId, opts)
        .then((result) => setChartOverrides((prev) => ({ ...prev, [chartId]: result })))
        .catch(console.error)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charts])

  // Called when a chart-level toggle is clicked
  const handleOptionChange = useCallback(
    async (chartId, optionKey, optionValue) => {
      const newOptions = { ...chartOptions[chartId], [optionKey]: optionValue }
      setChartOptions((prev) => ({ ...prev, [chartId]: newOptions }))
      setChartLoading((prev) => ({ ...prev, [chartId]: true }))
      try {
        const result = await fetchChart(sessionId, activeFilters, chartId, newOptions)
        setChartOverrides((prev) => ({ ...prev, [chartId]: result }))
      } catch {
        toast.error('Failed to update chart.')
      } finally {
        setChartLoading((prev) => ({ ...prev, [chartId]: false }))
      }
    },
    [sessionId, activeFilters, chartOptions]
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-dark-bg transition-colors">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="fixed bottom-6 right-6 z-50 md:hidden btn-primary p-3 rounded-full shadow-lg"
          aria-label="Toggle filters"
        >
          {sidebarOpen ? <X size={20} /> : <SlidersHorizontal size={20} />}
        </button>

        {/* Filter Sidebar */}
        <aside
          className={`
            fixed md:sticky top-0 md:top-16 h-screen md:h-[calc(100vh-4rem)]
            w-72 shrink-0 z-40 overflow-y-auto transition-transform duration-300
            bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <FilterPanel onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* KPI Cards */}
          <section>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-0.5">Key Performance Indicators</h2>
            <p className="text-xs text-slate-500 dark:text-dark-muted mb-3">Core business metrics for the selected period</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {KPI_CONFIGS.map((cfg) => (
                <KPICard
                  key={cfg.key}
                  label={cfg.label}
                  value={kpis?.[cfg.key]}
                  prefix={cfg.prefix}
                  suffix={cfg.suffix}
                  color={cfg.color}
                  icon={cfg.icon}
                  sparkline={sparklines?.[cfg.key]}
                  loading={isLoading && !kpis}
                />
              ))}
            </div>
          </section>

          {/* Charts Grid */}
          <section>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-0.5">Analytics</h2>
            <p className="text-xs text-slate-500 dark:text-dark-muted mb-3">Interactive charts — click any segment to filter the dashboard</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {charts.map((chart) => {
                const toggleCfg    = CHART_TOGGLE_CONFIGS[chart.chart_id] || null
                const curOption    = toggleCfg
                  ? (chartOptions[chart.chart_id]?.[toggleCfg.key] ?? toggleCfg.defaultValue)
                  : null
                const overrideData = chartOverrides[chart.chart_id] || null

                return (
                  <ChartCard
                    key={chart.chart_id}
                    chart={chart}
                    overrideChart={overrideData}
                    filterKey={CHART_FILTER_MAP[chart.chart_id] || null}
                    className={CHART_SPANS[chart.chart_id] || ''}
                    isLoading={isLoading || !!chartLoading[chart.chart_id]}
                    toggleConfig={toggleCfg}
                    currentOption={curOption}
                    onOptionChange={(key, value) => handleOptionChange(chart.chart_id, key, value)}
                  />
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
