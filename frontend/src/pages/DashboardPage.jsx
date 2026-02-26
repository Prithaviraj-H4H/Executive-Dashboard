import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import FilterPanel from '../components/FilterPanel'
import { useDashboard } from '../context/DashboardContext'

// Maps chart_id → which filter key a click on that chart updates
const CHART_FILTER_MAP = {
  sales_by_category: 'category',
  sales_by_subcategory: 'sub_category',
  sales_by_market_region: 'market',
  segment_breakdown: 'segment',
  ship_mode_priority: 'ship_mode',
}

const KPI_CONFIGS = [
  { key: 'total_sales', label: 'Total Sales', prefix: '$', color: 'blue' },
  { key: 'total_profit', label: 'Total Profit', prefix: '$', color: 'green' },
  { key: 'profit_margin', label: 'Profit Margin', suffix: '%', color: 'purple' },
  { key: 'total_orders', label: 'Total Orders', color: 'orange' },
  { key: 'total_quantity', label: 'Units Sold', color: 'teal' },
  { key: 'avg_order_value', label: 'Avg Order Value', prefix: '$', color: 'indigo' },
  { key: 'total_shipping_cost', label: 'Shipping Cost', prefix: '$', color: 'rose' },
  { key: 'avg_discount', label: 'Avg Discount', suffix: '%', color: 'amber' },
]

// Chart layout: some charts span 2 columns for better visual hierarchy
const CHART_SPANS = {
  sales_profit_trend: 'col-span-1 md:col-span-2',
  sales_by_subcategory: 'col-span-1 md:col-span-2',
  ship_mode_priority: 'col-span-1 md:col-span-2',
}

export default function DashboardPage() {
  const { kpis, charts, isLoading } = useDashboard()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-dark-bg transition-colors">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar toggle button (mobile) */}
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
            w-72 shrink-0 z-40 overflow-y-auto
            transition-transform duration-300
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
            <h2 className="label mb-3">Key Performance Indicators</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {KPI_CONFIGS.map((cfg) => (
                <KPICard
                  key={cfg.key}
                  label={cfg.label}
                  value={kpis?.[cfg.key]}
                  prefix={cfg.prefix}
                  suffix={cfg.suffix}
                  color={cfg.color}
                  loading={isLoading && !kpis}
                />
              ))}
            </div>
          </section>

          {/* Charts Grid */}
          <section>
            <h2 className="label mb-3">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {charts.map((chart) => (
                <ChartCard
                  key={chart.chart_id}
                  chart={chart}
                  filterKey={CHART_FILTER_MAP[chart.chart_id] || null}
                  className={CHART_SPANS[chart.chart_id] || ''}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
